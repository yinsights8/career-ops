// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Apify provider — runs an Apify Actor to scrape job links and normalizes results
// into the provider contract: [{title, url, company, location, source}]
//
// config/portals.yml entry examples:
//
//   - name: LinkedIn Jobs (Apify)
//     provider: apify
//     apify_actor_id: "apimaestro/linkedin-jobs-scraper"
//     apify_input:
//       url: "https://www.linkedin.com/jobs/search/?keywords=AI+Engineer&location=Remote"
//       maxResults: 50
//     enabled: true
//
// Supported extra fields on the entry:
//   - apify_actor_id (required)
//   - apify_input (optional, object sent to the actor as input)
//   - apify_startMaxItems / apify_maxResults (optional override)
//   - apify_defaultTimeoutSec (optional, default 120)
//   - apify_waitTimeoutSec (optional, default 90)
//   - apify_pollIntervalMs (optional, default 2000)

const DEFAULT_ACTOR_START_TIMEOUT_SEC = 120;
const DEFAULT_RUN_WAIT_TIMEOUT_SEC = 90;
const DEFAULT_POLL_INTERVAL_MS = 2000;
const DEFAULT_USER_AGENT = 'career-ops/1.3';

function buildHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': DEFAULT_USER_AGENT,
  };
}

/** @type {Provider} */
export default {
  id: 'apify',

  detect() {
    // Only selected when entry.provider === 'apify' (explicit routing).
    return null;
  },

  async fetch(entry, ctx) {
    const token = getApifyToken();
    if (!token) {
      throw new Error('apify: APIFY_API_KEY is not set in .env');
    }

    const actorId = entry.apify_actor_id || entry.apifyActorId;
    if (!actorId) {
      throw new Error('apify: missing apify_actor_id in portals.yml entry for ' + (entry.name || 'unknown'));
    }

    const startTimeoutSec = Number(entry.apify_defaultTimeoutSec || entry.apifyDefaultTimeoutSec || DEFAULT_ACTOR_START_TIMEOUT_SEC);
    const runWaitTimeoutSec = Number(entry.apify_waitTimeoutSec || entry.apifyWaitTimeoutSec || DEFAULT_RUN_WAIT_TIMEOUT_SEC);
    const pollIntervalMs = Number(entry.apify_poll_interval_ms || entry.apifyPollIntervalMs || DEFAULT_POLL_INTERVAL_MS);

    const runId = await startActorRun({
      token,
      actorId,
      input: entry.apify_input || entry.apifyInput || {},
      timeoutMs: startTimeoutSec * 1000,
      fetchJson: ctx.fetchJson,
    });

    const run = await waitForRunSuccess({
      token,
      actorId,
      runId,
      timeoutMs: runWaitTimeoutSec * 1000,
      pollIntervalMs,
      fetchJson: ctx.fetchJson,
    });

    const datasetId = run.defaultDatasetId || run.datasetId;
    if (!datasetId) {
      // Fallback to actor-level default dataset
      return [];
    }

    const items = await fetchDatasetItems({
      token,
      actorId,
      datasetId,
      fetchJson: ctx.fetchJson,
    });

    const normalized = normalizeItems(items, {
      company: entry.name || actorId,
      source: 'apify',
    });

    return normalized;
  },
};

function getApifyToken() {
  // 1) ctx-provided (not implemented by _http, but future-proofing)
  // 2) process env — filled from career-ops/.env when the tooling runs
  //    and from `node dotenv` paths if runner loads it.
  return process.env.APIFY_API_KEY || '';
}

function getRunUrl(actorId, runId) {
  return `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs/${encodeURIComponent(runId)}`;
}
function getDatasetItemsUrl(actorId, datasetId) {
  return `https://api.apify.com/v2/datasets/${encodeURIComponent(datasetId)}/items?clean=true&format=json`;
}

async function startActorRun({ token, actorId, input, timeoutMs, fetchJson }) {
  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?waitForFinish=0`;
  const body = { ...(input || {}) };
  // Keep zero-token safety: example default size
  if (body && typeof body.maxResults === 'undefined') body.maxResults = 50;

  const json = await fetchJson(url, {
    timeoutMs,
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': DEFAULT_USER_AGENT,
    },
  });

  const data = json && json.data;
  const runId = data && (data.id || data.runId);
  if (!runId) {
    const snippet = typeof json === 'string' ? json : JSON.stringify(json);
    throw new Error('apify: failed to start actor run — ' + snippet.slice(0, 300));
  }
  return String(runId);
}

async function waitForRunSuccess({ token, actorId, runId, timeoutMs, pollIntervalMs, fetchJson }) {
  const start = Date.now();
  let last = null;

  while (true) {
    const res = await fetchJson(getRunUrl(actorId, runId), {
      timeoutMs: Math.min(timeoutMs, 30_000),
      headers: buildHeaders(token),
    });

    const data = res && res.data;
    if (!data) {
      last = res;
    } else {
      const status = (data.status || '').toLowerCase();
      if (status === 'succeeded' || status === 'SUCCEEDED') {
        return data;
      }
      if (status === 'failed' || status === 'aborted' || status === 'TIMED-OUT') {
        const msg = data.statusMessage || status;
        throw new Error('apify: actor run failed — ' + msg);
      }
    }

    if (Date.now() - start > timeoutMs) {
      const status = last && last.data && last.data.status ? last.data.status : 'unknown';
      throw new Error('apify: run did not finish within timeout (last status=' + status + ')');
    }

    await new Promise(r => setTimeout(r, pollIntervalMs));
  }
}

async function fetchDatasetItems({ token, actorId, datasetId, fetchJson }) {
  const url = getDatasetItemsUrl(actorId, datasetId);
  const all = [];
  let next = url;

  for (let i = 0; i < 50 && next; i++) {
    const json = await fetchJson(next, {
      timeoutMs: 30_000,
      headers: buildHeaders(token),
    });

    const arr = Array.isArray(json) ? json : (Array.isArray(json && json.data) ? json.data : []);
    if (!arr.length) break;
    all.push(...arr);

    // Apify pagination via next field is usually in data.next or top-level link.
    const nextUrl = json && (json.next || (json.paging && json.paging.next));
    next = nextUrl || null;
  }

  return all;
}

function normalizeItems(items, opts) {
  const company = opts.company || 'Apify Source';
  const source = opts.source || 'apify';

  return items
    .map((item) => {
      // Let the provider be permissive: detect likely link fields and titles.
      const url = pickString(item, ['url', 'jobUrl', 'link', 'href', 'applyUrl', 'applicationUrl']) || '';
      if (!url || !/^https?:\/\//i.test(url)) return null;
      const title = pickString(item, ['title', 'positionName', 'jobTitle', 'name', 'position']) || '';
      const location = pickString(item, ['location', 'country', 'office', 'locations', 'address']) || '';
      return {
        title,
        url,
        company,
        location,
        source,
      };
    })
    .filter(Boolean);
}

function pickString(obj, keys) {
  if (!obj || typeof obj !== 'object') return '';
  for (const k of keys) {
    if (k in obj) {
      const v = obj[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
  }
  // One-level nested fallback for common objects
  for (const inner of Object.values(obj)) {
    if (inner && typeof inner === 'object') {
      const v = pickString(inner, keys);
      if (v) return v;
    }
  }
  return '';
}
