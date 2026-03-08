import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Settings as SettingsIcon, Bookmark } from 'lucide-react';
import clsx from 'clsx';
import Opportunities from './pages/Opportunities';
import MyExams from './pages/MyExams';
import MapView from './pages/Map';
import Settings from './pages/Settings';
import { UserAuth } from './components/UserAuth';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Oportunidades' },
  { to: '/my-exams', icon: Bookmark, label: 'Meus Concursos' },
  { to: '/map', icon: MapIcon, label: 'Mapa' },
  { to: '/settings', icon: SettingsIcon, label: 'Configurações' },
];

function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="hidden md:flex w-64 bg-slate-900 text-white h-full flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight">Concursos BR</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors',
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <UserAuth />
    </div>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center pb-safe z-50">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={clsx(
              'flex flex-col items-center justify-center w-full py-3 space-y-1',
              isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 sticky top-0 z-50">
      <h1 className="text-lg font-bold tracking-tight">Concursos BR</h1>
      <div className="flex items-center">
        {/* We can render a simplified UserAuth here or just an icon */}
        <UserAuth compact />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
            <Routes>
              <Route path="/" element={<Opportunities />} />
              <Route path="/my-exams" element={<MyExams />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}
