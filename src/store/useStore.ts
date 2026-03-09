import { useState, useEffect, useCallback } from 'react';

export interface Car {
  id: string;
  avatar?: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  plate: string;
  engineVolume: string;
  power: string;
  fuelType: string;
  transmission: string;
  drive: string;
  mileage: number;
  lastOilChange: number;
  lastService: number;
  tireSeason: 'summer' | 'winter' | 'all-season';
  tireSize: string;
  batteryVoltage: number;
}

export interface Trip {
  id: string;
  date: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  duration: number;
  fuelUsed?: number;
  notes?: string;
  drivingStyle: 'calm' | 'normal' | 'aggressive';
}

export interface Expense {
  id: string;
  date: string;
  category: 'fuel' | 'maintenance' | 'parts' | 'insurance' | 'fines' | 'parking' | 'wash' | 'other';
  amount: number;
  description: string;
  mileage?: number;
}

export interface OwnerPeriod {
  id: string;
  ownerName: string;
  startDate: string;
  endDate?: string;
  startMileage: number;
  endMileage?: number;
  city: string;
  comment?: string;
  hasAccidents: number;
  maintenanceScore: number;
  washFrequency: number;
  partsQuality: 'economy' | 'original' | 'premium';
  hasGarage: boolean;
  drivingStyle: 'calm' | 'normal' | 'aggressive';
}

export interface Part {
  id: string;
  category: string;
  name: string;
  brand?: string;
  replacedAt: number;
  replacedDate: string;
  cost: number;
  intervalKm?: number;
  intervalDays?: number;
  notes?: string;
}

export interface MaintenanceInterval {
  id: string;
  name: string;
  category: string;
  lastKm: number;
  lastDate: string;
  intervalKm: number;
  intervalDays: number;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Document {
  id: string;
  type: 'sts' | 'license' | 'osago' | 'kasko' | 'diagnostic';
  number?: string;
  issueDate?: string;
  expiryDate: string;
  cost?: number;
  notifyDaysBefore: number;
  notes?: string;
}

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export interface NotificationSettings {
  oil: { enabled: boolean; warnAtKm: number; warnAtDays: number; priority: 'low' | 'medium' | 'high' };
  filters: { enabled: boolean; warnAtKm: number; warnAtDays: number };
  documents: { enabled: boolean; warnAtDays: number };
  trips: { enabled: boolean; idleDays: number };
  weeklyReport: { enabled: boolean; dayOfWeek: number };
  monthlyReport: { enabled: boolean };
}

export interface Budget {
  monthly: number;
  yearly: number;
}

export interface AppState {
  car: Car;
  trips: Trip[];
  expenses: Expense[];
  ownerPeriods: OwnerPeriod[];
  parts: Part[];
  intervals: MaintenanceInterval[];
  documents: Document[];
  telegram: TelegramSettings;
  notifications: NotificationSettings;
  budget: Budget;
  pin: string;
  pinEnabled: boolean;
}

const defaultCar: Car = {
  id: '1',
  brand: 'Toyota',
  model: 'Land Cruiser 200',
  year: 2018,
  vin: 'JTMHV05J204123456',
  plate: 'А777МР77',
  engineVolume: '4.6',
  power: '309',
  fuelType: 'Бензин',
  transmission: 'АКПП',
  drive: 'Полный',
  mileage: 87450,
  lastOilChange: 82000,
  lastService: 80000,
  tireSeason: 'winter',
  tireSize: '285/60 R18',
  batteryVoltage: 12.6,
};

const generateTrips = (): Trip[] => {
  const trips: Trip[] = [];
  const routes = [
    { s: 'Москва, Тверская', e: 'Москва, МКАД', d: 18 },
    { s: 'Москва, Арбат', e: 'Химки', d: 32 },
    { s: 'Москва, Центр', e: 'Домодедово', d: 45 },
    { s: 'Москва, Север', e: 'Дмитров', d: 67 },
    { s: 'Москва', e: 'Серпухов', d: 102 },
    { s: 'Москва', e: 'Тула', d: 185 },
    { s: 'Химки', e: 'Москва, ЦАО', d: 28 },
    { s: 'Бизнес-центр', e: 'Дом', d: 14 },
    { s: 'Москва', e: 'Балашиха', d: 24 },
    { s: 'Москва', e: 'Подольск', d: 42 },
  ];
  const styles: Array<'calm' | 'normal' | 'aggressive'> = ['calm', 'normal', 'aggressive'];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 3 - Math.floor(Math.random() * 2));
    const route = routes[i % routes.length];
    trips.push({
      id: `t${i + 1}`,
      date: date.toISOString().split('T')[0],
      startPoint: route.s,
      endPoint: route.e,
      distance: route.d + Math.floor(Math.random() * 10) - 5,
      duration: Math.round((route.d / 55) * 60),
      fuelUsed: parseFloat((route.d * 0.13 + Math.random() * 2).toFixed(1)),
      drivingStyle: styles[Math.floor(Math.random() * 3)],
      notes: i % 7 === 0 ? 'Пробки на шоссе' : undefined,
    });
  }
  return trips;
};

const generateExpenses = (): Expense[] => {
  const expenses: Expense[] = [];
  const categories: Array<Expense['category']> = ['fuel', 'maintenance', 'parts', 'insurance', 'fines', 'parking', 'wash', 'other'];
  const data = [
    { cat: 'fuel', desc: 'Заправка АЗС Лукойл', amt: 4200 },
    { cat: 'fuel', desc: 'Заправка АЗС Газпром', amt: 3800 },
    { cat: 'fuel', desc: 'Заправка АЗС Shell', amt: 4500 },
    { cat: 'maintenance', desc: 'Замена масла двигателя', amt: 8500 },
    { cat: 'maintenance', desc: 'Сход-развал', amt: 3200 },
    { cat: 'parts', desc: 'Масляный фильтр Mann', amt: 1200 },
    { cat: 'parts', desc: 'Воздушный фильтр Toyota OEM', amt: 2400 },
    { cat: 'parts', desc: 'Тормозные колодки Brembo', amt: 12000 },
    { cat: 'insurance', desc: 'ОСАГО', amt: 24000 },
    { cat: 'wash', desc: 'Мойка кузова и салона', amt: 1500 },
    { cat: 'wash', desc: 'Химчистка салона', amt: 8000 },
    { cat: 'parking', desc: 'Парковка бизнес-центр', amt: 800 },
    { cat: 'fines', desc: 'Штраф за превышение', amt: 1000 },
    { cat: 'fuel', desc: 'Заправка АЗС BP', amt: 5100 },
    { cat: 'maintenance', desc: 'Замена фильтра салона', amt: 2800 },
    { cat: 'parts', desc: 'Свечи зажигания NGK', amt: 3600 },
    { cat: 'wash', desc: 'Мойка кузова', amt: 900 },
    { cat: 'fuel', desc: 'Заправка АЗС Роснефть', amt: 4100 },
    { cat: 'other', desc: 'Автохимия 3M', amt: 2200 },
    { cat: 'parking', desc: 'Платная парковка', amt: 400 },
  ];
  const now = new Date();
  for (let i = 0; i < 20; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 4 - Math.floor(Math.random() * 3));
    const item = data[i];
    expenses.push({
      id: `e${i + 1}`,
      date: date.toISOString().split('T')[0],
      category: item.cat as Expense['category'],
      amount: item.amt,
      description: item.desc,
      mileage: 87450 - i * 200,
    });
  }
  return expenses;
};

const defaultOwnerPeriods: OwnerPeriod[] = [
  {
    id: 'op1', ownerName: 'Иванов Алексей Петрович', startDate: '2018-01-15', endDate: '2019-06-30',
    startMileage: 0, endMileage: 18500, city: 'Москва', comment: 'Первый владелец, покупка у дилера',
    hasAccidents: 0, maintenanceScore: 9, washFrequency: 8, partsQuality: 'original', hasGarage: true, drivingStyle: 'calm',
  },
  {
    id: 'op2', ownerName: 'Петрова Мария Сергеевна', startDate: '2019-07-10', endDate: '2020-11-20',
    startMileage: 18500, endMileage: 34200, city: 'Санкт-Петербург', comment: 'Второй владелец',
    hasAccidents: 1, maintenanceScore: 7, washFrequency: 5, partsQuality: 'original', hasGarage: false, drivingStyle: 'normal',
  },
  {
    id: 'op3', ownerName: 'Сидоров Дмитрий Васильевич', startDate: '2020-12-05', endDate: '2022-03-15',
    startMileage: 34200, endMileage: 58900, city: 'Краснодар', comment: 'Третий владелец, юг России',
    hasAccidents: 0, maintenanceScore: 6, washFrequency: 9, partsQuality: 'economy', hasGarage: true, drivingStyle: 'aggressive',
  },
  {
    id: 'op4', ownerName: 'Козлова Елена Игоревна', startDate: '2022-04-01', endDate: '2023-08-31',
    startMileage: 58900, endMileage: 72100, city: 'Москва', comment: 'Четвёртый владелец',
    hasAccidents: 0, maintenanceScore: 8, washFrequency: 6, partsQuality: 'original', hasGarage: false, drivingStyle: 'calm',
  },
  {
    id: 'op5', ownerName: 'Новиков Владимир Андреевич', startDate: '2023-09-10',
    startMileage: 72100, city: 'Москва', comment: 'Текущий владелец',
    hasAccidents: 0, maintenanceScore: 10, washFrequency: 8, partsQuality: 'premium', hasGarage: true, drivingStyle: 'calm',
  },
];

const defaultParts: Part[] = [
  { id: 'p1', category: 'Масло', name: 'Масло Mobil 1 5W-40', brand: 'Mobil', replacedAt: 82000, replacedDate: '2024-09-15', cost: 6500, intervalKm: 10000, intervalDays: 365 },
  { id: 'p2', category: 'Фильтры', name: 'Масляный фильтр Mann', brand: 'Mann', replacedAt: 82000, replacedDate: '2024-09-15', cost: 1200, intervalKm: 10000, intervalDays: 365 },
  { id: 'p3', category: 'Фильтры', name: 'Воздушный фильтр Toyota OEM', brand: 'Toyota', replacedAt: 78000, replacedDate: '2024-06-10', cost: 2400, intervalKm: 15000, intervalDays: 365 },
  { id: 'p4', category: 'Фильтры', name: 'Салонный фильтр Mann', brand: 'Mann', replacedAt: 75000, replacedDate: '2024-03-20', cost: 1800, intervalKm: 15000, intervalDays: 365 },
  { id: 'p5', category: 'Тормоза', name: 'Тормозные колодки передние Brembo', brand: 'Brembo', replacedAt: 70000, replacedDate: '2023-12-05', cost: 12000, intervalKm: 40000 },
  { id: 'p6', category: 'Свечи', name: 'Свечи зажигания NGK Iridium', brand: 'NGK', replacedAt: 60000, replacedDate: '2023-05-15', cost: 3600, intervalKm: 30000 },
];

const defaultIntervals: MaintenanceInterval[] = [
  { id: 'i1', name: 'Масло двигателя', category: 'Масло и фильтры', lastKm: 82000, lastDate: '2024-09-15', intervalKm: 10000, intervalDays: 365, enabled: true, priority: 'critical' },
  { id: 'i2', name: 'Масляный фильтр', category: 'Масло и фильтры', lastKm: 82000, lastDate: '2024-09-15', intervalKm: 10000, intervalDays: 365, enabled: true, priority: 'critical' },
  { id: 'i3', name: 'Воздушный фильтр', category: 'Масло и фильтры', lastKm: 78000, lastDate: '2024-06-10', intervalKm: 15000, intervalDays: 365, enabled: true, priority: 'high' },
  { id: 'i4', name: 'Салонный фильтр', category: 'Масло и фильтры', lastKm: 75000, lastDate: '2024-03-20', intervalKm: 15000, intervalDays: 365, enabled: true, priority: 'medium' },
  { id: 'i5', name: 'Тормозная жидкость', category: 'Жидкости', lastKm: 65000, lastDate: '2023-07-10', intervalKm: 40000, intervalDays: 730, enabled: true, priority: 'high' },
  { id: 'i6', name: 'Антифриз', category: 'Жидкости', lastKm: 50000, lastDate: '2022-04-15', intervalKm: 60000, intervalDays: 1095, enabled: true, priority: 'medium' },
  { id: 'i7', name: 'Свечи зажигания', category: 'Двигатель', lastKm: 60000, lastDate: '2023-05-15', intervalKm: 30000, intervalDays: 1095, enabled: true, priority: 'high' },
  { id: 'i8', name: 'Тормозные колодки (перед)', category: 'Тормоза', lastKm: 70000, lastDate: '2023-12-05', intervalKm: 40000, intervalDays: 0, enabled: true, priority: 'high' },
  { id: 'i9', name: 'Тормозные колодки (зад)', category: 'Тормоза', lastKm: 55000, lastDate: '2022-11-20', intervalKm: 50000, intervalDays: 0, enabled: true, priority: 'high' },
  { id: 'i10', name: 'Сход-развал', category: 'Ходовая', lastKm: 85000, lastDate: '2024-11-01', intervalKm: 20000, intervalDays: 365, enabled: true, priority: 'medium' },
  { id: 'i11', name: 'Балансировка колёс', category: 'Ходовая', lastKm: 85000, lastDate: '2024-11-01', intervalKm: 10000, intervalDays: 180, enabled: true, priority: 'medium' },
  { id: 'i12', name: 'Сезонная смена шин', category: 'Шины', lastKm: 85000, lastDate: '2024-11-01', intervalKm: 0, intervalDays: 180, enabled: true, priority: 'high' },
];

const defaultDocuments: Document[] = [
  { id: 'd1', type: 'sts', number: '99АА123456', expiryDate: '2028-01-15', notifyDaysBefore: 30 },
  { id: 'd2', type: 'license', number: '9999 123456', issueDate: '2015-05-20', expiryDate: '2025-05-20', notifyDaysBefore: 60 },
  { id: 'd3', type: 'osago', number: 'ААА 5678901234', issueDate: '2025-01-10', expiryDate: '2026-01-09', cost: 24000, notifyDaysBefore: 30 },
  { id: 'd4', type: 'kasko', number: 'К2345678', issueDate: '2025-01-10', expiryDate: '2026-01-09', cost: 85000, notifyDaysBefore: 30 },
  { id: 'd5', type: 'diagnostic', expiryDate: '2026-08-15', cost: 1200, notifyDaysBefore: 14 },
];

const defaultIntervalNotifications: NotificationSettings = {
  oil: { enabled: true, warnAtKm: 1000, warnAtDays: 30, priority: 'high' },
  filters: { enabled: true, warnAtKm: 1000, warnAtDays: 30 },
  documents: { enabled: true, warnAtDays: 30 },
  trips: { enabled: true, idleDays: 14 },
  weeklyReport: { enabled: true, dayOfWeek: 1 },
  monthlyReport: { enabled: true },
};

const STORAGE_KEY = 'gvm_performance_data';

const defaultState: AppState = {
  car: defaultCar,
  trips: generateTrips(),
  expenses: generateExpenses(),
  ownerPeriods: defaultOwnerPeriods,
  parts: defaultParts,
  intervals: defaultIntervals,
  documents: defaultDocuments,
  telegram: { botToken: '', chatId: '', enabled: false },
  notifications: defaultIntervalNotifications,
  budget: { monthly: 30000, yearly: 360000 },
  pin: '1234',
  pinEnabled: false,
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

let globalState: AppState = loadState();
const listeners: Set<() => void> = new Set();

function notifyAll() {
  listeners.forEach(fn => fn());
}

export function updateStore(updater: (prev: AppState) => AppState) {
  globalState = updater(globalState);
  saveState(globalState);
  notifyAll();
}

export function useStore(): [AppState, (updater: (prev: AppState) => AppState) => void] {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    updateStore(updater);
  }, []);

  return [globalState, update];
}

export function calcIntervalStatus(interval: MaintenanceInterval, currentMileage: number) {
  const kmDone = currentMileage - interval.lastKm;
  const daysDone = Math.floor((Date.now() - new Date(interval.lastDate).getTime()) / 86400000);
  
  const kmPct = interval.intervalKm > 0 ? (kmDone / interval.intervalKm) * 100 : 0;
  const daysPct = interval.intervalDays > 0 ? (daysDone / interval.intervalDays) * 100 : 0;
  const pct = Math.max(kmPct, daysPct);
  
  const kmLeft = interval.intervalKm > 0 ? interval.intervalKm - kmDone : 0;
  const daysLeft = interval.intervalDays > 0 ? interval.intervalDays - daysDone : 0;

  let status: 'ok' | 'warn' | 'overdue' = 'ok';
  if (pct >= 100) status = 'overdue';
  else if (pct >= 80) status = 'warn';

  return { pct: Math.min(pct, 100), kmLeft, daysLeft, status };
}

export function calcOwnerRating(period: OwnerPeriod): number {
  let score = 50;
  if (period.washFrequency >= 8) score += 1;
  if (period.maintenanceScore >= 8) score += 2;
  if (period.partsQuality === 'premium') score += 1;
  if (period.partsQuality === 'original') score += 0;
  if (period.partsQuality === 'economy') score -= 1;
  if (period.hasGarage) score += 1;
  if (period.hasAccidents === 0) score += 3;
  if (period.drivingStyle === 'calm') score += 2;
  if (period.drivingStyle === 'aggressive') score -= 2;

  score -= period.hasAccidents * 3;
  if (period.maintenanceScore < 6) score -= 2;
  if (period.washFrequency < 3) score -= 1;

  const endMileage = period.endMileage || globalState.car.mileage;
  const startDate = new Date(period.startDate);
  const endDate = period.endDate ? new Date(period.endDate) : new Date();
  const months = Math.max(1, (endDate.getTime() - startDate.getTime()) / (30 * 86400000));
  const kmPerMonth = (endMileage - period.startMileage) / months;
  if (kmPerMonth > 3000) score -= 1;

  return Math.max(0, Math.min(100, score));
}

export const EXPENSE_CATEGORY_LABELS: Record<Expense['category'], string> = {
  fuel: 'Топливо',
  maintenance: 'ТО',
  parts: 'Запчасти',
  insurance: 'Страховка',
  fines: 'Штрафы',
  parking: 'Парковка',
  wash: 'Мойка',
  other: 'Прочее',
};

export const EXPENSE_CATEGORY_COLORS: Record<Expense['category'], string> = {
  fuel: '#39d353',
  maintenance: '#3b82f6',
  parts: '#8b5cf6',
  insurance: '#f59e0b',
  fines: '#ef4444',
  parking: '#06b6d4',
  wash: '#10b981',
  other: '#6b7280',
};

export const DOC_LABELS: Record<string, string> = {
  sts: 'СТС',
  license: 'Водительские права',
  osago: 'ОСАГО',
  kasko: 'КАСКО',
  diagnostic: 'Диагностическая карта',
};
