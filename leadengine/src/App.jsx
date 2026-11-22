import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════
// SHARED DATA
// ═══════════════════════════════════════════════════════════════

const AGENTS = [
  { id: 1, name: 'Faisal Al-Rashid', languages: ['Arabic', 'English', 'Hindi'], areas: ['Dubai Marina', 'JBR'], tier: 'high', avgResponse: 38, contactRate: 94, leadsToday: 7, pipeline: 3.2, online: true },
  { id: 2, name: 'Sarah Thompson', languages: ['English', 'French'], areas: ['Downtown Dubai', 'DIFC'], tier: 'high', avgResponse: 42, contactRate: 91, leadsToday: 6, pipeline: 2.8, online: true },
  { id: 3, name: 'Khalid Mahmoud', languages: ['Arabic', 'English'], areas: ['JVC', 'Business Bay'], tier: 'low', avgResponse: 187, contactRate: 37, leadsToday: 5, pipeline: 0.9, online: true },
  { id: 4, name: 'Priya Sharma', languages: ['Hindi', 'English', 'Marathi'], areas: ['Dubai Hills', 'Arabian Ranches'], tier: 'mid', avgResponse: 65, contactRate: 78, leadsToday: 4, pipeline: 1.8, online: true },
  { id: 5, name: 'Dmitri Volkov', languages: ['Russian', 'English'], areas: ['Palm Jumeirah', 'Emirates Hills'], tier: 'high', avgResponse: 35, contactRate: 96, leadsToday: 5, pipeline: 4.1, online: true },
  { id: 6, name: 'Amira Hassan', languages: ['Arabic', 'English', 'French'], areas: ['Creek Harbour', 'Downtown Dubai'], tier: 'mid', avgResponse: 72, contactRate: 74, leadsToday: 3, pipeline: 1.5, online: false },
  { id: 7, name: 'James Chen', languages: ['Mandarin', 'English', 'Cantonese'], areas: ['Business Bay', 'Downtown Dubai'], tier: 'mid', avgResponse: 58, contactRate: 80, leadsToday: 3, pipeline: 2.1, online: true },
  { id: 8, name: 'Fatima Al-Zahra', languages: ['Arabic', 'English'], areas: ['JVC', 'Dubai South'], tier: 'mid', avgResponse: 68, contactRate: 72, leadsToday: 2, pipeline: 1.0, online: false },
];

const SOURCES = ['Property Finder', 'Bayut', 'Google Ads', 'Instagram', 'WhatsApp'];

const NATIONALITIES = {
  'India': { flag: '\u{1F1EE}\u{1F1F3}', names: ['Rajesh Mehta', 'Vikram Patel', 'Ananya Iyer', 'Arjun Kapoor', 'Neha Gupta', 'Sanjay Reddy', 'Deepika Nair', 'Rohit Sharma'], budgetRange: [1, 3], areas: ['Dubai Marina', 'Business Bay', 'JVC', 'Creek Harbour'], types: ['Apartment'], bedrooms: [1, 2, 3] },
  'Russia': { flag: '\u{1F1F7}\u{1F1FA}', names: ['Alexei Petrov', 'Natasha Sokolov', 'Ivan Kuznetsov', 'Olga Ivanova', 'Dmitry Popov', 'Svetlana Morozova'], budgetRange: [3, 10], areas: ['Palm Jumeirah', 'Dubai Marina', 'JBR'], types: ['Villa', 'Penthouse', 'Apartment'], bedrooms: [2, 3, 4, 5] },
  'UK': { flag: '\u{1F1EC}\u{1F1E7}', names: ['David Williams', 'Emma Clarke', 'Oliver Hughes', 'Charlotte Baker', 'James Wilson', 'Sophie Turner'], budgetRange: [1.5, 4], areas: ['Dubai Hills', 'Arabian Ranches', 'Downtown Dubai'], types: ['Apartment', 'Townhouse', 'Villa'], bedrooms: [2, 3, 4] },
  'China': { flag: '\u{1F1E8}\u{1F1F3}', names: ['Wei Zhang', 'Li Chen', 'Mei Wong', 'Jing Liu', 'Hao Wang', 'Xin Zhao'], budgetRange: [2, 8], areas: ['Downtown Dubai', 'DIFC', 'Business Bay'], types: ['Apartment', 'Penthouse'], bedrooms: [1, 2, 3] },
  'Pakistan': { flag: '\u{1F1F5}\u{1F1F0}', names: ['Hassan Ali', 'Ayesha Khan', 'Omar Farooq', 'Fatima Malik', 'Ahmed Raza', 'Zainab Hussain'], budgetRange: [0.8, 2], areas: ['JVC', 'Dubai South', 'Dubai Hills'], types: ['Apartment'], bedrooms: [1, 2, 3] },
  'UAE': { flag: '\u{1F1E6}\u{1F1EA}', names: ['Sultan Al-Maktoum', 'Noura Al-Thani', 'Rashid Al-Habtoor', 'Sheikha Al-Nahyan', 'Majid Al-Futtaim'], budgetRange: [5, 15], areas: ['Emirates Hills', 'Palm Jumeirah', 'District One'], types: ['Villa', 'Mansion'], bedrooms: [4, 5, 6, 7] },
};

const NATIONALITY_KEYS = Object.keys(NATIONALITIES);

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function formatAED(millions) {
  if (millions >= 1) return `AED ${millions.toFixed(millions >= 10 ? 1 : 2)}M`;
  return `AED ${(millions * 1000).toFixed(0)}K`;
}

function generatePrice(budgetRange) {
  const price = randomFloat(budgetRange[0], budgetRange[1], 2);
  return price;
}

function generateLead(id, ageSeconds = null) {
  const natKey = randomItem(NATIONALITY_KEYS);
  const nat = NATIONALITIES[natKey];
  const name = randomItem(nat.names);
  const area = randomItem(nat.areas);
  const type = randomItem(nat.types);
  const beds = randomItem(nat.bedrooms);
  const price = generatePrice(nat.budgetRange);
  const source = randomItem(SOURCES);
  const agent = randomItem(AGENTS);
  const age = ageSeconds !== null ? ageSeconds : 0;

  let status;
  if (age < 30) {
    status = 'pending';
  } else if (age < 120 && agent.tier !== 'low') {
    status = Math.random() > 0.3 ? 'contacted' : 'pending';
  } else if (agent.tier === 'low') {
    status = Math.random() > 0.4 ? 'overdue' : 'pending';
  } else {
    status = Math.random() > 0.5 ? 'contacted' : (Math.random() > 0.5 ? 'pending' : 'overdue');
  }

  const contactTime = status === 'contacted' ? randomBetween(15, agent.tier === 'high' ? 55 : (agent.tier === 'low' ? 240 : 90)) : null;

  return {
    id,
    name,
    nationality: natKey,
    flag: nat.flag,
    source,
    property: `${beds}BR ${type}, ${area}, ${formatAED(price)}`,
    area,
    type,
    beds,
    price,
    agent: agent.name,
    agentId: agent.id,
    status,
    contactTime,
    createdAt: Date.now() - (age * 1000),
    isNew: age < 5,
    phone: `+971 5${randomBetween(0, 9)} ${randomBetween(100, 999)} ${randomBetween(1000, 9999)}`,
  };
}

function generateInitialLeads() {
  const leads = [];
  const ages = [8, 23, 47, 65, 98, 142, 195, 267, 380, 520, 710, 890, 1100, 1450, 1800];
  for (let i = 0; i < 15; i++) {
    leads.push(generateLead(i + 1, ages[i]));
  }
  return leads;
}


// ═══════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════

const PAGE = 'mx-auto w-full max-w-[1440px] px-4 sm:px-6';

const BTN = 'inline-flex items-center justify-center gap-2 h-11 sm:h-10 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer';
const BTN_PRIMARY = `${BTN} bg-accent text-on-accent hover:bg-accent-hover`;
const BTN_SECONDARY = `${BTN} bg-raised border border-line-strong text-ink hover:border-ink-3`;

const FIELD = 'w-full h-11 sm:h-10 bg-canvas border border-line-strong rounded-md px-3 text-base sm:text-sm text-ink transition-colors hover:border-ink-3 focus:border-accent focus:ring-2 focus:ring-accent/25';

const TONE_TEXT = {
  positive: 'text-positive',
  negative: 'text-negative',
  warning: 'text-accent',
  neutral: 'text-ink-2',
};

// --- Icons: one 20px stroke set, drawn inline ---
const ICONS = {
  check: <path d="M4.5 10.5 8 14l7.5-8" />,
  clock: <><circle cx="10" cy="10" r="7" /><path d="M10 6.5V10l2.5 1.5" /></>,
  warning: <><path d="M10 3.5 17 16H3L10 3.5Z" /><path d="M10 8.5V12" /><path d="M10 14.1v.1" /></>,
  alert: <><circle cx="10" cy="10" r="7" /><path d="M10 6.5v4" /><path d="M10 13.4v.1" /></>,
  swap: <path d="M4 7h11l-3-3M16 13H5l3 3" />,
  bell: <><path d="M5.5 14V9a4.5 4.5 0 0 1 9 0v5l1.5 1.5H4L5.5 14Z" /><path d="M8.5 17.5h3" /></>,
  play: <path d="M7 5.5 14.5 10 7 14.5v-9Z" />,
  reset: <><path d="M15.5 10a5.5 5.5 0 1 1-1.7-4" /><path d="M15.5 3.5V7H12" /></>,
  back: <path d="M16 10H4m5-5-5 5 5 5" />,
  plus: <path d="M10 4.5v11M4.5 10h11" />,
  mic: <><rect x="7.5" y="3" width="5" height="9" rx="2.5" /><path d="M5 10a5 5 0 0 0 10 0M10 15v2.5" /></>,
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

// --- Panel: the one container used for every section ---
function Panel({ title, aside = null, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`bg-surface border border-line rounded-lg flex flex-col min-w-0 ${className}`}>
      <header className="min-h-12 px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line shrink-0">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {aside}
      </header>
      <div className={`flex-1 min-h-0 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

function PageHeading({ title, description }) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="text-sm text-ink-3 mt-1">{description}</p>
    </div>
  );
}

function Dot({ className }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${className}`}></span>;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

// --- Header ---
function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Operations Dashboard' },
    { id: 'flow', label: 'test' },
  ];
  return (
    <header className="border-b border-line bg-canvas/95 backdrop-blur sticky top-0 z-50">
      <div className={`${PAGE} flex flex-wrap items-center gap-x-8`}>
        <div className="flex items-center gap-2.5 h-14">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center font-semibold text-on-accent text-xs tracking-tight">LE</div>
          <span className="text-[15px] font-semibold text-ink tracking-tight">LeadEngine</span>
          <span className="text-[13px] text-ink-3 ml-2 pl-3 border-l border-line hidden lg:inline">Dubai Real Estate Lead Automation</span>
        </div>
        <nav aria-label="Views" className="order-last sm:order-none w-full sm:w-auto flex gap-6 border-t border-line sm:border-t-0 -mx-4 px-4 sm:mx-0 sm:px-0 box-content sm:box-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`h-11 sm:h-14 -mb-px border-b-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id ? 'border-accent text-ink' : 'border-transparent text-ink-3 hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 h-14">
          <span className="flex items-center gap-2 text-[13px] text-ink-2">
            <Dot className="bg-positive" />
            Live
          </span>
          <div className="w-8 h-8 rounded-full bg-raised border border-line-strong flex items-center justify-center text-xs text-ink-2 font-medium">OA</div>
        </div>
      </div>
    </header>
  );
}

// --- KPI cell ---
function KPICard({ label, value, sub, badge = null }) {
  return (
    <div className="bg-surface px-4 py-4 sm:px-5 min-w-0">
      <div className="text-[13px] text-ink-3">{label}</div>
      <div className="mt-2 text-2xl sm:text-[28px] leading-8 font-semibold text-ink tracking-tight tabular-nums whitespace-nowrap">{value}</div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px]">
        {badge && <span className={`font-medium ${TONE_TEXT[badge.tone]}`}>{badge.text}</span>}
        {sub && <span className="text-ink-3">{sub}</span>}
      </div>
    </div>
  );
}

// --- Live Timer ---
function LiveTimer({ createdAt, status }) {
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - createdAt) / 1000));

  useEffect(() => {
    if (status === 'contacted') return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - createdAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  return <span>{formatTime(elapsed)}</span>;
}

// --- Lead row ---
const LEAD_STATUS = {
  contacted: { label: 'Contacted', dot: 'bg-positive', text: 'text-ink-2' },
  pending: { label: 'Pending', dot: 'bg-accent', text: 'text-ink-2' },
  overdue: { label: 'Overdue', dot: 'bg-negative', text: 'text-negative' },
};

function LeadCard({ lead, isNew }) {
  const s = LEAD_STATUS[lead.status];

  return (
    <li className={`px-4 py-3 flex items-start justify-between gap-4 ${isNew ? 'animate-row-in' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink truncate">
          <span className="mr-1.5" aria-hidden="true">{lead.flag}</span>
          {lead.name}
        </div>
        <div className="text-[13px] text-ink-2 mt-0.5 sm:truncate">{lead.property}</div>
        <div className="text-xs text-ink-3 mt-1 truncate">
          {lead.source} <span aria-hidden="true">·</span> Assigned to {lead.agent}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${s.text}`}>
          <Dot className={s.dot} />
          {s.label}
        </div>
        <div className="text-xs text-ink-3 mt-0.5 tabular-nums">
          {lead.status === 'contacted'
            ? `in ${lead.contactTime}s`
            : <>waiting <LiveTimer createdAt={lead.createdAt} status={lead.status} /></>}
        </div>
      </div>
    </li>
  );
}

// --- Agent Leaderboard ---
function AgentLeaderboard() {
  const sorted = useMemo(() => [...AGENTS].sort((a, b) => b.contactRate - a.contactRate), []);
  const th = 'px-3 py-2.5 font-medium text-xs text-ink-3 whitespace-nowrap';
  const td = 'px-3 py-3 whitespace-nowrap tabular-nums';
  return (
    <Panel title="Agent leaderboard" className="h-full" bodyClassName="overflow-x-auto">
      <ul className="sm:hidden divide-y divide-line">
        {sorted.map((agent, i) => (
          <li key={agent.id} className="px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 text-ink-3 tabular-nums">{i + 1}</span>
              <Dot className={agent.online ? 'bg-positive' : 'bg-line-strong'} />
              <span className="font-medium text-ink truncate">{agent.name}</span>
              <span className="sr-only">{agent.online ? '(online)' : '(offline)'}</span>
            </div>
            <dl className="mt-2 pl-6 grid grid-cols-4 gap-x-3 tabular-nums">
              {[
                ['Leads', agent.leadsToday, 'text-ink-2'],
                ['Avg resp.', `${agent.avgResponse}s`, agent.avgResponse < 60 ? 'text-positive' : agent.avgResponse > 120 ? 'text-negative' : 'text-ink-2'],
                ['Contact', `${agent.contactRate}%`, agent.contactRate > 85 ? 'text-positive' : agent.contactRate < 50 ? 'text-negative' : 'text-ink-2'],
                ['Pipeline', `AED ${agent.pipeline.toFixed(1)}M`, 'text-ink-2'],
              ].map(([label, value, color]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs text-ink-3 truncate">{label}</dt>
                  <dd className={`text-[13px] font-medium mt-0.5 ${color}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <table className="hidden sm:table w-full text-[13px]">
        <thead>
          <tr className="border-b border-line">
            <th className={`${th} text-left pl-4 w-8`}>#</th>
            <th className={`${th} text-left`}>Agent</th>
            <th className={`${th} text-right`}>Leads</th>
            <th className={`${th} text-right`}>Avg response</th>
            <th className={`${th} text-right`}>Contact rate</th>
            <th className={`${th} text-right pr-4`}>Pipeline</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sorted.map((agent, i) => (
            <tr key={agent.id} className="hover:bg-raised/60 transition-colors">
              <td className={`${td} pl-4 text-ink-3`}>{i + 1}</td>
              <td className="px-3 py-3 whitespace-nowrap">
                <span className="flex items-center gap-2">
                  <Dot className={agent.online ? 'bg-positive' : 'bg-line-strong'} />
                  <span className="font-medium text-ink">{agent.name}</span>
                  <span className="sr-only">{agent.online ? '(online)' : '(offline)'}</span>
                </span>
              </td>
              <td className={`${td} text-right text-ink-2`}>{agent.leadsToday}</td>
              <td className={`${td} text-right font-medium ${agent.avgResponse < 60 ? 'text-positive' : agent.avgResponse > 120 ? 'text-negative' : 'text-ink-2'}`}>
                {agent.avgResponse}s
              </td>
              <td className={`${td} text-right font-medium ${agent.contactRate > 85 ? 'text-positive' : agent.contactRate < 50 ? 'text-negative' : 'text-ink-2'}`}>
                {agent.contactRate}%
              </td>
              <td className={`${td} text-right pr-4 text-ink-2`}>AED {agent.pipeline.toFixed(1)}M</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

// --- Source Performance ---
function Meter({ fraction, value, title, barClassName }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0" title={title}>
      <div className="flex-1 h-1.5 rounded-full bg-raised overflow-hidden">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${Math.round(fraction * 100)}%` }}></div>
      </div>
      <span className="w-8 text-right text-ink tabular-nums">{value}</span>
    </div>
  );
}

function SourcePerformance() {
  const data = [
    { source: 'Property Finder', volume: 14, conversion: 18 },
    { source: 'Bayut', volume: 9, conversion: 15 },
    { source: 'Google Ads', volume: 5, conversion: 28 },
    { source: 'Instagram', volume: 4, conversion: 8 },
    { source: 'WhatsApp', volume: 3, conversion: 22 },
  ];
  const maxVol = Math.max(...data.map(d => d.volume));
  const maxConv = Math.max(...data.map(d => d.conversion));
  const row = 'grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-4 sm:gap-x-6 px-4';

  return (
    <Panel title="Lead source performance" className="h-full">
      <div className={`${row} py-2.5 text-xs font-medium text-ink-3 border-b border-line`}>
        <span>Source</span>
        <span>Leads</span>
        <span>Conversion</span>
      </div>
      <ul className="divide-y divide-line text-[13px]">
        {data.map(d => (
          <li key={d.source} className={`${row} py-3`}>
            <span className="font-medium text-ink truncate">{d.source}</span>
            <Meter fraction={d.volume / maxVol} value={d.volume} title={`${d.volume} leads`} barClassName="bg-ink-3" />
            <Meter fraction={d.conversion / maxConv} value={`${d.conversion}%`} title={`${d.conversion}% conversion`} barClassName="bg-ink-2" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// --- Escalation Alerts ---
const ALERT_STYLE = {
  warning: { icon: 'warning', color: 'text-accent' },
  critical: { icon: 'alert', color: 'text-negative' },
  success: { icon: 'check', color: 'text-positive' },
  info: { icon: 'clock', color: 'text-ink-3' },
};

function EscalationAlerts() {
  const [alerts] = useState([
    { id: 1, text: 'Khalid has 6 uncontacted leads (oldest: 23 min)', type: 'warning', time: '2 min ago' },
    { id: 2, text: 'High-value lead (AED 5.1M villa, Palm Jumeirah) unassigned for 4 min', type: 'critical', time: '4 min ago' },
    { id: 3, text: 'Priya just contacted Wei Zhang (response time: 28s)', type: 'success', time: '1 min ago' },
    { id: 4, text: "Follow-up reminder: Alexei Petrov hasn't been contacted in 12 days", type: 'info', time: '5 min ago' },
  ]);

  return (
    <Panel title="Escalation alerts" className="h-full">
      <ul className="divide-y divide-line">
        {alerts.map(a => (
          <li key={a.id} className="px-4 py-3 flex items-start gap-3">
            <Icon name={ALERT_STYLE[a.type].icon} className={`w-4 h-4 mt-0.5 ${ALERT_STYLE[a.type].color}`} />
            <p className="flex-1 min-w-0 text-[13px] leading-5 text-ink">{a.text}</p>
            <span className="text-xs leading-5 text-ink-3 whitespace-nowrap tabular-nums">{a.time}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// --- Operations Dashboard ---
function OperationsDashboard() {
  const [leads, setLeads] = useState(generateInitialLeads);
  const leadIdRef = useRef(16);

  // Add new leads periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newLead = generateLead(leadIdRef.current++, 0);
      newLead.isNew = true;
      newLead.status = 'pending';
      setLeads(prev => [newLead, ...prev.slice(0, 19)]);
    }, randomBetween(8000, 12000));

    return () => clearInterval(interval);
  }, []);

  // Advance lead statuses
  useEffect(() => {
    const interval = setInterval(() => {
      setLeads(prev => prev.map(lead => {
        if (lead.status !== 'pending') return lead;
        const age = (Date.now() - lead.createdAt) / 1000;
        const agent = AGENTS.find(a => a.id === lead.agentId);
        if (!agent) return lead;

        if (agent.tier === 'low' && age > 180) {
          return { ...lead, status: 'overdue' };
        }
        if (agent.tier === 'low' && age > 60 && Math.random() > 0.8) {
          return { ...lead, status: 'overdue' };
        }
        if (agent.tier !== 'low' && age > 30 && Math.random() > 0.7) {
          const ct = randomBetween(20, agent.tier === 'high' ? 55 : 85);
          return { ...lead, status: 'contacted', contactTime: ct };
        }
        if (age > 300 && Math.random() > 0.5) {
          return { ...lead, status: 'overdue' };
        }
        return lead;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const contactedCount = leads.filter(l => l.status === 'contacted').length;
  const pendingCount = leads.filter(l => l.status === 'pending').length;
  const overdueCount = leads.filter(l => l.status === 'overdue').length;

  return (
    <main className={`${PAGE} py-6 space-y-5`}>
      <PageHeading title="Operations" description="Lead response and agent performance for today." />

      {/* KPIs: one band, four cells */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-lg overflow-hidden">
        <KPICard label="Leads today" value="34" badge={{ text: '+3 new', tone: 'positive' }} sub="vs 28 yesterday" />
        <KPICard label="Avg response time" value="47s" sub="Target: <60s" />
        <KPICard label="Follow-ups due today" value="12" badge={{ text: '3 overdue', tone: 'negative' }} sub="8 completed" />
        <KPICard label="Pipeline value" value="AED 14.2M" sub="32 active opportunities" />
      </div>

      {/* Main area: Feed + Leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* On wide screens the feed takes its height from the leaderboard beside it */}
        <div className="xl:col-span-7 min-w-0 relative">
          <Panel
            title="Live lead feed"
            className="h-[480px] xl:h-auto xl:absolute xl:inset-0"
            bodyClassName="overflow-y-auto"
            aside={
              <div className="flex items-center gap-4 text-xs text-ink-3 tabular-nums">
                <span className="flex items-center gap-1.5"><Dot className="bg-positive" />{contactedCount} contacted</span>
                <span className="flex items-center gap-1.5"><Dot className="bg-accent" />{pendingCount} pending</span>
                <span className="flex items-center gap-1.5"><Dot className="bg-negative" />{overdueCount} overdue</span>
              </div>
            }
          >
            <ul className="divide-y divide-line">
              {leads.map(lead => (
                <LeadCard key={lead.id} lead={lead} isNew={lead.isNew} />
              ))}
            </ul>
          </Panel>
        </div>
        <div className="xl:col-span-5 min-w-0">
          <AgentLeaderboard />
        </div>
      </div>

      {/* Bottom: Source Performance + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SourcePerformance />
        <EscalationAlerts />
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// LEAD FLOW VIEW
// ═══════════════════════════════════════════════════════════════

// WhatsApp renders *text* as bold
function formatWhatsApp(text) {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) => (
    part.length > 2 && part.startsWith('*') && part.endsWith('*')
      ? <strong key={i} className="font-semibold">{part.slice(1, -1)}</strong>
      : part
  ));
}

// --- WhatsApp Phone ---
function WhatsAppPhone({ label, messages, contactName }) {
  const chatRef = useRef(null);

  // Keep the latest reply in view once a thread has more than one message
  useEffect(() => {
    if (messages.length > 1 && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col min-w-0">
      <div className="text-[13px] text-ink-2 font-medium mb-2">{label}</div>
      <div className="bg-wa-bg rounded-2xl border border-line-strong overflow-hidden w-full">
        {/* WhatsApp Header */}
        <div className="bg-wa-bar px-3 h-12 flex items-center gap-3">
          <Icon name="back" className="w-4 h-4 text-ink-3" />
          <div className="w-8 h-8 rounded-full bg-wa-field flex items-center justify-center text-xs text-ink-2 font-semibold">
            {contactName?.[0] || 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] leading-4 font-semibold text-ink truncate">{contactName || 'Contact'}</div>
            <div className="text-[11px] leading-4 text-ink-3">online</div>
          </div>
        </div>
        {/* Chat area */}
        <div ref={chatRef} className="h-[300px] xl:h-[236px] overflow-y-auto p-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} animate-enter`} style={{ animationDelay: `${msg.delay || 0}ms` }}>
              <div className={`max-w-[85%] px-3 py-2 text-[13px] leading-5 text-ink ${
                msg.sent ? 'bg-wa-sent rounded-lg rounded-tr-none' : 'bg-wa-bar rounded-lg rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap break-words">{formatWhatsApp(msg.text)}</div>
                <div className="flex items-center justify-end gap-1 mt-1 text-[11px] leading-4">
                  <span className="text-ink/55">{msg.time || '12:34 PM'}</span>
                  {msg.sent && (
                    <span className={msg.read ? 'text-wa-tick' : 'text-ink/55'}>
                      {'✓✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-[13px] text-ink-3">
              Messages will appear here
            </div>
          )}
        </div>
        {/* Input bar */}
        <div className="bg-wa-bar px-3 h-12 flex items-center gap-2.5 text-ink-3" aria-hidden="true">
          <Icon name="plus" className="w-5 h-5" />
          <div className="flex-1 bg-wa-field rounded-full px-3.5 h-8 flex items-center text-[13px]">Type a message</div>
          <Icon name="mic" className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// --- Timeline Step ---
const STEP_STYLE = {
  success: { icon: 'check', color: 'text-positive' },
  timer: { icon: 'clock', color: 'text-accent' },
  warning: { icon: 'warning', color: 'text-accent' },
  reassign: { icon: 'swap', color: 'text-ink-2' },
  alert: { icon: 'bell', color: 'text-negative' },
};

function StepDetail({ detail }) {
  const box = 'mt-2 bg-canvas border border-line rounded-md px-3 py-2.5 text-[13px] leading-5';
  if (detail.rows) {
    return (
      <dl className={`${box} grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1`}>
        {detail.rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-ink-3">{k}</dt>
            <dd className="text-ink-2 break-words">{v}</dd>
          </div>
        ))}
      </dl>
    );
  }
  if (detail.checks) {
    return (
      <ul className={`${box} space-y-1`}>
        {detail.checks.map(c => (
          <li key={c} className="flex items-start gap-2 text-ink-2">
            <Icon name="check" className="w-3.5 h-3.5 mt-[3px] text-positive" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className={`${box} text-ink-2 space-y-0.5`}>
      {detail.lines.map(line => <p key={line}>{line}</p>)}
    </div>
  );
}

function TimelineStep({ step, visible, isLast }) {
  if (!visible) return null;
  const style = STEP_STYLE[step.type] || STEP_STYLE.alert;

  return (
    <li className="animate-enter flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-6 h-6 rounded-full bg-raised border border-line-strong flex items-center justify-center ${style.color}`}>
          <Icon name={style.icon} className="w-3.5 h-3.5" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-line mt-1"></div>}
      </div>
      <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-5'}`}>
        <div className="flex items-baseline justify-between gap-3 min-h-6">
          <span className="text-sm font-medium text-ink">{step.label}</span>
          <span className="text-xs text-ink-3 tabular-nums shrink-0">{step.time}</span>
        </div>
        {step.detail && <StepDetail detail={step.detail} />}
        {step.countdown && <CountdownTimer />}
      </div>
    </li>
  );
}

// --- Countdown Timer ---
function CountdownTimer() {
  const [seconds, setSeconds] = useState(600);
  useEffect(() => {
    const iv = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div className="flex items-baseline gap-2 mt-1.5">
      <span className="text-ink tabular-nums text-xl font-semibold tracking-tight">{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}</span>
      <span className="text-[13px] text-ink-3">remaining</span>
    </div>
  );
}

function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-[13px] font-medium text-ink-2 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

// --- Lead Flow View ---
function LeadFlow() {
  const [form, setForm] = useState({
    name: 'Rajesh Mehta',
    nationality: 'India',
    source: 'Property Finder',
    property: '2BR Apartment, Dubai Marina, AED 1.85M',
    phone: '+971 50 XXX XXXX',
    budget: 'AED 1.5-2M',
  });

  const [timelineSteps, setTimelineSteps] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutcomeButtons, setShowOutcomeButtons] = useState(false);
  const [buyerMessages, setBuyerMessages] = useState([]);
  const [agentMessages, setAgentMessages] = useState([]);
  const [outcomeResult, setOutcomeResult] = useState(null);
  const timeoutRefs = useRef([]);

  const resetRun = useCallback(() => {
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];
    setTimelineSteps([]);
    setIsRunning(false);
    setShowOutcomeButtons(false);
    setBuyerMessages([]);
    setAgentMessages([]);
    setOutcomeResult(null);
  }, []);

  const matchedAgent = useMemo(() => {
    const nat = NATIONALITIES[form.nationality];
    if (!nat) return AGENTS[0];
    // Find agent who speaks buyer's language and covers the area
    const propertyArea = form.property.split(',').map(s => s.trim());
    const areaName = propertyArea.length > 1 ? propertyArea[1] : '';

    // Find best match based on language + area
    let best = AGENTS[0];
    let bestScore = 0;
    for (const agent of AGENTS) {
      if (agent.tier === 'low') continue;
      let score = 0;
      const buyerLangs = nat.flag === '\u{1F1EE}\u{1F1F3}' ? ['Hindi', 'English'] :
                         nat.flag === '\u{1F1F7}\u{1F1FA}' ? ['Russian', 'English'] :
                         nat.flag === '\u{1F1EC}\u{1F1E7}' ? ['English'] :
                         nat.flag === '\u{1F1E8}\u{1F1F3}' ? ['Mandarin', 'English'] :
                         nat.flag === '\u{1F1F5}\u{1F1F0}' ? ['Urdu', 'English'] :
                         ['Arabic', 'English'];
      for (const lang of buyerLangs) {
        if (agent.languages.includes(lang)) score += 3;
      }
      if (agent.areas.some(a => areaName.includes(a))) score += 5;
      if (agent.tier === 'high') score += 2;
      if (score > bestScore) { bestScore = score; best = agent; }
    }
    return best;
  }, [form.nationality, form.property]);

  const natFlag = NATIONALITIES[form.nationality]?.flag || '';

  const runFlow = useCallback(() => {
    resetRun();
    setIsRunning(true);

    const steps = [
      { time: '0.0s', type: 'success', label: `Lead captured from ${form.source}`, delay: 500,
        detail: { rows: [['Name', `${form.name} ${natFlag}`], ['Nationality', form.nationality], ['Property', form.property], ['Budget', form.budget], ['Phone', form.phone], ['Source', form.source]] } },
      { time: '1.5s', type: 'success', label: 'Lead scored: 78/100 (High intent)', delay: 2000,
        detail: { checks: [`Budget match: ${form.budget} aligns with property value`, `Active market segment: ${form.nationality} buyers in high demand`, 'Direct unit inquiry: Specific property selected', 'High-demand area: Strong rental yields & appreciation'] } },
      { time: '2.5s', type: 'success', label: `Agent matched: ${matchedAgent.name}`, delay: 3500,
        detail: { lines: [`${matchedAgent.areas.join(' & ')} specialist`, `Speaks: ${matchedAgent.languages.join(', ')}`, `${matchedAgent.contactRate}% contact rate · ${matchedAgent.avgResponse}s avg response`] } },
      { time: '3.5s', type: 'success', label: 'WhatsApp sent to buyer', delay: 5000 },
      { time: '4.0s', type: 'success', label: 'Agent notified via WhatsApp', delay: 6000 },
      { time: '4.5s', type: 'timer', label: 'Response timer started: 10:00 minutes remaining', delay: 7000, countdown: true },
    ];

    steps.forEach(step => {
      const t = setTimeout(() => {
        setTimelineSteps(prev => [...prev, step]);
      }, step.delay);
      timeoutRefs.current.push(t);
    });

    // Send buyer message
    const buyerMsgTimeout = setTimeout(() => {
      setBuyerMessages([{
        sent: true,
        text: `Hi ${form.name}! \uD83D\uDC4B\n\nThank you for your interest in the ${form.property.split(',').slice(0, -1).join(',').trim()} (${form.property.split(',').pop().trim()}).\n\nYour dedicated property consultant *${matchedAgent.name}* will call you within the next 10 minutes.\n\n\uD83C\uDFE0 View property details: [link]\n\uD83C\uDFA5 Virtual tour: [link]\n\n\u2014 Elite Properties Dubai\n\uD83D\uDCDE +971 4 XXX XXXX`,
        time: '12:34 PM',
        read: false,
        delay: 0,
      }]);
      // Blue ticks after delay
      const readTimeout = setTimeout(() => {
        setBuyerMessages(prev => prev.map(m => ({ ...m, read: true })));
      }, 2000);
      timeoutRefs.current.push(readTimeout);
    }, 5000);
    timeoutRefs.current.push(buyerMsgTimeout);

    // Send agent message
    const agentMsgTimeout = setTimeout(() => {
      setAgentMessages([{
        sent: false,
        text: `\uD83D\uDD14 *NEW LEAD \u2014 HIGH PRIORITY*\n\n\uD83D\uDC64 ${form.name} | ${natFlag} ${form.nationality}\n\uD83C\uDFE0 ${form.property}\n\uD83D\uDCCA Lead Score: 78/100\n\uD83D\uDCCD Source: ${form.source}\n\n\uD83D\uDCDE ${form.phone}\n\uD83D\uDCAC Speaks: ${NATIONALITIES[form.nationality]?.flag === '\u{1F1EE}\u{1F1F3}' ? 'Hindi, English' : NATIONALITIES[form.nationality]?.flag === '\u{1F1F7}\u{1F1FA}' ? 'Russian, English' : NATIONALITIES[form.nationality]?.flag === '\u{1F1E8}\u{1F1F3}' ? 'Mandarin, English' : 'English'}\n\n\u23F1\uFE0F *Contact within 10 minutes*\n[\u2705 Tap to confirm contact]`,
        time: '12:34 PM',
        delay: 0,
      }]);
    }, 6000);
    timeoutRefs.current.push(agentMsgTimeout);

    // Show outcome buttons
    const outcomeTimeout = setTimeout(() => {
      setShowOutcomeButtons(true);
    }, 8000);
    timeoutRefs.current.push(outcomeTimeout);
  }, [form, matchedAgent, natFlag, resetRun]);

  const confirmContact = useCallback(() => {
    setShowOutcomeButtons(false);
    setOutcomeResult('confirmed');
    // Add agent confirmation message
    setAgentMessages(prev => [...prev, {
      sent: true,
      text: `\u2705 Contact confirmed\n\nSpoke with ${form.name}. Scheduling viewing for tomorrow.\n\nLead moved to Active Pipeline.`,
      time: '12:35 PM',
      read: true,
      delay: 0,
    }]);
  }, [form.name]);

  const triggerEscalation = useCallback(() => {
    setShowOutcomeButtons(false);
    setOutcomeResult('escalated');

    const escalationSteps = [
      { time: '10:00', type: 'warning', label: `No confirmation from ${matchedAgent.name} \u2014 escalating`, delay: 500 },
      { time: '10:02', type: 'reassign', label: 'Lead reassigned to Sarah Thompson (backup)', delay: 1500 },
      { time: '10:03', type: 'alert', label: 'Manager alert sent to Omar Al-Farsi (Sales Director)', delay: 2500,
        detail: { lines: [`Escalation: ${matchedAgent.name} did not contact ${form.name} (${form.property.split(',').pop().trim()}, ${form.property.split(',')[1]?.trim()}) within 10 minutes. Lead reassigned to Sarah. This is ${matchedAgent.name}'s 3rd missed lead today.`] } },
    ];

    escalationSteps.forEach(step => {
      const t = setTimeout(() => {
        setTimelineSteps(prev => [...prev, step]);
      }, step.delay);
      timeoutRefs.current.push(t);
    });

    // Update agent phone with escalation
    const escMsgTimeout = setTimeout(() => {
      setAgentMessages(prev => [...prev, {
        sent: false,
        text: `\u26A0\uFE0F *LEAD REASSIGNED*\n\n${form.name}'s lead has been reassigned to Sarah Thompson due to no response.\n\nThis is your 3rd missed lead today. Please contact your manager.`,
        time: '12:44 PM',
        delay: 0,
      }]);
    }, 3000);
    timeoutRefs.current.push(escMsgTimeout);
  }, [form.name, form.property, matchedAgent.name]);

  const setField = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const timelineRef = useRef(null);
  const startRun = () => {
    runFlow();
    if (window.matchMedia('(max-width: 1023px)').matches) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      timelineRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <main className={`${PAGE} py-6 space-y-5`}>
      <PageHeading title="Lead automation" description="Send a lead through routing, messaging and escalation." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Lead Trigger */}
        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-20 min-w-0">
          <Panel title="Lead trigger" bodyClassName="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <Field id="lead-name" label="Name">
              <input id="lead-name" className={FIELD} value={form.name} onChange={setField('name')} />
            </Field>
            <Field id="lead-nationality" label="Nationality">
              <select id="lead-nationality" className={`${FIELD} select-chevron`} value={form.nationality} onChange={setField('nationality')}>
                {NATIONALITY_KEYS.map(k => (
                  <option key={k} value={k}>{NATIONALITIES[k].flag} {k}</option>
                ))}
              </select>
            </Field>
            <Field id="lead-source" label="Source">
              <select id="lead-source" className={`${FIELD} select-chevron`} value={form.source} onChange={setField('source')}>
                {SOURCES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field id="lead-property" label="Property">
              <input id="lead-property" className={FIELD} value={form.property} onChange={setField('property')} />
            </Field>
            <Field id="lead-phone" label="Phone">
              <input id="lead-phone" className={FIELD} value={form.phone} onChange={setField('phone')} />
            </Field>
            <Field id="lead-budget" label="Budget">
              <input id="lead-budget" className={FIELD} value={form.budget} onChange={setField('budget')} />
            </Field>
            <button
              onClick={isRunning ? resetRun : startRun}
              className={`w-full sm:col-span-2 lg:col-span-1 ${isRunning ? BTN_SECONDARY : BTN_PRIMARY}`}
            >
              <Icon name={isRunning ? 'reset' : 'play'} />
              {isRunning ? 'Reset' : 'Send new lead'}
            </button>
          </Panel>
        </div>

        {/* Center: Automation Timeline */}
        <div ref={timelineRef} className="lg:col-span-8 xl:col-span-5 min-w-0 scroll-mt-28 sm:scroll-mt-20">
          <Panel title="Automation timeline" className="min-h-[320px]" bodyClassName="p-4">
            {timelineSteps.length === 0 && !isRunning && (
              <div className="py-16 text-center">
                <div className="text-sm font-medium text-ink">No lead in progress</div>
                <div className="text-[13px] text-ink-3 mt-1">Press "Send new lead" to watch the automation run step by step.</div>
              </div>
            )}
            {timelineSteps.length === 0 && isRunning && (
              <div className="py-16 text-center text-[13px] text-ink-3">Capturing lead…</div>
            )}
            <ol>
              {timelineSteps.map((step, i) => (
                <TimelineStep key={i} step={step} visible={true} isLast={i === timelineSteps.length - 1} />
              ))}
            </ol>

            {/* Outcome buttons */}
            {showOutcomeButtons && !outcomeResult && (
              <div className="mt-5 pt-4 border-t border-line animate-enter">
                <div className="text-[13px] text-ink-2 mb-3">Choose how the agent responds</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={confirmContact} className={BTN_SECONDARY}>
                    <Icon name="check" className="w-4 h-4 text-positive" />
                    Agent confirms contact
                  </button>
                  <button onClick={triggerEscalation} className={BTN_SECONDARY}>
                    <Icon name="warning" className="w-4 h-4 text-negative" />
                    Agent doesn't respond
                  </button>
                </div>
              </div>
            )}

            {/* Outcome result */}
            {outcomeResult === 'confirmed' && (
              <div className="mt-5 pt-4 border-t border-line flex items-start gap-3 animate-enter">
                <Icon name="check" className="w-4 h-4 mt-0.5 text-positive" />
                <div>
                  <div className="text-sm font-medium text-ink">Lead successfully contacted</div>
                  <div className="text-[13px] leading-5 text-ink-2 mt-1">
                    {matchedAgent.name} confirmed contact with {form.name} at 12:35 PM.<br/>
                    Response time: 52 seconds.<br/>
                    Lead moved to Active Pipeline.
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* Right: WhatsApp Phones */}
        <div className="lg:col-span-12 xl:col-span-4 min-w-0 sticky-when-tall">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
            <WhatsAppPhone
              label="Buyer's WhatsApp"
              messages={buyerMessages}
              contactName="Elite Properties Dubai"
            />
            <WhatsAppPhone
              label={`Agent's WhatsApp (${matchedAgent.name})`}
              messages={agentMessages}
              contactName="LeadEngine Bot"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-canvas">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'dashboard' ? <OperationsDashboard /> : <LeadFlow />}
    </div>
  );
}
