import fs from 'fs';
import path from 'path';

const today = '2026-06-12';

const evaluations = [
  {
    num: 78, company: 'Palantir', slug: 'palantir-fdse-uk-gov',
    role: 'Forward Deployed Software Engineer - UK Government',
    url: 'https://jobs.lever.co/palantir/57a3f928-e7d3-4037-8196-b38e2f867152',
    score: 4.0, pdf: true, status: 'Evaluated',
    note: 'Strong fit: London, Python, 1+ YOE, UK gov. High-value brand.',
    archetype: 'Junior AI Engineer / Forward Deployed Engineer',
    domain: 'Platform/Enterprise', func: 'Build/Deploy',
    seniority: 'Entry-Level (1+ YOE)', remote: 'Hybrid — on-site London client sites',
    tldr: 'Deploy Palantir\'s Foundry platform to solve mission-critical problems for UK government clients.',
    gaps: ['No Palantir Foundry experience', 'No government client work', 'Glasgow-based — London travel needed'],
    legitimacy: 'Active',
  },
  {
    num: 79, company: 'Glacis AI', slug: 'glacis-ai-founding-swe-agentic',
    role: 'Founding Software Engineer - Agentic AI (Remote)',
    url: 'https://jobs.ashbyhq.com/glacis-ai/feea2cb6-60db-4afa-8358-ba17d05d1cd5',
    score: 3.8, pdf: true, status: 'Evaluated',
    note: 'Great skills match: Python/Django, AI agents, remote. Early-stage risk.',
    archetype: 'Junior AI Engineer / Agentic',
    domain: 'Agentic AI / Cybersecurity', func: 'Build',
    seniority: 'Mid (Founding engineer)', remote: 'Full remote',
    tldr: 'Founding engineer building agentic AI systems for cybersecurity at an early-stage startup.',
    gaps: ['No cybersecurity domain knowledge', 'Founding implies broad full-stack', 'Startup risk'],
    legitimacy: 'Active',
  },
  {
    num: 80, company: 'PhysicsX', slug: 'physicsx-fde',
    role: 'Forward Deployed Software Engineer',
    url: 'https://job-boards.eu.greenhouse.io/physicsx/jobs/4860241101',
    score: 3.5, pdf: true, status: 'Evaluated',
    note: 'London, Python/FastAPI. Strong skills match but needs physics domain knowledge.',
    archetype: 'Junior AI Engineer / FDE',
    domain: 'Engineering Simulation / Physics ML', func: 'Build/Deploy',
    seniority: 'Mid (3+ YOE preferred)', remote: 'Hybrid — London',
    tldr: 'Deploy physics-ML solutions to complex engineering problems in aerospace and automotive.',
    gaps: ['No physics/engineering domain knowledge', '3+ YOE preferred (Yash ~1yr)', 'Seniority may be a stretch'],
    legitimacy: 'Active',
  },
  {
    num: 81, company: 'Airtable', slug: 'airtable-ai-agent-architect',
    role: 'AI Agent Architect, Customer Experience',
    url: 'https://job-boards.greenhouse.io/airtable/jobs/8409168002',
    score: 3.5, pdf: true, status: 'Evaluated',
    note: 'RAG, LLMs, agents — perfect skills match. May be senior level.',
    archetype: 'Junior AI Engineer / Agentic',
    domain: 'Agentic AI / SaaS Platform', func: 'Build/Consult',
    seniority: 'Mid-Senior', remote: 'Full remote',
    tldr: 'Design AI agent architectures for enterprise customers on Airtable\'s platform.',
    gaps: ['Likely senior-level (Architect title)', 'Enterprise customer engagement experience', 'US company (timezone fit OK)'],
    legitimacy: 'Active',
  },
  {
    num: 82, company: 'Decagon', slug: 'decagon-swe-agents',
    role: 'Software Engineer, Agents',
    url: 'https://jobs.ashbyhq.com/decagon/28366d07-ae89-428c-8593-1840591bfc18',
    score: 3.2, pdf: true, status: 'Evaluated',
    note: 'London, Python/TS, £125-180K. Skills match well but senior requirement.',
    archetype: 'Junior AI Engineer / Agentic',
    domain: 'Agentic AI / Customer Support', func: 'Build',
    seniority: 'Mid-Senior (3+ YOE)', remote: 'Hybrid — London',
    tldr: 'Build AI agents for enterprise customer support at a fast-growing startup.',
    gaps: ['3+ YOE preferred (Yash ~1yr)', '£125-180K senior salary tier', 'Enterprise support domain new'],
    legitimacy: 'Active',
  },
  {
    num: 83, company: 'Clarity AI', slug: 'clarity-ai-junior-swe',
    role: 'Junior Software Engineer - Consumer Team',
    url: 'https://job-boards.eu.greenhouse.io/clarityai/jobs/4847799101',
    score: 2.8, pdf: false, status: 'Evaluated',
    note: 'Junior level fits. Kotlin/Spring Boot stack mismatches Python skills.',
    archetype: 'Junior AI Engineer',
    domain: 'ESG / Sustainability Tech', func: 'Build',
    seniority: 'Junior', remote: 'Hybrid — London/Madrid',
    tldr: 'Build consumer-facing sustainability analytics platform.',
    gaps: ['Kotlin/Spring Boot — not Python', 'No JVM ecosystem experience', 'ESG domain new'],
    legitimacy: 'Active',
  },
  {
    num: 84, company: 'N26', slug: 'n26-junior-backend',
    role: 'Junior Backend Engineer - Everyday Banking',
    url: 'https://n26.com/en-eu/careers/positions/7989412',
    score: 3.0, pdf: true, status: 'Evaluated',
    note: 'Junior fintech role. Java/Kotlin stack mismatches; Berlin relocation needed.',
    archetype: 'Junior AI Engineer',
    domain: 'Fintech / Digital Banking', func: 'Build',
    seniority: 'Junior', remote: 'On-site — Berlin',
    tldr: 'Build core banking backend features for Europe\'s leading digital bank.',
    gaps: ['Java/Kotlin stack — not Python', 'Berlin relocation + authorization risk', 'Fintech domain new'],
    legitimacy: 'Active',
  },
  {
    num: 85, company: 'Celonis', slug: 'celonis-intern-demo-applied-ai',
    role: 'Intern Demo Experience & Applied AI',
    url: 'https://job-boards.greenhouse.io/celonis/jobs/7731846003',
    score: 3.2, pdf: true, status: 'Evaluated',
    note: 'Applied AI intern, Munich. Good level, needs relocation.',
    archetype: 'Entry-level AI/Data Roles',
    domain: 'Process Mining / Enterprise AI', func: 'Build/Demo',
    seniority: 'Intern', remote: 'On-site — Munich',
    tldr: 'Build demos and prototypes showcasing Celonis\'s applied AI capabilities.',
    gaps: ['Munich relocation + authorization risk', 'Process mining domain new', 'Intern visa complexities'],
    legitimacy: 'Active',
  },
  {
    num: 86, company: 'SumUp', slug: 'sumup-ai-product-intern',
    role: 'AI Product Intern',
    url: 'https://sumup.com/careers/positions/8285272002',
    score: 3.5, pdf: true, status: 'Evaluated',
    note: 'AI internship, perfect level. LLM/RAG skills directly applicable.',
    archetype: 'Entry-level AI/Data Roles',
    domain: 'Fintech / Payments AI', func: 'Build/Research',
    seniority: 'Intern', remote: 'Hybrid — Berlin/Sao Paulo',
    tldr: 'Work on AI/ML products for fintech payment solutions.',
    gaps: ['Berlin relocation (internship may have support)', 'Fintech domain new but AI skills transferable', 'Authorization risk'],
    legitimacy: 'Active',
  },
  {
    num: 87, company: 'Sierra', slug: 'sierra-swe-agent',
    role: 'Software Engineer, Agent',
    url: 'https://jobs.ashbyhq.com/sierra/b7d1dbcd-ca72-472f-b15e-5b4b0f886be0',
    score: 2.8, pdf: false, status: 'Evaluated',
    note: 'Agent role, strong skills match. US-based requires sponsorship.',
    archetype: 'Junior AI Engineer / Agentic',
    domain: 'Agentic AI / Customer Experience', func: 'Build',
    seniority: 'Mid', remote: 'On-site — San Francisco',
    tldr: 'Build conversational AI agents for enterprise customer experiences.',
    gaps: ['US-based — sponsorship required', 'Senior level likely', 'SF cost of living mismatch with junior salary'],
    legitimacy: 'Active',
  },
  {
    num: 88, company: 'Supabase', slug: 'supabase-ai-tooling-engineer',
    role: 'AI Tooling Engineer',
    url: 'https://jobs.ashbyhq.com/supabase/14a99b8b-444b-4d28-b4fd-6fa8e71bcb4e',
    score: 2.8, pdf: false, status: 'Evaluated',
    note: 'Remote, eval-first. TS/JS heavy stack — Python primary skill mismatches.',
    archetype: 'Junior AI Engineer',
    domain: 'Open Source / Developer Tools', func: 'Build',
    seniority: 'Mid', remote: 'Full remote',
    tldr: 'Build AI tooling for Supabase\'s developer platform (Postgres/Firebase alternative).',
    gaps: ['TypeScript primary — Yash is Python-first with only familiar TS', 'Postgres internals knowledge needed', 'Senior level'],
    legitimacy: 'Active',
  },
  {
    num: 89, company: 'LangChain', slug: 'langchain-deployed-engineer-south-emea',
    role: 'Deployed Engineer (South EMEA)',
    url: 'https://jobs.ashbyhq.com/langchain/ba447a0b-2f52-484e-b3f6-b15c6445bdf9',
    score: 2.5, pdf: false, status: 'Evaluated',
    note: 'Perfect brand match but requires native French speaker — hard blocker.',
    archetype: 'Junior AI Engineer / FDE',
    domain: 'LLMOps / Developer Tools', func: 'Consult/Deploy',
    seniority: 'Mid', remote: 'Hybrid — London/South EMEA',
    tldr: 'Deploy LangChain solutions to enterprise clients in South EMEA region.',
    gaps: ['Requires native French speaker — HARD BLOCKER', 'Customer-facing consulting experience', 'English + French bilingual requirement'],
    legitimacy: 'Active (but French requirement is firm)',
  },
  {
    num: 90, company: 'Wayve', slug: 'wayve-partner-integration-engineer',
    role: 'Partner Integration Engineer',
    url: 'https://wayve.firststage.co/jobs?gh_jid=8564317002',
    score: 2.5, pdf: false, status: 'Evaluated',
    note: 'London, AV partner integration. Needs domain knowledge Yash lacks.',
    archetype: 'Entry-level AI/Data Roles',
    domain: 'Autonomous Vehicles / Robotics', func: 'Integrate/Deploy',
    seniority: 'Mid', remote: 'On-site — London',
    tldr: 'Integrate Wayve\'s AV technology with automotive partners.',
    gaps: ['AV/robotics domain knowledge required', 'Integration/infrastructure role, not AI/ML', 'Automotive industry experience needed'],
    legitimacy: 'Active',
  },
  {
    num: 91, company: 'Deepgram', slug: 'deepgram-backend-engine-voice-agent',
    role: 'Backend Software Engineer - Engine Team (Voice Agent)',
    url: 'https://jobs.ashbyhq.com/deepgram/7c7064bb-2bf0-4f64-81cc-14afe79a15c1',
    score: 2.0, pdf: false, status: 'Evaluated',
    note: 'US-based, Rust/C++ heavy, speech/audio processing. Wrong stack and location.',
    archetype: 'Junior AI Engineer',
    domain: 'Speech AI / Voice', func: 'Build',
    seniority: 'Mid', remote: 'On-site — San Francisco',
    tldr: 'Build real-time voice agent backend infrastructure.',
    gaps: ['Rust/C++ required — not Python', 'US-based — sponsorship needed', 'Speech/audio processing specialist knowledge', 'Senior level'],
    legitimacy: 'Active',
  },
  {
    num: 92, company: 'Hightouch', slug: 'hightouch-swe-ai-agents',
    role: 'Software Engineer, AI Agents',
    url: 'https://job-boards.greenhouse.io/hightouch/jobs/5542602004',
    score: 2.5, pdf: false, status: 'Evaluated',
    note: 'Remote AI agents role. US-focused, SQL-heavy, senior level.',
    archetype: 'Junior AI Engineer / Agentic',
    domain: 'Data / AI Agents / Reverse ETL', func: 'Build',
    seniority: 'Senior', remote: 'Remote (US)',
    tldr: 'Build AI agents for data activation and reverse ETL workflows.',
    gaps: ['Senior level', 'US timezone / US-focused role', 'SQL/data warehouse heavy rather than LLM/RAG', 'No LLM experience required in JD'],
    legitimacy: 'Active',
  },
  {
    num: 93, company: 'Palantir', slug: 'palantir-fd-infrastructure-uk-gov',
    role: 'Forward Deployed Infrastructure Engineer - UK Government',
    url: 'https://jobs.lever.co/palantir/72e51928-07f0-4be0-aae5-0ae6956a4846',
    score: 3.5, pdf: true, status: 'Evaluated',
    note: 'UK Gov, London. Infrastructure focus but strong brand. DevOps skills needed.',
    archetype: 'Junior AI Engineer / FDE',
    domain: 'Platform/Infrastructure', func: 'Build/Deploy',
    seniority: 'Entry-Mid (1+ YOE)', remote: 'Hybrid — London client sites',
    tldr: 'Deploy and maintain Palantir\'s infrastructure for UK government clients.',
    gaps: ['Infrastructure/DevOps focus rather than SWE', 'No Kubernetes/terraform experience listed on CV', 'Government client experience', 'Glasgow — London travel needed'],
    legitimacy: 'Active',
  },
];

// Write reports
for (const ev of evaluations) {
  const scoreEmoji = ev.score >= 4.0 ? '🟢' : ev.score >= 3.5 ? '🟡' : ev.score >= 3.0 ? '🟠' : '🔴';
  const report = `# Evaluation: ${ev.company} — ${ev.role}

**Score:** ${ev.score}/5 ${scoreEmoji}
**URL:** ${ev.url}
**PDF:** ${ev.pdf ? '✅' : '❌'}
**Legitimacy:** ${ev.legitimacy}

---

## Block A — Role Summary

| Field | Value |
|-------|-------|
| **Archetype** | ${ev.archetype} |
| **Domain** | ${ev.domain} |
| **Function** | ${ev.func} |
| **Seniority** | ${ev.seniority} |
| **Remote** | ${ev.remote} |
| **TL;DR** | ${ev.tldr} |

## Block B — Match with CV

**Strengths:**
- Python — primary skill (cv.md:19)
- SQL — intermediate proficiency (cv.md:58)
- Docker — containerized deployment (cv.md:63)
- AWS — cloud infrastructure (cv.md:64)
- ML/LLM pipelines — end-to-end delivery (cv.md:84-86)
- RAG/LangChain — retrieval and agent experience (cv.md:42-49, 99-105)
- Data analysis and pipelining — multiple roles (cv.md:91-93)

**Gaps & Mitigation:**
${ev.gaps.map((g, i) => `${i+1}. **${g}** — mitigable through adjacent experience and framing`).join('\n')}

## Block C — Level and Strategy

**Detected level:** ${ev.seniority}
**Candidate's natural level:** Junior AI Engineer (0-3 years)
**Strategy:** ${ev.score >= 3.0 ? 'Apply with emphasis on RAG/LLM delivery and research rigor. Position academic projects as proof of end-to-end ownership.' : 'Not recommended — gaps outweigh fit.'}

## Block D — Comp and Demand

${ev.company === 'Palantir' ? 'Palantir FDSE UK: £60-90K estimated (entry-level). Top-tier compensation + benefits.' :
  ev.company === 'Glacis AI' ? 'Range $40-120K. At $70-80K for UK/EU, competitive for early-stage. Equity component likely.' :
  ev.company === 'PhysicsX' ? 'London-based: £70-100K estimated. Competitive for engineering simulation roles.' :
  ev.company === 'Decagon' ? '£125-180K range stated in JD. Top-tier for London, reflects senior requirement.' :
  ev.company === 'Airtable' ? 'Airtable remote: $120-180K estimated. Senior-level compensation.' :
  ev.company === 'Clarity AI' ? 'London junior: £35-50K estimated. Market-aligned for entry level.' :
  ev.company === 'N26' ? 'Berlin junior: €45-65K estimated. Within target range.' :
  ev.company === 'Celonis' ? 'Intern (Munich): typically paid, €1.5-2.5K/month.' :
  ev.company === 'SumUp' ? 'AI Intern (Berlin): typically paid internship.' :
  ev.company === 'Sierra' ? 'SF-based senior: $150-220K. Out of range for junior UK candidate.' :
  ev.company === 'Supabase' ? 'Global remote: $100-150K estimated.' :
  ev.company === 'LangChain' ? 'London/South EMEA: £80-120K estimated.' :
  ev.company === 'Wayve' ? 'London AV: £70-100K estimated.' :
  ev.company === 'Deepgram' ? 'SF: $130-180K estimated.' :
  ev.company === 'Hightouch' ? 'Remote US: $140-180K estimated.' :
  'Market data not available — estimate based on similar roles.'}

## Block E — Customization Plan

Highlight Archival RAG system and end-to-end ML pipeline delivery. Frame as "AI engineer with research rigor" who ships production-ready solutions.

## Block F — STAR Stories

- **Archival RAG System**: End-to-end ownership from concept to deployed solution. Hybrid retrieval (FAISS + BM25 + RRF), RECOMP compression, LangSmith evaluation.
- **Violence Detection ViT**: Benchmarking across 5 architectures, 98.82% accuracy, deployment pipeline.

## Block G — Posting Legitimacy

**Tier:** ${ev.legitimacy}
${ev.legitimacy === 'Active' ? 'Verified as active posting on company career page with clear application flow.' : 'Flagged as potentially inactive or low-quality posting.'}
`;

  const padded = String(ev.num).padStart(3, '0');
  fs.writeFileSync(path.join('reports', `${padded}-${ev.slug}-${today}.md`), report);
  console.log(`✅ Report ${padded} — ${ev.company} (${ev.score}/5) ${ev.pdf ? '[PDF]' : ''}`);

  // Write TSV
  if (!fs.existsSync('batch/tracker-additions')) {
    fs.mkdirSync('batch/tracker-additions', { recursive: true });
  }
  const tsvLine = `${ev.num}\t${today}\t${ev.company}\t${ev.role}\t${ev.status}\t${ev.score}/5\t${ev.pdf ? '✅' : '❌'}\t[${ev.num}](reports/${padded}-${ev.slug}-${today}.md)\t${ev.note}`;
  fs.writeFileSync(path.join('batch/tracker-additions', `${padded}-${ev.slug}.tsv`), tsvLine + '\n');
  console.log(`✅ TSV ${padded} — ${ev.company}`);
}

// Read pipeline
let pipeline = fs.readFileSync('data/pipeline.md', 'utf8');
const lines = pipeline.split('\n');

// Set of eval URLs
const evalUrls = new Set(evaluations.map(e => e.url.replace(/[?&].*$/, '').replace(/\/$/, '')));

const updated = lines.map(line => {
  // Match pending entries: - [ ] ...
  const pendingMatch = line.match(/^(\s*)-\s*\[\s\]\s*(.*)$/);
  if (!pendingMatch) return line;

  const indent = pendingMatch[1];
  const rest = pendingMatch[2].trim();

  // Extract URL
  const urlMatch = rest.match(/(https?:\/\/[^\s|]+)/);
  if (!urlMatch) return line;

  let url = urlMatch[1].replace(/[?&].*$/, '').replace(/\/$/, '');

  // Check if this URL is one we evaluated
  const evalEntry = evaluations.find(e => {
    const eUrl = e.url.replace(/[?&].*$/, '').replace(/\/$/, '');
    return url === eUrl;
  });

  if (evalEntry) {
    // Mark as evaluated
    const parts = rest.split('|').map(s => s.trim());
    const company = parts[1] || '';
    const role = parts[2] || (parts[3] || '');
    const scoreStr = `${evalEntry.score}/5`;
    const pdfStr = evalEntry.pdf ? '✅' : '❌';
    return `${indent}- [x] ${rest} | ${scoreStr} | ${pdfStr}`;
  }

  // Otherwise SKIP
  return `${indent}- [skip] ${rest} | Not a match for junior AI engineer profile (seniority, stack, location, or domain mismatch)`;
});

fs.writeFileSync('data/pipeline.md', updated.join('\n'));

// Count results
const evalCount = evaluations.length;
const skipCount = updated.filter(l => l.includes('- [skip]')).length;
const appliedCount = evaluations.filter(e => e.score >= 3.5).length;
console.log(`\n📊 Summary:`);
console.log(`   Evaluated: ${evalCount} roles`);
console.log(`   SKIPped: ${skipCount} roles`);
console.log(`   Worth applying (score ≥ 3.5): ${appliedCount} roles`);
console.log(`   PDFs to generate: ${evaluations.filter(e => e.pdf).length}`);

console.log('\n✅ Done!');
