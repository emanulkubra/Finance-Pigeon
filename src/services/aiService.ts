import { 
  PurchaseEvaluationRequest, 
  PurchaseEvaluationResult, 
  Transaction, 
  Goal, 
  Budget, 
  FinancialHealthReport,
  ParsedExpense 
} from '../types/finance';

class AIService {
  /**
   * Parse natural language expense string (e.g. "Spent $45 on groceries at Target using debit card")
   */
  async parseNaturalLanguageExpense(
    text: string,
    categories: string[],
    apiKey?: string,
    provider: 'gemini' | 'openai' | 'groq' | 'openrouter' = 'gemini'
  ): Promise<ParsedExpense> {
    if (apiKey && apiKey.trim().length > 5) {
      try {
        if (provider === 'gemini') {
          return await this.callGeminiNaturalLanguageParser(text, categories, apiKey);
        }
      } catch (e) {
        console.warn('AI natural language parser API error, falling back to smart regex:', e);
      }
    }

    // Heuristic regex parser fallback
    return this.heuristicNaturalLanguageParser(text, categories);
  }

  private heuristicNaturalLanguageParser(text: string, categories: string[]): ParsedExpense {
    const amountMatch = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 25.00;

    let category = categories.find(c => text.toLowerCase().includes(c.toLowerCase())) || 'Shopping & Clothing';
    if (text.toLowerCase().includes('food') || text.toLowerCase().includes('lunch') || text.toLowerCase().includes('dinner') || text.toLowerCase().includes('groceries') || text.toLowerCase().includes('coffee')) {
      category = 'Food & Groceries';
    } else if (text.toLowerCase().includes('uber') || text.toLowerCase().includes('gas') || text.toLowerCase().includes('fuel') || text.toLowerCase().includes('flight') || text.toLowerCase().includes('train')) {
      category = 'Transportation & Fuel';
    } else if (text.toLowerCase().includes('bill') || text.toLowerCase().includes('internet') || text.toLowerCase().includes('electric') || text.toLowerCase().includes('water')) {
      category = 'Utilities & Bills';
    }

    let paymentMethod: any = 'card';
    if (text.toLowerCase().includes('cash')) paymentMethod = 'cash';
    else if (text.toLowerCase().includes('transfer') || text.toLowerCase().includes('bank')) paymentMethod = 'transfer';
    else if (text.toLowerCase().includes('crypto')) paymentMethod = 'crypto';

    let merchant = 'Merchant Store';
    const atMatch = text.match(/at\s+([A-Za-z0-9\s]+?)(?:\s+on|\s+using|\s+for|$)/i);
    if (atMatch) merchant = atMatch[1].trim();

    return {
      amount,
      category,
      merchant,
      paymentMethod,
      notes: text,
      type: 'expense'
    };
  }

  private async callGeminiNaturalLanguageParser(text: string, categories: string[], apiKey: string): Promise<ParsedExpense> {
    const prompt = `Parse this financial transaction text into a structured JSON expense object: "${text}"
Available categories: ${JSON.stringify(categories)}
Return ONLY JSON with schema:
{
  "amount": number,
  "category": string,
  "merchant": string,
  "paymentMethod": "card" | "transfer" | "cash" | "wallet" | "crypto" | "other",
  "notes": string,
  "type": "expense" | "income" | "transfer"
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await res.json();
    const jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonStr) throw new Error('Failed to parse text');
    return JSON.parse(jsonStr) as ParsedExpense;
  }

  /**
   * Evaluates if a purchase is a good decision given the user's budget and monetary goals.
   */
  async evaluatePurchase(
    req: PurchaseEvaluationRequest,
    budgets: Budget[],
    goals: Goal[],
    recentTransactions: Transaction[],
    apiKey?: string,
    provider: 'gemini' | 'openai' | 'groq' | 'openrouter' = 'gemini'
  ): Promise<PurchaseEvaluationResult> {
    if (apiKey && apiKey.trim().length > 5) {
      try {
        if (provider === 'gemini') {
          return await this.callGeminiPurchaseEvaluator(req, budgets, goals, apiKey);
        } else {
          return await this.callOpenAiCompatiblePurchaseEvaluator(req, budgets, goals, apiKey, provider);
        }
      } catch (e) {
        console.warn('AI API call failed, falling back to smart financial heuristics engine:', e);
      }
    }

    return this.heuristicPurchaseEvaluator(req, budgets, goals, recentTransactions);
  }

  private heuristicPurchaseEvaluator(
    req: PurchaseEvaluationRequest,
    budgets: Budget[],
    goals: Goal[],
    recentTransactions: Transaction[]
  ): PurchaseEvaluationResult {
    const categoryBudget = budgets.find(b => b.category.toLowerCase().includes(req.category.toLowerCase())) || { limitAmount: 500 };
    
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthSpentInCat = recentTransactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth) && t.category === req.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAfterPurchase = monthSpentInCat + req.price;
    const overLimitRatio = totalAfterPurchase / (categoryBudget.limitAmount || 1);

    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
    const topGoal = activeGoals[0] || { title: 'Emergency Savings', targetAmount: 10000, currentAmount: 2000 };
    const goalDeficit = topGoal.targetAmount - topGoal.currentAmount;
    const goalDelayDays = Math.round((req.price / Math.max(100, goalDeficit)) * 30);

    if (req.isEssential) {
      return {
        isGoodPurchase: true,
        verdict: 'Great Buy',
        impactOnGoals: `Essential necessity. Negligible impact on ${topGoal.title}.`,
        reasoning: `As an essential expense in ${req.category}, this takes priority. Fits within your baseline living overhead.`,
        savingsAlternativeTip: 'Consider buying in bulk or using rewards credit cards to earn 2% cashback.',
        healthScoreDelta: 0
      };
    }

    if (overLimitRatio > 1.2) {
      return {
        isGoodPurchase: false,
        verdict: 'Financial Trap',
        impactOnGoals: `Delays ${topGoal.title} milestone progress by ~${Math.max(3, goalDelayDays)} days.`,
        reasoning: `This $${req.price.toFixed(2)} purchase pushes your ${req.category} category spending to $${totalAfterPurchase.toFixed(2)}, exceeding your $${categoryBudget.limitAmount} budget by ${Math.round((overLimitRatio - 1) * 100)}%.`,
        savingsAlternativeTip: 'Wait 72 hours (Cooling-off rule). Put this amount directly into your savings vault instead.',
        healthScoreDelta: -6
      };
    } else if (overLimitRatio > 0.85) {
      return {
        isGoodPurchase: false,
        verdict: 'Think Twice',
        impactOnGoals: `Consumes discretionary buffer. Reduces monthly contribution to ${topGoal.title}.`,
        reasoning: `This purchase uses up ${Math.round((req.price / (categoryBudget.limitAmount || 500)) * 100)}% of your remaining monthly budget for ${req.category}.`,
        savingsAlternativeTip: 'Search for a pre-owned alternative or coupon discount before completing checkout.',
        healthScoreDelta: -2
      };
    } else {
      return {
        isGoodPurchase: true,
        verdict: 'Acceptable',
        impactOnGoals: `Within healthy limits. Maintains overall pace towards ${topGoal.title}.`,
        reasoning: `Well within your monthly $${categoryBudget.limitAmount} allocation for ${req.category}. Your monthly cash flow remains positive.`,
        savingsAlternativeTip: 'Always track transactions right away to keep your live charts updated.',
        healthScoreDelta: +2
      };
    }
  }

  private async callGeminiPurchaseEvaluator(
    req: PurchaseEvaluationRequest,
    budgets: Budget[],
    goals: Goal[],
    apiKey: string
  ): Promise<PurchaseEvaluationResult> {
    const prompt = `You are an expert personal financial advisor AI for Finance Pigeon.
Evaluate this purchase request:
Item: "${req.item}"
Price: $${req.price}
Category: "${req.category}"
Merchant: "${req.merchant || 'N/A'}"
Is Essential: ${req.isEssential}

User Budgets: ${JSON.stringify(budgets)}
User Milestones/Goals: ${JSON.stringify(goals.map(g => ({ title: g.title, current: g.currentAmount, target: g.targetAmount, deadline: g.deadline })))}

Return ONLY valid JSON matching this schema:
{
  "isGoodPurchase": boolean,
  "verdict": "Great Buy" | "Acceptable" | "Think Twice" | "Financial Trap",
  "impactOnGoals": "short summary of impact on goal deadlines",
  "reasoning": "2-3 sentences concise explanation",
  "savingsAlternativeTip": "actionable saving tip",
  "healthScoreDelta": number (-10 to +10)
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Invalid response from Gemini API');
    return JSON.parse(text) as PurchaseEvaluationResult;
  }

  private async callOpenAiCompatiblePurchaseEvaluator(
    req: PurchaseEvaluationRequest,
    budgets: Budget[],
    goals: Goal[],
    apiKey: string,
    provider: string
  ): Promise<PurchaseEvaluationResult> {
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    let model = 'gpt-4o-mini';

    if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      model = 'llama-3.1-8b-instant';
    } else if (provider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      model = 'meta-llama/llama-3.1-8b-instruct:free';
    }

    const prompt = `Evaluate purchase decision: Item: ${req.item}, Price: $${req.price}, Category: ${req.category}, Essential: ${req.isEssential}. User goals: ${JSON.stringify(goals)}. User budgets: ${JSON.stringify(budgets)}. Return JSON object with keys: isGoodPurchase (boolean), verdict ("Great Buy"|"Acceptable"|"Think Twice"|"Financial Trap"), impactOnGoals (string), reasoning (string), savingsAlternativeTip (string), healthScoreDelta (number).`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Failed to fetch completion');
    return JSON.parse(content) as PurchaseEvaluationResult;
  }

  calculateFinancialHealth(
    transactions: Transaction[],
    goals: Goal[],
    budgets: Budget[],
    monthlyIncomeTarget: number
  ): FinancialHealthReport {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthTxs = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const monthlyIncome = monthTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || monthlyIncomeTarget || 5000;

    const monthlyExpense = monthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense);
    const savingsRate = Math.min(100, Math.round((monthlySavings / monthlyIncome) * 100));

    const catTotals: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    let topExpenseCategory = 'Food & Groceries';
    let maxSpent = 0;
    Object.entries(catTotals).forEach(([cat, amt]) => {
      if (amt > maxSpent) {
        maxSpent = amt;
        topExpenseCategory = cat;
      }
    });

    let score = 70;
    if (savingsRate >= 30) score += 20;
    else if (savingsRate >= 15) score += 10;
    else if (savingsRate < 5) score -= 15;

    const goalAvgProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + (g.currentAmount / Math.max(1, g.targetAmount)), 0) / goals.length
      : 0.5;

    score += Math.round(goalAvgProgress * 10);
    score = Math.max(15, Math.min(99, score));

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';
    else grade = 'F';

    const tips: string[] = [];
    if (savingsRate < 20) {
      tips.push(`Boost your monthly savings rate from ${savingsRate}% to at least 20% to reach goals faster.`);
    }
    if (maxSpent > monthlyIncome * 0.35) {
      tips.push(`High expenditure detected in ${topExpenseCategory}. Try setting a stricter category budget.`);
    }
    tips.push(`Automate transfers to your ${goals[0]?.title || 'Savings Vault'} on payday to avoid impulse spending.`);

    return {
      score,
      grade,
      monthlyIncome,
      monthlyExpense,
      monthlySavings,
      savingsRate,
      topExpenseCategory,
      aiSummary: `Your financial health is graded ${grade} with a ${savingsRate}% net savings rate. You have saved $${monthlySavings.toFixed(0)} this month.`,
      actionableTips: tips
    };
  }
}

export const aiService = new AIService();
