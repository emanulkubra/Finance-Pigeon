import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { PurchaseEvaluationResult } from '../../types/finance';
import {
  PageHeader,
  Card,
  Button,
  Field,
  Input,
  Select,
  MoneyInput,
  Checkbox,
  Badge,
  EmptyState,
} from '../ui';
import { money } from '../../lib/format';
import { Compass, Lightbulb, Target, TrendingDown, TrendingUp } from 'lucide-react';

export const AdvisorPage: React.FC = () => {
  const { evaluatePurchase, settings } = useFinance();
  const symbol = settings.currencySymbol;

  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(settings.customCategories[0] ?? 'Shopping & Clothing');
  const [isEssential, setIsEssential] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PurchaseEvaluationResult | null>(null);

  const value = parseFloat(price);
  const isValid = item.trim() !== '' && !isNaN(value) && value > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsChecking(true);
    try {
      setResult(
        await evaluatePurchase({ item: item.trim(), price: value, category, isEssential }),
      );
    } catch (error) {
      console.error('Purchase check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const isGood = result?.isGoodPurchase ?? false;
  const DeltaIcon = (result?.healthScoreDelta ?? 0) >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Should I buy it?"
        description="Describe something you are thinking of buying and see what it does to your budget and your goals."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 items-start">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="What are you thinking of buying?">
              {(id) => (
                <Input
                  id={id}
                  required
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="e.g. Noise-cancelling headphones"
                  className="h-12"
                />
              )}
            </Field>

            <Field label={`How much does it cost? (${symbol})`}>
              {(id) => (
                <MoneyInput
                  id={id}
                  symbol={symbol}
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-12 text-lg font-semibold"
                />
              )}
            </Field>

            <Field label="Which category does it fall under?">
              {(id) => (
                <Select id={id} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {settings.customCategories.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Checkbox
              label="This is something I need, not something I want"
              hint="Rent, food, medicine and bills count as needs."
              checked={isEssential}
              onChange={(e) => setIsEssential(e.target.checked)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              icon={Compass}
              disabled={!isValid || isChecking}
            >
              {isChecking ? 'Working it out…' : 'Check this purchase'}
            </Button>
          </form>
        </Card>

        {result ? (
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={isGood ? 'positive' : 'negative'} className="text-base px-3 py-1.5">
                {result.verdict}
              </Badge>
              <span
                className={`tnum inline-flex items-center gap-1.5 text-[0.9375rem] font-medium ${
                  result.healthScoreDelta >= 0 ? 'text-positive' : 'text-negative'
                }`}
              >
                <DeltaIcon className="w-4 h-4" />
                {result.healthScoreDelta > 0 ? '+' : ''}
                {result.healthScoreDelta} to your health score
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.015em] leading-snug">
              {item.trim()} · {money(value, symbol)}
            </h2>

            <p className="mt-4 text-[1.0625rem] leading-relaxed">{result.reasoning}</p>

            <div className="mt-6 p-5 rounded-xl bg-sunken border border-line">
              <h3 className="flex items-center gap-2.5 text-[0.9375rem] font-semibold text-ink-soft">
                <Target className="w-[1.125rem] h-[1.125rem]" />
                Effect on your goals
              </h3>
              <p className="mt-2 text-[1.0625rem] leading-relaxed">{result.impactOnGoals}</p>
            </div>

            {result.savingsAlternativeTip && (
              <div className="mt-4 p-5 rounded-xl bg-warning-tint">
                <h3 className="flex items-center gap-2.5 text-[0.9375rem] font-semibold text-warning">
                  <Lightbulb className="w-[1.125rem] h-[1.125rem]" />
                  Another way to look at it
                </h3>
                <p className="mt-2 text-[1.0625rem] leading-relaxed">
                  {result.savingsAlternativeTip}
                </p>
              </div>
            )}
          </Card>
        ) : (
          <Card flush>
            <EmptyState
              icon={Compass}
              title="Your answer will appear here"
              description="Fill in the form and you will get a straight answer, what it means for your goals, and a cheaper alternative worth considering."
            />
          </Card>
        )}
      </div>
    </div>
  );
};
