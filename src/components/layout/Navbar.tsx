"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Map, Plus, LogOut, User, Sun, Moon, Menu, X } from "lucide-react";
import { signOutAction } from "@/server/actions/auth";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";

const navItems = [
  { href: "/trips", icon: Map, label: "Mis Planes" },
];

interface NavbarProps {
  userEmail?: string;
  userName?: string;
}

export default function Navbar({ userEmail, userName }: NavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--navbar-bg)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}>
      <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link href="/trips" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "white", boxShadow: "var(--shadow-glow)", flexShrink: 0 }}>P</div>
          <div className="hide-xs">
            <div className="gradient-text" style={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1 }}>PagaPuej</div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>Cuentas Claras</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: "var(--radius-full)",
                textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
                position: "relative", transition: "all 0.2s",
                color: isActive ? "var(--accent-violet)" : "var(--text-secondary)",
                background: isActive ? "rgba(59,170,104,0.12)" : "transparent",
              }}>
                <item.icon size={16} />
                {item.label}
                {isActive && (
                  <motion.div layoutId="nav-active" style={{ position: "absolute", inset: 0, borderRadius: "var(--radius-full)", border: "1px solid var(--accent-violet)", opacity: 0.4 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
              </Link>
            );
          })}

          <Link href="/trips/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", textDecoration: "none", fontSize: "0.875rem", marginLeft: 8 }}>
            <Plus size={16} />
            Nuevo plan
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            style={{ marginLeft: 8, padding: 8, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User + logout */}
          {userEmail && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, paddingLeft: 8, borderLeft: "1px solid var(--border-subtle)" }}>
              <Link href="/profile" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: "var(--radius-full)", background: "var(--bg-elevated)", fontSize: "0.8rem", color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.2s" }}>
                <User size={14} />
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userName ?? userEmail}
                </span>
              </Link>
              <form action={signOutAction}>
                <button type="submit" title="Cerrar sesión" style={{ padding: 8, borderRadius: "var(--radius-md)", background: "rgba(214,69,69,0.1)", border: "none", color: "var(--accent-rose)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile right: theme toggle + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="hide-desktop">
          <button
            onClick={toggleTheme}
            style={{ padding: 8, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: 8, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="hide-desktop" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--navbar-bg)", backdropFilter: "blur(20px)", padding: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: "var(--radius-md)",
                  textDecoration: "none", fontSize: "0.9rem", fontWeight: 500,
                  color: isActive ? "var(--accent-violet)" : "var(--text-secondary)",
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                }}>
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <Link href="/trips/new" className="btn-primary" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", textDecoration: "none", fontSize: "0.9rem", justifyContent: "center" }}>
              <Plus size={16} />
              Nuevo viaje
            </Link>
            {userEmail && (
              <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <User size={16} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{userName ?? userEmail}</span>
                </div>
                <form action={signOutAction}>
                  <button type="submit" style={{ padding: "6px 12px", borderRadius: "var(--radius-md)", background: "rgba(214,69,69,0.1)", border: "none", color: "var(--accent-rose)", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <LogOut size={14} />
                    Salir
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
