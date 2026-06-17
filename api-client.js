// D'NEWS — api-client.js
// Lee datos reales desde Supabase si hay credenciales en window.DNEWS_CONFIG.
// Si no hay config o el fetch falla, deja intacto el mock que cargó data.js.
//
// Estrategia: data.js corre ANTES y deja arrays mock en window.DNEWS_*.
// Este script muta esos mismos arrays IN PLACE (length=0 + push) para que
// app.jsx, que capturó la referencia al cargarse, vea los datos nuevos al
// re-renderizar. Después dispara 'dnews:data-loaded' para que App re-renderice.

(function () {
  const cfg = window.DNEWS_CONFIG;
  if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    console.warn("[D'NEWS] runtime-config.js ausente o incompleto — usando mock de data.js.");
    return;
  }

  const REST = cfg.SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1";
  const HEADERS = {
    apikey: cfg.SUPABASE_ANON_KEY,
    Authorization: "Bearer " + cfg.SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };

  // ----- helpers -----
  async function rest(path) {
    const res = await fetch(REST + path, { headers: HEADERS });
    if (!res.ok) throw new Error(path + " → " + res.status + " " + res.statusText);
    return res.json();
  }

  function replaceInPlace(targetName, nextItems) {
    const target = window[targetName];
    if (!Array.isArray(target)) {
      window[targetName] = nextItems;
      return;
    }
    target.length = 0;
    for (const item of nextItems) target.push(item);
  }

  // Postgres → JS date "Mar 18, 2026"
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(isoYmd) {
    if (!isoYmd) return "";
    const [y, m, d] = isoYmd.split("-").map(Number);
    return MONTHS[m - 1] + " " + d + ", " + y;
  }

  // ----- normalizers (DB rows → shape que espera app.jsx) -----
  function normStory(row) {
    return {
      id: row.id,
      score: row.score,
      urgent: !!row.urgent,
      breaking: !!row.breaking,
      hero: !!row.hero,
      saved: false, // se llenará cuando haya auth
      tags: row.tags || [],
      category: row.category,
      source: row.source,
      date: fmtDate(row.story_date),
      country: row.country || undefined,
      title: row.title,
      summary: row.summary,
      why: row.why,
    };
  }
  const normMarket = (row) => ({
    name: row.name, value: row.value, change: row.change, up: !!row.up,
  });
  const normTrending = (row) => ({
    rank: row.rank, label: row.label, count: row.story_count,
  });

  // ----- fetch all in parallel -----
  // Esquema lean v2: solo stories/markets/trending. Los clusters (Seguimiento
  // de temas) llegan en una fase posterior; mientras tanto van vacíos y el
  // front muestra su estado "Detectar y agrupar temas con IA".
  async function load() {
    const t0 = performance.now();
    const [stories, markets, trending] = await Promise.all([
      rest("/stories?order=score.desc,story_date.desc&limit=200"),
      rest("/markets?order=display_order.asc"),
      rest("/trending_topics?order=rank.asc"),
    ]);

    // marca hero: el front espera UNA historia con hero=true. Si no la hay, usa la primera.
    const normalized = stories.map(normStory);
    if (!normalized.some((s) => s.hero) && normalized.length) {
      normalized[0].hero = true;
    }

    replaceInPlace("DNEWS_STORIES",  normalized);
    replaceInPlace("DNEWS_MARKETS",  markets.map(normMarket));
    replaceInPlace("DNEWS_TRENDING", trending.map(normTrending));
    replaceInPlace("DNEWS_CLUSTERS", []); // lean: sin clusters todavía

    const ms = Math.round(performance.now() - t0);
    console.log(
      `[D'NEWS] data loaded from Supabase in ${ms}ms: ` +
      `${normalized.length} stories, ${markets.length} markets, ${trending.length} trending`
    );

    window.dispatchEvent(new CustomEvent("dnews:data-loaded"));
  }

  load().catch((err) => {
    console.error("[D'NEWS] Supabase fetch failed — quedando con mock de data.js:", err);
  });
})();
