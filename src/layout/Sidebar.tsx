import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Eye,
  Leaf,
  Users,
  Map,
  BarChart3,
  LogOut,
  Bird,
} from "lucide-react";
import { useObservationStats } from "@/hooks/useObservationsStats";

// Itens de navegação
const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Observações", path: "/observations", icon: Eye },
  { label: "Espécies", path: "/species", icon: Bird },
  { label: "Utilizadores", path: "/users", icon: Users },
  { label: "Mapa", path: "/map", icon: Map },
  { label: "Estatísticas", path: "/statistics", icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const { pendentes } = useObservationStats();

  // Verificar se o item está ativo
  function isActive(path: string) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  // Iniciais do utilizador para o avatar
  function getInitials(name: string | null) {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <aside className="w-56 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-[#2D5A3D]" />
          <span className="font-serif text-base text-[#2D5A3D] font-medium">
            BioRegisto
          </span>
        </div>
        <p className="text-[11px] text-stone-400 mt-1 ml-7">Backoffice</p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-stone-100 text-stone-900 font-medium"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}

              {/* Badge de pendentes nas observações */}
              {item.path === "/observations" && pendentes > 0 && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                  {pendentes}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Perfil do utilizador */}
      <div className="px-4 py-4 border-t border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-medium flex-shrink-0">
            {getInitials(profile?.full_name ?? null)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-700 truncate">
              {profile?.full_name ?? "Utilizador"}
            </p>
            <p className="text-[10px] text-stone-400 capitalize">
              {profile?.role?.toLowerCase() ?? "..."}
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-stone-400 hover:text-stone-600 cursor-pointer"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
