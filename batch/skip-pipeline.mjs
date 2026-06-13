import fs from 'fs';

// === CONFIG: These role company+title combos will be KEPT for evaluation ===
const keepEntries = [
  // PhysicsX
  { company: 'physicsx', titlePat: /Forward Deployed Software Engineer/ },
  { company: 'physicsx', titlePat: /Senior AI Engineer - Applied/ },
  { company: 'physicsx', titlePat: /Senior Forward Deployed/ },
  { company: 'physicsx', titlePat: /Machine Learning Software Engineer, Research/ },
  // Helsing — AI Research Engineer roles only
  { company: 'helsing', titlePat: /AI Research Engineer/ },
  // Hugging Face
  { company: 'hugging face', titlePat: /Cloud ML DevRel Engineer - EMEA/ },
  { company: 'hugging face', titlePat: /Data\/Infrastructure Advocate Engineer - EMEA/ },
  // Perplexity
  { company: 'perplexity', titlePat: /MTS.*AI Inference/ },
  { company: 'perplexity', titlePat: /MTS.*AI Infrastructure/ },
  { company: 'perplexity', titlePat: /MTS.*Machine Learning Research/ },
  // Intercom
  { company: 'intercom', titlePat: /AI Infrastructure Engineer/ },
  { company: 'intercom', titlePat: /Senior Forward Deployed Engineer/ },
  { company: 'intercom', titlePat: /Staff Forward Deployed Engineer/ },
  { company: 'intercom', titlePat: /Senior Product Engineer, AI(?! Platform)/ },
  { company: 'intercom', titlePat: /Engineering Manager, AI Models/ },
  // Cohere
  { company: 'cohere', titlePat: /FDE.*Infrastructure/ },
  { company: 'cohere', titlePat: /Forward Deployed Engineer.*Infrastructure/ },
  { company: 'cohere', titlePat: /Software Engineer - Applied ML/ },
  { company: 'cohere', titlePat: /MTS.*Agent Code/ },
  { company: 'cohere', titlePat: /MTS.*MLE.*UK/ },
  { company: 'cohere', titlePat: /MTS.*Safety for Agents/ },
  { company: 'cohere', titlePat: /Engineering Manager.*Agentic/ },
  { company: 'cohere', titlePat: /Engineering Manager.*FDE/ },
  { company: 'cohere', titlePat: /Senior ML Systems Engineer/ },
  // Glean
  { company: 'glean', titlePat: /Founding Forward Deployed/ },
  // n8n
  { company: 'n8n', titlePat: /AI Engineering Manager/ },
  // LangChain
  { company: 'langchain', titlePat: /Deployed Engineer \(South EMEA\)/ },
  { company: 'langchain', titlePat: /Deployed Engineer \(Germany\)/ },
  { company: 'langchain', titlePat: /Deployed Engineer \(Singapore\)/ },
  // Airtable
  { company: 'airtable', titlePat: /AI Agent Architect/ },
  // Parloa
  { company: 'parloa', titlePat: /Forward Deployed Engineer, VoIP/ },
  { company: 'parloa', titlePat: /Senior Agent Architect/ },
  { company: 'parloa', titlePat: /\(Senior\) Technical Program Manager - Agentic AI/ },
  // Anthropic
  { company: 'anthropic', titlePat: /Applied AI Architect/ },
  { company: 'anthropic', titlePat: /Research Engineer, Pretraining/ },
  { company: 'anthropic', titlePat: /Research Engineer\/Research Scientist, Pre-training/ },
  { company: 'anthropic', titlePat: /Research Lead, Training Insights/ },
  { company: 'anthropic', titlePat: /Staff Software Engineer, AI Reliability/ },
  { company: 'anthropic', titlePat: /Research Engineer, Environment Scaling/ },
  { company: 'anthropic', titlePat: /Research Engineer, Knowledge Team/ },
  { company: 'anthropic', titlePat: /Research Engineer, Machine Learning \(Reinforcement Learning\)/ },
  { company: 'anthropic', titlePat: /Research Engineer, Model Evaluations/ },
  { company: 'anthropic', titlePat: /Research Engineer, Science of Scaling/ },
  { company: 'anthropic', titlePat: /Research Engineer \/ Scientist, Alignment Science/ },
  { company: 'anthropic', titlePat: /Research Engineer, Universes/ },
  { company: 'anthropic', titlePat: /Senior Research Scientist, Reward/ },
  { company: 'anthropic', titlePat: /Applied AI Security Architect/ },
  // RunPod
  { company: 'runpod', titlePat: /Forward Deployed Engineer APAC/ },
  // Faculty
  { company: 'faculty', titlePat: /Director, AI Engineering/ },
  { company: 'faculty', titlePat: /Senior Research Scientist - AI Safety/ },
  { company: 'faculty', titlePat: /Principal Research Scientist - AI Safety/ },
  { company: 'faculty', titlePat: /Lead Machine Learning Engineer/ },
  // Wayve
  { company: 'wayve', titlePat: /Partner Integration Engineer/ },
  { company: 'wayve', titlePat: /Senior Cloud SRE - AI\/ML/ },
  { company: 'wayve', titlePat: /Staff Cloud SRE/ },
  { company: 'wayve', titlePat: /Senior Platform Engineer/ },
  { company: 'wayve', titlePat: /Research Scientist, Wayve Labs/ },
  // Mistral — Applied AI + FD roles
  { company: 'mistral', titlePat: /Applied AI Engineer, Senior\/Staff Fullstack/ },
  { company: 'mistral', titlePat: /Applied AI,.*Forward Deployed Machine Learning Engineer - Munich/ },
  { company: 'mistral', titlePat: /Applied AI,.*Forward Deployed Machine Learning Engineer- Singapore/ },
  { company: 'mistral', titlePat: /Applied AI, Technical Lead, Forward Deployed AI Engineer/ },
  { company: 'mistral', titlePat: /Applied Scientist \/ Research Engineer/ },
  // Palantir — FDE roles
  { company: 'palantir', titlePat: /Forward Deployed Infrastructure Engineer/ },
  { company: 'palantir', titlePat: /Forward Deployed Reliability Engineer/ },
  { company: 'palantir', titlePat: /Forward Deployed Software Engineer(?!.*Enablement)/ },
  // Deepgram — actual engineering
  { company: 'deepgram', titlePat: /Site Reliability Engineer - AI/ },
  { company: 'deepgram', titlePat: /Backend Software Engineer - Engine/ },
  { company: 'deepgram', titlePat: /ML Ops Infrastructure/ },
  { company: 'deepgram', titlePat: /Systems Architect AI\/ML/ },
  { company: 'deepgram', titlePat: /Research Engineer, Machine Learning Systems/ },
  // Glacis AI
  { company: 'glacis', titlePat: /Founding Software Engineer - Agentic AI/ },
  // Supabase
  { company: 'supabase', titlePat: /AI Tooling Engineer/ },
  { company: 'supabase', titlePat: /Platform Engineer - Multicloud/ },
  // Black Forest Labs
  { company: 'blackforestlabs', titlePat: /Member of Technical Staff/ },
  // Celonis
  { company: 'celonis', titlePat: /Senior AI Deployment Architect/ },
  { company: 'celonis', titlePat: /Intern Demo Experience.*Applied AI/ },
  // GetYourGuide
  { company: 'getyourguide', titlePat: /Senior Engineering Manager, AI Platform/ },
  { company: 'getyourguide', titlePat: /Senior ML Ops Engineer, AI Platform/ },
  // N26
  { company: 'n26', titlePat: /Data Engineer - Platform Engineering/ },
  { company: 'n26', titlePat: /Junior Backend Engineer - Everyday/ },
  // SumUp
  { company: 'sumup', titlePat: /Engineering Manager - Edge AI/ },
  { company: 'sumup', titlePat: /AI Product Intern/ },
  // Synthesia
  { company: 'synthesia', titlePat: /Senior Research Engineer - Video Foundation/ },
  { company: 'synthesia', titlePat: /Senior ML Engineer, Dubbing/ },
  { company: 'synthesia', titlePat: /Senior Research Engineer - Voice/ },
  { company: 'synthesia', titlePat: /Senior Research Engineer - Interactive Avatars/ },
  { company: 'synthesia', titlePat: /Infrastructure Engineer/ },
  // Clarity AI
  { company: 'clarity ai', titlePat: /Junior Software Engineer/ },
  { company: 'clarity ai', titlePat: /Staff AI Engineer/ },
  // Encharge AI
  { company: 'encharge', titlePat: /AI Compiler Engineer/ },
  // Stability AI
  { company: 'stability', titlePat: /Multimodal Generative AI Researcher/ },
  { company: 'stability', titlePat: /Research Scientist.*3D/ },
  // Causaly
  { company: 'causaly', titlePat: /Senior AI Engineer/ },
  // Spotify — engineering/ML
  { company: 'spotify', titlePat: /C\+\+ Engineer - Platform Engineering/ },
  { company: 'spotify', titlePat: /Research Scientist - Music/ },
  { company: 'spotify', titlePat: /Senior Applied Research Engineer/ },
  { company: 'spotify', titlePat: /Senior Research Scientist - Music/ },
  // Hightouch — eng
  { company: 'hightouch', titlePat: /Software Engineer, AI Agents/ },
  { company: 'hightouch', titlePat: /Software Engineer - AI Productivity/ },
  { company: 'hightouch', titlePat: /Staff Engineer, AI Productivity/ },
  { company: 'hightouch', titlePat: /Engineering Manager, Agents/ },
  // Pigment
  { company: 'pigment', titlePat: /AI Deployment Strategist/ },
  // Boomi
  { company: 'boomi', titlePat: /AI.*Transformation Lead/ },
  // Attio
  { company: 'attio', titlePat: /Senior Platform Engineer/ },
  // Safari
  { company: 'safari', titlePat: /GTM Engineering Intern/ },
  // Trade Republic — infra/eng
  { company: 'traderepublic', titlePat: /Engineer/ },
  // Contentful
  { company: 'contentful', titlePat: /Senior Software Engineer - Backend.*AI/ },
  // Lovable
  { company: 'lovable', titlePat: /Deployment Strategist/ },
  // CoreWeave/W&B
  { company: /coreweave|weights.*biases/, titlePat: /Senior Specialist Field Engineer - HPC/ },
  // Isomorphic
  { company: 'isomorphic', titlePat: /Research Scientist \(Applied LLMs\)/ },
  { company: 'isomorphic', titlePat: /Research Scientist \(Machine Learning\)/ },
  { company: 'isomorphic', titlePat: /Software Engineer \(Training Platform\)/ },
  // Arize AI
  { company: 'arize', titlePat: /Forward Deployed AI Engineer, (East|West)/ },
  { company: 'arize', titlePat: /Forward Deployed Engineer, APJ/ },
  { company: 'arize', titlePat: /Senior AI Product Engineer, Backend/ },
  { company: 'arize', titlePat: /Senior AI Product Engineer, Fullstack/ },
  { company: 'arize', titlePat: /DevSecOps Engineer.*Agentic/ },
  { company: 'arize', titlePat: /AI Application Engineer, APJ/ },
  // Decagon
  { company: 'decagon', titlePat: /Software Engineer, Agents/ },
  { company: 'decagon', titlePat: /Senior Research Engineer$/ },
  // Sierra — Agent Engineer/Software Engineer, Agent (non-language-specific)
  { company: 'sierra', titlePat: /^Software Engineer, Agent$/ },
  { company: 'sierra', titlePat: /^Agent Engineer, TLM$/ },
  // Glean — FDE
  { company: 'glean', titlePat: /Founding Forward Deployed Engineer/ },
  // Pinecone
  { company: 'pinecone', titlePat: /Senior\/Staff Software Engineer, Search/ },
  // Speechmatics
  { company: 'speechmatics', titlePat: /Technical Product Manager/ },
  // Data / Infrastructure Advocate at Hugging Face
  { company: 'hugging face', titlePat: /Data.*Advocate Engineer/ },
];

const content = fs.readFileSync('data/pipeline.md', 'utf8');
const lines = content.split('\n');

let keptForEval = 0;
let skipped = 0;
let processed = [];

for (const line of lines) {
  // Skip empty/header lines
  if (!line.trim() || line.trim().startsWith('#') || line.trim().startsWith('Format:')) {
    processed.push(line);
    continue;
  }

  // Already processed entries — keep as-is
  if (line.includes('- [x]')) {
    processed.push(line);
    continue;
  }

  // Already SKIPped entries — keep as-is
  if (line.includes('- [skip]')) {
    processed.push(line);
    continue;
  }

  // Pending entries — decide
  const pendingMatch = line.match(/^(\s*-\s)\[\s\](\s.*?\|.*)$/);
  if (!pendingMatch) {
    processed.push(line);
    continue;
  }

  const prefix = pendingMatch[1];
  const rest = pendingMatch[2];
  const parts = rest.split('|').map(s => s.trim());
  const url = parts[0] || '';
  const companyRaw = parts[1] || '';
  const title = parts[2] || '';

  let shouldKeep = false;

  for (const entry of keepEntries) {
    const companyMatch = typeof entry.company === 'string'
      ? companyRaw.toLowerCase().includes(entry.company.toLowerCase())
      : entry.company.test(companyRaw.toLowerCase());
    
    if (companyMatch && entry.titlePat.test(title)) {
      shouldKeep = true;
      break;
    }
  }

  if (shouldKeep) {
    processed.push(line);
    keptForEval++;
  } else {
    processed.push(`${prefix}[skip]${rest}`);
    skipped++;
  }
}

console.log(`Kept for evaluation: ${keptForEval}`);
console.log(`SKIPped: ${skipped}`);

fs.writeFileSync('data/pipeline.md', processed.join('\n'));
