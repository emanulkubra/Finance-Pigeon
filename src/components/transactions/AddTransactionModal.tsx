import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type {
  TransactionType,
  PaymentMethod,
  PurchaseEvaluationResult,
} from '../../types/finance';
import { Modal, Button, Field, Input, Select, MoneyInput, Segmented, Badge } from '../ui';
import { money } from '../../lib/format';
import { Plus, Compass, Lightbulb } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Money out' },
  { value: 'income', label: 'Money in' },
  { value: 'transfer', label: 'Transfer' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'wallet', label: 'Digital wallet' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'other', label: 'Something else' },
];

const ESSENTIAL_HINTS = ['food', 'bills', 'rent', 'housing', 'health', 'utilit'];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, settings, evaluatePurchase } = useFinance();
  const symbol = settings.currencySymbol;

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(settings.customCategories[0] ?? 'Food & Groceries');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [accountSource, setAccountSource] = useState('');
  const [accountDestination, setAccountDestination] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [isChecking, setIsChecking] = useState(false);
  const [advice, setAdvice] = useState<PurchaseEvaluationResult | null>(null);

  const numericAmount = parseFloat(amount);
  const hasAmount = !isNaN(numericAmount) && numericAmount > 0;

  const reset = () => {
    setAmount('');
    setMerchant('');
    setNotes('');
    setAccountSource('');
    setAccountDestination('');
    setAdvice(null);
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleCheckPurchase = async () => {
    if (!hasAmount) return;
    setIsChecking(true);
    try {
      setAdvice(
        await evaluatePurchase({
          item: merchant.trim() || category,
          price: numericAmount,
          category,
          merchant: merchant.trim(),
          isEssential: ESSENTIAL_HINTS.some((hint) => category.toLowerCase().includes(hint)),
        }),
      );
    } catch (error) {
      console.error('Purchase check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAmount) return;

    await addTransaction({
      date,
      amount: numericAmount,
      type,
      category,
      paymentMethod,
      accountSource: accountSource.trim() || undefined,
      accountDestination: type === 'transfer' ? accountDestination.trim() || undefined : undefined,
      merchant: merchant.trim() || category,
      notes: notes.trim(),
      isGoodPurchase: advice?.isGoodPurchase,
      aiReasoning: advice?.reasoning,
    });

    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add a transaction"
      description="Record something you spent, earned or moved between accounts."
      icon={Plus}
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button onClick={handleClose} fullWidth>
            Cancel
          </Button>
          <Button
            type="submit"
            form="transaction-form"
            variant="primary"
            fullWidth
            disabled={!hasAmount}
          >
            Save transaction
          </Button>
        </div>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
        <Field label="What kind of transaction is this?">
          {() => <Segmented options={TYPE_OPTIONS} value={type} onChange={setType} />}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={`Amount (${symbol})`}>
            {(id) => (
              <MoneyInput
                id={id}
                symbol={symbol}
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 text-lg font-semibold"
              />
            )}
          </Field>

          <Field label="Date">
            {(id) => (
              <Input
                id={id}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12"
              />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label={type === 'income' ? 'Who paid you?' : 'Who did you pay?'}
            hint="Leave blank to use the category name."
          >
            {(id) => (
              <Input
                id={id}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder={type === 'income' ? 'e.g. Employer' : 'e.g. Tesco'}
              />
            )}
          </Field>

          <Field label="Category">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="How was it paid?">
            {(id) => (
              <Select
                id={id}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label={type === 'transfer' ? 'From account' : 'Account'} hint="Optional.">
            {(id) => (
              <Input
                id={id}
                value={accountSource}
                onChange={(e) => setAccountSource(e.target.value)}
                placeholder="e.g. Current account"
              />
            )}
          </Field>
        </div>

        {type === 'transfer' && (
          <Field label="To account">
            {(id) => (
              <Input
                id={id}
                value={accountDestination}
                onChange={(e) => setAccountDestination(e.target.value)}
                placeholder="e.g. Savings"
              />
            )}
          </Field>
        )}

        <Field label="Note" hint="Optional — anything you want to remember about it.">
          {(id) => (
            <Input
              id={id}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Weekly shop"
            />
          )}
        </Field>

        {type === 'expense' && (
          <div className="p-5 rounded-xl bg-sunken border border-line">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold">Not sure about this one?</h3>
                <p className="text-[0.9375rem] text-ink-soft mt-0.5">
                  Check it against your budget and goals before you save it.
                </p>
              </div>
              <Button
                onClick={handleCheckPurchase}
                icon={Compass}
                disabled={!hasAmount || isChecking}
                className="shrink-0"
              >
                {isChecking ? 'Checking…' : 'Check it'}
              </Button>
            </div>

            {advice && (
              <div className="mt-5 pt-5 border-t border-line space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge tone={advice.isGoodPurchase ? 'positive' : 'negative'}>
                    {advice.verdict}
                  </Badge>
                  <span className="text-[0.9375rem] text-ink-soft">{advice.impactOnGoals}</span>
                </div>
                <p className="text-[1.0625rem] leading-relaxed">{advice.reasoning}</p>
                {advice.savingsAlternativeTip && (
                  <p className="flex items-start gap-2.5 text-[0.9375rem] text-ink-soft">
                    <Lightbulb className="w-[1.125rem] h-[1.125rem] text-warning shrink-0 mt-0.5" />
                    {advice.savingsAlternativeTip}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {hasAmount && (
          <p className="text-[0.9375rem] text-ink-soft">
            Saving{' '}
            <span className="tnum font-semibold text-ink">{money(numericAmount, symbol)}</span> as{' '}
            <span className="font-medium text-ink">
              {TYPE_OPTIONS.find((option) => option.value === type)?.label.toLowerCase()}
            </span>{' '}
            in {category}.
          </p>
        )}
      </form>
    </Modal>
  );
};
