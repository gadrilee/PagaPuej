# 🚀 Guía de Despliegue de PagaPuej en la Nube (Vercel)

Esta guía te llevará paso a paso para publicar tu aplicación PagaPuej en Internet para que cualquier persona pueda usarla. 
Dado que PagaPuej usa **Next.js**, la mejor plataforma (y gratuita) para desplegarlo es **Vercel** (los creadores de Next.js).

---

## 🛠️ Requisitos Previos

1. **Una cuenta en GitHub** con tu proyecto subido (ya lo tienes en `github.com/gadrilee/PagaPuej`).
2. **Una cuenta en Vercel** (puedes registrarte gratis usando tu cuenta de GitHub en [vercel.com](https://vercel.com/signup)).
3. **Tu proyecto en Supabase** activo (ya tienes tus credenciales de base de datos).

---

## 📦 Paso 1: Configurar Vercel

1. Entra a tu cuenta de Vercel y haz clic en el botón **"Add New..." -> "Project"**.
2. Vercel te mostrará una lista de tus repositorios de GitHub. Busca `PagaPuej` y haz clic en **Import**.
3. Se abrirá la configuración del proyecto:
   - **Project Name:** PagaPuej (o como quieras llamarlo).
   - **Framework Preset:** Vercel detectará automáticamente que es `Next.js`. Déjalo así.
   - **Root Directory:** Déjalo en `./`.
4. **⚠️ ALTO AQUÍ:** No presiones "Deploy" todavía. Necesitamos configurar las variables de entorno.

---

## 🔐 Paso 2: Configurar las Variables de Entorno

Para que la aplicación funcione en la nube, necesita conectarse a tu base de datos de Supabase.
En la pantalla de configuración de Vercel (donde estabas en el Paso 1), despliega la sección **Environment Variables** e ingresa una por una las variables que tienes en tu archivo `.env.local`:

Agrega estas 4 variables (copia y pega los valores desde tu `.env.local`):

1. **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   **Value:** `https://paxhbkihhnlqdqugrbsy.supabase.co`

2. **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   **Value:** `eyJhbGciOiJIUzI1NiIsInR5... (todo el texto largo de tu anon key)`

3. **Name:** `DATABASE_URL`
   **Value:** `postgresql://postgres.paxhbkihhnlqdqugrbsy:DBs0...pooler.supabase.com:6543/postgres?pgbouncer=true`

4. **Name:** `DIRECT_URL`
   **Value:** `postgresql://postgres.paxhbkihhnlqdqugrbsy:DBs0...pooler.supabase.com:5432/postgres`

Una vez que hayas agregado las cuatro variables, ahora sí, haz clic en el botón azul **"Deploy"**.

---

## ⏳ Paso 3: Esperar la Construcción (Build)

Vercel comenzará a descargar el código, instalará las dependencias y construirá la aplicación (compilará TypeScript y Tailwind).
- Esto toma alrededor de 1 a 2 minutos.
- Si ves confeti en la pantalla... ¡Felicidades! 🎉 Tu aplicación ya está en la nube.

---

## 🌐 Paso 4: Configurar la URL en Supabase (Importante para el Login)

Ahora que tu app está en Internet, tiene un link público (por ejemplo, `pagapuej.vercel.app`).
Sin embargo, **Supabase por seguridad bloquea intentos de login desde URLs desconocidas**. Tienes que decirle a Supabase que tu nuevo link es oficial.

1. Ve a tu proyecto en **Supabase** (supabase.com/dashboard).
2. En el menú izquierdo, ve a **Authentication** -> **URL Configuration**.
3. En la sección **Site URL**, borra `http://localhost:3000` y pon la URL real que Vercel te acaba de dar (ej. `https://pagapuej.vercel.app`).
4. (Opcional) En **Redirect URLs**, añade `https://pagapuej.vercel.app/**` para permitir redirecciones dinámicas dentro de tu app.
5. Haz clic en **Save**.

---

## 🔄 ¿Cómo actualizo la app en el futuro?

¡Esta es la mejor parte! Vercel y GitHub están sincronizados.
Cada vez que hagamos un cambio en el código, lo único que tienes que hacer es escribir en la terminal:

```bash
git add .
git commit -m "Mi nueva mejora"
git push origin main
```

Al hacer `push`, Vercel automáticamente detectará los cambios, construirá la nueva versión y actualizará la página web sin que tú tengas que tocar nada más.

¡Listo! Tu aplicación PagaPuej ya es pública y cualquier amigo puede usar el código de invitación (Estilo Blooket) para unirse a los viajes desde su celular.
