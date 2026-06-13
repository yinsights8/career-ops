#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const template = readFileSync(resolve(root, 'templates/cv-template.html'), 'utf-8');
const outputDir = resolve(root, 'output');
mkdirSync(outputDir, { recursive: true });

const profiles = [
  // Helper to generate skills rows
];

function skillsHTML(skills) {
  return Object.entries(skills).map(([category, items]) =>
    `<span class="skill-item"><span class="skill-category">${category}:</span> ${items.join(', ')}</span>`
  ).join('\n      ');
}

const cvs = [
  {
    name: '078-palantir-fdse-uk-gov',
    summary: 'AI Engineer with hands-on experience building LLM applications, RAG systems, and ML pipelines deployed on cloud infrastructure. Proven ability to deliver end-to-end solutions from proof-of-concept to production in client-facing environments. Strong ownership mindset with experience deploying containerised applications and working with government-grade data pipelines.',
    competencies: ['LLM & RAG Systems', 'Python & SQL', 'Cloud Deployment (AWS/Docker)', 'End-to-End Delivery', 'Data Pipelines & ETL', 'Client-Facing Solutions', 'Prompt Engineering & Evaluation'],
    skills: {
      'Languages': ['Python', 'SQL', 'JavaScript/TypeScript (familiar)'],
      'ML & AI': ['LangChain', 'RAG', 'OpenAI API', 'Claude', 'LLaMA', 'Prompt Engineering', 'MCP'],
      'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker)', 'GitHub', 'Linux'],
      'Data': ['NumPy/Pandas', 'SQL (3C, CRUD, Joins, Window Functions)', 'MongoDB', 'FAISS (Vector DB)'],
      'Other': ['Flask', 'TensorFlow', 'Hugging Face', 'AI-assisted Dev (Claude Code, Cursor)']
    }
  },
  {
    name: '079-glacis-ai-founding-swe-agentic',
    summary: 'AI Engineer with deep hands-on experience building LLM-powered applications, multi-step RAG pipelines, and autonomous agent systems. Strong Python background with production ML deployment, Docker containerisation, and cloud infrastructure. Proven ability to work autonomously and take ownership — from research experimentation to production deployment in early-stage environments.',
    competencies: ['Agentic AI Systems', 'RAG & LLM Integration', 'Python & Django/Flask', 'End-to-End Ownership', 'ML Pipeline Deployment', 'API Design & Integration', 'Evaluation & Observability'],
    skills: {
      'Languages': ['Python', 'SQL', 'JavaScript/TypeScript (familiar)'],
      'AI & Agents': ['LangChain', 'RAG (Hybrid Retrieval)', 'OpenAI API', 'Claude', 'Prompt Engineering', 'MCP Protocol'],
      'Backend': ['Flask', 'Python (NumPy, Pandas)', 'REST APIs', 'Docker'],
      'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker)', 'GitHub', 'Linux'],
      'ML': ['TensorFlow 2.x', 'Keras', 'scikit-learn', 'Hugging Face', 'FAISS'],
      'Dev Tools': ['AI-assisted Dev (Claude Code, Cursor)', 'LangSmith', 'Ragas']
    }
  },
  {
    name: '080-physicsx-fde',
    summary: 'AI Engineer with strong Python and ML pipeline experience, from research through to containerised deployment. Built and deployed real-time inference systems, RAG architectures over 120K+ documents, and evaluated frontier models. Comfortable working across the full stack — data engineering, ML modelling, cloud deployment — in fast-paced technical environments.',
    competencies: ['Python & FastAPI/Flask', 'ML Pipeline Engineering', 'Cloud Deployment (AWS/Docker)', 'End-to-End Delivery', 'Data Engineering', 'Model Evaluation & Benchmarking', 'RAG & Information Retrieval'],
    skills: {
      'Languages': ['Python', 'SQL', 'JavaScript/TypeScript (familiar)'],
      'ML & AI': ['LangChain', 'RAG', 'TensorFlow 2.x', 'Keras', 'scikit-learn', 'Hugging Face'],
      'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker)', 'Linux', 'GitHub'],
      'Data': ['NumPy/Pandas', 'SQL', 'FAISS', 'Data Pipelines'],
      'Other': ['Flask', 'OpenAI API', 'Claude', 'LLaMA', 'MCP']
    }
  },
  {
    name: '081-airtable-ai-agent-architect',
    summary: 'AI Engineer specialising in LLM applications, RAG architectures, and agent-based systems. Designed and built a hybrid retrieval RAG system across 120K+ documents with RECOMP compression and automated evaluation pipelines. Combines research rigour with production engineering to deliver AI features that are both innovative and reliable.',
    competencies: ['AI Agent Architecture', 'RAG & Hybrid Retrieval', 'LLM Integration & Evaluation', 'Prompt Engineering', 'Information Retrieval Systems', 'End-to-End ML Pipelines', 'Client-Facing AI Solutions'],
    skills: {
      'AI & LLMs': ['LangChain', 'RAG (Hybrid: FAISS + BM25 + RRF)', 'OpenAI API', 'Claude', 'Prompt Engineering', 'MCP', 'RECOMP Compression'],
      'Evaluation': ['Ragas (Faithfulness, Relevancy)', 'LangSmith Observability', 'A/B Testing of Retrieval'],
      'Languages': ['Python', 'SQL', 'JavaScript/TypeScript (familiar)'],
      'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker)', 'GitHub', 'Linux'],
      'ML': ['TensorFlow', 'scikit-learn', 'Hugging Face', 'FAISS']
    }
  },
  {
    name: '082-decagon-swe-agents',
    summary: 'AI Engineer with hands-on experience building LLM-powered applications, RAG systems, and agent-based architectures. Proven track record of shipping end-to-end ML solutions from concept to containerised deployment. Strong Python engineering foundation with production experience in AI evaluation, pipeline building, and deployment.',
    competencies: ['Agent-Based Systems', 'RAG & LLM Engineering', 'Python Backend Development', 'End-to-End ML Pipelines', 'Cloud Deployment (AWS/Docker)', 'AI Evaluation & Observability', 'API Design & Integration'],
    skills: {
      'Languages': ['Python', 'SQL', 'JavaScript/TypeScript (familiar)'],
      'AI & Agents': ['LangChain', 'RAG (Hybrid Retrieval)', 'OpenAI API', 'Claude', 'Prompt Engineering', 'MCP'],
      'Backend': ['Flask', 'REST APIs', 'Docker'],
      'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker)', 'Linux', 'GitHub'],
      'ML': ['TensorFlow 2.x', 'Keras', 'scikit-learn', 'Hugging Face', 'FAISS'],
      'Evaluation': ['LangSmith', 'Ragas', 'Model Benchmarking']
    }
  },
  {
    name: '084-n26-junior-backend',
    summary: 'AI Engineer with a strong Python and data engineering foundation, experienced in building production data pipelines, containerising applications, and deploying cloud-native solutions. Research background in machine learning and LLMs combined with practical software engineering skills. Eager to apply problem-solving skills to fintech backend challenges.',
    competencies: ['Python Engineering', 'SQL & Data Pipelines', 'Docker & AWS', 'End-to-End Delivery', 'API Design', 'Problem Solving from First Principles', 'Rapid Learning & Adaptability'],
    skills: {
      'Languages': ['Python', 'SQL', 'JavaScript/TypeScript (familiar)'],
      'Backend': ['Flask', 'REST APIs', 'Docker'],
      'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker)', 'Linux', 'GitHub'],
      'Data': ['NumPy/Pandas', 'SQL (3C, CRUD, Joins, Window Functions)', 'MongoDB', 'Data Pipelines & ETL'],
      'ML & AI': ['LangChain', 'RAG', 'TensorFlow', 'scikit-learn', 'Hugging Face'],
      'Other': ['Microservices Architecture', 'CI/CD', 'AI-assisted Dev']
    }
  },
  {
    name: '085-celonis-intern-demo-applied-ai',
    summary: 'AI-focused MSc graduate with hands-on experience building LLM applications, RAG systems, and ML pipelines. Skilled at translating research concepts into working prototypes and demos. Strong evaluation mindset with experience benchmarking retrieval quality, model performance, and faithfulness metrics.',
    competencies: ['LLM Application Development', 'RAG System Building', 'Prototype & Demo Engineering', 'AI Evaluation & Benchmarking', 'Python & ML Libraries', 'End-to-End Pipelines', 'Rapid Experimentation'],
    skills: {
      'AI & LLMs': ['LangChain', 'RAG (Hybrid: FAISS + BM25 + RRF)', 'OpenAI API', 'Claude', 'Prompt Engineering'],
      'Languages': ['Python', 'SQL', 'JavaScript/TypeScript (familiar)'],
      'ML': ['TensorFlow 2.x', 'Keras', 'scikit-learn', 'Hugging Face', 'NumPy/Pandas'],
      'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker)', 'GitHub'],
      'Evaluation': ['Ragas (Faithfulness, Relevancy, Recall)', 'LangSmith', 'A/B Testing', 'Benchmarking']
    }
  },
  {
    name: '086-sumup-ai-product-intern',
    summary: 'AI-focused MSc graduate with practical experience building and deploying LLM-powered products. Designed a hybrid retrieval RAG application across 120K+ documents, built automated evaluation pipelines, and delivered production-ready ML systems. Strong product sense with ability to balance technical quality with user impact.',
    competencies: ['AI Product Development', 'LLM & RAG Applications', 'Rapid Prototyping', 'End-to-End Delivery', 'User-Facing AI Features', 'Python & ML Stack', 'Evaluation & Iteration'],
    skills: {
      'AI & LLMs': ['LangChain', 'RAG', 'OpenAI API', 'Claude', 'Prompt Engineering', 'MCP'],
      'Languages': ['Python', 'SQL', 'JavaScript/TypeScript (familiar)'],
      'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker)', 'GitHub', 'Linux'],
      'ML': ['TensorFlow 2.x', 'Keras', 'scikit-learn', 'Hugging Face', 'FAISS'],
      'Evaluation': ['Ragas', 'LangSmith', 'Model Benchmarking'],
      'Dev Tools': ['AI-assisted Dev (Claude Code, Cursor)']
    }
  },
  {
    name: '093-palantir-fd-infrastructure-uk-gov',
    summary: 'AI Engineer with cloud infrastructure and deployment experience, from containerising ML applications on AWS to building production data pipelines. Strong Python and DevOps skills with proven ability to deploy, monitor, and maintain production systems. Experience working with government-grade data curation and security-conscious environments.',
    competencies: ['Cloud Infrastructure (AWS)', 'Docker Containerisation', 'Linux Administration', 'Python Scripting & Automation', 'CI/CD & Deployment', 'Data Pipelines & ETL', 'Infrastructure as Code'],
    skills: {
      'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker, Container)', 'Linux', 'GitHub Actions CI/CD'],
      'Languages': ['Python', 'SQL', 'Bash/Linux'],
      'Data': ['NumPy/Pandas', 'SQL (3C, CRUD, Joins, Window Functions)', 'MongoDB', 'FAISS'],
      'ML & AI': ['LangChain', 'RAG', 'TensorFlow', 'scikit-learn', 'Hugging Face'],
      'Security': ['Linux Security', 'Container Security', 'Metadata Extraction & Curation'],
      'Other': ['Flask', 'AI-assisted Dev', 'Monitoring & Deployment']
    }
  }
];

const baseSkills = {
  'Languages': ['Python', 'SQL', 'JavaScript/TypeScript (familiar)'],
  'ML & LLMs': ['LangChain', 'RAG', 'TensorFlow 2.x', 'scikit-learn', 'Hugging Face', 'OpenAI API', 'Claude'],
  'Infrastructure': ['Docker', 'AWS (EC2, S3, SageMaker)', 'Linux', 'GitHub'],
  'Data': ['NumPy/Pandas', 'SQL', 'FAISS', 'Data Pipelines'],
  'Other': ['Flask', 'Prompt Engineering', 'MCP', 'AI-assisted Dev']
};

for (const cv of cvs) {
  let html = template;

  // Extract number from name
  const num = cv.name.split('-')[0];
  const company = cv.name.split('-').slice(1).join(' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const role = cvs.find(c => c.name === cv.name);
  
  html = html.replace(/{{LANG}}/g, 'en');
  html = html.replace(/{{NAME}}/g, 'Yash Dhakade');
  html = html.replace(/{{PHONE}}/g, '+44 (0) 7823 703 834');
  html = html.replace(/{{EMAIL}}/g, 'yashdhakade2021@gmail.com');
  html = html.replace(/{{LINKEDIN_URL}}/g, 'https://www.linkedin.com/in/yashdhakade/');
  html = html.replace(/{{LINKEDIN_DISPLAY}}/g, 'linkedin.com/in/yashdhakade');
  html = html.replace(/{{PORTFOLIO_URL}}/g, 'https://github.com/yinsights8');
  html = html.replace(/{{PORTFOLIO_DISPLAY}}/g, 'github.com/yinsights8');
  html = html.replace(/{{LOCATION}}/g, 'Glasgow, UK');
  html = html.replace(/{{PAGE_WIDTH}}/g, '210mm');

  html = html.replace(/{{SECTION_SUMMARY}}/g, 'Professional Summary');
  html = html.replace(/{{SECTION_COMPETENCIES}}/g, 'Core Competencies');
  html = html.replace(/{{SECTION_EXPERIENCE}}/g, 'Experience');
  html = html.replace(/{{SECTION_PROJECTS}}/g, 'Projects');
  html = html.replace(/{{SECTION_EDUCATION}}/g, 'Education');
  html = html.replace(/{{SECTION_SKILLS}}/g, 'Technical Skills');

  html = html.replace(/{{SUMMARY_TEXT}}/g, cv.summary);

  html = html.replace(/{{COMPETENCIES}}/g,
    cv.competencies.map(c => `<span class="competency-tag">${c}</span>`).join('\n      ')
  );

  const expHTML = `
  <div class="job avoid-break">
    <div class="job-header">
      <span class="job-company">NeuraSearch Laboratory</span>
      <span class="job-period">Oct 2025 – present</span>
    </div>
    <div class="job-role">Research Intern <span class="job-location">| Glasgow, UK</span></div>
    <ul>
      <li><strong>Developed and evaluated</strong> an LLM-based RAG pipeline using OpenAI and LangChain, from prompt design and document ingestion to retrieval tuning and generation assessment.</li>
      <li><strong>Designed and tested</strong> prompts and context strategies to improve output quality, recording experimental results for iterative improvement.</li>
      <li><strong>Collaborated on data preparation</strong> for high-volume multimodal documents, including cleaning, metadata extraction, and ML-ready formatting.</li>
      <li><strong>Monitored and tested</strong> model performance post-deployment by tracking retrieval quality, hallucination rates, recall, and faithfulness.</li>
      <li><strong>Documented</strong> model behaviour, experiment configurations, and findings to support reproducible evaluation workflows.</li>
    </ul>
  </div>
  <div class="job avoid-break">
    <div class="job-header">
      <span class="job-company">CL Techno</span>
      <span class="job-period">Feb 2024 – Feb 2025</span>
    </div>
    <div class="job-role">AI Engineer <span class="job-location">| London, UK (Remote)</span></div>
    <ul>
      <li><strong>Fine-tuned</strong> a pre-trained deep learning model on a custom emotion dataset using PyTorch with iterative augmentation and hyperparameter tuning, achieving 80% multi-class accuracy.</li>
      <li><strong>Built</strong> a fully automated end-to-end ML pipeline covering preprocessing, augmentation, training, and inference.</li>
      <li><strong>Containerised and deployed</strong> a real-time face and emotion recognition system using Docker.</li>
    </ul>
  </div>
  <div class="job avoid-break">
    <div class="job-header">
      <span class="job-company">Gamaka AI</span>
      <span class="job-period">July 2023 – Dec 2023</span>
    </div>
    <div class="job-role">Data Analyst Intern <span class="job-location">| Pune, India</span></div>
    <ul>
      <li><strong>Interpreted and analysed</strong> business data using Python, SQL, and statistical techniques to identify trends and generate actionable insights.</li>
      <li><strong>Developed</strong> data collection and analysis pipelines in Python and SQL, improving data quality and reducing manual processing overhead.</li>
      <li><strong>Created</strong> dashboards and visualisations with Power BI to support stakeholder decision-making and business metric monitoring.</li>
    </ul>
  </div>`;
  html = html.replace(/{{EXPERIENCE}}/g, expHTML);

  const projectsHTML = `
  <div class="project avoid-break">
    <div class="project-title">Archival RAG System</div>
    <div class="project-desc">
      <ul>
        <li>Built a RAG application across <strong>121,700+ documents</strong> using hybrid retrieval (FAISS + HuggingFace Embeddings + BM25 with RRF), improving recall by <strong>24%</strong> on historical language queries.</li>
        <li>Applied <strong>RECOMP compression</strong> to reduce token overhead by <strong>48%</strong> while maintaining retrieval quality.</li>
        <li>Built an LLM observability and evaluation pipeline using <strong>LangSmith and Ragas</strong> (faithfulness, relevancy), enabling automated iterative improvement.</li>
      </ul>
      <div class="project-tech">LangChain · BM25 · Ragas · OpenAI · Google · OpenRouter · FAISS</div>
    </div>
  </div>
  <div class="project avoid-break">
    <div class="project-title">Violence Detection using Deep Learning & Transfer Learning</div>
    <div class="project-desc">
      <ul>
        <li>Fine-tuned a pre-trained <strong>Vision Transformer (ViT)</strong> on a custom dataset of ~3,000 images, achieving <strong>98.82% accuracy</strong>.</li>
        <li>Performed comparative analysis across ResNet50, EfficientNet, MAML, and LSTM baselines against ViT.</li>
        <li>Designed a benchmarking architecture evaluating latency, convergence time, and classification metrics.</li>
      </ul>
      <div class="project-tech">PyTorch · ViT · TensorFlow · scikit-learn</div>
    </div>
  </div>`;
  html = html.replace(/{{PROJECTS}}/g, projectsHTML);

  const eduHTML = `
  <div class="edu-item avoid-break">
    <div class="edu-header">
      <span class="edu-title">MSc Advanced Computer Science with AI</span>
      <span class="edu-year">Sep 2024 – Sep 2025</span>
    </div>
    <div class="edu-org">University of Strathclyde, UK</div>
    <div class="edu-desc">
      <div style="margin-top: 2px;"><strong>Modules:</strong> Machine Learning, Deep Learning, Business Analysis, Big Data Tools and Techniques, Quantitative Methods for AI</div>
      <div style="margin-top: 2px;"><strong>Dissertation:</strong> Auditing Bias in Retrieval-Augmented Generation Systems Using Cultural Heritage Archives</div>
    </div>
  </div>`;
  html = html.replace(/{{EDUCATION}}/g, eduHTML);

  html = html.replace(/{{SKILLS}}/g, skillsHTML(cv.skills));
  html = html.replace(/{{CERTIFICATIONS}}/g, '');

  const htmlPath = resolve(outputDir, `${cv.name}.html`);
  writeFileSync(htmlPath, html);
  console.log(`✅ HTML: ${cv.name}.html`);
}

console.log(`\nGenerated ${cvs.length} tailored HTML CVs in output/`);
console.log('Now run generate-pdf.mjs for each to produce PDFs');
