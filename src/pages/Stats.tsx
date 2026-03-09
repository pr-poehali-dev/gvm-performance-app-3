import { useStore } from '@/store/useStore';
import Icon from '@/components/ui/icon';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar
} from 'recharts';
import { format, eachMonthOfInterval, subMonths, startOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Stats() {
  const [state] = useStore();
  const { trips, expenses, car, ownerPeriods } = state;

  const now = new Date();
  const months12 = eachMonthOfInterval({ start: subMonths(now, 11), end: now });

  const monthlyData = months12.map(m => {
    const start = startOfMonth(m);
    const end = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    const monthTrips = trips.filter(t => { const d = new Date(t.date); return d >= start && d <= end; });
    const monthExpenses = expenses.filter(e => { const d = new Date(e.date); return d >= start && d <= end; });
    return {
      name: format(m, 'MMM', { locale: ru }),
      km: monthTrips.reduce((s, t) => s + t.distance, 0),
      spend: monthExpenses.reduce((s, e) => s + e.amount, 0),
      trips: monthTrips.length,
    };
  });

  const totalKm = trips.reduce((s, t) => s + t.distance, 0);
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const costPerKm = totalKm > 0 ? (totalSpend / totalKm).toFixed(1) : 0;
  const avgMonthKm = Math.round(totalKm / 12);
  const avgMonthSpend = Math.round(totalSpend / 12);

  const calmPct = trips.length > 0 ? Math.round(trips.filter(t => t.drivingStyle === 'calm').length / trips.length * 100) : 0;
  const aggrPct = trips.length > 0 ? Math.round(trips.filter(t => t.drivingStyle === 'aggressive').length / trips.length * 100) : 0;
  const healthScore = Math.max(0, Math.min(100, 70 + calmPct * 0.2 - aggrPct * 0.3));

  const radarData = [
    { subject: 'Обслуживание', A: 82 },
    { subject: 'Вождение', A: 100 - aggrPct },
    { subject: 'Расходы', A: Math.max(0, 100 - (avgMonthSpend / 500)) },
    { subject: 'Пробег', A: Math.min(100, (avgMonthKm / 3000) * 100) },
    { subject: 'Документы', A: 90 },
    { subject: 'Хранение', A: 85 },
  ];

  const yearData = Array.from({ length: 5 }, (_, i) => {
    const year = now.getFullYear() - 4 + i;
    const km = trips
      .filter(t => new Date(t.date).getFullYear() === year)
      .reduce((s, t) => s + t.distance, 0);
    return { year: String(year), km };
  });

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="pt-2">
        <div className="font-rajdhani font-bold text-xl">Статистика</div>
        <div className="text-xs text-muted-foreground">Аналитика за всё время</div>
      </div>

      {/* Индекс здоровья авто */}
      <div className="glass-card rounded-2xl p-5 neon-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">ИНДЕКС ЗДОРОВЬЯ АВТОМОБИЛЯ</div>
            <div className="font-rajdhani font-bold text-4xl neon-glow-text">{Math.round(healthScore)}</div>
            <div className="text-xs text-muted-foreground mt-1">из 100 — {healthScore >= 80 ? 'Отличное состояние' : healthScore >= 60 ? 'Хорошее состояние' : 'Требует внимания'}</div>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#39d353" strokeWidth="6"
                strokeDasharray={`${(healthScore / 100) * 201} 201`} strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px #39d353)' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="Heart" size={22} className="neon-text" />
            </div>
          </div>
        </div>
      </div>

      {/* Ключевые показатели */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Всего пройдено', val: totalKm.toLocaleString('ru'), unit: 'км', color: 'neon-text', icon: 'MapPin' },
          { label: 'Всего потрачено', val: totalSpend.toLocaleString('ru'), unit: '₽', color: 'text-amber-400', icon: 'Wallet' },
          { label: 'Стоимость км', val: String(costPerKm), unit: '₽/км', color: 'text-purple-400', icon: 'TrendingUp' },
          { label: 'Поездок всего', val: String(trips.length), unit: 'шт', color: 'text-blue-400', icon: 'Navigation' },
        ].map(item => (
          <div key={item.label} className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name={item.icon} size={12} className="text-muted-foreground" />
              <div className="text-[10px] text-muted-foreground">{item.label.toUpperCase()}</div>
            </div>
            <div className={`font-rajdhani font-bold text-xl ${item.color}`}>{item.val}</div>
            <div className="text-xs text-muted-foreground">{item.unit}</div>
          </div>
        ))}
      </div>

      {/* Пробег и расходы по месяцам */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="TrendingUp" size={15} className="neon-text" />
          <span className="font-rajdhani font-semibold text-sm">Пробег по месяцам (12 мес.)</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#39d353" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#39d353" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0d1a0d', border: '1px solid rgba(57,211,83,0.2)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} км`]} />
            <Area type="monotone" dataKey="km" stroke="#39d353" strokeWidth={2} fill="url(#kmGradient)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Расходы по месяцам */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="BarChart2" size={15} className="text-amber-400" />
          <span className="font-rajdhani font-semibold text-sm">Расходы по месяцам</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#0d1a0d', border: '1px solid rgba(57,211,83,0.2)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v.toLocaleString('ru')} ₽`]} />
            <Bar dataKey="spend" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Радар */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Target" size={15} className="neon-text" />
          <span className="font-rajdhani font-semibold text-sm">Профиль автомобиля</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Оценка" dataKey="A" stroke="#39d353" fill="#39d353" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Пробег по годам */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Calendar" size={15} className="text-blue-400" />
          <span className="font-rajdhani font-semibold text-sm">Пробег по годам</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={yearData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0d1a0d', border: '1px solid rgba(57,211,83,0.2)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} км`]} />
            <Bar dataKey="km" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Средние показатели */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Activity" size={15} className="text-purple-400" />
          <span className="font-rajdhani font-semibold text-sm">Средние показатели</span>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Км в месяц', val: `${avgMonthKm.toLocaleString('ru')} км`, color: 'neon-text' },
            { label: 'Расходы в месяц', val: `${avgMonthSpend.toLocaleString('ru')} ₽`, color: 'text-amber-400' },
            { label: 'Поездок в месяц', val: `${Math.round(trips.length / 12)} шт`, color: 'text-blue-400' },
            { label: 'Средняя поездка', val: `${Math.round(totalKm / Math.max(1, trips.length))} км`, color: 'text-purple-400' },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/20 last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className={`font-rajdhani font-bold text-sm ${item.color}`}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}
