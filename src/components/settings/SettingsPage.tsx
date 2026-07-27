import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { exportService } from '../../services/exportService';
import { storageService } from '../../services/storageService';
import { PROJECT_NAME } from '../../firebase/config';
import type { UserSettings } from '../../types/finance';
import { PageHeader, Card, CardHeader, Button, Field, Input, Select, Badge } from '../ui';
import { money } from '../../lib/format';
import {
  Wallet,
  Sparkles,
  Sliders,
  Tag,
  Download,
  Upload,
  RotateCcw,
  X,
  Plus,
  Check,
  Cloud,
} from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British pound (£)' },
  { code: 'PKR', symbol: 'Rs', label: 'Pakistani rupee (Rs)' },
  { code: 'INR', symbol: '₹', label: 'Indian rupee (₹)' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian dollar (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian dollar (A$)' },
];

const AI_PROVIDERS: { value: UserSettings['aiProvider']; label: string }[] = [
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'groq', label: 'Groq' },
  { value: 'openrouter', label: 'OpenRouter' },
];

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, transactions, goals, budgets, updateBudget, resetToDefaults } =
    useFinance();
  const { isGuest } = useAuth();

  const [currency, setCurrency] = useState(settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [incomeTarget, setIncomeTarget] = useState(String(settings.monthlyIncomeTarget));
  const [provider, setProvider] = useState<UserSettings['aiProvider']>(settings.aiProvider);
  const [apiKey, setApiKey] = useState(settings.aiApiKey);
  const [newCategory, setNewCategory] = useState('');
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const handleSave = async () => {
    await updateSettings({
      currency,
      currencySymbol,
      monthlyIncomeTarget: parseFloat(incomeTarget) || 5000,
      aiProvider: provider,
      aiApiKey: apiKey.trim(),
    });
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 3000);
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name || settings.customCategories.includes(name)) return;
    await updateSettings({ customCategories: [...settings.customCategories, name] });
    setNewCategory('');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions) storageService.saveGuestTransactions(data.transactions);
        if (data.goals) storageService.saveGuestGoals(data.goals);
        if (data.budgets) storageService.saveGuestBudgets(data.budgets);
        if (data.settings) storageService.saveGuestSettings(data.settings);
        window.location.reload();
      } catch {
        alert('That file could not be read. Please choose a backup exported from Finance Pigeon.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Currency, budgets, categories and your data."
        action={
          <>
            {savedAt && (
              <span className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-positive">
                <Check className="w-[1.125rem] h-[1.125rem]" />
                Saved
              </span>
            )}
            <Button onClick={handleSave} variant="primary">
              Save changes
            </Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-info-tint text-info">
              <Cloud className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">
                {isGuest ? 'Saved on this device' : 'Backed up to your account'}
              </h2>
              <p className="text-[0.9375rem] text-ink-soft mt-0.5">
                {isGuest
                  ? 'Sign in with Google to keep your data across devices. Nothing is lost when you do — it moves with you.'
                  : `Changes sync automatically. Project: ${PROJECT_NAME}.`}
              </p>
            </div>
          </div>
          <Badge tone={isGuest ? 'neutral' : 'positive'}>
            {isGuest ? 'Local only' : 'Syncing'}
          </Badge>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Money and currency"
          description="How amounts are shown, and what you expect to earn each month."
          icon={Wallet}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Currency">
            {(id) => (
              <Select
                id={id}
                value={currency}
                onChange={(e) => {
                  const match = CURRENCIES.find((c) => c.code === e.target.value);
                  setCurrency(e.target.value);
                  if (match) setCurrencySymbol(match.symbol);
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label={`Expected monthly income (${currencySymbol})`}
            hint="Used to work out your savings rate and health score."
          >
            {(id) => (
              <Input
                id={id}
                type="number"
                min="0"
                inputMode="decimal"
                value={incomeTarget}
                onChange={(e) => setIncomeTarget(e.target.value)}
                className="tnum"
              />
            )}
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Monthly budgets"
          description="A limit per category. You will see how much of each you have used on the Insights page."
          icon={Sliders}
        />

        {budgets.length === 0 ? (
          <p className="text-[0.9375rem] text-ink-soft">
            No budgets yet. They are created with the sample data — use “Start over with sample
            data” below if you want a set to begin from.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-sunken border border-line"
              >
                <span className="font-medium truncate">{budget.category}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-ink-faint">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    aria-label={`Monthly limit for ${budget.category}`}
                    value={budget.limitAmount}
                    onChange={(e) => {
                      const limitAmount = parseFloat(e.target.value);
                      if (isNaN(limitAmount) || limitAmount < 0) return;
                      void updateBudget({ ...budget, limitAmount });
                    }}
                    className="field tnum w-28 text-right py-2"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Categories"
          description="The list you pick from when recording a transaction."
          icon={Tag}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleAddCategory();
              }
            }}
            placeholder="e.g. Pets"
            aria-label="New category name"
            className="flex-1"
          />
          <Button onClick={handleAddCategory} icon={Plus} disabled={!newCategory.trim()}>
            Add category
          </Button>
        </div>

        <ul className="mt-5 flex flex-wrap gap-2">
          {settings.customCategories.map((name) => (
            <li
              key={name}
              className="inline-flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-lg bg-sunken border border-line"
            >
              <span className="text-[0.9375rem] font-medium">{name}</span>
              <button
                type="button"
                onClick={() =>
                  void updateSettings({
                    customCategories: settings.customCategories.filter((c) => c !== name),
                  })
                }
                aria-label={`Remove ${name}`}
                className="grid place-items-center w-6 h-6 rounded text-ink-faint hover:bg-negative-tint hover:text-negative transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Purchase advice"
          description="Add your own API key for tailored advice. Without one, Finance Pigeon uses built-in rules based on your budgets and goals."
          icon={Sparkles}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Provider">
            {(id) => (
              <Select
                id={id}
                value={provider}
                onChange={(e) => setProvider(e.target.value as UserSettings['aiProvider'])}
              >
                {AI_PROVIDERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="API key" hint="Stored with your own data. Leave blank to use the built-in rules.">
            {(id) => (
              <Input
                id={id}
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your key"
                className="font-mono"
              />
            )}
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Your data"
          description={`${transactions.length} transactions and ${goals.length} goals, worth ${money(
            goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
            currencySymbol,
          )} saved.`}
          icon={Download}
        />

        <div className="flex flex-wrap gap-3">
          <Button
            icon={Download}
            onClick={() => exportService.exportFullBackup(transactions, goals, budgets, settings)}
          >
            Download a backup
          </Button>

          <label className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-line-strong bg-surface font-semibold cursor-pointer hover:bg-sunken transition-colors">
            <Upload className="w-[1.125rem] h-[1.125rem]" />
            Restore from a file
            <input type="file" accept=".json" onChange={handleImport} className="sr-only" />
          </label>

          <Button
            variant="danger"
            icon={RotateCcw}
            onClick={() => {
              if (confirm('This replaces everything with the sample data. Continue?')) {
                resetToDefaults();
              }
            }}
          >
            Start over with sample data
          </Button>
        </div>
      </Card>
    </div>
  );
};
