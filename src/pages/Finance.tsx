import { useState } from 'react';
import { useStore, EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_COLORS, type Expense } from '@/store/useStore';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

type Tab = 'overview' | 'add' | 'history';

const CATEGORIES = Object.entries(EXPENSE_CATEGORY_LABELS) as [Expense['category'], string][];

export default function Finance() {
  const [state, update] = useStore();
  const { expenses, budget } = state;
  const [tab, setTab] = useState<Tab>('overview');
  const [form, setForm] = useState({ category: 'fuel' as Expense['category'], amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const now = new Date();
  const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });

  const monthlyData = months.map(m => {
    const start = startOfMonth(m);
    const end = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    const total = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      })
      .reduce((s, e) => s + e.amount, 0);
    return { name: format(m, 'MMM', { locale: ru }), total, fuel: 0, maintenance: 0 };
  });

  months.forEach((m, idx) => {
    const start = startOfMonth(m);
    const end = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    const month = expenses.filter(e => { const d = new Date(e.date); return d >= start && d <= end; });
    monthlyData[idx].fuel = month.filter(e => e.category === 'fuel').reduce((s, e) => s + e.amount, 0);
    monthlyData[idx].maintenance = month.filter(e => ['maintenance', 'parts'].includes(e.category)).reduce((s, e) => s + e.amount, 0);
  });

  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const monthStart = startOfMonth(now);
  const monthTotal = expenses.filter(e => new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0);
  const budgetPct = Math.min((monthTotal / budget.monthly) * 100, 100);

  const pieData = Object.entries(
    expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>)
  ).map(([key, value]) => ({ name: EXPENSE_CATEGORY_LABELS[key as Expense['category']] || key, value, color: EXPENSE_CATEGORY_COLORS[key as Expense['category']] || '#6b7280' }));

  function addExpense() {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) { toast.error('Укажи сумму'); return; }
    if (!form.description) { toast.error('Укажи описание'); return; }
    const newExp: Expense = {
      id: `e${Date.now()}`,
      date: form.date,
      category: form.category,
      amount: amt,
      description: form.description,
      mileage: state.car.mileage,
    };
    update(s => ({ ...s, expenses: [newExp, ...s.expenses] }));
    setForm({ category: 'fuel', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    setTab('overview');
    toast.success('Расход добавлен');
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="font-rajdhani font-bold text-xl">Финансы</div>
          <div className="text-xs text-muted-foreground">Учёт расходов на авто</div>
        </div>
        <button onClick={() => setTab('add')} className="neon-btn px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
          <Icon name="Plus" size={14} />
          Добавить
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 glass-card rounded-xl p-1">
        {(['overview', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-rajdhani font-semibold transition-all ${tab === t ? 'bg-[var(--neon)] text-[#080d08]' : 'text-muted-foreground'}`}
          >
            {t === 'overview' ? 'Обзор' : 'История'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Бюджет месяца */}
          <div className="glass-card rounded-2xl p-4 neon-border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-[10px] text-muted-foreground">БЮДЖЕТ МЕСЯЦА</div>
                <div className="font-rajdhani font-bold text-2xl mt-0.5">
                  <span className={budgetPct >= 90 ? 'text-red-400' : budgetPct >= 70 ? 'text-amber-400' : 'neon-text'}>
                    {monthTotal.toLocaleString('ru')}
                  </span>
                  <span className="text-muted-foreground text-lg"> / {budget.monthly.toLocaleString('ru')} ₽</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">ВСЕГО</div>
                <div className="font-rajdhani font-bold text-lg text-amber-400">{totalAll.toLocaleString('ru')} ₽</div>
              </div>
            </div>
            <div className="progress-bar-track h-3">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${budgetPct}%`,
                  background: budgetPct >= 90 ? '#ef4444' : budgetPct >= 70 ? '#f59e0b' : '#39d353',
                  boxShadow: `0 0 8px ${budgetPct >= 90 ? '#ef444466' : '#39d35366'}`
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
              <span>{Math.round(budgetPct)}% использовано</span>
              <span>Осталось: {Math.max(0, budget.monthly - monthTotal).toLocaleString('ru')} ₽</span>
            </div>
          </div>

          {/* График по месяцам */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="BarChart2" size={15} className="neon-text" />
              <span className="font-rajdhani font-semibold text-sm">Расходы за 6 месяцев</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#0d1a0d', border: '1px solid rgba(57,211,83,0.2)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`${v.toLocaleString('ru')} ₽`]}
                />
                <Bar dataKey="fuel" name="Топливо" stackId="a" fill="#39d353" radius={[0, 0, 0, 0]} />
                <Bar dataKey="maintenance" name="ТО + Запчасти" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Пирог */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="PieChart" size={15} className="neon-text" />
              <span className="font-rajdhani font-semibold text-sm">По категориям (всё время)</span>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={56} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                    <span className="text-xs font-rajdhani font-bold">{((item.value / totalAll) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Еженедельный/ежемесячный отчёт */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="TrendingUp" size={15} className="neon-text" />
              <span className="font-rajdhani font-semibold text-sm">Динамика расходов</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#0d1a0d', border: '1px solid rgba(57,211,83,0.2)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`${v.toLocaleString('ru')} ₽`, 'Всего']}
                />
                <Line type="monotone" dataKey="total" stroke="#39d353" strokeWidth={2} dot={{ fill: '#39d353', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {expenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
            <div key={e.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${EXPENSE_CATEGORY_COLORS[e.category]}20` }}>
                <Icon name={e.category === 'fuel' ? 'Fuel' : e.category === 'wash' ? 'Droplets' : e.category === 'parts' ? 'Wrench' : e.category === 'fines' ? 'AlertOctagon' : 'CreditCard'} size={14} style={{ color: EXPENSE_CATEGORY_COLORS[e.category] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{e.description}</div>
                <div className="text-xs text-muted-foreground">{e.date} · {EXPENSE_CATEGORY_LABELS[e.category]}</div>
              </div>
              <div className="font-rajdhani font-bold text-base text-amber-400">{e.amount.toLocaleString('ru')} ₽</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'add' && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="font-rajdhani font-bold text-lg">Новый расход</div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Категория</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setForm(f => ({ ...f, category: key }))}
                  className={`py-2 px-3 rounded-xl text-sm font-rajdhani font-semibold transition-all border ${form.category === key ? 'neon-border neon-text bg-[var(--glass)]' : 'border-border/50 text-muted-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Сумма, ₽</label>
            <input
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-lg font-rajdhani font-bold focus:outline-none focus:border-[var(--neon)]"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Описание</label>
            <input
              type="text"
              placeholder="Например: Заправка АЗС Лукойл"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--neon)]"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Дата</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--neon)]"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setTab('overview')} className="neon-btn-outline flex-1 py-3 rounded-xl text-sm">Отмена</button>
            <button onClick={addExpense} className="neon-btn flex-1 py-3 rounded-xl text-sm">Сохранить</button>
          </div>
        </div>
      )}
    </div>
  );
}
