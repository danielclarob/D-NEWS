# D'NEWS — Roadmap detallado

> Plan calendario al MVP monetizable. Inicio: miércoles 29 abril 2026.
> Tiempo disponible: 2h/día entre semana + 8h sábado + 4h domingo ≈ 22h/semana.

---

## Visión general

| Semana | Fechas | Foco | Hito |
|--------|--------|------|------|
| 1 | 29 abr – 5 may | Foundation | dnews.cl online con DB conectada |
| 2 | 6 – 12 may | Robot 1 Recolector | Noticias crudas entrando cada 15 min |
| 3 | 13 – 19 may | Robot 2 Clasificador | Stories reales con análisis IA |
| 4 | 20 – 26 may | Auth + Guardadas + Email | Usuarios reales con cuenta |
| 5 | 27 may – 2 jun | Robot 4 Narrador (killer feature) | "Analizar implicancias" funciona |
| 6 | 3 – 9 jun | Pagos | Stripe + paywall activo |
| 7 | 10 – 16 jun | Pulido | Onboarding + landing + legal |
| 8 | 17 – 23 jun | Beta privada | 50 usuarios reales probando |

**MVP completo: 23 de junio 2026.**

---

## Cómo usar Claude.ai con tu plan

Cada tarea de código:
1. En Claude.ai crea un Project "D'NEWS" y sube como Knowledge: `MEMORIA.md`, `app.jsx`, `data.js`, `styles.css`, y los archivos del backend a medida que se generan.
2. Pídele código completo: *"Genera el Robot 1 como Supabase Edge Function leyendo el contexto"*.
3. Pega el código en Supabase. Si falla, pega el error y pide fix.

---

## SEMANA 1 (29 abr – 5 may): Foundation

### Mié 29 abr — Crear cuentas (1h)
1. **GitHub** (github.com): si no tienes, regístrate.
2. **Vercel** (vercel.com): "Continue with GitHub". Plan Hobby (gratis).
3. **Supabase** (supabase.com): "New project" → región São Paulo o N. Virginia. Guarda la **anon key** y la **service_role key** que aparecen en Settings → API.
4. **Anthropic Console** (console.anthropic.com): registrarse, ir a "Plans & Billing" y cargar tarjeta. Crear API key en "API Keys" → guárdala en un gestor de contraseñas.

### Jue 30 abr — Front a Vercel (2h)
1. Descarga este proyecto como ZIP.
2. Crea repo en GitHub: "New repository" → nombre `dnews`. Sube los archivos arrastrándolos a la web de GitHub.
3. En Vercel: "Add New Project" → importa `dnews`. Framework preset: "Other". Output directory: dejar en blanco. Deploy.
4. Te queda en `dnews-tuusuario.vercel.app`. Ábrelo, debe verse igual que aquí.

### Vie 1 may — Dominio (1h)
1. Compra `dnews.cl` en NIC.cl o `dnews.app` en Namecheap.
2. En Vercel: tu proyecto → Settings → Domains → "Add". Pega tu dominio.
3. Vercel te da registros DNS. Cópialos al panel de tu registrador.
4. Espera 15 min – 2 h. Ya está online en tu dominio.

### Sáb 2 may (mañana) — Schema completo en Supabase (3h)
1. En Supabase, abre SQL Editor.
2. Te genero `schema.sql` cuando me lo pidas. Lo pegas y aprietas "Run".
3. Verifica en "Table Editor" que existan: `sources`, `articles_raw`, `stories`, `clusters`, `users`, `saved_stories`, `briefings`, `markets`.

### Sáb 2 may (tarde) — Setup local (2h)
1. Instala **Node.js** (nodejs.org, versión LTS).
2. Instala **VS Code** (code.visualstudio.com).
3. Clona tu repo: terminal → `git clone https://github.com/tuusuario/dnews.git`.
4. Para previsualizarlo localmente: `npx serve` dentro de la carpeta. Abre `http://localhost:3000`.

### Dom 3 may — `api-client.js` con datos seed (4h)
1. Te genero `api-client.js` que reemplaza al `data.js` actual.
2. Insertas las 15 stories mock como filas seed en Supabase.
3. El front ahora lee desde Supabase aunque sean los mismos datos. **Hito visual: nada cambió, pero por dentro ya es real.**
4. Commit y push a GitHub → Vercel re-despliega solo.

### Lun 4 – Mar 5 may — Buffer y documentación (4h)
- Arregla bugs de DNS, CORS o claves mal copiadas.
- Anota en `MEMORIA.md` cualquier decisión nueva.
- Si terminaste todo: adelanta lectura sobre Supabase Edge Functions para la próxima semana.

---

## Próximo paso

Cuando termines la semana 1, vuelve y te genero:
- `schema.sql` final con todas las tablas y RLS policies.
- `api-client.js` listo para reemplazar `data.js`.
- Las 15 stories seed como inserts SQL.
- El Robot 1 Recolector como Edge Function.

---

*Actualizado: 29 abril 2026.*
