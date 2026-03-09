import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const navItems = [
  { path: '/', icon: 'Home', label: 'Главная' },
  { path: '/finance', icon: 'Wallet', label: 'Финансы' },
  { path: '/trips', icon: 'MapPin', label: 'Поездки' },
  { path: '/owners', icon: 'Users', label: 'Владельцы' },
  { path: '/parts', icon: 'Wrench', label: 'Запчасти' },
  { path: '/stats', icon: 'BarChart2', label: 'Статистика' },
  { path: '/intervals', icon: 'RefreshCw', label: 'Интервалы' },
  { path: '/documents', icon: 'FileText', label: 'Документы' },
  { path: '/settings', icon: 'Settings', label: 'Настройки' },
];

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto relative">
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-none">
        {children}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
        <div className="glass-card border-t border-border/50 px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0 ${
                    isActive
                      ? 'text-[var(--neon)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className={`relative ${isActive ? 'animate-scale-in' : ''}`}>
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-[var(--neon)] opacity-20 blur-md scale-150" />
                    )}
                    <Icon name={item.icon} size={isActive ? 22 : 20} />
                  </div>
                  <span className={`text-[9px] font-rajdhani font-600 tracking-wide truncate max-w-[40px] ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
