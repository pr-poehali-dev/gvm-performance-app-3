import { useStore, calcIntervalStatus, type MaintenanceInterval } from '@/store/useStore';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useState } from 'react';

const PRIORITY_COLORS = { low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444' };
const PRIORITY_LABELS = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критичный' };

function ProgressBar({ pct, status }: { pct: number; status: 'ok' | 'warn' | 'overdue' }) {
  const color = status === 'overdue' ? '#ef4444' : status === 'warn' ? '#f59e0b' : '#39d353';
  return (
    <div className="progress-bar-track h-2 w-full">
      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}44` }} />
    </div>
  );
}

export default function Intervals() {
  const [state, update] = useStore();
  const { intervals, car } = state;
  const [filter, setFilter] = useState<'all' | 'warn' | 'ok'>('all');

  const withStatus = intervals.map(iv => ({
    ...iv,
    ...calcIntervalStatus(iv, car.mileage),
  }));

  const filtered = withStatus.filter(iv => {
    if (filter === 'warn') return iv.status !== 'ok';
    if (filter === 'ok') return iv.status === 'ok';
    return true;
  });

  const grouped = filtered.reduce((acc, iv) => {
    if (!acc[iv.category]) acc[iv.category] = [];
    acc[iv.category].push(iv);
    return acc;
  }, {} as Record<string, typeof filtered>);

  function markReplaced(id: string) {
    update(s => ({
      ...s,
      intervals: s.intervals.map(iv =>
        iv.id === id
          ? { ...iv, lastKm: s.car.mileage, lastDate: new Date().toISOString().split('T')[0] }
          : iv
      )
    }));
    toast.success('Замена записана!');
  }

  function toggleEnabled(id: string) {
    update(s => ({
      ...s,
      intervals: s.intervals.map(iv => iv.id === id ? { ...iv, enabled: !iv.enabled } : iv)
    }));
  }

  const overdueCount = withStatus.filter(iv => iv.status === 'overdue').length;
  const warnCount = withStatus.filter(iv => iv.status === 'warn').length;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="font-rajdhani font-bold text-xl">Интервалы ТО</div>
          <div className="text-xs text-muted-foreground">
            {overdueCount > 0 && <span className="text-red-400">{overdueCount} просрочено · </span>}
            {warnCount > 0 && <span className="text-amber-400">{warnCount} скоро · </span>}
            <span>{intervals.length} всего</span>
          </div>
        </div>
      </div>

      {/* Фильтр */}
      <div className="flex gap-1.5 glass-card rounded-xl p-1">
        {(['all', 'warn', 'ok'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-lg text-xs font-rajdhani font-semibold transition-all ${filter === f ? 'bg-[var(--neon)] text-[#080d08]' : 'text-muted-foreground'}`}
          >
            {f === 'all' ? 'Все' : f === 'warn' ? '⚠ Внимание' : '✓ В норме'}
          </button>
        ))}
      </div>

      {/* Группы */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="font-rajdhani font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-border/50" />
              {category}
              <div className="h-px flex-1 bg-border/50" />
            </div>
            <div className="space-y-3">
              {items.map(iv => (
                <div key={iv.id} className={`glass-card rounded-xl p-4 ${!iv.enabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{iv.name}</span>
                        <span className="badge-pill" style={{ background: `${PRIORITY_COLORS[iv.priority]}20`, color: PRIORITY_COLORS[iv.priority] }}>
                          {PRIORITY_LABELS[iv.priority]}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Последняя: {iv.lastDate} · {iv.lastKm.toLocaleString('ru')} км
                      </div>
                    </div>
                    <button onClick={() => toggleEnabled(iv.id)} className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ml-2 ${iv.enabled ? 'bg-[var(--neon)]' : 'bg-border'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${iv.enabled ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <ProgressBar pct={iv.pct} status={iv.status} />

                  <div className="flex justify-between mt-2 text-[11px]">
                    <span className="text-muted-foreground">
                      {iv.intervalKm > 0 && `${iv.intervalKm.toLocaleString('ru')} км`}
                      {iv.intervalKm > 0 && iv.intervalDays > 0 && ' / '}
                      {iv.intervalDays > 0 && `${iv.intervalDays} дней`}
                    </span>
                    <span className={iv.status === 'overdue' ? 'text-red-400 font-semibold' : iv.status === 'warn' ? 'text-amber-400 font-semibold' : 'neon-text'}>
                      {iv.status === 'overdue' ? 'ПРОСРОЧЕНО' : `${Math.round(iv.pct)}%`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                    {iv.intervalKm > 0 && (
                      <div className="bg-white/[0.02] rounded-lg p-2">
                        <div className="text-[10px]">Осталось км</div>
                        <div className={`font-rajdhani font-semibold ${iv.kmLeft <= 0 ? 'text-red-400' : iv.kmLeft < 1000 ? 'text-amber-400' : 'text-foreground'}`}>
                          {iv.kmLeft > 0 ? `${iv.kmLeft.toLocaleString('ru')} км` : 'просрочено'}
                        </div>
                      </div>
                    )}
                    {iv.intervalDays > 0 && (
                      <div className="bg-white/[0.02] rounded-lg p-2">
                        <div className="text-[10px]">Осталось дней</div>
                        <div className={`font-rajdhani font-semibold ${iv.daysLeft <= 0 ? 'text-red-400' : iv.daysLeft < 30 ? 'text-amber-400' : 'text-foreground'}`}>
                          {iv.daysLeft > 0 ? `${iv.daysLeft} дн.` : 'просрочено'}
                        </div>
                      </div>
                    )}
                  </div>

                  {iv.status !== 'ok' && iv.enabled && (
                    <button
                      onClick={() => markReplaced(iv.id)}
                      className="neon-btn-outline w-full mt-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      <Icon name="CheckCircle" size={13} />
                      Я заменил / выполнил
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="h-2" />
    </div>
  );
}
