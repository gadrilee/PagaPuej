"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction, deleteAccountAction } from "@/server/actions/users";
import { User, Edit3, Trash2, Check, X, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  email: string;
  name: string;
  username: string;
  createdAt: Date;
}

interface Props {
  profile: Profile;
  email: string;
}

export default function ProfilePageClient({ profile, email }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleSave = () => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        await updateProfileAction({ name, username });
        setSuccess("¡Perfil actualizado correctamente!");
        setEditing(false);
        router.refresh();
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  const handleDelete = () => {
    setError("");
    startDeleteTransition(async () => {
      try {
        await deleteAccountAction();
      } catch (e: any) {
        setError(e.message);
        setShowDeleteConfirm(false);
      }
    });
  };

  return (
    <>
      <Navbar userEmail={email} userName={profile.name} />
      <main className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem", maxWidth: 600 }}>
        {/* Back */}
        <Link href="/trips" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "1.5rem" }}>
          <ArrowLeft size={14} />
          Volver a Mis Viajes
        </Link>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: 800, color: "white", flexShrink: 0 }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{profile.name}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>@{profile.username}</p>
          </div>
        </div>

        {/* Profile Card */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: "1.75rem", marginBottom: "1.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Mis datos</h2>
            {!editing && (
              <button
                onClick={() => { setEditing(true); setSuccess(""); setError(""); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: "var(--radius-full)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer" }}
              >
                <Edit3 size={14} />
                Editar
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Email (non-editable) */}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Correo electrónico</label>
              <div style={{ marginTop: 4, padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
                {email}
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>El correo no se puede cambiar por ahora.</p>
            </div>

            {/* Name */}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Nombre completo</label>
              {editing ? (
                <input
                  className="input-field"
                  style={{ marginTop: 4 }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              ) : (
                <div style={{ marginTop: 4, padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", fontSize: "0.9375rem" }}>
                  {profile.name}
                </div>
              )}
            </div>

            {/* Username */}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Nombre de usuario</label>
              {editing ? (
                <div style={{ marginTop: 4, position: "relative" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.9rem" }}>@</span>
                  <input
                    className="input-field"
                    style={{ paddingLeft: "1.75rem" }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
                    placeholder="nombre_usuario"
                  />
                </div>
              ) : (
                <div style={{ marginTop: 4, padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", fontSize: "0.9375rem" }}>
                  @{profile.username}
                </div>
              )}
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(214,69,69,0.1)", border: "1px solid rgba(214,69,69,0.3)", color: "var(--accent-rose)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(22,131,75,0.1)", border: "1px solid rgba(22,131,75,0.3)", color: "var(--accent-emerald)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Check size={16} />
              {success}
            </div>
          )}

          {/* Edit actions */}
          {editing && (
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="btn-primary"
                style={{ flex: 1, padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: "0.9rem" }}
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Guardar cambios
              </button>
              <button
                onClick={() => { setEditing(false); setName(profile.name); setUsername(profile.username); setError(""); }}
                style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-full)", border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem" }}
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          )}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ padding: "1.75rem", border: "1px solid rgba(214,69,69,0.2)" }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-rose)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} />
            Zona de peligro
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Eliminar tu cuenta es permanente e irreversible. Solo puedes hacerlo si no eres dueño de ningún viaje.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.25rem", borderRadius: "var(--radius-full)", background: "rgba(214,69,69,0.08)", border: "1px solid rgba(214,69,69,0.3)", color: "var(--accent-rose)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}
            >
              <Trash2 size={16} />
              Eliminar mi cuenta
            </button>
          ) : (
            <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "rgba(214,69,69,0.08)", border: "1px solid rgba(214,69,69,0.3)" }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--accent-rose)" }}>
                ¿Estás seguro? Esta acción no se puede deshacer.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{ flex: 1, padding: "0.625rem", borderRadius: "var(--radius-full)", background: "var(--accent-rose)", border: "none", color: "white", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: "0.625rem 1rem", borderRadius: "var(--radius-full)", background: "transparent", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
