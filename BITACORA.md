# 📒 BITÁCORA — PagaPuej

> "Cuentas Claras, Amistades Duraderas"

---

## Registro de Prompts y Acciones

| # | Fecha / Hora | Tipo | Descripción |
|---|---|---|---|
| 1 | 2026-08-24 22:59 | 🚀 INICIO | Creación del proyecto PagaPuej. App web para dividir gastos entre amigos de viaje. Stack Frontend: Next.js + React + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion. El usuario solicitó comenzar con el frontend para tener un preview del flujo. |
| 2 | 2026-08-24 23:07 | ✅ APROBACIÓN | Plan de implementación frontend aprobado. Decisiones: (1) Monedas soportadas: Boliviano (Bs.), Euro (€), Dólar ($), Otro (personalizado). (2) Almacenamiento: localStorage para MVP rápido. Proceder con inicialización Next.js 14. |
| 3 | 2026-08-24 23:40 | 🎉 FRONTEND COMPLETADO | Frontend funcional. 7 páginas implementadas: Dashboard, Lista de viajes, Crear viaje (3 pasos), Detalle viaje, Gastos (CRUD + modal), Saldos (gráfico Recharts + balances), Liquidación (transferencias X→Y). Escenario Samaipata verificado: Diego→Ana Bs.400, Carla→Ana Bs.160. Sum(balances)=0 confirmado. Servidor corriendo en http://localhost:3000 |
| 4 | 2026-08-25 00:06 | 🗄️ BACKEND INICIADO | Se inicia integración del backend: Supabase (PostgreSQL + Auth) + Drizzle ORM + API Routes de Next.js. Migración gradual desde localStorage hacia base de datos real. |
| 5 | 2026-08-25 14:02 | ⚡ EJECUCIÓN BACKEND | Credenciales Supabase recibidas. Decisión: auth con login desde inicio (landing + Sign In + Sign Up). Instalando drizzle-orm, @supabase/ssr. Creando schema, migraciones, Server Actions y páginas de auth. |
| 6 | 2026-08-25 14:33 | ✅ BACKEND COMPLETADO | Tablas creadas en Supabase (trips, participants, expenses, expense_splits, trip_members). Middleware Next.js protege /trips/*. Páginas /auth/login, /auth/register, /auth/check-email, /auth/callback operativas. Server Actions para CRUD. Landing pública con Sign In/Sign Up. Commit f635ac2 pusheado a GitHub. |
| 7 | 2026-08-25 14:47 | 🔄 MIGRACIÓN PAGINAS | Conectando páginas de detalle (/trips/[id], /gastos, /saldos, /liquidar) a Supabase via Drizzle ORM. Eliminando dependencia de Zustand/localStorage para datos persistentes. |
| 8 | 2026-08-25 17:19 | 🐛 BUGFIX | Se resolvió el error "Viaje no encontrado" tras crear un viaje. La falla ocurría por leer el DOM durante el renderizado (Client Component) intentando extraer datos inyectados por un Layout (Server Component). Se refactorizó usando `React Context` (`TripProvider`) en `useTripData` para un paso de datos limpio y robusto. Fase 4 (Server Components) completada. |
| 9 | 2026-08-25 17:48 | 🐛 BUGFIX | Se corrigió un error en la inserción de gastos (`expense_splits`). Se usó `db.transaction` para asegurar que el gasto y la división de pagos se inserten en la misma transacción y conexión de base de datos, evitando problemas de sincronización con el pooler (PgBouncer). También se implementó eliminación de duplicados para los participantes seleccionados. |

---

_Última actualización: 2026-08-25 17:48_
