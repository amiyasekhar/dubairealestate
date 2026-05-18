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

const SOURCE_COLORS = {
  'Property Finder': 'bg-pf-blue',
  'Bayut': 'bg-bayut-purple',
  'Google Ads': 'bg-google-green',
  'Instagram': 'bg-insta-pink',
  'WhatsApp': 'bg-whatsapp-green',
};

const SOURCE_TEXT_COLORS = {
  'Property Finder': 'text-pf-blue',
  'Bayut': 'text-bayut-purple',
  'Google Ads': 'text-google-green',
  'Instagram': 'text-insta-pink',
  'WhatsApp': 'text-whatsapp-green',
};

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

  const statuses = ['pending', 'contacted', 'overdue'];
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
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

// --- Header ---
function Header({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-dark-border bg-dark-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-bold text-black text-sm">LE</div>
          <span className="text-lg font-semibold text-white tracking-tight">LeadEngine</span>
          <span className="text-xs text-gray-500 ml-1 hidden sm:inline">Dubai Real Estate Lead Automation</span>
        </div>
        <div className="flex items-center gap-1 bg-dark-bg rounded-lg p-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-dark-card text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Operations Dashboard
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'demo' ? 'bg-dark-card text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Live Demo
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs text-accent font-semibold">OA</div>
        </div>
      </div>
    </header>
  );
}

// --- KPI Cards ---
function KPICard({ label, value, sub, color = 'text-white', badge = null }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-5 flex-1 min-w-[200px]">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${color} tracking-tight`}>{value}</span>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.text}</span>
        )}
      </div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

// --- Source Badge ---
function SourceBadge({ source }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${SOURCE_COLORS[source]} bg-opacity-90`}>
      {source}
    </span>
  );
}

// --- Live Timer ---
function LiveTimer({ createdAt, status }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - createdAt) / 1000));

  useEffect(() => {
    if (status === 'contacted') return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - createdAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  return <span>{formatTime(elapsed)}</span>;
}

// --- Lead Card ---
function LeadCard({ lead, isNew }) {
  const statusConfig = {
    contacted: { label: `Contacted in ${lead.contactTime}s`, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
    pending: { label: 'Pending', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
    overdue: { label: 'Overdue', color: 'text-danger animate-pulse-red', bg: 'bg-danger/10', border: 'border-danger/20' },
  };
  const s = statusConfig[lead.status];

  return (
    <div className={`bg-dark-card border border-dark-border rounded-lg p-4 transition-all duration-300 hover:border-gray-600 ${isNew ? 'animate-slide-in' : ''} ${lead.status === 'overdue' ? 'border-danger/30' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-white truncate">{lead.flag} {lead.name}</span>
            <SourceBadge source={lead.source} />
          </div>
          <div className="text-xs text-gray-400 mb-1.5 truncate">{lead.property}</div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500">Agent: <span className="text-gray-300">{lead.agent}</span></span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-xs font-semibold px-2 py-1 rounded ${s.bg} ${s.color} ${s.border} border mb-1.5`}>
            {lead.status === 'contacted' ? s.label : (
              <span className="flex items-center gap-1">
                {s.label} <LiveTimer createdAt={lead.createdAt} status={lead.status} />
              </span>
            )}
          </div>
          <div className="text-[10px] text-gray-600">
            {lead.status !== 'contacted' && (
              <span className="flex items-center justify-end gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                <LiveTimer createdAt={lead.createdAt} status={lead.status} /> ago
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Agent Leaderboard ---
function AgentLeaderboard() {
  const sorted = useMemo(() => [...AGENTS].sort((a, b) => b.contactRate - a.contactRate), []);
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-dark-border">
        <h3 className="text-sm font-semibold text-white">Agent Leaderboard</h3>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dark-border text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-2.5 font-medium">Agent</th>
              <th className="text-center px-2 py-2.5 font-medium">Leads</th>
              <th className="text-center px-2 py-2.5 font-medium">Avg Resp</th>
              <th className="text-center px-2 py-2.5 font-medium">Contact %</th>
              <th className="text-right px-4 py-2.5 font-medium">Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((agent, i) => (
              <tr key={agent.id} className={`border-b border-dark-border/50 hover:bg-white/[0.02] transition-colors ${agent.tier === 'low' ? 'bg-danger/[0.03]' : ''}`}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${agent.online ? 'bg-success' : 'bg-gray-600'}`}></div>
                    <span className={`font-medium ${agent.tier === 'high' ? 'text-white' : agent.tier === 'low' ? 'text-danger' : 'text-gray-300'}`}>
                      {agent.name}
                    </span>
                    {i === 0 && <span className="text-accent text-[10px]">#1</span>}
                  </div>
                </td>
                <td className="text-center px-2 py-2.5 text-gray-300">{agent.leadsToday}</td>
                <td className={`text-center px-2 py-2.5 font-mono font-semibold ${agent.avgResponse < 60 ? 'text-success' : agent.avgResponse > 120 ? 'text-danger' : 'text-accent'}`}>
                  {agent.avgResponse}s
                </td>
                <td className="text-center px-2 py-2.5">
                  <span className={`font-semibold ${agent.contactRate > 85 ? 'text-success' : agent.contactRate < 50 ? 'text-danger' : 'text-gray-300'}`}>
                    {agent.contactRate}%
                  </span>
                </td>
                <td className="text-right px-4 py-2.5 text-gray-300 font-mono">AED {agent.pipeline}M</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Source Performance ---
function SourcePerformance() {
  const data = [
    { source: 'Property Finder', volume: 14, conversion: 18 },
    { source: 'Bayut', volume: 9, conversion: 15 },
    { source: 'Google Ads', volume: 5, conversion: 28 },
    { source: 'Instagram', volume: 4, conversion: 8 },
    { source: 'WhatsApp', volume: 3, conversion: 22 },
  ];
  const maxVol = Math.max(...data.map(d => d.volume));

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 h-full">
      <h3 className="text-sm font-semibold text-white mb-4">Lead Source Performance</h3>
      <div className="space-y-3">
        {data.map(d => (
          <div key={d.source} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${SOURCE_TEXT_COLORS[d.source]}`}>{d.source}</span>
              <span className="text-gray-500">{d.volume} leads / {d.conversion}% conv</span>
            </div>
            <div className="flex gap-1.5 h-3">
              <div
                className={`h-full rounded-sm ${SOURCE_COLORS[d.source]} animate-bar-grow`}
                style={{ width: `${(d.volume / maxVol) * 60}%` }}
                title={`${d.volume} leads`}
              ></div>
              <div
                className={`h-full rounded-sm ${SOURCE_COLORS[d.source]} opacity-40 animate-bar-grow`}
                style={{ width: `${(d.conversion / 30) * 35}%`, animationDelay: '0.3s' }}
                title={`${d.conversion}% conversion`}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-gray-500 rounded-sm inline-block"></span>Volume</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-gray-500 opacity-40 rounded-sm inline-block"></span>Conversion Rate</span>
      </div>
    </div>
  );
}

// --- Escalation Alerts ---
function EscalationAlerts() {
  const [alerts, setAlerts] = useState([
    { id: 1, icon: '\u26A0\uFE0F', text: 'Khalid has 6 uncontacted leads (oldest: 23 min)', type: 'warning', time: '2 min ago' },
    { id: 2, icon: '\uD83D\uDD25', text: 'High-value lead (AED 5.1M villa, Palm Jumeirah) unassigned for 4 min', type: 'critical', time: '4 min ago' },
    { id: 3, icon: '\u2705', text: 'Priya just contacted Wei Zhang (response time: 28s)', type: 'success', time: '1 min ago' },
    { id: 4, icon: '\uD83D\uDCF1', text: "Follow-up reminder: Alexei Petrov hasn't been contacted in 12 days", type: 'info', time: '5 min ago' },
  ]);

  const typeBg = {
    warning: 'border-l-accent bg-accent/5',
    critical: 'border-l-danger bg-danger/5',
    success: 'border-l-success bg-success/5',
    info: 'border-l-pf-blue bg-pf-blue/5',
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 h-full">
      <h3 className="text-sm font-semibold text-white mb-4">Escalation Alerts</h3>
      <div className="space-y-2">
        {alerts.map(a => (
          <div key={a.id} className={`border-l-2 rounded-r-md px-3 py-2.5 ${typeBg[a.type]}`}>
            <div className="text-xs text-gray-200 leading-relaxed">
              <span className="mr-1">{a.icon}</span> {a.text}
            </div>
            <div className="text-[10px] text-gray-600 mt-1">{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Operations Dashboard ---
function OperationsDashboard() {
  const [leads, setLeads] = useState(generateInitialLeads);
  const leadIdRef = useRef(16);
  const newLeadIdsRef = useRef(new Set());

  // Add new leads periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newLead = generateLead(leadIdRef.current++, 0);
      newLead.isNew = true;
      newLead.status = 'pending';
      newLeadIdsRef.current.add(newLead.id);
      setLeads(prev => [newLead, ...prev.slice(0, 19)]);

      // Clear "new" flag after animation
      setTimeout(() => {
        newLeadIdsRef.current.delete(newLead.id);
      }, 2000);
    }, randomBetween(8000, 12000));

    return () => clearInterval(interval);
  }, []);

  // Simulate status changes
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

  return (
    <div className="max-w-[1920px] mx-auto px-6 py-5 space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Leads Today" value="34" badge={{ text: '+3 new', color: 'bg-success/20 text-success' }} sub="vs 28 yesterday" />
        <KPICard label="Avg Response Time" value="47s" color="text-success" sub="Target: <60s" />
        <KPICard label="Follow-ups Due Today" value="12" color="text-accent" badge={{ text: '3 overdue', color: 'bg-danger/20 text-danger' }} sub="8 completed" />
        <KPICard label="Pipeline Value" value="AED 14.2M" sub="32 active opportunities" />
      </div>

      {/* Main area: Feed + Leaderboard */}
      <div className="grid grid-cols-5 gap-5" style={{ minHeight: '480px' }}>
        <div className="col-span-3">
          <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden h-full flex flex-col">
            <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Live Lead Feed</h3>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success"></span>{contactedCount} contacted</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent"></span>{pendingCount} pending</span>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-2" style={{ maxHeight: '440px' }}>
              {leads.map(lead => (
                <LeadCard key={lead.id} lead={lead} isNew={newLeadIdsRef.current.has(lead.id)} />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <AgentLeaderboard />
        </div>
      </div>

      {/* Bottom: Source Performance + Alerts */}
      <div className="grid grid-cols-2 gap-5">
        <SourcePerformance />
        <EscalationAlerts />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LIVE DEMO VIEW
// ═══════════════════════════════════════════════════════════════

// --- WhatsApp Phone Mockup ---
function WhatsAppPhone({ label, messages, contactName }) {
  return (
    <div className="flex flex-col">
      <div className="text-xs text-gray-500 font-medium mb-2 text-center">{label}</div>
      <div className="bg-[#0B141A] rounded-2xl border border-dark-border overflow-hidden shadow-2xl w-full max-w-[340px] mx-auto">
        {/* WhatsApp Header */}
        <div className="bg-[#1F2C34] px-3 py-2.5 flex items-center gap-3">
          <div className="w-3 h-3 text-gray-400">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#2A3942] flex items-center justify-center text-xs text-gray-400 font-semibold">
            {contactName?.[0] || 'U'}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-200">{contactName || 'Contact'}</div>
            <div className="text-[10px] text-gray-500">online</div>
          </div>
        </div>
        {/* Chat area */}
        <div className="bg-[#0B141A] min-h-[280px] max-h-[320px] overflow-y-auto p-3 space-y-2"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(37,211,102,0.02) 0%, transparent 50%)' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} animate-bubble-in`} style={{ animationDelay: `${msg.delay || 0}ms` }}>
              <div className={`max-w-[85%] px-3 py-2 text-xs leading-relaxed ${
                msg.sent ? 'bg-[#005C4B] text-gray-100 rounded-lg rounded-tr-none' : 'bg-[#1F2C34] text-gray-200 rounded-lg rounded-tl-none'
              }`}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[9px] text-gray-500">{msg.time || '12:34 PM'}</span>
                  {msg.sent && (
                    <span className={`text-[10px] ${msg.read ? 'text-[#53BDEB]' : 'text-gray-500'}`}>
                      {'\u2713\u2713'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-xs text-gray-600 py-20">
              Messages will appear here...
            </div>
          )}
        </div>
        {/* Input bar */}
        <div className="bg-[#1F2C34] px-3 py-2 flex items-center gap-2">
          <div className="text-gray-500 text-sm">+</div>
          <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5 text-[10px] text-gray-500">Type a message</div>
          <div className="text-gray-500 text-xs">{'\uD83C\uDF99\uFE0F'}</div>
        </div>
      </div>
    </div>
  );
}

// --- Timeline Step ---
function TimelineStep({ step, visible }) {
  if (!visible) return null;

  const icons = {
    success: <span className="text-success">{'\u2705'}</span>,
    timer: <span className="text-accent">{'\u23F1\uFE0F'}</span>,
    warning: <span className="text-accent">{'\u26A0\uFE0F'}</span>,
    reassign: <span className="text-pf-blue">{'\uD83D\uDD04'}</span>,
    alert: <span className="text-danger">{'\uD83D\uDCF1'}</span>,
  };

  return (
    <div className="animate-timeline-step flex gap-3 items-start">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
          step.type === 'success' ? 'bg-success/10 border border-success/30' :
          step.type === 'timer' ? 'bg-accent/10 border border-accent/30' :
          step.type === 'warning' ? 'bg-accent/10 border border-accent/30' :
          step.type === 'reassign' ? 'bg-pf-blue/10 border border-pf-blue/30' :
          'bg-danger/10 border border-danger/30'
        }`}>
          {icons[step.type]}
        </div>
        <div className="w-px h-6 bg-dark-border"></div>
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-gray-600 font-mono">[{step.time}]</span>
          <span className="text-xs font-medium text-gray-200">{step.label}</span>
        </div>
        {step.detail && (
          <div className="bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-[11px] text-gray-400 leading-relaxed mt-1">
            {step.detail}
          </div>
        )}
        {step.countdown && <CountdownTimer />}
      </div>
    </div>
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
    <div className="flex items-center gap-2 mt-2">
      <span className="text-accent font-mono text-lg font-bold">{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}</span>
      <span className="text-xs text-gray-500">remaining</span>
    </div>
  );
}

// --- Live Demo View ---
function LiveDemo() {
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

  const resetDemo = useCallback(() => {
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

  const runDemo = useCallback(() => {
    resetDemo();
    setIsRunning(true);

    const steps = [
      { time: '0.0s', type: 'success', label: `Lead captured from ${form.source}`, delay: 500,
        detail: `Name: ${form.name} ${natFlag}\nNationality: ${form.nationality}\nProperty: ${form.property}\nBudget: ${form.budget}\nPhone: ${form.phone}\nSource: ${form.source}` },
      { time: '1.5s', type: 'success', label: 'Lead scored: 78/100 (High intent)', delay: 2000,
        detail: `\u2705 Budget match: ${form.budget} aligns with property value\n\u2705 Active market segment: ${form.nationality} buyers in high demand\n\u2705 Direct unit inquiry: Specific property selected\n\u2705 High-demand area: Strong rental yields & appreciation` },
      { time: '2.5s', type: 'success', label: `Agent matched: ${matchedAgent.name}`, delay: 3500,
        detail: `${matchedAgent.areas.join(' & ')} specialist\nSpeaks: ${matchedAgent.languages.join(', ')}\n${matchedAgent.contactRate}% contact rate | ${matchedAgent.avgResponse}s avg response` },
      { time: '3.5s', type: 'success', label: 'WhatsApp sent to buyer', delay: 5000 },
      { time: '4.0s', type: 'success', label: 'Agent notified via WhatsApp', delay: 6000 },
      { time: '4.5s', type: 'timer', label: 'Response timer started: 10:00 minutes remaining', delay: 7000, countdown: true },
    ];

    steps.forEach((step, i) => {
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
  }, [form, matchedAgent, natFlag, resetDemo]);

  const simulateConfirm = useCallback(() => {
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

  const simulateEscalation = useCallback(() => {
    setShowOutcomeButtons(false);
    setOutcomeResult('escalated');

    const escalationSteps = [
      { time: '10:00', type: 'warning', label: `No confirmation from ${matchedAgent.name} \u2014 escalating`, delay: 500 },
      { time: '10:02', type: 'reassign', label: 'Lead reassigned to Sarah Thompson (backup)', delay: 1500 },
      { time: '10:03', type: 'alert', label: 'Manager alert sent to Omar Al-Farsi (Sales Director)', delay: 2500,
        detail: `\u26A0\uFE0F ESCALATION: ${matchedAgent.name} did not contact ${form.name} (${form.property.split(',').pop().trim()}, ${form.property.split(',')[1]?.trim()}) within 10 minutes. Lead reassigned to Sarah. This is ${matchedAgent.name}'s 3rd missed lead today.` },
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

  return (
    <div className="max-w-[1920px] mx-auto px-6 py-5">
      <div className="grid grid-cols-12 gap-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
        {/* Left: Lead Trigger */}
        <div className="col-span-3">
          <div className="bg-dark-card border border-dark-border rounded-lg p-5 sticky top-20">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              {'\u26A1'} Lead Trigger Panel
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Name</label>
                <input
                  className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Nationality</label>
                <select
                  className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                  value={form.nationality}
                  onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
                >
                  {NATIONALITY_KEYS.map(k => (
                    <option key={k} value={k}>{NATIONALITIES[k].flag} {k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Source</label>
                <select
                  className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                  value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                >
                  {SOURCES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Property</label>
                <input
                  className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                  value={form.property}
                  onChange={e => setForm(f => ({ ...f, property: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Phone</label>
                <input
                  className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Budget</label>
                <input
                  className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                  value={form.budget}
                  onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                />
              </div>
              <button
                onClick={isRunning ? resetDemo : runDemo}
                className={`w-full py-3 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer mt-2 ${
                  isRunning
                    ? 'bg-dark-bg border border-dark-border text-gray-400 hover:text-white'
                    : 'bg-accent text-black hover:bg-amber-400 animate-pulse-glow'
                }`}
              >
                {isRunning ? '\u21BB Reset Demo' : '\u26A1 Simulate New Lead'}
              </button>
            </div>
          </div>
        </div>

        {/* Center: Automation Timeline */}
        <div className="col-span-5">
          <div className="bg-dark-card border border-dark-border rounded-lg p-5 h-full">
            <h3 className="text-sm font-semibold text-white mb-5">Automation Timeline</h3>
            {timelineSteps.length === 0 && !isRunning && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                <div className="text-4xl mb-3">{'\u26A1'}</div>
                <div className="text-sm">Click "Simulate New Lead" to start</div>
                <div className="text-xs mt-1 text-gray-700">Watch the automation unfold in real-time</div>
              </div>
            )}
            <div className="space-y-1">
              {timelineSteps.map((step, i) => (
                <TimelineStep key={i} step={step} visible={true} />
              ))}
            </div>

            {/* Outcome buttons */}
            {showOutcomeButtons && !outcomeResult && (
              <div className="mt-6 space-y-2 animate-fade-in">
                <div className="text-xs text-gray-500 mb-3">Choose outcome to simulate:</div>
                <button
                  onClick={simulateConfirm}
                  className="w-full py-3 bg-success/10 border border-success/30 text-success rounded-md text-sm font-semibold hover:bg-success/20 transition-colors cursor-pointer"
                >
                  {'\u2705'} Simulate: Agent Confirms Contact
                </button>
                <button
                  onClick={simulateEscalation}
                  className="w-full py-3 bg-danger/10 border border-danger/30 text-danger rounded-md text-sm font-semibold hover:bg-danger/20 transition-colors cursor-pointer"
                >
                  {'\u26A0\uFE0F'} Simulate: Agent Doesn't Respond
                </button>
              </div>
            )}

            {/* Outcome result */}
            {outcomeResult === 'confirmed' && (
              <div className="mt-6 bg-success/10 border border-success/30 rounded-lg p-4 animate-fade-in">
                <div className="text-success text-sm font-semibold mb-1">{'\u2705'} Lead Successfully Contacted</div>
                <div className="text-xs text-gray-400">
                  {matchedAgent.name} confirmed contact with {form.name} at 12:35 PM.<br/>
                  Response time: 52 seconds.<br/>
                  Lead moved to Active Pipeline.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: WhatsApp Mockups */}
        <div className="col-span-4">
          <div className="space-y-5 sticky top-20">
            <WhatsAppPhone
              label={`\uD83D\uDCF1 Buyer's WhatsApp`}
              messages={buyerMessages}
              contactName="Elite Properties Dubai"
            />
            <WhatsAppPhone
              label={`\uD83D\uDCF1 Agent's WhatsApp (${matchedAgent.name})`}
              messages={agentMessages}
              contactName="LeadEngine Bot"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'dashboard' ? <OperationsDashboard /> : <LiveDemo />}
    </div>
  );
}
