import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '../ui';
import { Wand2, Check, CircleAlert } from 'lucide-react';

const EXAMPLES = [
  'Spent 45 on lunch at Subway',
  'Paid 120 electricity bill',
  'Got 3800 salary',
];

/**
 * Type a sentence, get a transaction. The examples are clickable so the
 * expected phrasing is obvious without reading instructions.
 */
export const QuickLogCard: React.FC = () => {
  const { parseNaturalLanguageExpense, addTransaction } = useFinance();

  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || status === 'working') return;

    setStatus('working');
    try {
      const parsed = await parseNaturalLanguageExpense(text.trim());
      await addTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        paymentMethod: parsed.paymentMethod,
        merchant: parsed.merchant,
        notes: parsed.notes,
        isGoodPurchase: true,
        aiReasoning: 'Added from a quick note.',
      });

      setMessage(`Added ${parsed.merchant} to ${parsed.category}.`);
      setStatus('done');
      setText('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      console.error('Quick log failed:', error);
      setMessage('Could not read that one. Try including an amount, such as “Spent 20 on coffee”.');
      setStatus('error');
    }
  };

  return (
    <section className="card p-6 sm:p-7 bg-brand-tint border-brand/15">
      <div className="flex items-start gap-3.5">
        <span className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-brand text-on-brand">
          <Wand2 className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Add something quickly</h2>
          <p className="mt-1 text-[0.9375rem] text-ink-soft">
            Describe it in plain words and it will be filed for you.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2.5">
        <label htmlFor="quick-log" className="sr-only">
          Describe a transaction
        </label>
        <input
          id="quick-log"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Spent 45 on lunch at Subway"
          className="field flex-1 h-12"
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!text.trim() || status === 'working'}
        >
          {status === 'working' ? 'Reading…' : 'Add it'}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-soft">Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setText(example)}
            className="px-3 py-1.5 rounded-lg bg-surface border border-line text-sm font-medium text-ink-soft hover:text-ink hover:border-line-strong transition-colors"
          >
            {example}
          </button>
        ))}
      </div>

      {status === 'done' && (
        <p className="mt-4 flex items-center gap-2 text-[0.9375rem] font-medium text-positive">
          <Check className="w-[1.125rem] h-[1.125rem] shrink-0" />
          {message}
        </p>
      )}
      {status === 'error' && (
        <p className="mt-4 flex items-start gap-2 text-[0.9375rem] font-medium text-negative">
          <CircleAlert className="w-[1.125rem] h-[1.125rem] shrink-0 mt-0.5" />
          {message}
        </p>
      )}
    </section>
  );
};
