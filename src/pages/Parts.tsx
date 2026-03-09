import { useState } from 'react';
import { useStore, type Part } from '@/store/useStore';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const PART_CATEGORIES = ['Масло', 'Фильтры', 'Тормоза', 'Свечи', 'Ходовая', 'Электрика', 'Кузов', 'Шины', 'Прочее'];

const CATEGORY_ICONS: Record<string, string> = {
  'Масло': 'Droplets',
  'Фильтры': 'Wind',
  'Тормоза': 'CircleSlash',
  'Свечи': 'Zap',
  'Ходовая': 'Settings',
  'Электрика': 'Battery',
  'Кузов': 'Car',
  'Шины': 'Circle',
  'Прочее': 'Package',
};

export default function Parts() {
  const [state, update] = useStore();
  const { parts, car } = state;
  const [adding, setAdding] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Part>>({
    category: 'Масло',
    name: '',
    brand: '',
    replacedAt: car.mileage,
    replacedDate: new Date().toISOString().split('T')[0],
    cost: 0,
    intervalKm: 10000,
    intervalDays: 365,
    notes: '',
  });

  const byCategory = PART_CATEGORIES.map(cat => ({
    cat,
    items: parts.filter(p => p.category === cat),
  })).filter(c => c.items.length > 0 || !selectedCat);

  function getNextKm(part: Part): { km: number; pct: number; status: 'ok' | 'warn' | 'overdue' } {
    if (!part.intervalKm) return { km: 0, pct: 0, status: 'ok' };
    const done = car.mileage - part.replacedAt;
    const pct = Math.min((done / part.intervalKm) * 100, 100);
    const km = part.intervalKm - done;
    const status = pct >= 100 ? 'overdue' : pct >= 80 ? 'warn' : 'ok';
    return { km, pct, status };
  }

  function savePart() {
    if (!form.name) { toast.error('Укажи название'); return; }
    const newPart: Part = {
      id: `p${Date.now()}`,
      category: form.category || 'Прочее',
      name: form.name!,
      brand: form.brand || undefined,
      replacedAt: form.replacedAt || car.mileage,
      replacedDate: form.replacedDate || new Date().toISOString().split('T')[0],
      cost: form.cost || 0,
      intervalKm: form.intervalKm || undefined,
      intervalDays: form.intervalDays || undefined,
      notes: form.notes || undefined,
    };
    update(s => ({ ...s, parts: [newPart, ...s.parts] }));
    setAdding(false);
    toast.success('Запчасть добавлена');
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="font-rajdhani font-bold text-xl">Запчасти</div>
          <div className="text-xs text-muted-foreground">{parts.length} записей</div>
        </div>
        <button onClick={() => setAdding(true)} className="neon-btn px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
          <Icon name="Plus" size={14} />
          Добавить
        </button>
      </div>

      {/* Категории */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setSelectedCat(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-rajdhani font-semibold border transition-all ${!selectedCat ? 'border-[var(--neon)] neon-text bg-[var(--glass)]' : 'border-border/50 text-muted-foreground'}`}
        >
          Все
        </button>
        {PART_CATEGORIES.filter(cat => parts.some(p => p.category === cat)).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-rajdhani font-semibold border transition-all ${selectedCat === cat ? 'border-[var(--neon)] neon-text bg-[var(--glass)]' : 'border-border/50 text-muted-foreground'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Список */}
      <div className="space-y-4">
        {byCategory
          .filter(c => !selectedCat || c.cat === selectedCat)
          .filter(c => c.items.length > 0)
          .map(({ cat, items }) => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={CATEGORY_ICONS[cat] || 'Package'} size={14} className="neon-text" />
              <span className="font-rajdhani font-semibold text-sm neon-text">{cat}</span>
            </div>
            <div className="space-y-2">
              {items.map(part => {
                const next = getNextKm(part);
                return (
                  <div key={part.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{part.name}</div>
                        {part.brand && <div className="text-xs text-muted-foreground">{part.brand}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-rajdhani font-bold text-sm text-amber-400">{part.cost.toLocaleString('ru')} ₽</div>
                        <div className="text-[10px] text-muted-foreground">{part.replacedDate}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="bg-white/[0.03] rounded-lg p-2">
                        <div className="text-muted-foreground">При пробеге</div>
                        <div className="font-rajdhani font-semibold">{part.replacedAt.toLocaleString('ru')} км</div>
                      </div>
                      {part.intervalKm && (
                        <div className="bg-white/[0.03] rounded-lg p-2">
                          <div className="text-muted-foreground">Интервал</div>
                          <div className="font-rajdhani font-semibold">{part.intervalKm.toLocaleString('ru')} км</div>
                        </div>
                      )}
                    </div>
                    {part.intervalKm && (
                      <>
                        <div className="progress-bar-track h-1.5">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${next.pct}%`,
                              background: next.status === 'overdue' ? '#ef4444' : next.status === 'warn' ? '#f59e0b' : '#39d353'
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                          <span>До замены: {next.km > 0 ? `${next.km.toLocaleString('ru')} км` : 'просрочено'}</span>
                          <span className={next.status === 'overdue' ? 'text-red-400' : next.status === 'warn' ? 'text-amber-400' : 'neon-text'}>{Math.round(next.pct)}%</span>
                        </div>
                      </>
                    )}
                    {part.notes && <div className="text-xs text-muted-foreground italic mt-2">{part.notes}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="font-rajdhani font-bold text-lg">Новая запчасть</div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Категория</label>
            <div className="grid grid-cols-3 gap-2">
              {PART_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))} className={`py-2 rounded-xl text-xs font-rajdhani font-semibold border transition-all ${form.category === cat ? 'border-[var(--neon)] neon-text bg-[var(--glass)]' : 'border-border/50 text-muted-foreground'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Название *</label>
            <input type="text" placeholder="Масло Mobil 1 5W-40" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Бренд</label>
              <input type="text" placeholder="Mobil" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Стоимость ₽</label>
              <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Пробег замены</label>
              <input type="number" value={form.replacedAt} onChange={e => setForm(f => ({ ...f, replacedAt: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Интервал км</label>
              <input type="number" value={form.intervalKm} onChange={e => setForm(f => ({ ...f, intervalKm: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAdding(false)} className="neon-btn-outline flex-1 py-3 rounded-xl text-sm">Отмена</button>
            <button onClick={savePart} className="neon-btn flex-1 py-3 rounded-xl text-sm">Сохранить</button>
          </div>
        </div>
      )}
    </div>
  );
}
