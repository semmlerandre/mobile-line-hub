import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Phone, Cpu, Smartphone, Users, FileText, Building2, DollarSign,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Linhas', icon: Phone, path: '/linhas' },
  { label: 'Chips', icon: Cpu, path: '/chips' },
  { label: 'Dispositivos', icon: Smartphone, path: '/dispositivos' },
  { label: 'Colaboradores', icon: Users, path: '/colaboradores' },
  { label: 'Planos', icon: FileText, path: '/planos' },
  { label: 'Operadoras', icon: Building2, path: '/operadoras' },
  { label: 'Custos', icon: DollarSign, path: '/custos' },
  { label: 'Movimentações', icon: BarChart3, path: '/movimentacoes' },
  { label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })();

  const systemName = (() => {
    try {
      const cfg = localStorage.getItem('system-config');
      return cfg ? JSON.parse(cfg).nomeDoSistema : 'Controle de Linhas';
    } catch { return 'Controle de Linhas'; }
  })();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Filter menu based on role
  const role = user?.role || 'admin';
  const filteredMenu = menuItems.filter(item => {
    if (role === 'auditor') {
      return ['/', '/custos', '/relatorios'].includes(item.path);
    }
    if (role === 'ti') {
      return item.path !== '/configuracoes';
    }
    return true;
  });

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Logo area */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-sm truncate text-sidebar-primary-foreground">{systemName}</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {filteredMenu.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + collapse */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {!collapsed && user && (
            <div className="px-2 py-1">
              <p className="text-xs font-medium text-sidebar-primary-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground truncate">{user.email}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors flex-1" title="Sair">
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Sair</span>}
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors" title={collapsed ? 'Expandir' : 'Recolher'}>
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
