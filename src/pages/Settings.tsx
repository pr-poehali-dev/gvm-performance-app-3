import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type Tab = 'car' | 'telegram' | 'notifications' | 'data';

export default function Settings() {
  const [state, update] = useStore();
  const { car, telegram, notifications, budget, pin } = state;
  const [tab, setTab] = useState<Tab>('car');
  const [carForm, setCarForm] = useState({ ...car });
  const [tgForm, setTgForm] = useState({ ...telegram });
  const [budgetForm, setBudgetForm] = useState({ ...budget });
  const [testing, setTesting] = useState(false);

  function saveCar() {
    update(s => ({ ...s, car: { ...carForm } }));
    toast.success('Данные авто сохранены');
  }

  function saveTelegram() {
    update(s => ({ ...s, telegram: { ...tgForm } }));
    toast.success('Telegram настройки сохранены');
  }

  function saveBudget() {
    update(s => ({ ...s, budget: { ...budgetForm } }));
    toast.success('Бюджет обновлён');
  }

  async function testTelegram() {
    if (!tgForm.botToken || !tgForm.chatId) { toast.error('Заполни токен и Chat ID'); return; }
    setTesting(true);
    try {
      const url = `https://api.telegram.org/bot${tgForm.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgForm.chatId, text: '✅ GVM Performance: подключение работает!' }),
      });
      const data = await res.json();
      if (data.ok) toast.success('Сообщение отправлено!');
      else toast.error('Ошибка: ' + (data.description || 'проверь токен'));
    } catch {
      toast.error('Ошибка соединения');
    }
    setTesting(false);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gvm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Данные экспортированы');
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        update(() => data);
        toast.success('Данные импортированы');
      } catch {
        toast.error('Ошибка файла');
      }
    };
    reader.readAsText(file);
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'car', label: 'Автомобиль', icon: 'Car' },
    { id: 'telegram', label: 'Telegram', icon: 'Send' },
    { id: 'notifications', label: 'Уведомления', icon: 'Bell' },
    { id: 'data', label: 'Данные', icon: 'Database' },
  ];

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="pt-2">
        <div className="font-rajdhani font-bold text-xl">Настройки</div>
        <div className="text-xs text-muted-foreground">GVM Performance</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card rounded-xl p-1 overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-rajdhani font-semibold transition-all ${tab === t.id ? 'bg-[var(--neon)] text-[#080d08]' : 'text-muted-foreground'}`}
          >
            <Icon name={t.icon} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'car' && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="font-rajdhani font-bold text-base">Данные автомобиля</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Марка', field: 'brand' as const },
              { label: 'Модель', field: 'model' as const },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
                <input type="text" value={carForm[field] as string} onChange={e => setCarForm(f => ({ ...f, [field]: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Год</label>
              <input type="number" value={carForm.year} onChange={e => setCarForm(f => ({ ...f, year: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Объём</label>
              <input type="text" value={carForm.engineVolume} onChange={e => setCarForm(f => ({ ...f, engineVolume: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Мощность</label>
              <input type="text" value={carForm.power} onChange={e => setCarForm(f => ({ ...f, power: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">VIN</label>
            <input type="text" value={carForm.vin} onChange={e => setCarForm(f => ({ ...f, vin: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--neon)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Госномер</label>
              <input type="text" value={carForm.plate} onChange={e => setCarForm(f => ({ ...f, plate: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Топливо</label>
              <select value={carForm.fuelType} onChange={e => setCarForm(f => ({ ...f, fuelType: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]">
                {['Бензин', 'Дизель', 'Газ', 'Электро', 'Гибрид'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">КПП</label>
              <select value={carForm.transmission} onChange={e => setCarForm(f => ({ ...f, transmission: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]">
                {['АКПП', 'МКПП', 'Вариатор', 'Робот'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Привод</label>
              <select value={carForm.drive} onChange={e => setCarForm(f => ({ ...f, drive: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]">
                {['Передний', 'Задний', 'Полный'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Размер шин</label>
              <input type="text" value={carForm.tireSize} onChange={e => setCarForm(f => ({ ...f, tireSize: e.target.value }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">АКБ Вольтаж</label>
              <input type="number" step="0.1" value={carForm.batteryVoltage} onChange={e => setCarForm(f => ({ ...f, batteryVoltage: parseFloat(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
            </div>
          </div>
          <button onClick={saveCar} className="neon-btn w-full py-3 rounded-xl text-sm">Сохранить</button>
        </div>
      )}

      {tab === 'telegram' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Send" size={16} className="neon-text" />
              <div className="font-rajdhani font-bold text-base">Telegram Bot</div>
            </div>

            <div className="glass-card rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Для получения уведомлений: создай бота через @BotFather, получи токен.
                  Затем напиши своему боту /start и нажми «Получить Chat ID» ниже.
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Bot Token</label>
              <input
                type="text"
                placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
                value={tgForm.botToken}
                onChange={e => setTgForm(f => ({ ...f, botToken: e.target.value }))}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--neon)]"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Chat ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="123456789"
                  value={tgForm.chatId}
                  onChange={e => setTgForm(f => ({ ...f, chatId: e.target.value }))}
                  className="flex-1 bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--neon)]"
                />
                <button
                  onClick={() => window.open(`https://api.telegram.org/bot${tgForm.botToken}/getUpdates`, '_blank')}
                  className="neon-btn-outline px-3 py-2.5 rounded-xl text-xs flex-shrink-0"
                >
                  Получить ID
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Уведомления включены</span>
              <button onClick={() => setTgForm(f => ({ ...f, enabled: !f.enabled }))} className={`w-12 h-6 rounded-full transition-all relative ${tgForm.enabled ? 'bg-[var(--neon)]' : 'bg-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${tgForm.enabled ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={testTelegram} disabled={testing} className="neon-btn-outline flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {testing ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="TestTube" size={14} />}
                Проверить
              </button>
              <button onClick={saveTelegram} className="neon-btn flex-1 py-3 rounded-xl text-sm">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4">
            <div className="font-rajdhani font-bold text-sm mb-3">Техническое обслуживание</div>
            <div className="space-y-3">
              {[
                { key: 'oil', label: 'Замена масла', field: notifications.oil },
                { key: 'filters', label: 'Замена фильтров', field: notifications.filters },
              ].map(({ key, label, field }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div>
                    <div className="text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground">За {(field as { warnAtKm: number }).warnAtKm} км / {(field as { warnAtDays: number }).warnAtDays} дней</div>
                  </div>
                  <button
                    onClick={() => update(s => ({ ...s, notifications: { ...s.notifications, [key]: { ...s.notifications[key as keyof typeof s.notifications], enabled: !(s.notifications[key as keyof typeof s.notifications] as { enabled: boolean }).enabled } } }))}
                    className={`w-12 h-6 rounded-full transition-all relative ${(field as { enabled: boolean }).enabled ? 'bg-[var(--neon)]' : 'bg-border'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${(field as { enabled: boolean }).enabled ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="font-rajdhani font-bold text-sm mb-3">Отчёты</div>
            <div className="space-y-3">
              {[
                { key: 'weeklyReport', label: 'Еженедельная сводка', enabled: notifications.weeklyReport.enabled },
                { key: 'monthlyReport', label: 'Ежемесячный отчёт', enabled: notifications.monthlyReport.enabled },
              ].map(({ key, label, enabled }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <span className="text-sm">{label}</span>
                  <button
                    onClick={() => update(s => ({ ...s, notifications: { ...s.notifications, [key]: { ...(s.notifications as Record<string, object>)[key], enabled: !enabled } } }))}
                    className={`w-12 h-6 rounded-full transition-all relative ${enabled ? 'bg-[var(--neon)]' : 'bg-border'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="font-rajdhani font-bold text-sm mb-3">Поездки</div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Простой авто</div>
                <div className="text-xs text-muted-foreground">Если нет поездок {notifications.trips.idleDays} дней</div>
              </div>
              <button onClick={() => update(s => ({ ...s, notifications: { ...s.notifications, trips: { ...s.notifications.trips, enabled: !s.notifications.trips.enabled } } }))} className={`w-12 h-6 rounded-full transition-all relative ${notifications.trips.enabled ? 'bg-[var(--neon)]' : 'bg-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${notifications.trips.enabled ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'data' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="font-rajdhani font-bold text-sm">Бюджет</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">В месяц ₽</label>
                <input type="number" value={budgetForm.monthly} onChange={e => setBudgetForm(f => ({ ...f, monthly: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">В год ₽</label>
                <input type="number" value={budgetForm.yearly} onChange={e => setBudgetForm(f => ({ ...f, yearly: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon)]" />
              </div>
            </div>
            <button onClick={saveBudget} className="neon-btn w-full py-2.5 rounded-xl text-sm">Сохранить бюджет</button>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="font-rajdhani font-bold text-sm">Экспорт / Импорт</div>
            <div className="text-xs text-muted-foreground">Сохрани данные в JSON-файл или загрузи их на другом устройстве</div>
            <button onClick={exportData} className="neon-btn w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <Icon name="Download" size={14} />
              Экспортировать данные
            </button>
            <label className="neon-btn-outline w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Icon name="Upload" size={14} />
              Импортировать данные
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="font-rajdhani font-bold text-sm mb-2">О приложении</div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Версия</span><span className="neon-text">1.0.0</span></div>
              <div className="flex justify-between"><span>PIN код</span><span>{pin}</span></div>
              <div className="flex justify-between"><span>Данные</span><span>LocalStorage</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
