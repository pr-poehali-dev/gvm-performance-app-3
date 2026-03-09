import { useState } from 'react';
import { useStore, type Trip } from '@/store/useStore';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, eachMonthOfInterval, subMonths, startOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

const STYLE_LABELS = { calm: 'Спокойный', normal: 'Обычный', aggressive: 'Агрессивный' };
const STYLE_COLORS = { calm: '#39d353', normal: '#3b82f6', aggressive: '#ef4444' };

export default function Trips() {
  const [state, update] = useStore();
  const { trips } = state;
  const [tab, setTab] = useState<'list' | 'add' | 'stats'>('list');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startPoint: '',
    endPoint: '',
    distance: '',
    duration: '',
    fuelUsed: '',
    drivingStyle: 'normal' as Trip['drivingStyle'],
    notes: '',
  });

  const now = new Date();
  const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });

  const monthlyKm = months.map(m => {
    const start = startOfMonth(m);
    const end = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    const km = trips
      .filter(t => { const d = new Date(t.date); return d >= start && d <= end; })
      .reduce((s, t) => s + t.distance, 0);
    return { name: format(m, 'MMM', { locale: ru }), km };
  });

  const totalKm = trips.reduce((s, t) => s + t.distance, 0);
  const totalFuel = trips.reduce((s, t) => s + (t.fuelUsed || 0), 0);
  const avgDistance = trips.length > 0 ? Math.round(totalKm / trips.length) : 0;

  const styleStats = {
    calm: trips.filter(t => t.drivingStyle === 'calm').length,
    normal: trips.filter(t => t.drivingStyle === 'normal').length,
    aggressive: trips.filter(t => t.drivingStyle === 'aggressive').length,
  };

  const aggressiveIndex = trips.length > 0
    ? Math.round((styleStats.aggressive * 100 + styleStats.normal * 50) / trips.length)
    : 0;

  const lastTrip = trips.sort((a, b) => b.date.localeCompare(a.date))[0];
  const idleDays = lastTrip
    ? Math.floor((Date.now() - new Date(lastTrip.date).getTime()) / 86400000)
    : 0;

  function addTrip() {
    const dist = parseFloat(form.distance);
    if (!dist) { toast.error('Укажи расстояние'); return; }
    if (!form.startPoint || !form.endPoint) { toast.error('Укажи маршрут'); return; }
    const newTrip: Trip = {
      id: `t${Date.now()}`,
      date: form.date,
      startPoint: form.startPoint,
      endPoint: form.endPoint,
      distance: dist,
      duration: parseInt(form.duration) || Math.round(dist / 55 * 60),
      fuelUsed: form.fuelUsed ? parseFloat(form.fuelUsed) : undefined,
      drivingStyle: form.drivingStyle,
      notes: form.notes || undefined,
    };
    update(s => ({
      ...s,
      trips: [newTrip, ...s.trips],
      car: { ...s.car, mileage: s.car.mileage + dist },
    }));
    setForm({ date: new Date().toISOString().split('T')[0], startPoint: '', endPoint: '', distance: '', duration: '', fuelUsed: '', drivingStyle: 'normal', notes: '' });
    setTab('list');
    toast.success(`Поездка записана (+${dist} км)`);
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="font-rajdhani font-bold text-xl">Поездки</div>
          <div className="text-xs text-muted-foreground">Журнал маршрутов</div>
        </div>
        <button onClick={() => setTab('add')} className="neon-btn px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
          <Icon name="Plus" size={14} />
          Добавить
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 glass-card rounded-xl p-1">
        {(['list', 'stats'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-rajdhani font-semibold transition-all ${tab === t ? 'bg-[var(--neon)] text-[#080d08]' : 'text-muted-foreground'}`}
          >
            {t === 'list' ? 'Журнал' : 'Статистика'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div className="space-y-3">
          {/* Простой */}
          {idleDays > 3 && (
            <div className="glass-card rounded-xl p-3 border border-amber-500/30 flex items-center gap-3">
              <Icon name="Clock" size={16} className="text-amber-400" />
              <div>
                <div className="text-sm font-semibold text-amber-400">Простой {idleDays} дней</div>
                <div className="text-xs text-muted-foreground">Последняя поездка: {lastTrip?.date}</div>
              </div>
            </div>
          )}

          {trips.sort((a, b) => b.date.localeCompare(a.date)).map(trip => (
            <div key={trip.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <Icon name="MapPin" size={12} className="text-[var(--neon)]" />
                    {trip.startPoint}
                    <Icon name="ArrowRight" size={11} className="text-muted-foreground" />
                    {trip.endPoint}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{trip.date}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: STYLE_COLORS[trip.drivingStyle] }} />
                  <span className="text-xs text-muted-foreground">{STYLE_LABELS[trip.drivingStyle]}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                  <div className="font-rajdhani font-bold text-base neon-text">{trip.distance}</div>
                  <div className="text-[10px] text-muted-foreground">км</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                  <div className="font-rajdhani font-bold text-base">{trip.duration}</div>
                  <div className="text-[10px] text-muted-foreground">мин</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                  <div className="font-rajdhani font-bold text-base text-amber-400">{trip.fuelUsed ?? '—'}</div>
                  <div className="text-[10px] text-muted-foreground">л</div>
                </div>
              </div>
              {trip.notes && <div className="text-xs text-muted-foreground mt-2 italic">{trip.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Всего км', val: totalKm.toLocaleString('ru'), unit: 'км', color: 'neon-text' },
              { label: 'Поездок', val: trips.length.toString(), unit: 'шт', color: 'text-blue-400' },
              { label: 'Средняя', val: avgDistance.toString(), unit: 'км', color: 'text-purple-400' },
              { label: 'Топливо', val: totalFuel.toFixed(0), unit: 'л', color: 'text-amber-400' },
            ].map(item => (
              <div key={item.label} className="glass-card rounded-2xl p-4">
                <div className="text-[10px] text-muted-foreground">{item.label.toUpperCase()}</div>
                <div className={`font-rajdhani font-bold text-2xl mt-0.5 ${item.color}`}>{item.val}</div>
                <div className="text-xs text-muted-foreground">{item.unit}</div>
              </div>
            ))}
          </div>

          {/* Индекс агрессивности */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="Gauge" size={15} className="text-amber-400" />
                <span className="font-rajdhani font-semibold text-sm">Индекс агрессивности</span>
              </div>
              <span className={`font-rajdhani font-bold text-xl ${aggressiveIndex > 60 ? 'text-red-400' : aggressiveIndex > 30 ? 'text-amber-400' : 'neon-text'}`}>
                {aggressiveIndex}%
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              {Object.entries(styleStats).map(([style, count]) => (
                <div key={style} className="flex-1 text-center bg-white/[0.03] rounded-lg p-2">
                  <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: STYLE_COLORS[style as Trip['drivingStyle']] }} />
                  <div className="font-semibold">{count}</div>
                  <div className="text-muted-foreground">{STYLE_LABELS[style as Trip['drivingStyle']].split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* График */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="BarChart2" size={15} className="neon-text" />
              <span className="font-rajdhani font-semibold text-sm">Пробег по месяцам</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyKm} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0d1a0d', border: '1px solid rgba(57,211,83,0.2)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`${v} км`, 'Пробег']}
                />
                <Bar dataKey="km" fill="#39d353" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'add' && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="font-rajdhani font-bold text-lg">Новая поездка</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Откуда</label>
              <input type="text" placeholder="Начало маршрута" value={form.startPoint} onChange={e => setForm(f => ({ ...f, startPoint: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Куда</label>
              <input type="text" placeholder="Конец маршрута" value={form.endPoint} onChange={e => setForm(f => ({ ...f, endPoint: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Км</label>
              <input type="number" placeholder="0" value={form.distance} onChange={e => setForm(f => ({ ...f, distance: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Мин</label>
              <input type="number" placeholder="0" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Литров</label>
              <input type="number" placeholder="0" value={form.fuelUsed} onChange={e => setForm(f => ({ ...f, fuelUsed: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Стиль вождения</label>
            <div className="flex gap-2">
              {(['calm', 'normal', 'aggressive'] as const).map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, drivingStyle: s }))} className={`flex-1 py-2 rounded-xl text-xs font-rajdhani font-semibold border transition-all ${form.drivingStyle === s ? 'border-[var(--neon)] bg-[var(--glass)] neon-text' : 'border-border/50 text-muted-foreground'}`}>
                  {STYLE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Дата</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Заметка</label>
            <input type="text" placeholder="Необязательно" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setTab('list')} className="neon-btn-outline flex-1 py-3 rounded-xl text-sm">Отмена</button>
            <button onClick={addTrip} className="neon-btn flex-1 py-3 rounded-xl text-sm">Сохранить</button>
          </div>
        </div>
      )}
    </div>
  );
}
