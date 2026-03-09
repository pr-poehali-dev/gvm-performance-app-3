import { useState } from 'react';
import { useStore, DOC_LABELS, type Document } from '@/store/useStore';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const DOC_ICONS: Record<string, string> = {
  sts: 'FileText',
  license: 'CreditCard',
  osago: 'Shield',
  kasko: 'ShieldCheck',
  diagnostic: 'ClipboardCheck',
};

function calcDaysLeft(expiryDate: string): number {
  return Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86400000);
}

export default function Documents() {
  const [state, update] = useStore();
  const { documents, pin, pinEnabled } = state;
  const [unlocked, setUnlocked] = useState(!pinEnabled);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Document>>({});

  function tryUnlock() {
    if (pinInput === pin) {
      setUnlocked(true);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
      setPinInput('');
    }
  }

  if (!unlocked) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="glass-card rounded-2xl p-8 text-center w-full max-w-xs">
          <div className="w-14 h-14 rounded-2xl bg-[var(--glass)] neon-border flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={24} className="neon-text" />
          </div>
          <div className="font-rajdhani font-bold text-lg mb-1">Документы</div>
          <div className="text-xs text-muted-foreground mb-6">Введите PIN для доступа</div>
          <div className="flex gap-2 justify-center mb-4">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-rajdhani font-bold transition-all ${pinError ? 'border-red-500 text-red-400' : pinInput.length > i ? 'border-[var(--neon)] neon-text' : 'border-border/50'}`}
              >
                {pinInput.length > i ? '●' : ''}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
              <button
                key={i}
                disabled={!key}
                onClick={() => {
                  if (key === '⌫') { setPinInput(p => p.slice(0, -1)); return; }
                  if (pinInput.length < 4) {
                    const newPin = pinInput + key;
                    setPinInput(newPin);
                    if (newPin.length === 4) {
                      setTimeout(() => {
                        if (newPin === pin) { setUnlocked(true); setPinInput(''); }
                        else { setPinError(true); setTimeout(() => { setPinError(false); setPinInput(''); }, 1000); }
                      }, 100);
                    }
                  }
                }}
                className={`h-12 rounded-xl font-rajdhani font-bold text-lg transition-all ${key ? 'glass-card hover:bg-white/10 active:scale-95' : 'opacity-0 pointer-events-none'} ${pinError ? 'text-red-400' : ''}`}
              >
                {key}
              </button>
            ))}
          </div>
          {pinError && <div className="text-red-400 text-xs mt-3 animate-fade-in">Неверный PIN</div>}
        </div>
      </div>
    );
  }

  function startEdit(doc: Document) {
    setEditing(doc.id);
    setForm({ ...doc });
  }

  function saveDoc() {
    if (!editing) return;
    update(s => ({
      ...s,
      documents: s.documents.map(d => d.id === editing ? { ...d, ...form } as Document : d)
    }));
    setEditing(null);
    toast.success('Документ обновлён');
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="font-rajdhani font-bold text-xl">Документы</div>
          <div className="text-xs text-muted-foreground">Защищено PIN</div>
        </div>
        <button onClick={() => setUnlocked(false)} className="glass-card p-2 rounded-xl">
          <Icon name="Lock" size={16} className="text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {documents.map(doc => {
          const daysLeft = calcDaysLeft(doc.expiryDate);
          const isExpiring = daysLeft <= doc.notifyDaysBefore;
          const isExpired = daysLeft < 0;
          const statusColor = isExpired ? '#ef4444' : isExpiring ? '#f59e0b' : '#39d353';

          return editing === doc.id ? (
            <div key={doc.id} className="glass-card rounded-2xl p-5 neon-border space-y-4">
              <div className="font-rajdhani font-bold text-base">{DOC_LABELS[doc.type]}</div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Номер</label>
                <input type="text" value={form.number ?? ''} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Дата выдачи</label>
                  <input type="date" value={form.issueDate ?? ''} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Действует до</label>
                  <input type="date" value={form.expiryDate ?? ''} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Стоимость ₽</label>
                <input type="number" value={form.cost ?? ''} onChange={e => setForm(f => ({ ...f, cost: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Предупреждать за (дней)</label>
                <input type="number" value={form.notifyDaysBefore ?? 30} onChange={e => setForm(f => ({ ...f, notifyDaysBefore: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditing(null)} className="neon-btn-outline flex-1 py-3 rounded-xl text-sm">Отмена</button>
                <button onClick={saveDoc} className="neon-btn flex-1 py-3 rounded-xl text-sm">Сохранить</button>
              </div>
            </div>
          ) : (
            <div key={doc.id} className="glass-card rounded-xl p-4" style={{ borderColor: isExpiring ? `${statusColor}40` : undefined, borderWidth: isExpiring ? 1 : undefined }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${statusColor}15` }}>
                    <Icon name={DOC_ICONS[doc.type] || 'FileText'} size={18} style={{ color: statusColor }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{DOC_LABELS[doc.type]}</div>
                    {doc.number && <div className="text-xs text-muted-foreground">{doc.number}</div>}
                    {doc.cost && <div className="text-xs text-muted-foreground">{doc.cost.toLocaleString('ru')} ₽</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">до {doc.expiryDate}</div>
                    <div className="font-rajdhani font-bold text-sm" style={{ color: statusColor }}>
                      {isExpired ? `просрочено ${Math.abs(daysLeft)}д` : `${daysLeft} дней`}
                    </div>
                  </div>
                  <button onClick={() => startEdit(doc)} className="p-1.5 rounded-lg hover:bg-white/5 ml-1">
                    <Icon name="Edit2" size={13} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Смена PIN */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Key" size={14} className="neon-text" />
          <span className="font-rajdhani font-semibold text-sm">Настройки PIN</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Защита документов PIN</span>
          <button
            onClick={() => update(s => ({ ...s, pinEnabled: !s.pinEnabled }))}
            className={`w-12 h-6 rounded-full transition-all relative ${pinEnabled ? 'bg-[var(--neon)]' : 'bg-border'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${pinEnabled ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
