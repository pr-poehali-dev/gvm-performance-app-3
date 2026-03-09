import { useState } from 'react';
import { useStore, calcOwnerRating, type OwnerPeriod } from '@/store/useStore';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

function RatingBadge({ score }: { score: number }) {
  const color = score >= 75 ? '#39d353' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Отлично' : score >= 50 ? 'Хорошо' : 'Плохо';
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${(score / 100) * 113} 113`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-rajdhani font-bold text-sm" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function calcPeriodStats(period: OwnerPeriod, currentMileage: number) {
  const endMileage = period.endMileage ?? currentMileage;
  const startDate = new Date(period.startDate);
  const endDate = period.endDate ? new Date(period.endDate) : new Date();
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);
  const months = days / 30;
  const km = endMileage - period.startMileage;
  return {
    km,
    days,
    kmPerDay: days > 0 ? Math.round(km / days) : 0,
    kmPerMonth: months > 0 ? Math.round(km / months) : 0,
  };
}

export default function Owners() {
  const [state, update] = useStore();
  const { ownerPeriods, car } = state;
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Partial<OwnerPeriod>>({
    ownerName: '',
    startDate: '',
    endDate: '',
    startMileage: 0,
    endMileage: undefined,
    city: '',
    comment: '',
    hasAccidents: 0,
    maintenanceScore: 7,
    washFrequency: 5,
    partsQuality: 'original',
    hasGarage: false,
    drivingStyle: 'normal',
  });

  const sorted = [...ownerPeriods].sort((a, b) => a.startDate.localeCompare(b.startDate));

  function saveOwner() {
    if (!form.ownerName || !form.startDate) { toast.error('Заполни обязательные поля'); return; }
    const newPeriod: OwnerPeriod = {
      id: `op${Date.now()}`,
      ownerName: form.ownerName!,
      startDate: form.startDate!,
      endDate: form.endDate || undefined,
      startMileage: form.startMileage || 0,
      endMileage: form.endMileage,
      city: form.city || '',
      comment: form.comment,
      hasAccidents: form.hasAccidents || 0,
      maintenanceScore: form.maintenanceScore || 7,
      washFrequency: form.washFrequency || 5,
      partsQuality: form.partsQuality || 'original',
      hasGarage: form.hasGarage || false,
      drivingStyle: form.drivingStyle || 'normal',
    };
    update(s => ({ ...s, ownerPeriods: [...s.ownerPeriods, newPeriod] }));
    setAdding(false);
    toast.success('Период владения добавлен');
  }

  if (selected) {
    const period = ownerPeriods.find(p => p.id === selected);
    if (!period) return null;
    const rating = calcOwnerRating(period);
    const stats = calcPeriodStats(period, car.mileage);

    const positives = [];
    const negatives = [];
    if (period.washFrequency >= 8) positives.push('Регулярные мойки');
    if (period.maintenanceScore >= 8) positives.push('Своевременное ТО');
    if (period.partsQuality === 'premium') positives.push('Премиум запчасти');
    if (period.hasGarage) positives.push('Хранение в гараже');
    if (period.hasAccidents === 0) positives.push('Без аварий');
    if (period.drivingStyle === 'calm') positives.push('Плавный стиль');
    if (period.hasAccidents > 0) negatives.push(`Аварий: ${period.hasAccidents}`);
    if (period.maintenanceScore < 6) negatives.push('Пропуски ТО');
    if (period.drivingStyle === 'aggressive') negatives.push('Агрессивный стиль');
    if (period.partsQuality === 'economy') negatives.push('Дешёвые запчасти');

    return (
      <div className="p-4 space-y-4 animate-fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ChevronLeft" size={18} />
          <span className="text-sm">Назад</span>
        </button>

        <div className="glass-card rounded-2xl p-5 neon-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-rajdhani font-bold text-lg">{period.ownerName}</div>
              <div className="text-xs text-muted-foreground">{period.city}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{period.startDate} — {period.endDate || 'сейчас'}</div>
            </div>
            <RatingBadge score={rating} />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Пробег', val: `${stats.km.toLocaleString('ru')} км` },
              { label: 'Дней', val: `${stats.days}` },
              { label: 'км/день', val: `${stats.kmPerDay}` },
              { label: 'км/мес', val: `${stats.kmPerMonth}` },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.03] rounded-xl p-3 text-center">
                <div className="text-[10px] text-muted-foreground">{item.label.toUpperCase()}</div>
                <div className="font-rajdhani font-bold text-base mt-0.5 neon-text">{item.val}</div>
              </div>
            ))}
          </div>

          {period.comment && (
            <div className="text-sm text-muted-foreground italic border-l-2 border-[var(--neon)]/30 pl-3 mb-4">{period.comment}</div>
          )}

          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
            <div className="bg-white/[0.03] rounded-xl p-2">
              <div className="text-muted-foreground">Запчасти</div>
              <div className="font-semibold mt-0.5">{period.partsQuality === 'economy' ? 'Эконом' : period.partsQuality === 'original' ? 'Оригинал' : 'Премиум'}</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-2">
              <div className="text-muted-foreground">Стиль</div>
              <div className="font-semibold mt-0.5" style={{ color: period.drivingStyle === 'calm' ? '#39d353' : period.drivingStyle === 'aggressive' ? '#ef4444' : '#3b82f6' }}>
                {period.drivingStyle === 'calm' ? 'Спокойный' : period.drivingStyle === 'aggressive' ? 'Агрессивный' : 'Обычный'}
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-2">
              <div className="text-muted-foreground">Гараж</div>
              <div className={`font-semibold mt-0.5 ${period.hasGarage ? 'neon-text' : 'text-muted-foreground'}`}>{period.hasGarage ? 'Да' : 'Нет'}</div>
            </div>
          </div>

          {positives.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-[var(--neon)] font-semibold mb-2">+ Положительные практики</div>
              <div className="space-y-1">
                {positives.map(p => (
                  <div key={p} className="flex items-center gap-2 text-sm">
                    <Icon name="CheckCircle" size={13} className="neon-text flex-shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {negatives.length > 0 && (
            <div>
              <div className="text-xs text-red-400 font-semibold mb-2">— Негативные практики</div>
              <div className="space-y-1">
                {negatives.map(n => (
                  <div key={n} className="flex items-center gap-2 text-sm">
                    <Icon name="XCircle" size={13} className="text-red-400 flex-shrink-0" />
                    <span>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="font-rajdhani font-bold text-xl">Периоды владения</div>
          <div className="text-xs text-muted-foreground">{ownerPeriods.length} владельцев</div>
        </div>
        <button onClick={() => setAdding(true)} className="neon-btn px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
          <Icon name="Plus" size={14} />
          Добавить
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {sorted.map((period, idx) => {
          const rating = calcOwnerRating(period);
          const stats = calcPeriodStats(period, car.mileage);
          const ratingColor = rating >= 75 ? '#39d353' : rating >= 50 ? '#f59e0b' : '#ef4444';
          const isCurrent = !period.endDate;

          return (
            <div key={period.id} className="flex gap-3">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 flex-shrink-0 mt-4" style={{ borderColor: ratingColor, background: `${ratingColor}30` }} />
                {idx < sorted.length - 1 && <div className="w-0.5 flex-1 bg-border/50 mt-1" />}
              </div>

              <button
                onClick={() => setSelected(period.id)}
                className="flex-1 glass-card rounded-xl p-4 text-left hover:border-[var(--neon)]/30 transition-all mb-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-rajdhani font-semibold text-sm">{period.ownerName.split(' ')[0]} {period.ownerName.split(' ')[1] ? period.ownerName.split(' ')[1][0] + '.' : ''}</span>
                      {isCurrent && <span className="badge-pill bg-[var(--neon)]/20 text-[var(--neon)]">ТЕКУЩИЙ</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{period.city} · {period.startDate.slice(0, 4)}{period.endDate ? `–${period.endDate.slice(0, 4)}` : '–н.в.'}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stats.km.toLocaleString('ru')} км за {stats.days} дней</div>
                  </div>
                  <RatingBadge score={rating} />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {adding && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="font-rajdhani font-bold text-lg">Новый период владения</div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">ФИО владельца *</label>
            <input type="text" placeholder="Иванов Иван Иванович" value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Дата начала *</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Дата окончания</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Пробег начало</label>
              <input type="number" value={form.startMileage} onChange={e => setForm(f => ({ ...f, startMileage: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Пробег конец</label>
              <input type="number" value={form.endMileage ?? ''} onChange={e => setForm(f => ({ ...f, endMileage: e.target.value ? parseInt(e.target.value) : undefined }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Город</label>
            <input type="text" placeholder="Москва" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Стиль вождения</label>
            <div className="flex gap-2">
              {(['calm', 'normal', 'aggressive'] as const).map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, drivingStyle: s }))} className={`flex-1 py-2 rounded-xl text-xs font-rajdhani font-semibold border transition-all ${form.drivingStyle === s ? 'border-[var(--neon)] neon-text bg-[var(--glass)]' : 'border-border/50 text-muted-foreground'}`}>
                  {s === 'calm' ? 'Спокойный' : s === 'normal' ? 'Обычный' : 'Агрессивный'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Качество запчастей</label>
            <div className="flex gap-2">
              {(['economy', 'original', 'premium'] as const).map(q => (
                <button key={q} onClick={() => setForm(f => ({ ...f, partsQuality: q }))} className={`flex-1 py-2 rounded-xl text-xs font-rajdhani font-semibold border transition-all ${form.partsQuality === q ? 'border-[var(--neon)] neon-text bg-[var(--glass)]' : 'border-border/50 text-muted-foreground'}`}>
                  {q === 'economy' ? 'Эконом' : q === 'original' ? 'Оригинал' : 'Премиум'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Хранение в гараже</span>
            <button onClick={() => setForm(f => ({ ...f, hasGarage: !f.hasGarage }))} className={`w-12 h-6 rounded-full transition-all relative ${form.hasGarage ? 'bg-[var(--neon)]' : 'bg-border'}`}>
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${form.hasGarage ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Комментарий</label>
            <input type="text" placeholder="Необязательно" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAdding(false)} className="neon-btn-outline flex-1 py-3 rounded-xl text-sm">Отмена</button>
            <button onClick={saveOwner} className="neon-btn flex-1 py-3 rounded-xl text-sm">Сохранить</button>
          </div>
        </div>
      )}
    </div>
  );
}
