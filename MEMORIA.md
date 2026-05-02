# D'NEWS — Memoria del proyecto

> Documento maestro. Aquí queda guardado TODO lo que hemos definido para que cualquier conversación futura pueda retomar el proyecto sin perder contexto.

---

## 1. Qué es D'NEWS

**D'NEWS — Smart News Digest.** Noticiero inteligente para Chile y el mundo, con IA que resume, prioriza y conecta noticias. Idioma mixto (español chileno + inglés). Foco editorial: explicar **por qué importa** una noticia para el contexto chileno.

**Diferenciación clave**: no es "otro agregador con resumen IA". El moat está en:
- Análisis de implicancias enfocado en Chile ("Por qué importa").
- Agrupación inteligente de noticias guardadas por usuario, con narrativa conectada.
- Verticales especializadas (Markets, Política).

---

## 2. Diseño del front (entregado)

Archivos del prototipo:
- `D'NEWS.html` — entry point.
- `app.jsx` — toda la app React.
- `data.js` — datos mock (15 stories, mercados, trending, clusters).
- `styles.css` — estilos editoriales.
- `tweaks-panel.jsx` — panel de tweaks.

### Decisiones de diseño aplicadas
- **Aesthetic**: editorial light, basado en imágenes de referencia que subió el usuario.
- **Tipografía única**: Inter en todo el sitio (se eliminó Source Serif por pedido del usuario).
- **Color**: blanco, negro tinta, naranja `#d97706` para "Por qué importa", rojo `#d6332b` para BREAKING.
- **Layout desktop**: ticker fijo arriba + top nav fijo (logo D'N + nav central + iconos derecha) + breaking banner + hero card oscuro + lista de stories + sidebar (Daily Briefing / Market Snapshot / Trending) + footer.
- **Layout mobile**: device frame iPhone, ticker + top nav (sin menú de categorías visible — el usuario pidió ocultarlo), breaking banner, hero, feed con pull-to-refresh, bottom nav (Hoy / Guardadas / Ajustes), filter drawer.
- **Header** posición: **fixed** (no sticky) — fue petición explícita del usuario.
- **Tweaks expuestos**: device, route, brief mode (Fast/Deep), accent color (orange/red/blue/emerald), show breaking banner.

### Vistas implementadas
1. **Home (Fast)**: hero + Top Stories + sidebar.
2. **Daily Brief (Deep)**: long-form con Top 5 Chile + Top 5 World numerados.
3. **Saved Stories** con dos tabs:
   - **Guardados**: lista de stories salvadas.
   - **Seguimiento de temas**: clustering de IA (estado vacío → "Detectar y agrupar temas con IA" → expanded clusters con score, fuentes, items, "Analizar implicancias con IA").
4. **Mobile**: feed + saved + ajustes con bottom nav.

### Datos de referencia (mock, en `data.js`)
- 15 historias mezcla Chile + mundo (Trump/Hormuz, Brent crude, Kast presidente, NovaAndino litio, BCCh tasa, etc.).
- Mercados: IPSA, USD/CLP, Cobre, S&P 500, BTC, Litio.
- Clusters semilla: Crisis energética, Litio Chile, Fed, Reforma tributaria, Geopolítica, Mercados globales, Finanzas Chile.

---

## 3. Arquitectura técnica acordada

### Stack
- **Front**: React + Babel inline (lo actual). En producción: Vercel.
- **Backend / DB / Auth**: Supabase (Postgres + Auth + Edge Functions + Cron).
- **IA**: Anthropic Claude API. Haiku para tareas baratas (clasificación, resumen). Sonnet para análisis profundos.
- **Hosting front**: Vercel.
- **Email**: Resend (Daily Brief).
- **Push**: OneSignal (cuando llegue el momento).
- **Pagos**: Stripe.
- **Datos de mercado**: CoinGecko (BTC, gratis), Twelve Data o Finnhub (resto), bolsa.cl scrape (IPSA).

### Arquitectura de robots (visión del usuario, validada)
```
Internet (RSS, APIs)
    ↓
Robot 1: RECOLECTOR (15 min)        — sin IA, solo trae crudos
    ↓ articles_raw
Robot 2: CLASIFICADOR (30 min)      — Haiku: summary, score, category, tags
    ↓ stories
    ├──→ Robot 3: ANALISTA por dominio (1h) — Sonnet: clusters globales por vertical
    │        (economía, política, macro, social)
    └──→ Robot 4: NARRADOR personalizado (a demanda) — Sonnet: brief de implicancias
             desde stories guardadas por el usuario
```

### Tablas Postgres (a crear)
- `sources` (medios + RSS URLs).
- `articles_raw` (lo que trae el Robot 1).
- `stories` (artículos clasificados por Robot 2).
- `clusters` (agrupaciones globales del Robot 3).
- `users` + `user_preferences`.
- `saved_stories` (guardadas por usuario).
- `briefings` (output del Robot 4 por usuario).
- `markets` (precios del ticker).
- `subscriptions` (Stripe).

---

## 4. Modelo de negocio acordado

| Plan | Precio | Incluye |
|------|--------|---------|
| Free | $0 | Feed + 5 guardadas + 1 análisis IA / semana |
| **Plus** | $6 / mes | Guardadas ilimitadas + Robot 4 ilimitado + Daily Brief email |
| **Pro** | $25 / mes | Plus + 1 vertical pack (Markets o Política) + alertas custom |
| **API** | desde $200 / mes | Acceso al pipeline "Por qué importa" para B2B |

Meta inicial: 500 usuarios Plus = $3.000 USD/mes MRR.

---

## 5. Roadmap de construcción acordado

### Fase 1 — Foundation (semana 1)
1. ✅ Front terminado.
2. Cuentas: Vercel, Supabase, Anthropic Console, GitHub.
3. Subir front a Vercel.
4. Schema en Supabase.
5. Robot 1 (Recolector) como Edge Function + cron.
6. Robot 2 (Clasificador básico, Haiku).
7. Reemplazar `data.js` por fetch real a Supabase.

### Fase 2 — Diferenciación (semana 2-3)
8. Auth de Supabase + tabla `saved_stories`.
9. Robot 4 (Narrador personalizado) — killer feature.
10. Stripe + paywall (5 análisis gratis → suscripción).

### Fase 3 — Profundidad (semana 4-6)
11. Robot 3 (Analista por dominio).
12. Verticales (Markets, Política).
13. Daily Brief email con Resend.

### Fase 4 — Escala (mes 2+)
14. API pública B2B.
15. Push notifications.
16. App móvil nativa (Capacitor envolviendo este front).
17. Robot 5 (Memoria/personalización).

### Costos estimados MVP
~$50-130 USD/mes (hosting + Supabase + Claude API + dominio).

---

## 6. Próximo paso pendiente

El usuario pidió que primero se guarde la memoria del proyecto. Después continuamos con:
- `schema.sql` final con todas las tablas.
- `robot-1-collector.ts` (Edge Function de Supabase con RSS chilenos + mundiales).
- `robot-2-classifier.ts` (Edge Function con prompt Claude Haiku afinado para Chile).
- `api-client.js` para reemplazar el `data.js` actual.

---

## 7. Glosario de archivos del proyecto

| Archivo | Rol |
|---------|-----|
| `D'NEWS.html` | Entry point del front |
| `app.jsx` | App React completa |
| `data.js` | Mock data — se reemplazará por API client |
| `styles.css` | Estilos |
| `tweaks-panel.jsx` | Panel de tweaks (componente starter) |
| `MEMORIA.md` | **Este documento** |

---

*Última actualización: abril 29, 2026.*
