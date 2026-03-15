#!/usr/bin/env node

/**
 * Post-deployment verification for rickydata_docs (Cloud Run).
 *
 * Checks:
 *   1. API /health returns {"status":"ok"}
 *   2. API /api/public/nav returns product navigation
 *   3. Web root serves the SPA shell with <div id="root">
 *   4. Response times within thresholds
 *
 * Usage:
 *   node verify-deployment.mjs <api-url> <web-url>
 */

const API_URL = process.argv[2];
const WEB_URL = process.argv[3] || '';

if (!API_URL) {
  console.error('Usage: node verify-deployment.mjs <api-url> [web-url]');
  process.exit(1);
}

const THRESHOLDS = {
  health: 2000,
  nav: 3000,
  webRoot: 5000,
};

const results = {
  timestamp: new Date().toISOString(),
  service: 'rickydata-docs',
  urls: { api: API_URL, web: WEB_URL || null },
  checks: [],
  summary: { total: 0, passed: 0, failed: 0 },
};

async function timedFetch(url, options = {}) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    const elapsed = Date.now() - start;
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    return { ok: response.ok, status: response.status, elapsed, body, error: null };
  } catch (err) {
    return { ok: false, status: 0, elapsed: Date.now() - start, body: null, error: err.message };
  }
}

function addResult(name, passed, details) {
  results.checks.push({ name, passed, ...details });
  results.summary.total++;
  if (passed) results.summary.passed++;
  else results.summary.failed++;
  const icon = passed ? 'PASS' : 'FAIL';
  const timing = details.elapsed_ms != null ? ` (${details.elapsed_ms}ms)` : '';
  console.error(`  [${icon}] ${name}${timing}`);
}

async function checkApiHealth() {
  const res = await timedFetch(`${API_URL}/health`);
  const passed = res.ok && res.body?.status === 'ok' && res.elapsed < THRESHOLDS.health;
  addResult('GET /health (API)', passed, {
    elapsed_ms: res.elapsed,
    threshold_ms: THRESHOLDS.health,
    status_code: res.status,
    response_status: res.body?.status,
    error: res.error,
  });
}

async function checkPublicNav() {
  const res = await timedFetch(`${API_URL}/api/public/nav`);
  const hasProducts = typeof res.body === 'object' && res.body !== null;
  const passed = res.ok && hasProducts && res.elapsed < THRESHOLDS.nav;
  addResult('GET /api/public/nav', passed, {
    elapsed_ms: res.elapsed,
    threshold_ms: THRESHOLDS.nav,
    status_code: res.status,
    has_data: hasProducts,
    error: res.error,
  });
}

async function checkWebRoot() {
  if (!WEB_URL) {
    addResult('GET / (Web)', false, { error: 'Skipped: no web URL provided', skipped: true });
    return;
  }
  const res = await timedFetch(WEB_URL);
  const hasRoot = typeof res.body === 'string' && /<div[^>]*id=["']root["'][^>]*><\/div>/i.test(res.body);
  const passed = res.ok && hasRoot && res.elapsed < THRESHOLDS.webRoot;
  addResult('GET / (Web)', passed, {
    elapsed_ms: res.elapsed,
    threshold_ms: THRESHOLDS.webRoot,
    status_code: res.status,
    has_root_div: hasRoot,
    error: res.error,
  });
}

async function main() {
  console.error(`\nVerifying rickydata_docs deployment`);
  console.error(`API: ${API_URL}`);
  if (WEB_URL) console.error(`Web: ${WEB_URL}`);
  console.error(`Timestamp: ${results.timestamp}\n`);

  await checkApiHealth();
  await checkPublicNav();
  await checkWebRoot();

  console.log(JSON.stringify(results, null, 2));

  console.error(`\n--- Summary ---`);
  console.error(`Total: ${results.summary.total} | Passed: ${results.summary.passed} | Failed: ${results.summary.failed}`);

  if (results.summary.failed > 0) {
    console.error('\nVerification FAILED.');
    process.exit(1);
  } else {
    console.error('\nVerification PASSED.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
