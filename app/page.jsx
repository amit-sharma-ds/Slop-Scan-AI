"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  Code2,
  Command,
  GitPullRequest,
  Layers3,
  LineChart,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";

const demoRuns = [
  { repo: "vercel/next.js", pr: "#67890", score: 73, severity: "high-slop", time: "2m" },
  { repo: "facebook/react", pr: "#28000", score: 31, severity: "suspicious", time: "8m" },
  { repo: "microsoft/vscode", pr: "#201234", score: 12, severity: "clean", time: "15m" },
  { repo: "openai/openai-python", pr: "#1456", score: 58, severity: "suspicious", time: "23m" }
];

const demoComments = [
  {
    text: "Looks good overall. Nice improvement to the codebase and the changes look well structured.",
    status: "flagged",
    tags: ["generic-praise", "no-specifics", "low-depth"]
  },
  {
    text: "What happens if the stream is interrupted mid-JSON? Need error recovery for partial structured output tokens.",
    status: "clean",
    tags: ["edge-case", "actionable", "technical"]
  },
  {
    text: "LGTM. Great work on this PR.",
    status: "flagged",
    tags: ["lgtm-only", "zero-context"]
  }
];

const initialAnalysis = {
  title: "feat: Add streaming response support for App Router",
  repo: "vercel/next.js",
  pr: "#67890",
  author: "vercel-bot",
  dataMode: "DEMO",
  score: 73,
  severity: "high-slop",
  confidence: 87,
  commentCount: 12,
  metrics: {
    density: 24,
    generic: 68,
    restating: 71,
    actionability: 18,
    templated: 65,
    commitPattern: 58
  },
  comments: demoComments,
  insights: [
    "68% of review text is generic praise or diff restatement with little engineering judgment.",
    "Several comments repeat common assistant phrases: looks good, great work, well structured.",
    "Only one comment contains a concrete edge case with actionable remediation."
  ]
};

function parsePRUrl(value) {
  const clean = value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
  const match = clean.match(/^([^/\s]+)\/([^/\s]+)\/pull\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: match[3] };
}

async function github(path) {
  const response = await fetch(`https://api.github.com/repos/${path}`, {
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return response.json();
}

function hitCount(text, terms) {
  return terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
}

function scoreComment(text) {
  const lower = text.toLowerCase();
  const generic = hitCount(lower, ["looks good", "lgtm", "nice work", "great work", "well structured", "best practices", "good job", "overall"]);
  const actionable = hitCount(lower, ["should", "consider", "need", "needs", "because", "risk", "bug", "test", "edge case", "regression", "security", "null", "race", "perf"]);
  const specific = (text.match(/`[^`]+`|#[0-9]+|line\s+\d+|\b[A-Z][A-Za-z0-9_]+\(|\.[a-zA-Z_$][\w$]*/g) || []).length;
  let status = "clean";
  if (generic && actionable === 0 && specific < 2) status = "flagged";
  else if (generic || actionable < 1) status = "suspicious";
  const tags = [];
  if (generic) tags.push("generic");
  if (actionable) tags.push("actionable");
  if (specific > 1) tags.push("specific");
  if (status === "flagged") tags.push("low-signal");
  return { text: text.slice(0, 260), status, tags: tags.length ? tags : ["review-comment"] };
}

function aggregate(comments, commits) {
  const all = `${comments.join("\n")}\n${commits.join("\n")}`.toLowerCase();
  const words = all.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  const genericHits = hitCount(all, ["looks good", "lgtm", "nice work", "great work", "well structured", "best practices", "good job", "overall", "seems correct"]);
  const actionHits = hitCount(all, ["should", "consider", "need", "needs", "because", "risk", "bug", "test", "edge case", "regression", "benchmark", "security", "null", "race", "memory"]);
  const specificHits = (all.match(/`[^`]+`|line\s+\d+|#[0-9]+|[a-z0-9_]+\.[a-z0-9_]+|\([^)]+\)/g) || []).length;
  const templateHits = hitCount(all, ["add support", "update implementation", "fix issue", "improve code", "refactor code", "this change", "this pr"]);
  const commitPattern = commits.length ? Math.min(100, Math.round((templateHits / (commits.length + 1)) * 45 + commits.filter((m) => m.length < 24).length * 10)) : 20;
  const density = Math.max(5, Math.min(96, Math.round(specificHits * 9 + actionHits * 7 + Math.min(words.length / 18, 40) - genericHits * 9)));
  const generic = Math.min(96, Math.round(genericHits * 18 + Math.max(0, 4 - comments.length) * 8));
  const restating = Math.min(92, Math.round(templateHits * 13 + genericHits * 9 + Math.max(0, comments.length - actionHits) * 4));
  const actionability = Math.max(4, Math.min(96, Math.round(actionHits * 10 + specificHits * 4 - genericHits * 6)));
  const templated = Math.min(95, templateHits * 18 + genericHits * 10);
  const score = Math.min(96, Math.max(4, Math.round(generic * 0.28 + restating * 0.27 + templated * 0.08 + commitPattern * 0.16 + (100 - density) * 0.18 + (100 - actionability) * 0.11)));
  return { density, generic, restating, actionability, templated, commitPattern, score };
}

function severityFor(score) {
  if (score >= 60) return "high-slop";
  if (score >= 30) return "suspicious";
  return "clean";
}

function makeInsights(score, metrics, commentCount, commitCount) {
  const severity = severityFor(score);
  const lines = [
    `${commentCount} review comments and ${commitCount} commits analyzed. Current slop score is ${score}/100.`,
    `Information density is ${metrics.density}%, while generic phrasing is ${metrics.generic}%.`,
    metrics.actionability < 45
      ? "Review quality risk: low actionability. Ask for exact failure modes, test evidence, and code-level suggestions."
      : "Positive review signal: enough actionable language appears in the review stream."
  ];
  if (severity === "high-slop") lines.push("High slop pattern: comments are likely adding noise more than engineering review value.");
  return lines;
}

function statusColor(severity) {
  if (severity === "clean") return "green";
  if (severity === "suspicious") return "amber";
  return "red";
}

function downloadReport(analysis) {
  const report = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>SlopScan Report - ${analysis.repo} ${analysis.pr}</title>
  <style>
    body{font-family:Arial,sans-serif;background:#f6f8fb;color:#111827;margin:0;padding:32px}
    main{max-width:920px;margin:0 auto;background:white;border:1px solid #d8dee9;border-radius:14px;padding:28px}
    h1{margin:0 0 6px;font-size:28px} h2{margin-top:28px;font-size:18px}
    .muted{color:#667085}.score{font-size:54px;font-weight:800;margin:18px 0}
    .badge{display:inline-block;padding:6px 10px;border-radius:999px;background:#eef2ff;color:#1d4ed8;font-weight:700;font-size:12px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.card{border:1px solid #e5e7eb;border-radius:10px;padding:14px;background:#fafafa}
    .card b{display:block;font-size:24px;margin-bottom:4px}.comment{border-left:4px solid #94a3b8;padding:10px 12px;margin:10px 0;background:#f9fafb}
    .flagged{border-left-color:#ef4444}.suspicious{border-left-color:#f59e0b}.clean{border-left-color:#10b981}
    li{margin:8px 0}
  </style>
</head>
<body>
  <main>
    <span class="badge">${analysis.dataMode} SCAN REPORT</span>
    <h1>${analysis.repo} ${analysis.pr}</h1>
    <p class="muted">${analysis.title}</p>
    <p class="muted">Author: ${analysis.author} · ${analysis.commentCount} review comments analyzed</p>
    <div class="score">${analysis.score}/100</div>
    <p><b>Severity:</b> ${analysis.severity.replace("-", " ").toUpperCase()} · <b>Confidence:</b> ${analysis.confidence}%</p>
    <h2>Metrics</h2>
    <div class="grid">
      <div class="card"><b>${analysis.metrics.density}%</b>Info Density</div>
      <div class="card"><b>${analysis.metrics.generic}%</b>Generic Phrases</div>
      <div class="card"><b>${analysis.metrics.restating}%</b>Diff Restating</div>
      <div class="card"><b>${analysis.metrics.actionability}%</b>Actionability</div>
    </div>
    <h2>Flagged Comments</h2>
    ${analysis.comments.map((comment) => `<div class="comment ${comment.status}"><p>"${comment.text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}"</p><p class="muted">${comment.tags.join(", ")}</p></div>`).join("")}
    <h2>Insights</h2>
    <ul>${analysis.insights.map((item) => `<li>${item}</li>`).join("")}</ul>
  </main>
</body>
</html>`;
  const blob = new Blob([report], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `slopscan-${analysis.repo.replace("/", "-")}-${analysis.pr.replace("#", "")}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function MetricBar({ label, value, inverse = false }) {
  const good = inverse ? value < 30 : value > 60;
  const ok = inverse ? value < 55 : value > 35;
  const tone = good ? "green" : ok ? "amber" : "red";
  return (
    <div className="metric-card">
      <div className={`metric-value ${tone}`}>{value}%</div>
      <div className="metric-label">{label}</div>
      <div className="track"><span className={tone} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function MiniBars({ metrics }) {
  const rows = [
    ["Generic Praise", metrics.generic, true],
    ["Diff Restating", metrics.restating, true],
    ["Templated Lang", metrics.templated, true],
    ["Commit Pattern", metrics.commitPattern, true],
    ["Info Depth", metrics.density, false]
  ];
  return (
    <div className="mini-bars">
      {rows.map(([label, value, inverse]) => {
        const tone = inverse ? (value > 60 ? "red" : value > 30 ? "amber" : "green") : value > 55 ? "green" : value > 30 ? "amber" : "red";
        return (
          <div className="mini-row" key={label}>
            <span>{label}</span>
            <div className="mini-track"><i className={tone} style={{ width: `${value}%` }} /></div>
            <b>{value}%</b>
          </div>
        );
      })}
    </div>
  );
}

function RadarChart({ metrics }) {
  const axes = [
    { label: "Density", value: metrics.density, hint: "higher is better" },
    { label: "Low Generic", value: 100 - metrics.generic, hint: "higher is better" },
    { label: "Originality", value: 100 - metrics.restating, hint: "higher is better" },
    { label: "Actionable", value: metrics.actionability, hint: "higher is better" },
    { label: "Commit Signal", value: 100 - metrics.commitPattern, hint: "higher is better" }
  ];
  const points = axes.map((axis) => axis.value);
  const polygon = points
    .map((value, index) => {
      const angle = -90 + index * 72;
      const radius = 28 + value * 0.48;
      const x = 120 + Math.cos((angle * Math.PI) / 180) * radius;
      const y = 120 + Math.sin((angle * Math.PI) / 180) * radius;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className="radar-wrap">
      <svg className="radar-svg" viewBox="0 0 240 240" role="img" aria-label="Review quality radar chart with values">
        {[38, 62, 86].map((r) => (
          <circle key={r} cx="120" cy="120" r={r} />
        ))}
        {axes.map((axis, i) => {
          const angle = -90 + i * 72;
          const lineX = 120 + Math.cos((angle * Math.PI) / 180) * 86;
          const lineY = 120 + Math.sin((angle * Math.PI) / 180) * 86;
          const labelX = 120 + Math.cos((angle * Math.PI) / 180) * 108;
          const labelY = 120 + Math.sin((angle * Math.PI) / 180) * 108;
          return (
            <g key={axis.label}>
              <line x1="120" y1="120" x2={lineX} y2={lineY} />
              <text x={labelX} y={labelY} textAnchor={labelX < 95 ? "end" : labelX > 145 ? "start" : "middle"}>
                {axis.label}
              </text>
              <text className="radar-value" x={labelX} y={labelY + 13} textAnchor={labelX < 95 ? "end" : labelX > 145 ? "start" : "middle"}>
                {axis.value}%
              </text>
            </g>
          );
        })}
        <polygon points={polygon} />
      </svg>
      <div className="radar-legend">
        {axes.map((axis) => (
          <div key={axis.label}>
            <span>{axis.label}</span>
            <b>{axis.value}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("https://github.com/facebook/react/pull/28000");
  const [activeTab, setActiveTab] = useState("scanner");
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [runs, setRuns] = useState(demoRuns);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const scoreTone = statusColor(analysis.severity);
  const health = useMemo(() => 100 - analysis.score, [analysis.score]);
  const currentTopTab = ["findings", "analytics", "activity", "policy"].includes(activeTab) ? activeTab : "scanner";
  const showOverview = activeTab === "overview";
  const showReviewIntel = activeTab === "reviewIntel";
  const showReports = activeTab === "reports";
  const showHistory = activeTab === "history";
  const showSettings = activeTab === "settings";
  const sideModuleOpen = showOverview || showReviewIntel || showReports || showHistory || showSettings;
  const showScanner = currentTopTab === "scanner" && !sideModuleOpen;
  const showFindings = ["scanner", "findings"].includes(currentTopTab) && !sideModuleOpen;
  const showAnalytics = ["scanner", "analytics"].includes(currentTopTab) && !sideModuleOpen;
  const showActivity = ["scanner", "activity"].includes(currentTopTab) && !sideModuleOpen;
  const showPolicy = currentTopTab === "policy" && !sideModuleOpen;
  const gateVerdict = analysis.score >= 60 ? "Review Quality Too Low" : analysis.score >= 30 ? "Needs Human Review" : "Safe to Merge";
  const gateTone = analysis.score >= 60 ? "red" : analysis.score >= 30 ? "amber" : "green";

  async function analyze() {
    const parsed = parsePRUrl(url);
    if (!parsed) {
      setMessage("Valid GitHub PR URL daalo: https://github.com/owner/repo/pull/123");
      return;
    }
    setLoading(true);
    setMessage("Fetching live GitHub PR data...");
    try {
      const base = `${parsed.owner}/${parsed.repo}`;
      const [pr, reviewComments, issueComments, commits] = await Promise.all([
        github(`${base}/pulls/${parsed.number}`),
        github(`${base}/pulls/${parsed.number}/comments?per_page=100`),
        github(`${base}/issues/${parsed.number}/comments?per_page=100`),
        github(`${base}/pulls/${parsed.number}/commits?per_page=100`)
      ]);
      const comments = [...reviewComments, ...issueComments].map((item) => item.body || "").filter(Boolean);
      const commitMessages = commits.map((item) => item.commit?.message || "").filter(Boolean);
      const metrics = aggregate(comments, commitMessages);
      const severity = severityFor(metrics.score);
      const next = {
        title: pr.title,
        repo: base,
        pr: `#${parsed.number}`,
        author: pr.user?.login || "unknown",
        dataMode: "LIVE",
        score: metrics.score,
        severity,
        confidence: Math.min(96, Math.max(62, Math.round(58 + comments.length * 2 + Math.abs(metrics.score - 50) / 3))),
        commentCount: comments.length,
        metrics,
        comments: comments.length
          ? comments.slice(0, 8).map(scoreComment)
          : [{ text: "No review comments found. Score uses PR title and commit message patterns.", status: "suspicious", tags: ["low-review-volume"] }],
        insights: makeInsights(metrics.score, metrics, comments.length, commitMessages.length)
      };
      setAnalysis(next);
      setRuns([{ repo: base, pr: `#${parsed.number}`, score: metrics.score, severity, time: "now" }, ...runs].slice(0, 6));
      setMessage("Live scan complete.");
    } catch (error) {
      setAnalysis(initialAnalysis);
      setMessage("GitHub API blocked/rate-limited. Demo intelligence loaded, app flow still working.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <div><b>SlopScan</b><span>AI Pro</span></div>
        </div>
        <nav className="side-nav">
          {[
            ["overview", Layers3, "Overview"],
            ["scanner", Search, "Live Scanner"],
            ["reviewIntel", BrainCircuit, "Review Intel"],
            ["reports", BarChart3, "Reports"],
            ["history", LineChart, "Scan History"],
            ["settings", Command, "Settings"]
          ].map(([id, Icon, label]) => (
            <button className={activeTab === id ? "active" : ""} key={id} onClick={() => setActiveTab(id)}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <span>Repository Health</span>
          <strong>{health}%</strong>
          <div className="track"><span className="green" style={{ width: `${health}%` }} /></div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Engineering Intelligence Platform</p>
            <h1>Pull Request Review Quality Command Center</h1>
          </div>
          <div className="status-pill"><span /> Detection Engine Online</div>
        </header>

        <div className="top-tabs">
          {[
            ["scanner", "Scanner"],
            ["findings", "Findings"],
            ["analytics", "Analytics"],
            ["activity", "Activity"],
            ["policy", "Policy"]
          ].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={currentTopTab === id ? "active" : ""}>
              {label}
            </button>
          ))}
        </div>

        {showOverview && <section className="overview-grid">
          <div className="panel overview-hero">
            <div className="panel-title"><Layers3 size={17} /> Product Overview</div>
            <h2>SlopScan AI Pro turns noisy PR reviews into measurable engineering quality signals.</h2>
            <p>Use the top workspace tabs for the current scan. Use the left sidebar for app-level modules like overview, reports, history, and settings.</p>
          </div>
          <div className="panel">
            <div className="panel-title"><ShieldCheck size={17} /> Current Gate</div>
            <div className={`gate-verdict ${gateTone}`}>
              <strong>{gateVerdict}</strong>
              <span>{analysis.repo} {analysis.pr} · {analysis.score}/100 slop score</span>
            </div>
          </div>
        </section>}

        {showReviewIntel && <section className="content-grid">
          <div className="panel">
            <div className="panel-title"><BrainCircuit size={17} /> Review Intel</div>
            <div className="insights">
              {analysis.insights.map((item, index) => (
                <div className="insight" key={`intel-${item}`}>
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-title"><BrainCircuit size={17} /> Signal Explanation</div>
            <div className="policy-list">
              <div><BrainCircuit size={16} /><span>Low information density means comments lack specific technical evidence.</span><b>{analysis.metrics.density}%</b></div>
              <div><BrainCircuit size={16} /><span>Generic phrase rate catches vague praise like LGTM and looks good.</span><b>{analysis.metrics.generic}%</b></div>
              <div><BrainCircuit size={16} /><span>Actionability tracks whether comments suggest concrete fixes or tests.</span><b>{analysis.metrics.actionability}%</b></div>
            </div>
          </div>
        </section>}

        {showScanner && <section className="scan-panel">
          <div className="scan-copy">
            <span className="section-kicker"><GitPullRequest size={14} /> Live PR Scanner</span>
            <h2>Paste any public GitHub PR and score review signal quality.</h2>
            <p>Real GitHub metadata, review comments, issue comments, and commit messages are scored with local heuristic intelligence. No token needed for public repos.</p>
          </div>
          <div className="scan-box">
            <label htmlFor="pr-url">GitHub PR URL</label>
            <div className="input-wrap">
              <input id="pr-url" value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => event.key === "Enter" && analyze()} />
              <button onClick={analyze} disabled={loading}><Search size={17} /> {loading ? "Scanning..." : "Analyze"}</button>
            </div>
            <div className="quick-row">
              {["facebook/react/pull/28000", "vercel/next.js/pull/67890", "microsoft/vscode/pull/201234"].map((item) => (
                <button key={item} onClick={() => setUrl(`https://github.com/${item}`)}>{item.split("/").slice(0, 2).join("/")} {item.split("/").pop()}</button>
              ))}
            </div>
            {message && <p className="message">{message}</p>}
          </div>
        </section>}

        <section className="hero-grid">
          <div className="score-card">
            <div className={`score-ring ${scoreTone}`}>
              <CircleGauge size={26} />
              <strong>{analysis.score}</strong>
              <span>Slop Score</span>
            </div>
            <div className="score-meta">
              <b className={scoreTone}>{analysis.severity.replace("-", " ").toUpperCase()}</b>
              <span>{analysis.confidence}% confidence</span>
              <small>{analysis.dataMode} data source</small>
            </div>
          </div>
          <div className="pr-card">
            <div className="card-top">
              <span><Code2 size={16} /> {analysis.repo} {analysis.pr}</span>
              <b>{analysis.dataMode}</b>
            </div>
            <h2>{analysis.title}</h2>
            <p>Author: {analysis.author} · {analysis.commentCount} review comments analyzed</p>
            <button className="report-btn" onClick={() => downloadReport(analysis)}>
              Download Report
            </button>
            <MiniBars metrics={analysis.metrics} />
          </div>
        </section>

        {(showScanner || showAnalytics || showPolicy) && <section className="metrics-grid">
          <MetricBar label="Info Density" value={analysis.metrics.density} />
          <MetricBar label="Generic Phrases" value={analysis.metrics.generic} inverse />
          <MetricBar label="Diff Restating" value={analysis.metrics.restating} inverse />
          <MetricBar label="Actionability" value={analysis.metrics.actionability} />
        </section>}

        {showFindings && <section className="content-grid">
          <div className="panel">
            <div className="panel-title"><AlertTriangle size={17} /> Flagged Review Comments</div>
            <div className="comment-list">
              {analysis.comments.map((comment, index) => (
                <article className={`comment ${comment.status}`} key={`${comment.text}-${index}`}>
                  <p>"{comment.text}"</p>
                  <div>{comment.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </article>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-title"><BrainCircuit size={17} /> Review Intelligence Brief</div>
            <div className="insights">
              {analysis.insights.map((item, index) => (
                <div className="insight" key={item}>
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {showAnalytics && <section className="analytics-grid">
          <div className="panel chart-panel">
            <div className="panel-title"><Radar size={17} /> Review Signal Radar</div>
            <RadarChart metrics={analysis.metrics} />
          </div>
          <div className="panel chart-panel">
            <div className="panel-title"><BarChart3 size={17} /> Detection Mix</div>
            <div className="distribution">
              {[
                ["Clean", 100 - analysis.score, "green"],
                ["Suspicious", Math.max(12, Math.round(analysis.score * 0.52)), "amber"],
                ["High Slop", analysis.score, "red"]
              ].map(([label, value, tone]) => (
                <div key={label}>
                  <span>{label}</span>
                  <div className="column"><i className={tone} style={{ height: `${value}%` }} /></div>
                  <b>{value}</b>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {showActivity && <section className="panel activity-panel">
          <div className="panel-title"><Activity size={17} /> Live Activity Feed</div>
          <div className="activity-list">
            {runs.map((run, index) => {
              const tone = statusColor(run.severity);
              return (
                <div className="activity-row" key={`${run.repo}-${run.pr}-${index}`}>
                  <span className={tone}><Zap size={15} /></span>
                  <div><b>{run.repo} {run.pr}</b><small>{run.time} · {run.severity.toUpperCase()}</small></div>
                  <strong className={tone}>{run.score}</strong>
                  <ChevronRight size={16} />
                </div>
              );
            })}
          </div>
        </section>}

        {showPolicy && <section className="content-grid">
          <div className="panel quality-gate">
            <div className="panel-title"><ShieldCheck size={17} /> Merge Quality Gate</div>
            <div className={`gate-verdict ${gateTone}`}>
              <strong>{gateVerdict}</strong>
              <span>Based on slop score, actionability, generic phrasing, and review depth.</span>
            </div>
            <div className="policy-list">
              <div><CheckCircle2 size={16} /><span>Require actionable review comments</span><b>{analysis.metrics.actionability >= 45 ? "PASS" : "FAIL"}</b></div>
              <div><CheckCircle2 size={16} /><span>Generic phrasing below 55%</span><b>{analysis.metrics.generic < 55 ? "PASS" : "FAIL"}</b></div>
              <div><CheckCircle2 size={16} /><span>Information density above 35%</span><b>{analysis.metrics.density > 35 ? "PASS" : "FAIL"}</b></div>
              <div><CheckCircle2 size={16} /><span>Diff restating below 60%</span><b>{analysis.metrics.restating < 60 ? "PASS" : "FAIL"}</b></div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title"><Command size={17} /> Rules Engine</div>
            <div className="rule-grid">
              <button className="enabled">Flag LGTM-only reviews</button>
              <button className="enabled">Require test evidence</button>
              <button className="enabled">Detect generic praise</button>
              <button>Strict mode for large PRs</button>
              <button>Require edge-case comment</button>
              <button>Block low-depth approvals</button>
            </div>
          </div>
        </section>}

        {showReports && <section className="content-grid">
          <div className="panel">
            <div className="panel-title"><BarChart3 size={17} /> Report Center</div>
            <p className="module-copy">Generate and download a professional scan report for the current PR.</p>
            <button className="report-btn" onClick={() => downloadReport(analysis)}>Download Current Report</button>
            <div className="policy-list">
              <div><CheckCircle2 size={16} /><span>HTML report</span><b>READY</b></div>
              <div><CheckCircle2 size={16} /><span>Metrics summary</span><b>READY</b></div>
              <div><CheckCircle2 size={16} /><span>Flagged comments</span><b>READY</b></div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title"><Bot size={17} /> Report Preview</div>
            <div className={`gate-verdict ${scoreTone}`}>
              <strong>{analysis.score}/100</strong>
              <span>{analysis.title}</span>
            </div>
          </div>
        </section>}

        {showHistory && <section className="panel activity-panel">
          <div className="panel-title"><LineChart size={17} /> Scan History</div>
          <div className="activity-list">
            {runs.map((run, index) => {
              const tone = statusColor(run.severity);
              return (
                <div className="activity-row" key={`history-${run.repo}-${run.pr}-${index}`}>
                  <span className={tone}><Zap size={15} /></span>
                  <div><b>{run.repo} {run.pr}</b><small>{run.time} · {run.severity.toUpperCase()}</small></div>
                  <strong className={tone}>{run.score}</strong>
                  <ChevronRight size={16} />
                </div>
              );
            })}
          </div>
        </section>}

        {showSettings && <section className="content-grid">
          <div className="panel">
            <div className="panel-title"><Command size={17} /> App Settings</div>
            <div className="rule-grid">
              <button className="enabled">Use live GitHub API</button>
              <button className="enabled">Fallback demo mode</button>
              <button className="enabled">Store local scan history</button>
              <button>Strict enterprise mode</button>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title"><BrainCircuit size={17} /> Engine Profile</div>
            <div className="policy-list">
              <div><CheckCircle2 size={16} /><span>Heuristic scoring</span><b>ON</b></div>
              <div><CheckCircle2 size={16} /><span>AI paid API</span><b>OFF</b></div>
              <div><CheckCircle2 size={16} /><span>Free-only mode</span><b>ON</b></div>
            </div>
          </div>
        </section>}
      </main>
    </div>
  );
}
