// D'NEWS — main app (matches reference: light editorial, sticky ticker, hero, sidebar, saved + clusters)
const { useState, useMemo, useRef, useEffect } = React;
const STORIES = window.DNEWS_STORIES;
const MARKETS = window.DNEWS_MARKETS;
const NAV = window.DNEWS_NAV;
const TRENDING = window.DNEWS_TRENDING;
const CLUSTERS = window.DNEWS_CLUSTERS;

// Fecha de hoy (dinámica) para los encabezados del briefing
const _today = new Date();
const TODAY_LONG  = _today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase();
const TODAY_TITLE = _today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const TODAY_SHORT = `${_today.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()} · ${_today.toLocaleDateString("en-US", { month: "short" }).toUpperCase()} ${_today.getDate()}, ${_today.getFullYear()}`;

// Re-render cuando api-client.js termina de cargar datos reales desde Supabase.
// Los arrays se mutaron in-place, así que basta con forzar un repaint.
function useDataVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const on = () => setV((x) => x + 1);
    window.addEventListener("dnews:data-loaded", on);
    return () => window.removeEventListener("dnews:data-loaded", on);
  }, []);
  return v;
}

// ---------- icons ----------
const I = {
  search: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  doc:    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>,
  bm:     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h12v18l-6-4-6 4z"/></svg>,
  bmFill: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 3h12v18l-6-4-6 4z"/></svg>,
  moon:   <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>,
  gear:   <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  warn:   <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2 1 21h22z" opacity=".15"/><path d="M12 2 1 21h22zM12 9v5M12 17v.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  why:    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2 4 7v6c0 5 4 8 8 9 4-1 8-4 8-9V7z"/></svg>,
  chev:   <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>,
  sparkle:<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2 14 8l6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>,
  flag:   <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 21V4h12l-2 4 2 4H5"/></svg>,
  globe:  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  trend:  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></svg>,
  cal:    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  refresh:<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/></svg>,
  net:    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><circle cx="5" cy="18" r="2"/><path d="M7 7l3 3M17 7l-3 3M17 17l-3-3M7 17l3-3"/></svg>,
};

// ---------- helpers ----------
const tagClass = (t) => "tag " + (t || "").toLowerCase().replace(/[^a-z]/g, "");

// ---------- pieces ----------
function Ticker({ data, mobile }) {
  return (
    <div className={mobile ? "ticker m-ticker" : "ticker"}>
      {data.map((m, i) => (
        <span key={i} className="ticker-item">
          <span className="ticker-name">{m.name}</span>
          <span className="ticker-value">{m.value}</span>
          <span className={"ticker-change " + (m.up ? "up" : "down")}>{m.up ? "▲" : "▼"} {m.change}</span>
        </span>
      ))}
    </div>
  );
}

function TopNav({ active, setActive, savedActive, themeDark, toggleTheme, openSaved, openHome }) {
  return (
    <div className="topnav">
      <div className="brand" onClick={openHome} style={{ cursor: "pointer" }}>
        <div className="brand-mark">D'N</div>
        <div className="brand-text">
          <div className="brand-name">D'NEWS</div>
          <div className="brand-sub">SMART NEWS DIGEST</div>
        </div>
      </div>
      <nav className="topnav-center">
        {NAV.map((n) => (
          <button key={n} className={n === active ? "active" : ""} onClick={() => setActive(n)}>{n}</button>
        ))}
      </nav>
      <div className="topnav-right">
        <button className="icon-btn">{I.search}</button>
        <button className="icon-btn">{I.doc}</button>
        <button className={"icon-btn" + (savedActive ? " active" : "")} onClick={openSaved}>{savedActive ? I.bmFill : I.bm}</button>
        <button className="icon-btn" onClick={toggleTheme}>{I.moon}</button>
        <button className="icon-btn">{I.gear}</button>
      </div>
    </div>
  );
}

function Breaking({ text, onClose }) {
  return (
    <div className="breaking">
      <span className="breaking-tag">{I.warn} BREAKING</span>
      <span className="breaking-text">{text}</span>
      <button className="breaking-close" onClick={onClose}>×</button>
    </div>
  );
}

function Hero({ s, saved, onSave }) {
  return (
    <article className="hero">
      <div className="hero-meta">
        <span className="hero-tag">{s.tags[0]}</span>
        <span className="hero-date">{I.cal} {s.date}</span>
      </div>
      <h1 className="hero-title">{s.title}</h1>
      <p className="hero-summary">{s.summary}</p>
      <div className="hero-why">
        <span className="lbl">↳ Por qué importa:</span>{s.why}
      </div>
      <div className="hero-foot">
        <span>{s.source}</span>
        <button onClick={onSave} className={saved ? "saved" : ""}>
          {saved ? I.bmFill : I.bm} {saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}

function StoryCard({ s, expanded, onToggle, saved, onSave, mobile }) {
  return (
    <article className="story">
      <div className="story-tags">
        {s.breaking && <span className="tag breaking">BREAKING</span>}
        {s.tags.map((t) => <span key={t} className={tagClass(t)}>{t === "Urgent" ? "Urgent" : t}</span>)}
      </div>
      <div className="story-row">
        <div>
          <h3 className="story-headline" onClick={onToggle}>{s.title}</h3>
          <p className="story-summary">{s.summary}</p>
          <div className="why-box">
            <span className="icon">{I.why}</span>
            <div><span className="lbl">Por qué importa:</span>{s.why}</div>
          </div>
          {expanded && (
            <div className="story-detail">
              <div className="detail-row">
                <div>
                  <h5 className="detail-h">Tres claves</h5>
                  <ul className="detail-bullets">
                    <li>Reacción inmediata de mercados energéticos globales y monedas emergentes.</li>
                    <li>Implicancias directas en política exterior y trade-offs económicos para Chile.</li>
                    <li>Próximos hitos a observar en las siguientes 48–72 horas.</li>
                  </ul>
                </div>
                <div>
                  <h5 className="detail-h">Fuentes ({Math.max(2, Math.floor(s.score / 12))})</h5>
                  <ul className="detail-bullets">
                    <li>{s.source} — cobertura primaria</li>
                    <li>Bloomberg — análisis de mercado</li>
                    <li>Diario Financiero — contexto local</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className="story-foot">
            <span className="src">{s.source}</span>
            <span className="sep">·</span>
            <span>{I.cal} {s.date}</span>
            {s.country && <><span className="sep">·</span><span className="country">{s.country}</span></>}
            <span className="score-bar"><span style={{ width: s.score + "%" }} /></span>
            <span className="score-num">{s.score}</span>
          </div>
        </div>
        {!mobile && (
          <div className="story-side">
            <button className={"icon-btn" + (saved ? " active" : "")} onClick={onSave}>{saved ? I.bmFill : I.bm}</button>
            <button className="expand" onClick={onToggle}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .25s" }}><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function Sidebar({ markets, trending }) {
  return (
    <aside className="sidebar">
      <div className="s-card">
        <div className="s-card-h"><span className="ai">{I.sparkle}</span><h3>Daily Briefing</h3></div>
        <p className="s-briefing-line">Today's top stories summarized in 5 minutes</p>
      </div>
      <div className="s-card">
        <div className="s-card-h"><h3>Market Snapshot</h3></div>
        <div className="markets-grid">
          {markets.map((m) => (
            <div key={m.name} className="markets-cell">
              <div className="name">{m.name}</div>
              <div className="row">
                <span className="val">{m.value}</span>
                <span className={"chg " + (m.up ? "up" : "down")}>{m.up ? "▲" : "▼"} {m.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="s-card">
        <div className="s-card-h"><span style={{ color: "var(--ink-3)" }}>{I.trend}</span><h3>Trending</h3></div>
        <div className="trending-list">
          {trending.map((t) => (
            <div key={t.rank} className="trending-row">
              <span className="trending-rank">{t.rank}</span>
              <span className="trending-label">{t.label}</span>
              <span className="trending-count">{t.count}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ---------- HOME (desktop) ----------
function HomePage({ savedIds, toggle, expandedId, setExpanded, breakingOpen, setBreakingOpen, briefMode, setBriefMode }) {
  const hero = STORIES[0];
  const list = STORIES.slice(1, 11);
  return (
    <>
      {breakingOpen && STORIES.some(s => s.breaking) && <Breaking text={STORIES.find(s => s.breaking).title} onClose={() => setBreakingOpen(false)} />}
      <main className="page">
        <div>
          <div className="page-head">
            <div>
              <div className="page-eyebrow">{TODAY_LONG}</div>
              <div className="page-title"><span className="ai">{I.sparkle}</span> Your daily briefing <span className="page-meta">· Read in 5 min</span></div>
            </div>
            <div className="briefing-toggle">
              <button className={briefMode === "fast" ? "on" : ""} onClick={() => setBriefMode("fast")}>{I.sparkle} Fast</button>
              <button className={briefMode === "deep" ? "on" : ""} onClick={() => setBriefMode("deep")}>{I.doc} Deep</button>
            </div>
          </div>
          <Hero s={hero} saved={savedIds.has(hero.id)} onSave={() => toggle(hero.id)} />
          <div className="section-h">
            <h2>Top Stories</h2>
            <span className="pill">{list.length}</span>
            <span className="sub">Most important right now</span>
          </div>
          {list.map((s) => (
            <StoryCard key={s.id} s={s}
              expanded={expandedId === s.id}
              onToggle={() => setExpanded(expandedId === s.id ? null : s.id)}
              saved={savedIds.has(s.id)}
              onSave={() => toggle(s.id)} />
          ))}
        </div>
        <Sidebar markets={MARKETS} trending={TRENDING} />
      </main>
    </>
  );
}

// ---------- DAILY BRIEF (deep mode) ----------
function BriefPage() {
  const chile = STORIES.filter(s => s.category === "Chile").slice(0, 5);
  const world = STORIES.filter(s => s.category === "World").slice(0, 5);
  return (
    <main className="brief-page">
      <div style={{ textAlign: "center" }}>
        <span className="brief-eyebrow">{I.doc} Daily Briefing</span>
      </div>
      <h1 className="brief-title">Your Daily Brief</h1>
      <div className="brief-sub">{TODAY_TITLE} · Read in 5 minutes</div>

      <div className="brief-section-h"><span className="icon">{I.flag}</span> Top 5 Chile Stories</div>
      {chile.map((s, i) => (
        <div key={s.id} className="brief-item">
          <div className="brief-num">{i + 1}</div>
          <div>
            <h4 className="brief-h">{s.title}</h4>
            <p className="brief-sum" style={{ color: "var(--orange)" }}>{s.summary}</p>
            <div className="why-box"><span className="icon">{I.why}</span><div><span className="lbl">Por qué importa:</span>{s.why}</div></div>
            <div className="brief-meta">{s.source}</div>
          </div>
        </div>
      ))}

      <div className="brief-section-h"><span className="icon">{I.globe}</span> Top 5 World Stories</div>
      {world.map((s, i) => (
        <div key={s.id} className="brief-item">
          <div className="brief-num">{i + 1}</div>
          <div>
            <h4 className="brief-h">{s.title}</h4>
            <p className="brief-sum" style={{ color: "var(--ink-3)" }}>{s.summary}</p>
            <div className="why-box"><span className="icon">{I.why}</span><div><span className="lbl">Por qué importa:</span>{s.why}</div></div>
            <div className="brief-meta">{s.source}</div>
          </div>
        </div>
      ))}
    </main>
  );
}

// ---------- SAVED ----------
function SavedPage({ savedIds, toggle, expandedId, setExpanded }) {
  const [tab, setTab] = useState("guardadas");
  const [clusterMode, setClusterMode] = useState("empty"); // empty | grouped
  const [openCluster, setOpenCluster] = useState("energy");

  const saved = STORIES.filter(s => savedIds.has(s.id));

  return (
    <main className="saved-page">
      <div className="saved-head">
        <div className="saved-title">
          <span style={{ color: "var(--ink-3)", marginRight: 4 }}>{I.bm}</span>
          <h1>Saved Stories</h1>
          <span className="count">{saved.length}</span>
        </div>
        {tab === "guardadas" && (
          <div className="briefing-toggle">
            <button className="on">{I.sparkle} Fast</button>
            <button>{I.doc} Deep</button>
          </div>
        )}
      </div>
      <div className="saved-sub">Your reading list</div>

      <div className="saved-tabs">
        <button className={tab === "guardadas" ? "on" : ""} onClick={() => setTab("guardadas")}>{I.bm} Guardados <span style={{ background: "var(--bg)", padding: "1px 7px", borderRadius: 99, border: "1px solid var(--line)", fontSize: 10.5 }}>{saved.length}</span></button>
        <button className={tab === "temas" ? "on" : ""} onClick={() => setTab("temas")}>{I.net} Seguimiento de temas</button>
      </div>

      {tab === "guardadas" && (
        <div>
          {saved.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-4)" }}>
              No tienes historias guardadas todavía.
            </div>
          ) : saved.map((s) => (
            <StoryCard key={s.id} s={s}
              expanded={expandedId === s.id}
              onToggle={() => setExpanded(expandedId === s.id ? null : s.id)}
              saved={true}
              onSave={() => toggle(s.id)} />
          ))}
        </div>
      )}

      {tab === "temas" && (
        <div>
          <div className="cluster-info">
            <div className="cluster-info-h"><span className="ico">{I.trend}</span>Agrupación inteligente por tema</div>
            <div className="cluster-info-sub">La IA analiza tus {saved.length} artículos guardados y los agrupa por tema real, luego puedes generar un análisis de implicancias para cada grupo.</div>
            {clusterMode === "empty" ? (
              <button className="cluster-regroup" onClick={() => setClusterMode("grouped")}>
                {I.sparkle} Detectar y agrupar temas con IA
              </button>
            ) : (
              <button className="cluster-regroup" onClick={() => setClusterMode("empty")}>
                {I.refresh} Reagrupar
              </button>
            )}
          </div>

          {clusterMode === "grouped" && (
            <>
              <div className="cluster-count-h">{CLUSTERS.length} TEMAS DETECTADOS</div>
              {CLUSTERS.map((c) => {
                const open = openCluster === c.id;
                return (
                  <div key={c.id} className={"cluster" + (open ? " open" : "") + (c.hot ? " hot" : "")}>
                    <div className="cluster-head" onClick={() => setOpenCluster(open ? null : c.id)}>
                      <span className="cluster-dot" />
                      <div className="cluster-title">
                        <div className="cluster-title-row">
                          <strong>{c.title}</strong>
                          <span className="badge">{c.count} artículos</span>
                        </div>
                        <div className="cluster-lead">{c.lead}</div>
                      </div>
                      <div className="cluster-stats">
                        <span className="stat">{I.trend} {c.score}</span>
                        <span className="stat">{I.globe} {c.sources}</span>
                        <span className="cluster-chev">{I.chev}</span>
                      </div>
                    </div>
                    {open && c.items.length > 0 && (
                      <div className="cluster-body">
                        <div className="cluster-body-h">NOTICIAS AGRUPADAS</div>
                        {c.items.map((it, i) => (
                          <div key={i} className="cluster-item">
                            <span className="item-title">{it.title}</span>
                            <span className="item-meta">{it.source} · {it.date}</span>
                          </div>
                        ))}
                        <button className="cluster-analyze">{I.sparkle} Analizar implicancias con IA</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </main>
  );
}

// ---------- MOBILE ----------
function MobileApp({ savedIds, toggle, expandedId, setExpanded, route, setRoute, breakingOpen, setBreakingOpen }) {
  const [drawer, setDrawer] = useState(false);
  const [activeCat, setActiveCat] = useState("Home");
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const scrollerRef = useRef(null);

  const triggerRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1100); };

  const onTouchStart = (e) => { if (scrollerRef.current?.scrollTop === 0) startY.current = e.touches[0].clientY; };
  const onTouchMove = (e) => { if (startY.current == null) return; const dy = e.touches[0].clientY - startY.current; if (dy > 0) setPull(Math.min(dy * 0.45, 80)); };
  const onTouchEnd = () => { if (pull > 60) triggerRefresh(); setPull(0); startY.current = null; };

  const hero = STORIES[0];
  const list = STORIES.slice(1, 11);

  return (
    <div className="mobile-frame">
      <div className="mobile-screen">
        <div className="m-status">
          <span>9:41</span>
          <span className="m-status-r">
            <svg viewBox="0 0 18 12" width="16" height="11" fill="currentColor"><rect x="0" y="8" width="3" height="4"/><rect x="4" y="6" width="3" height="6"/><rect x="8" y="3" width="3" height="9"/><rect x="12" y="0" width="3" height="12"/></svg>
            <svg viewBox="0 0 16 12" width="14" height="11" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 5a10 10 0 0 1 14 0M3 7.5a7 7 0 0 1 10 0M5 10a4 4 0 0 1 6 0"/></svg>
            <svg viewBox="0 0 24 12" width="22" height="10" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="19" height="10" rx="2"/><rect x="3" y="3" width="14" height="6" fill="currentColor"/></svg>
          </span>
        </div>

        <Ticker data={MARKETS} mobile />
        <div className="m-topnav">
          <div className="brand">
            <div className="brand-mark">D'N</div>
            <div className="brand-text"><div className="brand-name">D'NEWS</div><div className="brand-sub">SMART NEWS DIGEST</div></div>
          </div>
          <div className="icons">
            <button className="icon-btn" onClick={() => setDrawer(true)}>{I.search}</button>
            <button className="icon-btn">{I.gear}</button>
          </div>
        </div>

        {breakingOpen && route === "home" && STORIES.some(s => s.breaking) && <Breaking text={STORIES.find(s => s.breaking).title} onClose={() => setBreakingOpen(false)} />}

        <div className="m-shell" ref={scrollerRef}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <div className="m-pull" style={{ height: refreshing ? 44 : pull }}>
            <div className="m-pull-inner">
              <span style={{ display: "inline-block", animation: refreshing ? "spin .8s linear infinite" : "none", transform: !refreshing ? `rotate(${pull * 4}deg)` : undefined }}>{I.refresh}</span>
              <span>{refreshing ? "Actualizando…" : pull > 60 ? "Soltar" : "Tira para actualizar"}</span>
            </div>
          </div>

          {route === "home" && (
            <>
              <div className="m-page-head">
                <div className="page-eyebrow">{TODAY_SHORT}</div>
                <div className="page-title"><span className="ai">{I.sparkle}</span> Your daily briefing</div>
              </div>
              <div className="m-content">
                <Hero s={hero} saved={savedIds.has(hero.id)} onSave={() => toggle(hero.id)} />
                <div className="section-h">
                  <h2>Top Stories</h2>
                  <span className="pill">{list.length}</span>
                </div>
                {list.map((s) => (
                  <article key={s.id} className="story">
                    <div className="story-tags">
                      {s.breaking && <span className="tag breaking">BREAKING</span>}
                      {s.tags.map((t) => <span key={t} className={tagClass(t)}>{t}</span>)}
                    </div>
                    <h3 className="story-headline" onClick={() => setExpanded(expandedId === s.id ? null : s.id)}>{s.title}</h3>
                    <p className="story-summary">{s.summary}</p>
                    <div className="why-box"><span className="icon">{I.why}</span><div><span className="lbl">Por qué importa:</span>{s.why}</div></div>
                    <div className="story-foot m-story-foot">
                      <span className="src">{s.source}</span>
                      <span className="sep">·</span>
                      <span>{s.date}</span>
                      <span className="score-bar"><span style={{ width: s.score + "%" }} /></span>
                      <button className="icon-btn" onClick={() => toggle(s.id)} style={{ width: 28, height: 28 }}>{savedIds.has(s.id) ? I.bmFill : I.bm}</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {route === "saved" && <div className="m-content"><SavedPage savedIds={savedIds} toggle={toggle} expandedId={expandedId} setExpanded={setExpanded} /></div>}
          {route === "settings" && (
            <div className="m-content" style={{ paddingTop: 16 }}>
              <h2 style={{ fontFamily: "var(--serif)" }}>Ajustes</h2>
              <div style={{ borderTop: "1px solid var(--line)", marginTop: 12 }}>
                {[["Notificaciones push", true], ["Resumen diario por mail", true], ["Sonido al actualizar", false], ["Modo oscuro", false]].map(([l, on]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "13px 2px", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 13.5 }}>{l}</span>
                    <span style={{ width: 36, height: 20, borderRadius: 99, background: on ? "var(--ink)" : "var(--line)", position: "relative", display: "inline-block" }}>
                      <span style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: 99, background: "#fff" }} />
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 24, fontSize: 11, color: "var(--ink-4)", textAlign: "center" }}>D'NEWS · v2.4.1</p>
            </div>
          )}
        </div>

        <nav className="m-nav">
          <button className={route === "home" ? "on" : ""} onClick={() => setRoute("home")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>
            <span>Hoy</span>
          </button>
          <button className={route === "saved" ? "on" : ""} onClick={() => setRoute("saved")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill={route === "saved" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7"><path d="M6 3h12v18l-6-4-6 4z"/></svg>
            <span>Guardadas</span>
          </button>
          <button className={route === "settings" ? "on" : ""} onClick={() => setRoute("settings")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z"/></svg>
            <span>Ajustes</span>
          </button>
        </nav>

        {drawer && (
          <div className="drawer-bd" onClick={() => setDrawer(false)}>
            <div className="drawer" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-handle" />
              <h3>Filtrar por categoría</h3>
              <div className="drawer-cats">
                {NAV.map((c) => (
                  <button key={c} className={"drawer-cat" + (c === activeCat ? " on" : "")} onClick={() => { setActiveCat(c); setDrawer(false); }}>{c}</button>
                ))}
              </div>
              <button className="drawer-close" onClick={() => setDrawer(false)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- App root ----------
function App() {
  useDataVersion(); // re-render cuando api-client.js carga datos reales
  const [tweaks, setTweak] = window.useTweaks({
    view: "desktop",
    accent: "orange",
    serifTitles: true,
    showBreaking: true,
  });
  const [route, setRoute] = useState("home"); // home | brief | saved
  const [briefMode, setBriefMode] = useState("fast"); // fast | deep
  const [savedIds, setSavedIds] = useState(new Set([2, 5, 8]));
  const [expandedId, setExpanded] = useState(null);
  const [breakingOpen, setBreakingOpen] = useState(true);
  const [active, setActive] = useState("Home");

  const toggle = (id) => setSavedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // accent override
  const accentVar = { orange: "#d97706", red: "#d6332b", blue: "#2563eb", emerald: "#059669" }[tweaks.accent] || "#d97706";

  const showBrief = briefMode === "deep" && route === "home";

  return (
    <div className={"app view-" + tweaks.view} style={{ "--orange": accentVar, fontFamily: tweaks.serifTitles ? undefined : "var(--sans)" }}>
      <div className="frame-switch">
        <button className={tweaks.view === "desktop" ? "on" : ""} onClick={() => setTweak("view", "desktop")}>Desktop</button>
        <button className={tweaks.view === "mobile" ? "on" : ""} onClick={() => setTweak("view", "mobile")}>Mobile</button>
      </div>

      {tweaks.view === "desktop" ? (
        <>
          <Ticker data={MARKETS} />
          <TopNav active={active} setActive={setActive}
            savedActive={route === "saved"} themeDark={false} toggleTheme={() => {}}
            openSaved={() => setRoute("saved")} openHome={() => setRoute("home")} />
          {route === "home" && !showBrief && (
            <HomePage savedIds={savedIds} toggle={toggle}
              expandedId={expandedId} setExpanded={setExpanded}
              breakingOpen={tweaks.showBreaking && breakingOpen} setBreakingOpen={setBreakingOpen}
              briefMode={briefMode} setBriefMode={setBriefMode} />
          )}
          {showBrief && <BriefPage />}
          {route === "saved" && <SavedPage savedIds={savedIds} toggle={toggle} expandedId={expandedId} setExpanded={setExpanded} />}
          <footer className="foot">
            <span>© 2026 D'NEWS · Smart News Digest</span>
            <span><a>Admin</a><a>Preferences</a></span>
          </footer>
        </>
      ) : (
        <MobileApp savedIds={savedIds} toggle={toggle}
          expandedId={expandedId} setExpanded={setExpanded}
          route={route} setRoute={setRoute}
          breakingOpen={tweaks.showBreaking && breakingOpen} setBreakingOpen={setBreakingOpen} />
      )}

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection title="View">
          <window.TweakRadio label="Device" value={tweaks.view} onChange={(v) => setTweak("view", v)}
            options={[{ value: "desktop", label: "Desktop" }, { value: "mobile", label: "Mobile" }]} />
          <window.TweakRadio label="Section" value={route} onChange={setRoute}
            options={[{ value: "home", label: "Home" }, { value: "saved", label: "Saved" }]} />
          {route === "home" && tweaks.view === "desktop" && (
            <window.TweakRadio label="Brief mode" value={briefMode} onChange={setBriefMode}
              options={[{ value: "fast", label: "Fast feed" }, { value: "deep", label: "Deep brief" }]} />
          )}
        </window.TweakSection>
        <window.TweakSection title="Style">
          <window.TweakRadio label="Accent" value={tweaks.accent} onChange={(v) => setTweak("accent", v)}
            options={[
              { value: "orange", label: "Amber" },
              { value: "red", label: "Red" },
              { value: "blue", label: "Blue" },
              { value: "emerald", label: "Green" },
            ]} />

          <window.TweakToggle label="Show breaking banner" value={tweaks.showBreaking} onChange={(v) => setTweak("showBreaking", v)} />
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
