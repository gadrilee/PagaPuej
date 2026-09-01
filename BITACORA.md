# 📒 BITÁCORA — PagaPuej

> "Cuentas Claras, Amistades Duraderas"

---

## Registro de Prompts y Acciones

| # | Fecha / Hora | Tipo | Descripción |
|---|---|---|---|
| 1 | 2026-08-24 22:59 | 🚀 INICIO | "Quiero que crees el proyecto PagaPuej, una app web para dividir gastos entre amigos de viaje. Usa el stack Frontend: Next.js + React + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion. Comienza primero con el frontend para que tengamos un preview rápido del flujo." |
| 2 | 2026-08-24 23:07 | ✅ APROBACIÓN | "Me parece bien el plan de implementación del frontend. Asegúrate de soportar monedas como Boliviano (Bs.), Euro (€), Dólar ($) y Otro. Por ahora, usa localStorage para tener un MVP rápido. Inicializa el proyecto en Next.js 14." |
| 3 | 2026-08-24 23:40 | 🎉 FRONTEND COMPLETADO | "Ahora verifica que el frontend sea funcional. Crea 7 páginas: Dashboard, Lista de viajes, Crear viaje (3 pasos), Detalle de viaje, Gastos (CRUD + modal), Saldos (gráfico Recharts + balances) y Liquidación (transferencias X→Y). Prueba el escenario de Samaipata: Diego le paga a Ana Bs.400 y Carla a Ana Bs.160, comprobando que la suma de balances dé 0." |
| 4 | 2026-08-25 00:06 | 🗄️ BACKEND INICIADO | "Inicia la integración del backend utilizando Supabase (PostgreSQL + Auth) + Drizzle ORM + API Routes de Next.js. Comienza la migración gradual desde localStorage hacia la base de datos real." |
| 5 | 2026-08-25 14:02 | ⚡ EJECUCIÓN BACKEND | "Usa este .env para los credenciales de Supabase. Implementa la autenticación con login desde el inicio (landing + Sign In + Sign Up). Instala drizzle-orm y @supabase/ssr, y crea el schema, las migraciones, los Server Actions y las páginas de auth." |
| 6 | 2026-08-25 14:33 | ✅ BACKEND COMPLETADO | "Crea las tablas en Supabase (trips, participants, expenses, expense_splits, trip_members). Configura el Middleware de Next.js para proteger las rutas `/trips/*`. Asegúrate de que las páginas `/auth/login`, `/auth/register`, `/auth/check-email`, y `/auth/callback` estén operativas. Implementa los Server Actions para el CRUD, haz el landing público y sube el primer commit a GitHub." |
| 7 | 2026-08-25 14:47 | 🔄 MIGRACIÓN PAGINAS | "Conecta las páginas de detalle (`/trips/[id]`, `/gastos`, `/saldos`, `/liquidar`) a Supabase mediante Drizzle ORM. Elimina definitivamente la dependencia de Zustand y localStorage para los datos persistentes." |
| 8 | 2026-08-25 17:19 | 🐛 BUGFIX | "Arregla el error 'Viaje no encontrado' que sale tras crear un viaje. Ocurre porque estamos leyendo el DOM durante el renderizado en un Client Component. Refactoriza eso usando un `React Context` (`TripProvider`) para pasar los datos correctamente, y con eso completa la Fase 4." |
| 9 | 2026-08-25 17:48 | 🐛 BUGFIX | "Hay un nuevo error en la inserción de gastos (`expense_splits`). Arréglalo usando `db.transaction` para asegurar que el gasto y la división de pagos se inserten en la misma transacción y conexión. Añade también la lógica para eliminar participantes duplicados en el formulario." |
| 10 | 2026-08-27 14:55 | 🐛 BUGFIX | "Hay un bug en la ruta `/trips`. No se actualiza de cuántos participantes ya hay, ni los gastos ni el total; aparece todo en 0. Revísalo y arréglalo refactorizando la consulta `getUserTrips`." |
| 11 | 2026-09-01 00:30 | 🚀 NUEVAS FUNCIONES | "Al crear yo el viaje, mi nombre ya debería aparecer como participante uno automáticamente. Esto puede ser editado, pero no eliminado. El viaje solo se puede crear si hay dos o más. Que haya otra opción que sea buscar a alguien que tenga cuenta (por nombre de usuario), me muestra para agregarlo y le puedo agregar, y él desde su cuenta puede ver el viaje y registrar gastos. Además, cuando se generan gastos, no se puede eliminar a alguien del grupo si es que debe; poner una advertencia que debe tanto y no se puede eliminar, que se haga una consolidación primero." |
| 12 | 2026-09-01 12:26 | 🎨 UI / UX | "Ahora puedes agregar modo claro con esta paleta de colores (el modo oscuro será el que está actualmente tal cual). También puedes verificar el frontend para el responsive para que dé en cada dispositivo y no se recorten los espacios. Paleta: Principal #16834B (Verde Santa Cruz), Secundario #3BAA68, Acento #8BCF8A, Fondo #F8FAF7, Texto principal #173B2A, Texto secundario #66756C, Superficies #FFFFFF, Error #D64545, Advertencia #E8B949." |
| 13 | 2026-09-01 13:13 | 🐛 BUGFIX | "Lo hice correr localmente y me salio esto ./src/app/globals.css Error: Parsing CSS source code failed. Revisa que paso" |
| 14 | 2026-09-01 13:17 | 🐛 BUGFIX | "Ahora me salio esto en la parte de los viajes, justo en esta ruta src/app/trips/[id]/page.tsx arreglalo" |
| 15 | 2026-09-01 17:32 | 🐛 BUGFIX | "Hay un problema no puedo ingresar al perfil https://paga-puej.vercel.app/profile, intento con el boton pasa un rato y se redirige hacia donde estaba inicialmente https://paga-puej.vercel.app/trips Revisalo que paso ahi" |

---

_Última actualización: 2026-09-01 17:35_
