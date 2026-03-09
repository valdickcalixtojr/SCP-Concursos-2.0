import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Settings as SettingsIcon, Bookmark, User as UserIcon } from 'lucide-react';
import clsx from 'clsx';
import Opportunities from './pages/Opportunities';
import MyExams from './pages/MyExams';
import MapView from './pages/Map';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { UserAuth } from './components/UserAuth';
import { Logo } from './components/Logo';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Oportunidades' },
  { to: '/my-exams', icon: Bookmark, label: 'Meus Concursos' },
  { to: '/map', icon: MapIcon, label: 'Mapa' },
  { to: '/settings', icon: SettingsIcon, label: 'Configurações' },
  { to: '/auth', icon: UserIcon, label: 'Perfil' },
];

function Sidebar() {
  const location = useLocation();
  
  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-white h-full flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Logo className="w-10 h-10" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">Concursos BR</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Sua plataforma de concursos</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={20} className={clsx(isActive && "scale-110", "transition-transform")} />
              <span className="font-medium">{link.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <UserAuth />
    </aside>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 flex justify-around items-center z-50 px-2 h-[72px] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={clsx(
              'flex flex-col items-center justify-center w-full h-full py-2 relative transition-all duration-200',
              isActive ? 'text-indigo-600' : 'text-slate-400 active:text-slate-600'
            )}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-indigo-600 rounded-b-full" />
            )}
            
            {/* Icon container */}
            <div className={clsx(
              "relative flex items-center justify-center transition-all duration-200",
              isActive && "scale-110 -translate-y-0.5"
            )}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            
            {/* Label */}
            <span className={clsx(
              "text-[10px] mt-1 font-bold tracking-tight uppercase transition-all",
              isActive ? "opacity-100" : "opacity-60"
            )}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between bg-white/95 backdrop-blur-xl text-slate-900 px-4 py-3 sticky top-0 z-50 border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-2.5">
        <Logo className="w-9 h-9" />
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-slate-900">Concursos BR</h1>
          <p className="text-[9px] text-slate-400 font-medium tracking-wide uppercase -mt-0.5">Sua plataforma</p>
        </div>
      </div>
      <div className="flex items-center">
        <UserAuth compact />
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
            <Routes>
              <Route path="/" element={<Opportunities />} />
              <Route path="/my-exams" element={<MyExams />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}
