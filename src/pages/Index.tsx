import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ============================================================
// TYPES
// ============================================================
type Section = "home" | "finances" | "trips" | "ownership" | "parts" | "stats" | "intervals" | "settings" | "documents";

interface CarData {
  avatar: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  plate: string;
  engine: string;
  power: number;
  fuel: string;
  transmission: string;
  drive: string;
  mileage: number;
  lastOil: number;
  lastService: number;
  tireSeason: string;
  tireSize: string;
  batteryVoltage: number;
}

interface Trip {
  id: number;
  date: string;
  from: string;
  to: string;
  distance: number;
  duration: string;
  fuel: number;
  style: "calm" | "normal" | "sport";
}

interface Expense {
  id: number;
  date: string;
  category: string;
  item: string;
  amount: number;
  mileage: number;
}

interface OwnerPeriod {
  id: number;
  owner: string;
  start: string;
  end: string;
  mileageStart: number;
  mileageEnd: number;
  city: string;
  comment: string;
  rating: number;
}

interface Interval {
  id: string;
  name: string;
  category: string;
  lastMileage: number;
  intervalKm: number;
  currentMileage: number;
  lastDate: string;
}

interface Document {
  id: string;
  name: string;
  number: string;
  expires: string;
  daysLeft: number;
}

// ============================================================
// TEST DATA
// ============================================================
const initialCar: CarData = {
  avatar: "🚙",
  brand: "Toyota",
  model: "Land Cruiser 200",
  year: 2019,
  vin: "JTMHV05J904082341",
  plate: "А777ВВ777",
  engine: "4.5L V8 TDI",
  power: 249,
  fuel: "Дизель",
  transmission: "АКПП 6",
  drive: "Полный 4WD",
  mileage: 87430,
  lastOil: 82000,
  lastService: 80000,
  tireSeason: "Зима",
  tireSize: "285/60 R18",
  batteryVoltage: 12.7,
};

const testTrips: Trip[] = Array.from({ length: 30 }, (_, i) => {
  const styles: ("calm" | "normal" | "sport")[] = ["calm", "normal", "sport"];
  const routes = [
    { from: "Москва", to: "Домодедово" },
    { from: "Офис", to: "Дом" },
    { from: "Москва", to: "Серпухов" },
    { from: "Дом", to: "Дача" },
    { from: "ТЦ Мега", to: "Центр" },
    { from: "Москва", to: "Коломна" },
  ];
  const route = routes[i % routes.length];
  const d = new Date(2026, 2, 9 - i);
  return {
    id: i + 1,
    date: d.toLocaleDateString("ru-RU"),
    from: route.from,
    to: route.to,
    distance: [24, 18, 120, 85, 45, 142, 32, 67, 91, 28][i % 10],
    duration: ["32 мин", "24 мин", "1ч 45м", "1ч 12м", "58 мин", "2ч 05м"][i % 6],
    fuel: parseFloat(([24, 18, 120, 85, 45, 142, 32, 67, 91, 28][i % 10] * 0.11).toFixed(1)),
    style: styles[i % 3],
  };
});

const testExpenses: Expense[] = [
  { id: 1, date: "05.03.2026", category: "Масло", item: "Моторное масло Mobil 1 5W-40", amount: 8500, mileage: 87430 },
  { id: 2, date: "01.03.2026", category: "Фильтры", item: "Масляный фильтр Toyota", amount: 650, mileage: 87430 },
  { id: 3, date: "20.02.2026", category: "Шины", item: "Балансировка 4 колеса", amount: 2400, mileage: 87200 },
  { id: 4, date: "15.02.2026", category: "Топливо", item: "Заправка ДТ 70л", amount: 5950, mileage: 87100 },
  { id: 5, date: "10.02.2026", category: "Мойка", item: "Детейлинг-мойка", amount: 3500, mileage: 87000 },
  { id: 6, date: "28.01.2026", category: "Страховка", item: "ОСАГО продление", amount: 18500, mileage: 86500 },
  { id: 7, date: "20.01.2026", category: "Топливо", item: "Заправка ДТ 65л", amount: 5525, mileage: 86400 },
  { id: 8, date: "15.01.2026", category: "ТО", item: "ТО-80000 км полное", amount: 24000, mileage: 80000 },
  { id: 9, date: "05.01.2026", category: "Запчасти", item: "Колодки передние Brembo", amount: 9800, mileage: 79800 },
  { id: 10, date: "28.12.2025", category: "Топливо", item: "Заправка ДТ 72л", amount: 6120, mileage: 79600 },
  { id: 11, date: "20.12.2025", category: "Шины", item: "Смена шин зима/лето", amount: 4800, mileage: 79400 },
  { id: 12, date: "10.12.2025", category: "Мойка", item: "Ручная мойка", amount: 1200, mileage: 79200 },
  { id: 13, date: "01.12.2025", category: "Топливо", item: "Заправка ДТ 68л", amount: 5780, mileage: 79000 },
  { id: 14, date: "20.11.2025", category: "Запчасти", item: "Воздушный фильтр", amount: 2100, mileage: 78800 },
  { id: 15, date: "10.11.2025", category: "Топливо", item: "Заправка ДТ 75л", amount: 6375, mileage: 78600 },
  { id: 16, date: "05.11.2025", category: "Мойка", item: "Экспресс-мойка", amount: 800, mileage: 78400 },
  { id: 17, date: "28.10.2025", category: "Топливо", item: "Заправка ДТ 70л", amount: 5950, mileage: 78200 },
  { id: 18, date: "20.10.2025", category: "Страховка", item: "КАСКО платёж", amount: 35000, mileage: 78000 },
  { id: 19, date: "15.10.2025", category: "Запчасти", item: "Свечи накаливания к-т", amount: 6400, mileage: 77800 },
  { id: 20, date: "05.10.2025", category: "Топливо", item: "Заправка ДТ 66л", amount: 5610, mileage: 77600 },
];

const testOwners: OwnerPeriod[] = [
  { id: 1, owner: "Петров Александр Иванович", start: "15.01.2019", end: "20.06.2020", mileageStart: 0, mileageEnd: 22400, city: "Москва", comment: "Первый владелец, куплен новым у дилера", rating: 82 },
  { id: 2, owner: "Сидорова Мария Сергеевна", start: "21.06.2020", end: "10.02.2021", mileageStart: 22400, mileageEnd: 35800, city: "Санкт-Петербург", comment: "В основном городские поездки", rating: 68 },
  { id: 3, owner: "Козлов Дмитрий Олегович", start: "11.02.2021", end: "30.09.2022", mileageStart: 35800, mileageEnd: 58200, city: "Краснодар", comment: "Активная эксплуатация, есть пробег по грунту", rating: 54 },
  { id: 4, owner: "Новиков Евгений Владимирович", start: "01.10.2022", end: "28.11.2024", mileageStart: 58200, mileageEnd: 79500, city: "Москва", comment: "ТО строго по регламенту", rating: 76 },
  { id: 5, owner: "Иванов Сергей Николаевич", start: "29.11.2024", end: "—", mileageStart: 79500, mileageEnd: 87430, city: "Москва", comment: "Текущий владелец", rating: 88 },
];

const testIntervals: Interval[] = [
  { id: "oil-engine", name: "Моторное масло", category: "Масло", lastMileage: 82000, intervalKm: 10000, currentMileage: 87430, lastDate: "01.11.2025" },
  { id: "oil-gearbox", name: "Масло КПП", category: "Масло", lastMileage: 70000, intervalKm: 40000, currentMileage: 87430, lastDate: "01.06.2024" },
  { id: "filter-oil", name: "Масляный фильтр", category: "Фильтры", lastMileage: 82000, intervalKm: 10000, currentMileage: 87430, lastDate: "01.11.2025" },
  { id: "filter-air", name: "Воздушный фильтр", category: "Фильтры", lastMileage: 78800, intervalKm: 15000, currentMileage: 87430, lastDate: "20.11.2025" },
  { id: "filter-cabin", name: "Салонный фильтр", category: "Фильтры", lastMileage: 75000, intervalKm: 15000, currentMileage: 87430, lastDate: "01.05.2025" },
  { id: "brake-fluid", name: "Тормозная жидкость", category: "Жидкости", lastMileage: 80000, intervalKm: 40000, currentMileage: 87430, lastDate: "01.07.2025" },
  { id: "coolant", name: "Антифриз", category: "Жидкости", lastMileage: 60000, intervalKm: 60000, currentMileage: 87430, lastDate: "01.01.2023" },
  { id: "brake-pads-front", name: "Колодки передние", category: "Тормоза", lastMileage: 79800, intervalKm: 30000, currentMileage: 87430, lastDate: "05.01.2026" },
  { id: "spark-plugs", name: "Свечи накаливания", category: "Двигатель", lastMileage: 77800, intervalKm: 30000, currentMileage: 87430, lastDate: "15.10.2025" },
  { id: "tires", name: "Смена шин", category: "Шины", lastMileage: 79400, intervalKm: 0, currentMileage: 87430, lastDate: "20.12.2025" },
];

const testDocuments: Document[] = [
  { id: "sts", name: "СТС", number: "77 ОО 123456", expires: "15.01.2029", daysLeft: 1042 },
  { id: "license", name: "Права", number: "7777 123456", expires: "20.08.2026", daysLeft: 164 },
  { id: "osago", name: "ОСАГО", number: "ХХХ 0123456789", expires: "28.01.2027", daysLeft: 325 },
  { id: "kasko", name: "КАСКО", number: "123456789-АТ", expires: "20.10.2026", daysLeft: 225 },
  { id: "diagcard", name: "Диагностическая карта", number: "012345678901234", expires: "15.03.2026", daysLeft: 6 },
];

// ============================================================
// HELPERS
// ============================================================
function getProgressColor(pct: number) {
  if (pct >= 80) return "#ef4444";
  if (pct >= 60) return "#f59e0b";
  return "#39d353";
}

function getDocColor(days: number) {
  if (days < 30) return "#ef4444";
  if (days < 90) return "#f59e0b";
  return "#39d353";
}

function getRatingColor(r: number) {
  if (r >= 75) return "#39d353";
  if (r >= 50) return "#f59e0b";
  return "#ef4444";
}

function getRatingLabel(r: number) {
  if (r >= 85) return "Отличный";
  if (r >= 70) return "Хороший";
  if (r >= 55) return "Средний";
  return "Слабый";
}

function getCategoryIcon(cat: string): string {
  const map: Record<string, string> = {
    "Масло": "Droplets",
    "Фильтры": "Filter",
    "Жидкости": "Beaker",
    "Тормоза": "CircleDot",
    "Двигатель": "Zap",
    "Шины": "Circle",
    "Топливо": "Fuel",
    "Страховка": "Shield",
    "Мойка": "Sparkles",
    "Запчасти": "Wrench",
    "ТО": "Settings2",
  };
  return map[cat] || "Tag";
}

function formatMoney(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

// ============================================================
// MINI COMPONENTS
// ============================================================
function NeonProgress({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const clr = color || getProgressColor(pct);
  return (
    <div className="progress-bar-track w-full h-2">
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%`, background: clr, boxShadow: `0 0 8px ${clr}60` }}
      />
    </div>
  );
}

function StatCard({ label, value, sub, icon, delay = 0 }: { label: string; value: string; sub?: string; icon: string; delay?: number }) {
  return (
    <div
      className="glass-card rounded-xl p-4 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-muted-foreground text-xs font-golos uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(57,211,83,0.12)" }}>
          <Icon name={icon} size={16} className="neon-text" />
        </div>
      </div>
      <div className="font-rajdhani font-bold text-2xl text-foreground">{value}</div>
      {sub && <div className="text-muted-foreground text-xs mt-1">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 animate-fade-in">
      <h1 className="font-rajdhani font-bold text-3xl neon-glow-text tracking-wide">{title}</h1>
      {sub && <p className="text-muted-foreground text-sm mt-1">{sub}</p>}
    </div>
  );
}

// ============================================================
// MINI BAR CHART
// ============================================================
function BarChart({ data, color = "#39d353" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-500"
          style={{
            height: `${(v / max) * 100}%`,
            background: color,
            opacity: i === data.length - 1 ? 1 : 0.5 + (i / data.length) * 0.5,
            boxShadow: i === data.length - 1 ? `0 0 8px ${color}80` : "none",
            minHeight: "2px",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// DONUT CHART
// ============================================================
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cumulative = 0;
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const R = 55;
  const r = 35;

  function polarToXY(deg: number, radius: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const paths = segments.map((seg) => {
    const startAngle = (cumulative / total) * 360;
    const endAngle = ((cumulative + seg.value) / total) * 360;
    cumulative += seg.value;
    const s1 = polarToXY(startAngle, R);
    const e1 = polarToXY(endAngle, R);
    const s2 = polarToXY(endAngle, r);
    const e2 = polarToXY(startAngle, r);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    const d = `M${s1.x},${s1.y} A${R},${R},0,${large},1,${e1.x},${e1.y} L${s2.x},${s2.y} A${r},${r},0,${large},0,${e2.x},${e2.y} Z`;
    return { d, color: seg.color };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} opacity="0.85" />
      ))}
    </svg>
  );
}

// ============================================================
// HOME SECTION
// ============================================================
function HomeSection({ car, setCar }: { car: CarData; setCar: (c: CarData) => void }) {
  const [mileageInput, setMileageInput] = useState(car.mileage.toString());

  const nextIntervals = testIntervals
    .map((iv) => ({
      ...iv,
      kmLeft: iv.lastMileage + iv.intervalKm - car.mileage,
      pct: iv.intervalKm > 0 ? Math.min(((car.mileage - iv.lastMileage) / iv.intervalKm) * 100, 100) : 0,
    }))
    .filter((iv) => iv.intervalKm > 0)
    .sort((a, b) => a.kmLeft - b.kmLeft)
    .slice(0, 4);

  const monthlyTrips = testTrips.slice(0, 12);
  const monthlyKm = monthlyTrips.reduce((s, t) => s + t.distance, 0);
  const monthlyData = [340, 280, 420, 390, 510, 460, 380, 490, 520, 440, 380, monthlyKm];

  const saveMileage = () => {
    const v = parseInt(mileageInput);
    if (!isNaN(v) && v > 0) setCar({ ...car, mileage: v });
  };

  return (
    <div className="space-y-4">
      <div className="glass-card neon-border rounded-2xl p-5 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "rgba(57,211,83,0.12)" }}>
              {car.avatar}
            </div>
            <div>
              <div className="font-rajdhani font-bold text-xl text-foreground">{car.brand} {car.model}</div>
              <div className="text-muted-foreground text-sm">{car.year} · {car.engine}</div>
              <div className="font-rajdhani font-semibold text-lg neon-text mt-0.5">{car.plate}</div>
            </div>
          </div>
          <button className="neon-btn-outline rounded-lg px-3 py-1.5 text-sm">
            <Icon name="Pencil" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { l: "Мощность", v: car.power + " л.с." },
            { l: "Топливо", v: car.fuel },
            { l: "КПП", v: car.transmission },
            { l: "Привод", v: car.drive },
            { l: "АКБ", v: car.batteryVoltage + " В" },
            { l: "Шины", v: car.tireSeason },
          ].map((item) => (
            <div key={item.l} className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-muted-foreground text-xs">{item.l}</div>
              <div className="font-rajdhani font-semibold text-sm text-foreground mt-0.5">{item.v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(57,211,83,0.06)", border: "1px solid rgba(57,211,83,0.2)" }}>
          <Icon name="Gauge" size={20} className="neon-text shrink-0" />
          <div className="flex-1">
            <div className="text-muted-foreground text-xs">Текущий пробег</div>
            <div className="font-rajdhani font-bold text-xl neon-text">{car.mileage.toLocaleString()} км</div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={mileageInput}
              onChange={(e) => setMileageInput(e.target.value)}
              className="w-28 rounded-lg px-2 py-1 text-sm font-rajdhani text-center"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(57,211,83,0.3)", color: "#e8f5e9", outline: "none" }}
            />
            <button onClick={saveMileage} className="neon-btn rounded-lg px-3 py-1 text-sm">OK</button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-1">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-4">Интервалы обслуживания</div>
        <div className="space-y-3">
          {nextIntervals.map((iv) => (
            <div key={iv.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{iv.name}</span>
                <span className="font-rajdhani text-sm" style={{ color: getProgressColor(iv.pct) }}>
                  {iv.kmLeft > 0 ? `ещё ${iv.kmLeft.toLocaleString()} км` : "Требует замены!"}
                </span>
              </div>
              <NeonProgress value={car.mileage - iv.lastMileage} max={iv.intervalKm} />
            </div>
          ))}
        </div>
        <button className="neon-btn w-full rounded-xl py-2.5 text-sm mt-4 font-rajdhani font-bold tracking-wider">
          ОТМЕТИТЬ ЗАМЕНУ
        </button>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-2">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-3">Документы</div>
        <div className="space-y-2">
          {testDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div>
                <div className="text-sm font-semibold text-foreground">{doc.name}</div>
                <div className="text-xs text-muted-foreground">{doc.expires}</div>
              </div>
              <div className="badge-pill" style={{ color: getDocColor(doc.daysLeft), background: `${getDocColor(doc.daysLeft)}20` }}>
                {doc.daysLeft < 30 ? `${doc.daysLeft} дн!` : `${doc.daysLeft} дн`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-3">
        <div className="flex items-center justify-between mb-4">
          <div className="font-rajdhani font-bold text-lg text-foreground">Пробег по месяцам</div>
          <div className="badge-pill" style={{ background: "rgba(57,211,83,0.12)", color: "#39d353" }}>2026</div>
        </div>
        <BarChart data={monthlyData} />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground font-rajdhani">
          {["Я", "Ф", "М", "А", "М", "И", "И", "А", "С", "О", "Н", "Д"].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">За месяц</div>
            <div className="font-rajdhani font-bold neon-text">{monthlyKm} км</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">За год</div>
            <div className="font-rajdhani font-bold text-foreground">{monthlyData.reduce((s, v) => s + v, 0).toLocaleString()} км</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FINANCES SECTION
// ============================================================
function FinancesSection() {
  const categories = [
    { label: "Топливо", icon: "Fuel", color: "#39d353" },
    { label: "ТО", icon: "Settings2", color: "#22d3ee" },
    { label: "Запчасти", icon: "Wrench", color: "#a78bfa" },
    { label: "Страховка", icon: "Shield", color: "#f59e0b" },
    { label: "Мойка", icon: "Sparkles", color: "#ec4899" },
    { label: "Шины", icon: "Circle", color: "#fb923c" },
    { label: "Масло", icon: "Droplets", color: "#34d399" },
    { label: "Фильтры", icon: "Filter", color: "#60a5fa" },
  ];

  const totals = categories.map((c) => ({
    ...c,
    total: testExpenses.filter((e) => e.category === c.label).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  const grand = totals.reduce((s, c) => s + c.total, 0);
  const budget = 150000;
  const budgetPct = Math.min((grand / budget) * 100, 100);

  const monthlyExpenses = [18400, 28900, 14200, 22000, 35600, 19800, 16500, 24100, 31200, 17800, 43200, 14370];

  return (
    <div className="space-y-4">
      <SectionHeader title="Финансы" sub="Расходы на автомобиль" />

      <div className="glass-card neon-border rounded-2xl p-5 animate-fade-in">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wider">Бюджет 2026</div>
            <div className="font-rajdhani font-bold text-3xl neon-text mt-1">{formatMoney(grand)}</div>
            <div className="text-muted-foreground text-sm">из {formatMoney(budget)}</div>
          </div>
          <div className="w-20 h-20">
            <DonutChart segments={totals.slice(0, 5).map((c) => ({ value: c.total, color: c.color, label: c.label }))} />
          </div>
        </div>
        <NeonProgress value={grand} max={budget} color={getProgressColor(budgetPct)} />
        <div className="text-xs text-muted-foreground mt-1">{budgetPct.toFixed(0)}% от бюджета</div>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-1">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-3">По категориям</div>
        <div className="space-y-2">
          {totals.sort((a, b) => b.total - a.total).map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${c.color}20` }}>
                <Icon name={c.icon} size={14} style={{ color: c.color }} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{c.label}</span>
                  <span className="font-rajdhani font-semibold" style={{ color: c.color }}>{formatMoney(c.total)}</span>
                </div>
                <NeonProgress value={c.total} max={grand} color={c.color} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-2">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-4">Расходы по месяцам</div>
        <BarChart data={monthlyExpenses} color="#a78bfa" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground font-rajdhani">
          {["Я", "Ф", "М", "А", "М", "И", "И", "А", "С", "О", "Н", "Д"].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-3">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-3">Последние расходы</div>
        <div className="space-y-2">
          {testExpenses.slice(0, 8).map((exp) => {
            const cat = categories.find((c) => c.label === exp.category);
            return (
              <div key={exp.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cat?.color || "#39d353"}15` }}>
                  <Icon name={cat?.icon || "Tag"} size={14} style={{ color: cat?.color || "#39d353" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{exp.item}</div>
                  <div className="text-xs text-muted-foreground">{exp.date} · {exp.mileage.toLocaleString()} км</div>
                </div>
                <div className="font-rajdhani font-bold text-sm shrink-0" style={{ color: cat?.color || "#39d353" }}>
                  {formatMoney(exp.amount)}
                </div>
              </div>
            );
          })}
        </div>
        <button className="neon-btn w-full rounded-xl py-2.5 text-sm mt-4 font-rajdhani font-bold tracking-wider">
          + ДОБАВИТЬ РАСХОД
        </button>
      </div>
    </div>
  );
}

// ============================================================
// TRIPS SECTION
// ============================================================
function TripsSection() {
  const styleColors: Record<string, string> = { calm: "#39d353", normal: "#f59e0b", sport: "#ef4444" };
  const styleLabels: Record<string, string> = { calm: "Спокойно", normal: "Умеренно", sport: "Агрессивно" };
  const totalKm = testTrips.reduce((s, t) => s + t.distance, 0);
  const totalFuel = testTrips.reduce((s, t) => s + t.fuel, 0);

  return (
    <div className="space-y-4">
      <SectionHeader title="Поездки" sub={`${testTrips.length} поездок в журнале`} />

      <div className="grid grid-cols-3 gap-3 animate-fade-in">
        <StatCard label="Пробег" value={`${totalKm.toLocaleString()} км`} icon="Route" />
        <StatCard label="Топливо" value={`${totalFuel.toFixed(0)} л`} icon="Fuel" delay={0.05} />
        <StatCard label="Поездок" value={testTrips.length.toString()} icon="Navigation" delay={0.1} />
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-1">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-3">Журнал поездок</div>
        <div className="space-y-2">
          {testTrips.slice(0, 15).map((trip) => (
            <div key={trip.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="Navigation" size={14} className="neon-text" />
                  <span className="text-sm font-semibold text-foreground">{trip.from} → {trip.to}</span>
                </div>
                <div className="badge-pill" style={{ color: styleColors[trip.style], background: `${styleColors[trip.style]}20` }}>
                  {styleLabels[trip.style]}
                </div>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                <span>{trip.date}</span>
                <span>{trip.distance} км</span>
                <span>{trip.duration}</span>
                <span>{trip.fuel} л</span>
              </div>
            </div>
          ))}
        </div>
        <button className="neon-btn w-full rounded-xl py-2.5 text-sm mt-4 font-rajdhani font-bold tracking-wider">
          + ДОБАВИТЬ ПОЕЗДКУ
        </button>
      </div>
    </div>
  );
}

// ============================================================
// OWNERSHIP SECTION
// ============================================================
function OwnershipSection() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <SectionHeader title="Владельцы" sub="История автомобиля по владельцам" />

      <div className="glass-card rounded-2xl p-5 animate-fade-in">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-4">Временная шкала</div>
        <div className="space-y-3">
          {testOwners.map((owner, i) => {
            const km = owner.mileageEnd - owner.mileageStart;
            const color = getRatingColor(owner.rating);
            const isCurrent = owner.end === "—";
            return (
              <div
                key={owner.id}
                className="rounded-xl p-4 cursor-pointer transition-all duration-200 animate-fade-in"
                style={{
                  background: selected === owner.id ? `${color}10` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected === owner.id ? color + "40" : "rgba(255,255,255,0.06)"}`,
                  animationDelay: `${i * 0.07}s`,
                }}
                onClick={() => setSelected(selected === owner.id ? null : owner.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-sm font-semibold text-foreground">{owner.owner.split(" ")[0]} {owner.owner.split(" ")[1]}</span>
                    {isCurrent && <span className="badge-pill" style={{ background: "rgba(57,211,83,0.15)", color: "#39d353" }}>Сейчас</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16">
                      <NeonProgress value={owner.rating} max={100} color={color} />
                    </div>
                    <span className="font-rajdhani font-bold text-sm" style={{ color }}>{owner.rating}%</span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>{owner.start} — {owner.end}</span>
                  <span>+{km.toLocaleString()} км</span>
                  <span>{owner.city}</span>
                </div>

                {selected === owner.id && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { l: "Пробег за период", v: km.toLocaleString() + " км" },
                        { l: "Рейтинг", v: getRatingLabel(owner.rating) },
                        { l: "Пробег начало", v: owner.mileageStart.toLocaleString() + " км" },
                        { l: "Пробег конец", v: owner.mileageEnd.toLocaleString() + " км" },
                      ].map((item) => (
                        <div key={item.l} className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <div className="text-xs text-muted-foreground">{item.l}</div>
                          <div className="font-rajdhani font-semibold text-sm text-foreground mt-0.5">{item.v}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground italic">{owner.comment}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-1">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-4">Рейтинг владельцев</div>
        <div className="space-y-3">
          {[...testOwners].sort((a, b) => b.rating - a.rating).map((owner, i) => (
            <div key={owner.id} className="flex items-center gap-3">
              <div className="font-rajdhani font-bold text-lg w-6 text-muted-foreground">{i + 1}</div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{owner.owner.split(" ")[0]} {owner.owner.split(" ")[1]}</span>
                  <span className="font-rajdhani font-bold" style={{ color: getRatingColor(owner.rating) }}>{owner.rating}%</span>
                </div>
                <NeonProgress value={owner.rating} max={100} color={getRatingColor(owner.rating)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PARTS SECTION
// ============================================================
function PartsSection() {
  const partCategories = [
    { name: "Масла и жидкости", icon: "Droplets", color: "#39d353", count: 4 },
    { name: "Фильтры", icon: "Filter", color: "#22d3ee", count: 4 },
    { name: "Тормозная система", icon: "CircleDot", color: "#ef4444", count: 3 },
    { name: "Двигатель", icon: "Zap", color: "#f59e0b", count: 5 },
    { name: "Подвеска", icon: "Settings2", color: "#a78bfa", count: 6 },
    { name: "Шины и диски", icon: "Circle", color: "#fb923c", count: 2 },
    { name: "Электрика", icon: "Battery", color: "#60a5fa", count: 3 },
    { name: "Кузов", icon: "Car", color: "#34d399", count: 2 },
  ];

  const recentParts = testExpenses
    .filter((e) => ["Запчасти", "Масло", "Фильтры"].includes(e.category))
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <SectionHeader title="Запчасти" sub="История замен и категории" />

      <div className="grid grid-cols-2 gap-3 animate-fade-in">
        {partCategories.map((cat, i) => (
          <div
            key={cat.name}
            className="glass-card rounded-xl p-3 cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}15` }}>
                <Icon name={cat.icon} size={16} style={{ color: cat.color }} />
              </div>
              <div className="badge-pill" style={{ background: `${cat.color}15`, color: cat.color }}>{cat.count}</div>
            </div>
            <div className="text-sm font-semibold text-foreground">{cat.name}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-2">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-3">Последние замены</div>
        <div className="space-y-2">
          {recentParts.map((part) => (
            <div key={part.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(57,211,83,0.12)" }}>
                <Icon name={getCategoryIcon(part.category)} size={14} className="neon-text" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">{part.item}</div>
                <div className="text-xs text-muted-foreground">{part.date} · {part.mileage.toLocaleString()} км</div>
              </div>
              <div className="font-rajdhani font-bold text-sm neon-text shrink-0">{formatMoney(part.amount)}</div>
            </div>
          ))}
        </div>
        <button className="neon-btn w-full rounded-xl py-2.5 text-sm mt-4 font-rajdhani font-bold tracking-wider">
          + ДОБАВИТЬ ЗАПЧАСТЬ
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STATS SECTION
// ============================================================
function StatsSection() {
  const totalExpenses = testExpenses.reduce((s, e) => s + e.amount, 0);
  const totalKm = testTrips.reduce((s, t) => s + t.distance, 0);
  const costPerKm = totalKm > 0 ? (totalExpenses / totalKm).toFixed(1) : "0";

  const sportTrips = testTrips.filter((t) => t.style === "sport").length;
  const aggrIndex = Math.round((sportTrips / testTrips.length) * 100);

  const weeklyData = [340, 280, 420, 390, 510, 460, 380];
  const monthlyExpenses = [18400, 28900, 14200, 22000, 35600, 19800, 16500, 24100, 31200, 17800, 43200, 14370];

  return (
    <div className="space-y-4">
      <SectionHeader title="Статистика" sub="Аналитика и отчёты" />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Расходов" value={formatMoney(totalExpenses)} icon="TrendingDown" />
        <StatCard label="Км пробег" value={totalKm.toLocaleString()} icon="Route" delay={0.05} />
        <StatCard label="₽ / км" value={costPerKm + " ₽"} icon="Calculator" delay={0.1} />
        <StatCard label="Агрессивность" value={aggrIndex + "%"} icon="Gauge" delay={0.15} />
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-1">
        <div className="flex items-center justify-between mb-4">
          <div className="font-rajdhani font-bold text-lg text-foreground">Пробег за неделю</div>
          <div className="badge-pill" style={{ background: "rgba(57,211,83,0.12)", color: "#39d353" }}>Дни</div>
        </div>
        <BarChart data={weeklyData} color="#39d353" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground font-rajdhani">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="mt-3 flex gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Итого</div>
            <div className="font-rajdhani font-bold neon-text">{weeklyData.reduce((s, v) => s + v, 0)} км</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Средний/день</div>
            <div className="font-rajdhani font-bold text-foreground">{Math.round(weeklyData.reduce((s, v) => s + v, 0) / 7)} км</div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-2">
        <div className="flex items-center justify-between mb-4">
          <div className="font-rajdhani font-bold text-lg text-foreground">Расходы по месяцам</div>
          <div className="badge-pill" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>2026</div>
        </div>
        <BarChart data={monthlyExpenses} color="#a78bfa" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground font-rajdhani">
          {["Я", "Ф", "М", "А", "М", "И", "И", "А", "С", "О", "Н", "Д"].map((m, i) => <span key={i}>{m}</span>)}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-3">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-4">Индекс агрессивности</div>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="40" cy="40" r="30" fill="none" stroke={aggrIndex > 50 ? "#ef4444" : "#f59e0b"} strokeWidth="8"
                strokeDasharray={`${aggrIndex * 1.885} 188.5`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-rajdhani font-bold text-lg" style={{ color: aggrIndex > 50 ? "#ef4444" : "#f59e0b" }}>{aggrIndex}%</span>
            </div>
          </div>
          <div>
            <div className="text-foreground font-semibold">{aggrIndex < 30 ? "Спокойный" : aggrIndex < 60 ? "Смешанный" : "Агрессивный"}</div>
            <div className="text-muted-foreground text-sm mt-1">Из {testTrips.length} поездок</div>
            <div className="text-muted-foreground text-sm">{sportTrips} спортивных</div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: "Спокойные", count: testTrips.filter(t => t.style === "calm").length, color: "#39d353" },
            { label: "Умеренные", count: testTrips.filter(t => t.style === "normal").length, color: "#f59e0b" },
            { label: "Агрессивные", count: testTrips.filter(t => t.style === "sport").length, color: "#ef4444" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <div className="flex-1 text-sm text-foreground">{s.label}</div>
              <div className="font-rajdhani font-semibold" style={{ color: s.color }}>{s.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INTERVALS SECTION
// ============================================================
function IntervalsSection() {
  const [intervals, setIntervals] = useState(testIntervals);

  const markDone = (id: string) => {
    setIntervals((prev) =>
      prev.map((iv) => iv.id === id ? { ...iv, lastMileage: iv.currentMileage, lastDate: new Date().toLocaleDateString("ru-RU") } : iv)
    );
  };

  const groups = Array.from(new Set(intervals.map((iv) => iv.category)));

  return (
    <div className="space-y-4">
      <SectionHeader title="Интервалы" sub="Регламент обслуживания" />
      {groups.map((group, gi) => (
        <div key={group} className="glass-card rounded-2xl p-5 animate-fade-in" style={{ animationDelay: `${gi * 0.08}s` }}>
          <div className="flex items-center gap-2 mb-3">
            <Icon name={getCategoryIcon(group)} size={16} className="neon-text" />
            <div className="font-rajdhani font-bold text-base text-foreground">{group}</div>
          </div>
          <div className="space-y-4">
            {intervals.filter((iv) => iv.category === group).map((iv) => {
              const pct = iv.intervalKm > 0 ? Math.min(((iv.currentMileage - iv.lastMileage) / iv.intervalKm) * 100, 100) : 0;
              const kmLeft = iv.lastMileage + iv.intervalKm - iv.currentMileage;
              const color = getProgressColor(pct);
              return (
                <div key={iv.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{iv.name}</div>
                      <div className="text-xs text-muted-foreground">Последняя: {iv.lastDate}</div>
                    </div>
                    <div className="text-right">
                      {iv.intervalKm > 0 ? (
                        <>
                          <div className="font-rajdhani font-bold text-sm" style={{ color }}>
                            {kmLeft > 0 ? `${kmLeft.toLocaleString()} км` : "Пора!"}
                          </div>
                          <div className="text-xs text-muted-foreground">{pct.toFixed(0)}%</div>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">Сезонная</div>
                      )}
                    </div>
                  </div>
                  {iv.intervalKm > 0 && <NeonProgress value={iv.currentMileage - iv.lastMileage} max={iv.intervalKm} color={color} />}
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => markDone(iv.id)}
                      className="neon-btn-outline rounded-lg px-3 py-1 text-xs"
                    >
                      ✓ Заменил
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SETTINGS SECTION
// ============================================================
function SettingsSection() {
  const [token, setToken] = useState(localStorage.getItem("tg_token") || "");
  const [chatId, setChatId] = useState(localStorage.getItem("tg_chat_id") || "");
  const [status, setStatus] = useState<null | "ok" | "error">(null);
  const [testing, setTesting] = useState(false);

  const save = () => {
    localStorage.setItem("tg_token", token);
    localStorage.setItem("tg_chat_id", chatId);
  };

  const testConnection = async () => {
    if (!token || !chatId) { setStatus("error"); return; }
    setTesting(true);
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: "🚗 GVM Performance: подключение успешно!" }),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
    setTesting(false);
  };

  const notificationsDefault = [
    { id: "oil", label: "Замена масла", desc: "За 1000 км", icon: "Droplets", active: true },
    { id: "filters", label: "Замена фильтров", desc: "За 500 км", icon: "Filter", active: true },
    { id: "docs", label: "Документы", desc: "За 30 дней", icon: "FileText", active: true },
    { id: "weekly", label: "Еженедельная сводка", desc: "Воскресенье 10:00", icon: "BarChart2", active: true },
    { id: "monthly", label: "Ежемесячный отчёт", desc: "1-го числа", icon: "Calendar", active: false },
    { id: "budget", label: "Превышение бюджета", desc: "При 80% от лимита", icon: "TrendingUp", active: true },
  ];

  const [notifs, setNotifs] = useState(notificationsDefault);

  return (
    <div className="space-y-4">
      <SectionHeader title="Настройки" sub="Telegram и уведомления" />

      <div className="glass-card neon-border rounded-2xl p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(57,211,83,0.12)" }}>
            <Icon name="Send" size={18} className="neon-text" />
          </div>
          <div>
            <div className="font-rajdhani font-bold text-base text-foreground">Telegram Bot</div>
            <div className="text-xs text-muted-foreground">Уведомления об обслуживании</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Bot Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="1234567890:ABCDEFGHIJklmnopqrstuvwxyz..."
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(57,211,83,0.2)", color: "#e8f5e9", outline: "none" }}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Chat ID</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-100123456789"
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(57,211,83,0.2)", color: "#e8f5e9", outline: "none" }}
            />
          </div>
        </div>

        <div className="rounded-xl p-3 mt-3 text-xs text-muted-foreground space-y-1" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="font-semibold text-foreground mb-1">Как получить Chat ID:</div>
          <div>1. Создайте бота через @BotFather и скопируйте токен</div>
          <div>2. Напишите боту любое сообщение</div>
          <div>3. Откройте api.telegram.org/bot&#123;TOKEN&#125;/getUpdates</div>
          <div>4. Скопируйте "id" из раздела "chat"</div>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={save} className="neon-btn-outline flex-1 rounded-xl py-2.5 text-sm">
            Сохранить
          </button>
          <button onClick={testConnection} disabled={testing} className="neon-btn flex-1 rounded-xl py-2.5 text-sm">
            {testing ? "Проверка..." : "Проверить"}
          </button>
        </div>

        {status && (
          <div className="rounded-xl p-3 mt-3 text-sm text-center font-rajdhani font-semibold" style={{
            background: status === "ok" ? "rgba(57,211,83,0.1)" : "rgba(239,68,68,0.1)",
            color: status === "ok" ? "#39d353" : "#ef4444",
            border: `1px solid ${status === "ok" ? "rgba(57,211,83,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}>
            {status === "ok" ? "✓ Сообщение отправлено!" : "✗ Ошибка. Проверьте токен и Chat ID"}
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-1">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-4">Уведомления</div>
        <div className="space-y-2">
          {notifs.map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(57,211,83,0.12)" }}>
                <Icon name={n.icon} size={14} className="neon-text" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{n.label}</div>
                <div className="text-xs text-muted-foreground truncate">{n.desc}</div>
              </div>
              <button
                onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, active: !x.active } : x))}
                className="rounded-full flex-shrink-0 transition-all duration-200 relative"
                style={{
                  width: 44, height: 24,
                  background: n.active ? "rgba(57,211,83,0.25)" : "rgba(255,255,255,0.08)",
                  border: `1px solid ${n.active ? "rgba(57,211,83,0.5)" : "rgba(255,255,255,0.15)"}`,
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: n.active ? "#39d353" : "rgba(255,255,255,0.4)",
                  position: "absolute", top: 3,
                  left: n.active ? 23 : 3,
                  transition: "all 0.2s",
                  boxShadow: n.active ? "0 0 6px #39d353" : "none",
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 animate-fade-in stagger-2">
        <div className="font-rajdhani font-bold text-lg text-foreground mb-4">Экспорт / Импорт</div>
        <div className="space-y-2">
          <button className="neon-btn w-full rounded-xl py-2.5 text-sm font-rajdhani font-bold tracking-wider flex items-center justify-center gap-2">
            <Icon name="Download" size={16} />ЭКСПОРТ JSON
          </button>
          <button className="neon-btn-outline w-full rounded-xl py-2.5 text-sm font-rajdhani font-bold tracking-wider flex items-center justify-center gap-2">
            <Icon name="Upload" size={16} />ИМПОРТ JSON
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DOCUMENTS SECTION
// ============================================================
function DocumentsSection() {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const correctPin = "1234";

  if (!unlocked) {
    return (
      <div className="space-y-4">
        <SectionHeader title="Документы" sub="Введите PIN для доступа" />
        <div className="glass-card neon-border rounded-2xl p-8 animate-fade-in flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(57,211,83,0.12)" }}>
            <Icon name="Lock" size={32} className="neon-text" />
          </div>
          <div className="text-muted-foreground text-sm">Документы защищены PIN-кодом</div>
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-12 rounded-xl flex items-center justify-center text-2xl font-rajdhani font-bold transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${pinError ? "rgba(239,68,68,0.5)" : pinInput.length > i ? "rgba(57,211,83,0.5)" : "rgba(255,255,255,0.1)"}`,
                  color: pinError ? "#ef4444" : "#39d353"
                }}>
                {pinInput.length > i ? "●" : ""}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 w-52">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k, i) => (
              <button
                key={i}
                onClick={() => {
                  if (k === "⌫") {
                    setPinInput((p) => p.slice(0, -1));
                  } else if (k !== "" && pinInput.length < 4) {
                    const newPin = pinInput + k;
                    setPinInput(newPin);
                    if (newPin.length === 4) {
                      if (newPin === correctPin) {
                        setUnlocked(true);
                      } else {
                        setPinError(true);
                        setTimeout(() => { setPinError(false); setPinInput(""); }, 800);
                      }
                    }
                  }
                }}
                className="h-12 rounded-xl font-rajdhani font-bold text-xl transition-all duration-150 active:scale-95"
                style={{
                  background: k === "" ? "transparent" : "rgba(255,255,255,0.06)",
                  border: k === "" ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: pinError ? "#ef4444" : "#e8f5e9",
                  visibility: k === "" ? "hidden" : "visible",
                }}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">Тестовый PIN: 1234</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <SectionHeader title="Документы" sub="Хранилище документов" />
        <button onClick={() => { setUnlocked(false); setPinInput(""); }} className="neon-btn-outline rounded-lg px-3 py-1.5 text-sm mt-1 flex items-center gap-1">
          <Icon name="Lock" size={14} />Блок
        </button>
      </div>

      <div className="space-y-3">
        {testDocuments.map((doc, i) => {
          const color = getDocColor(doc.daysLeft);
          return (
            <div key={doc.id} className="glass-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-rajdhani font-bold text-lg text-foreground">{doc.name}</div>
                  <div className="text-sm text-muted-foreground font-mono tracking-wider">{doc.number}</div>
                </div>
                <div className="text-right">
                  <div className="badge-pill mb-1" style={{ color, background: `${color}15` }}>
                    {doc.daysLeft < 7 ? "СРОЧНО!" : doc.daysLeft < 30 ? "Скоро" : "Активен"}
                  </div>
                  <div className="text-xs text-muted-foreground">{doc.expires}</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>До истечения</span>
                  <span style={{ color }}>{doc.daysLeft} дней</span>
                </div>
                <NeonProgress value={Math.max(0, 365 - doc.daysLeft)} max={365} color={color} />
              </div>
              <div className="flex gap-2 mt-3">
                <button className="neon-btn-outline flex-1 rounded-lg py-1.5 text-xs flex items-center justify-center gap-1">
                  <Icon name="Pencil" size={12} />Редактировать
                </button>
                <button className="neon-btn-outline rounded-lg px-3 py-1.5 text-xs">
                  <Icon name="Camera" size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button className="neon-btn w-full rounded-xl py-3 text-sm font-rajdhani font-bold tracking-wider animate-fade-in flex items-center justify-center gap-2">
        <Icon name="Plus" size={16} />ДОБАВИТЬ ДОКУМЕНТ
      </button>
    </div>
  );
}

// ============================================================
// NAV ITEMS
// ============================================================
const navItems: { id: Section; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "finances", label: "Финансы", icon: "Wallet" },
  { id: "trips", label: "Поездки", icon: "Navigation" },
  { id: "ownership", label: "Владельцы", icon: "Users" },
  { id: "parts", label: "Запчасти", icon: "Wrench" },
  { id: "stats", label: "Статистика", icon: "BarChart2" },
  { id: "intervals", label: "Интервалы", icon: "Settings2" },
  { id: "documents", label: "Документы", icon: "FileText" },
  { id: "settings", label: "Настройки", icon: "Bell" },
];

// ============================================================
// MAIN APP
// ============================================================
export default function Index() {
  const [section, setSection] = useState<Section>("home");
  const [car, setCar] = useState<CarData>(initialCar);
  const [menuOpen, setMenuOpen] = useState(false);

  const navBottom: { id: Section; label: string; icon: string; isMenu?: boolean }[] = [
    { id: "home", label: "Главная", icon: "Home" },
    { id: "trips", label: "Поездки", icon: "Navigation" },
    { id: "finances", label: "Финансы", icon: "Wallet" },
    { id: "intervals", label: "Интервалы", icon: "Settings2" },
    { id: "settings", label: "Ещё", icon: "MoreHorizontal", isMenu: true },
  ];

  const renderSection = () => {
    switch (section) {
      case "home": return <HomeSection car={car} setCar={setCar} />;
      case "finances": return <FinancesSection />;
      case "trips": return <TripsSection />;
      case "ownership": return <OwnershipSection />;
      case "parts": return <PartsSection />;
      case "stats": return <StatsSection />;
      case "intervals": return <IntervalsSection />;
      case "settings": return <SettingsSection />;
      case "documents": return <DocumentsSection />;
      default: return <HomeSection car={car} setCar={setCar} />;
    }
  };

  const isMenuSection = !["home", "trips", "finances", "intervals"].includes(section);

  return (
    <div className="min-h-dvh grid-pattern" style={{ background: "#080d08" }}>
      {/* HEADER */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(8,13,8,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(57,211,83,0.12)" }}>
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: "rgba(57,211,83,0.15)" }}>
              🏎
            </div>
            <span className="font-rajdhani font-bold text-lg neon-glow-text tracking-wider">GVM PERFORMANCE</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse-neon" style={{ background: "#39d353" }} />
              <span className="text-xs text-muted-foreground font-rajdhani">{car.mileage.toLocaleString()} км</span>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="neon-btn-outline rounded-lg px-2.5 py-1.5">
              <Icon name={menuOpen ? "X" : "Menu"} size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} />
          <div
            className="absolute right-0 top-0 h-full w-72 py-4"
            style={{ background: "rgba(9,15,9,0.98)", borderLeft: "1px solid rgba(57,211,83,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 mb-4 border-b" style={{ borderColor: "rgba(57,211,83,0.1)" }}>
              <div className="font-rajdhani font-bold text-xl neon-glow-text">GVM PERFORMANCE</div>
              <div className="text-muted-foreground text-sm mt-1">{car.brand} {car.model} · {car.year}</div>
              <div className="text-muted-foreground text-sm">{car.mileage.toLocaleString()} км</div>
            </div>
            <div className="px-3 space-y-1 overflow-y-auto scrollbar-none">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSection(item.id); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200"
                  style={{
                    background: section === item.id ? "rgba(57,211,83,0.1)" : "transparent",
                    border: section === item.id ? "1px solid rgba(57,211,83,0.22)" : "1px solid transparent",
                    color: section === item.id ? "#39d353" : "rgba(255,255,255,0.65)",
                  }}
                >
                  <Icon name={item.icon} size={18} />
                  <span className="font-golos font-medium">{item.label}</span>
                  {section === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#39d353" }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="px-4 pt-4 pb-28 max-w-2xl mx-auto" key={section}>
        {renderSection()}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 z-40" style={{ background: "rgba(8,13,8,0.94)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(57,211,83,0.1)" }}>
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
          {navBottom.map((item) => {
            const active = item.isMenu ? isMenuSection : section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isMenu) { setMenuOpen(true); }
                  else setSection(item.id);
                }}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200"
                style={{ color: active ? "#39d353" : "rgba(255,255,255,0.38)" }}
              >
                <div className="relative">
                  <Icon name={item.icon} size={22} />
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: "#39d353", boxShadow: "0 0 4px #39d353" }} />
                  )}
                </div>
                <span style={{ fontSize: "10px" }} className="font-golos">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </div>
  );
}