"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Map, Plus, LogOut, User } from "lucide-react";
import { signOutAction } from "@/server/actions/auth";

const navItems = [
  { href: "/trips", icon: Map, label: "Mis Viajes" },
];

interface NavbarProps {
  userEmail?: string;
  userName?: string;
}

export default function Navbar({ userEmail, userName }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(10,11,15,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}>
      <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link href="/trips" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "white", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>P</div>
          <div>
            <div className="gradient-text" style={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1 }}>PagaPuej</div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>Cuentas Claras</div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: "var(--radius-full)",
                textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
                position: "relative", transition: "all 0.2s",
                color: isActive ? "white" : "var(--text-secondary)",
                background: isActive ? "rgba(124,58,237,0.2)" : "transparent",
              }}>
                <item.icon size={16} />
                {item.label}
                {isActive && (
                  <motion.div layoutId="nav-active" style={{ position: "absolute", inset: 0, borderRadius: "var(--radius-full)", border: "1px solid rgba(124,58,237,0.4)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
              </Link>
            );
          })}

          <Link href="/trips/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", textDecoration: "none", fontSize: "0.875rem", marginLeft: 8 }}>
            <Plus size={16} />
            Nuevo viaje
          </Link>

          {/* User + logout */}
          {userEmail && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, paddingLeft: 8, borderLeft: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: "var(--radius-full)", background: "var(--bg-elevated)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <User size={14} />
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userName ?? userEmail}
                </span>
              </div>
              <form action={signOutAction}>
                <button type="submit" title="Cerrar sesión" style={{ padding: 8, borderRadius: "var(--radius-md)", background: "rgba(244,63,94,0.1)", border: "none", color: "var(--accent-rose)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
