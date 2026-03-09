import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, calcIntervalStatus, EXPENSE_CATEGORY_COLORS } from '@/store/useStore';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function ProgressBar({ pct, status }: { pct: number; status: 'ok' | 'warn' | 'overdue' }) {
  const color = status === 'overdue' ? '#ef4444' : status === 'warn' ? '#f59e0b' : '#39d353';
  return (
    <div className="progress-bar-track h-2 w-full">
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }}
      />
    </div>
  );
}

export default function Home() {
  const [state, update] = useStore();
  const { car, trips, expenses, intervals } = state;
  const navigate = useNavigate();
  const [editMileage, setEditMileage] = useState(false);
  const [mileageInput, setMileageInput] = useState(String(car.mileage));

  const topIntervals = intervals
    .map(iv => ({ ...iv, ...calcIntervalStatus(iv, car.mileage) }))
    .filter(iv => iv.status !== 'ok' || iv.pct >= 60)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTrips = trips.filter(t => new Date(t.date) >= monthStart);
  const monthKm = monthTrips.reduce((s, t) => s + t.distance, 0);
  const monthExpenses = expenses
    .filter(e => new Date(e.date) >= monthStart)
    .reduce((s, e) => s + e.amount, 0);

  const expenseByCategory = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([key, value]) => ({ name: key, value, color: EXPENSE_CATEGORY_COLORS[key as keyof typeof EXPENSE_CATEGORY_COLORS] || '#6b7280' }));

  const oilInterval = intervals.find(i => i.id === 'i1');
  const oilStatus = oilInterval ? calcIntervalStatus(oilInterval, car.mileage) : null;

  const expiringDocs = state.documents
    .filter(d => {
      const daysLeft = Math.floor((new Date(d.expiryDate).getTime() - Date.now()) / 86400000);
      return daysLeft <= d.notifyDaysBefore;
    })
    .map(d => ({
      ...d,
      daysLeft: Math.floor((new Date(d.expiryDate).getTime() - Date.now()) / 86400000),
    }));

  function saveMileage() {
    const val = parseInt(mileageInput);
    if (!isNaN(val) && val > 0) {
      update(s => ({ ...s, car: { ...s.car, mileage: val } }));
      setEditMileage(false);
      toast.success('Пробег обновлён');
    }
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="font-rajdhani font-bold text-xl neon-text tracking-widest">GVM PERFORMANCE</div>
          <div className="text-xs text-muted-foreground">Учёт автомобиля</div>
        </div>
        <button onClick={() => navigate('/settings')} className="glass-card p-2 rounded-xl">
          <Icon name="Bell" size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Карточка авто */}
      <div className="glass-card rounded-2xl p-4 neon-border animate-slide-up stagger-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--glass)] neon-border flex items-center justify-center">
              <Icon name="Car" size={24} className="neon-text" />
            </div>
            <div>
              <div className="font-rajdhani font-bold text-lg leading-tight">{car.brand} {car.model}</div>
              <div className="text-xs text-muted-foreground">{car.year} · {car.engineVolume}L · {car.power} л.с.</div>
            </div>
          </div>
          <button onClick={() => navigate('/settings?tab=car')} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <Icon name="Edit2" size={15} className="text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Госномер', val: car.plate },
            { label: 'КПП', val: car.transmission },
            { label: 'Привод', val: car.drive },
          ].map(item => (
            <div key={item.label} className="bg-white/[0.03] rounded-xl p-2 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">{item.label}</div>
              <div className="font-rajdhani font-semibold text-sm">{item.val}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground">ПРОБЕГ</div>
            {editMileage ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={mileageInput}
                  onChange={e => setMileageInput(e.target.value)}
                  className="bg-white/10 border border-border rounded-lg px-2 py-1 text-sm font-rajdhani font-bold w-24"
                  autoFocus
                />
                <button onClick={saveMileage} className="neon-btn px-3 py-1 rounded-lg text-xs">OK</button>
                <button onClick={() => setEditMileage(false)} className="text-muted-foreground text-xs">✕</button>
              </div>
            ) : (
              <button onClick={() => { setMileageInput(String(car.mileage)); setEditMileage(true); }} className="flex items-center gap-1 group">
                <span className="font-rajdhani font-bold text-2xl neon-glow-text">{car.mileage.toLocaleString('ru')}</span>
                <span className="text-muted-foreground text-xs">км</span>
                <Icon name="Pencil" size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">АКБ</div>
            <div className="font-rajdhani font-bold text-lg" style={{ color: car.batteryVoltage >= 12.5 ? '#39d353' : '#f59e0b' }}>
              {car.batteryVoltage}V
            </div>
          </div>
        </div>
      </div>

      {/* Масло и состояние */}
      {oilStatus && oilInterval && (
        <div className="glass-card rounded-2xl p-4 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Droplets" size={16} className="neon-text" />
              <span className="font-rajdhani font-semibold text-sm">Масло двигателя</span>
            </div>
            <span className={`badge-pill ${oilStatus.status === 'overdue' ? 'bg-red-500/20 text-red-400' : oilStatus.status === 'warn' ? 'bg-amber-500/20 text-amber-400' : 'bg-[var(--neon)]/20 text-[var(--neon)]'}`}>
              {oilStatus.status === 'overdue' ? 'ПРОСРОЧЕНО' : oilStatus.status === 'warn' ? 'СКОРО' : 'OK'}
            </span>
          </div>
          <ProgressBar pct={oilStatus.pct} status={oilStatus.status} />
          <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
            <span>Осталось: {oilStatus.kmLeft > 0 ? `${oilStatus.kmLeft.toLocaleString('ru')} км` : 'просрочено'}</span>
            <span>{Math.round(oilStatus.pct)}%</span>
          </div>
          <button
            onClick={() => {
              update(s => ({
                ...s,
                intervals: s.intervals.map(i => i.id === 'i1' ? { ...i, lastKm: s.car.mileage, lastDate: new Date().toISOString().split('T')[0] } : i)
              }));
              toast.success('Замена масла записана!');
            }}
            className="neon-btn-outline w-full mt-3 py-2 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Icon name="CheckCircle" size={14} />
            Я заменил
          </button>
        </div>
      )}

      {/* Интервалы — предупреждения */}
      {topIntervals.length > 0 && (
        <div className="glass-card rounded-2xl p-4 animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={16} className="text-amber-400" />
              <span className="font-rajdhani font-semibold text-sm">Требует внимания</span>
            </div>
            <button onClick={() => navigate('/intervals')} className="text-xs neon-text">Все →</button>
          </div>
          <div className="space-y-3">
            {topIntervals.map(iv => (
              <div key={iv.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground/80">{iv.name}</span>
                  <span className={iv.status === 'overdue' ? 'text-red-400' : iv.status === 'warn' ? 'text-amber-400' : 'text-muted-foreground'}>
                    {iv.kmLeft > 0 ? `${iv.kmLeft.toLocaleString('ru')} км` : 'просрочено'}
                  </span>
                </div>
                <ProgressBar pct={iv.pct} status={iv.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Документы */}
      {expiringDocs.length > 0 && (
        <div className="glass-card rounded-2xl p-4 animate-slide-up stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="FileText" size={16} className="text-red-400" />
            <span className="font-rajdhani font-semibold text-sm">Истекающие документы</span>
          </div>
          {expiringDocs.map(d => (
            <div key={d.id} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
              <span className="text-sm">{d.type.toUpperCase()}</span>
              <span className={`text-sm font-rajdhani font-semibold ${d.daysLeft < 0 ? 'text-red-400' : d.daysLeft < 14 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                {d.daysLeft < 0 ? `просрочено ${Math.abs(d.daysLeft)}д` : `${d.daysLeft} дней`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Статистика месяца */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up stagger-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="text-[10px] text-muted-foreground mb-1">ПРОБЕГ / МЕСЯЦ</div>
          <div className="font-rajdhani font-bold text-2xl neon-text">{monthKm.toLocaleString('ru')}</div>
          <div className="text-xs text-muted-foreground">км · {monthTrips.length} поездок</div>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="text-[10px] text-muted-foreground mb-1">РАСХОДЫ / МЕСЯЦ</div>
          <div className="font-rajdhani font-bold text-2xl text-amber-400">{monthExpenses.toLocaleString('ru')}</div>
          <div className="text-xs text-muted-foreground">₽</div>
        </div>
      </div>

      {/* Мини-диаграмма расходов */}
      <div className="glass-card rounded-2xl p-4 animate-slide-up stagger-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="PieChart" size={16} className="neon-text" />
            <span className="font-rajdhani font-semibold text-sm">Расходы по категориям</span>
          </div>
          <button onClick={() => navigate('/finance')} className="text-xs neon-text">Подробнее →</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={26} outerRadius={42} dataKey="value" strokeWidth={0}>
                  {expenseByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {expenseByCategory.slice(0, 5).map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-xs text-muted-foreground flex-1 truncate">{item.name}</span>
                <span className="text-xs font-rajdhani font-semibold">{item.value.toLocaleString('ru')}₽</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Шины и сезон */}
      <div className="glass-card rounded-2xl p-4 animate-slide-up stagger-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
              {car.tireSeason === 'winter' ? '❄️' : car.tireSeason === 'summer' ? '☀️' : '🔄'}
            </div>
            <div>
              <div className="font-rajdhani font-semibold text-sm">
                {car.tireSeason === 'winter' ? 'Зимние шины' : car.tireSeason === 'summer' ? 'Летние шины' : 'Всесезонные'}
              </div>
              <div className="text-xs text-muted-foreground">{car.tireSize}</div>
            </div>
          </div>
          <div className="badge-pill bg-blue-500/20 text-blue-400">
            {car.tireSeason === 'winter' ? 'ЗИМА' : car.tireSeason === 'summer' ? 'ЛЕТО' : 'ALL'}
          </div>
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}
