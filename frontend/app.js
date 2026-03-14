/* ──────────────────────────────────────────────────────────
   NotifyQ — Frontend Logic
   All API calls go through /api/* (proxied to localhost:7777)
   ────────────────────────────────────────────────────────── */

const API = '/api';
const DASHBOARD_URL = 'http://localhost:7777/admin/queues';

// ── Activity log state ──────────────────────────────────────
let logEntries = [];

// ── DOM refs ────────────────────────────────────────────────
const statusBadge  = document.getElementById('statusBadge');
const statusDot    = document.getElementById('statusDot');
const statusText   = document.getElementById('statusText');

const sendDirectBtn       = document.getElementById('sendDirectBtn');
const sendDirectBtnLabel  = document.getElementById('sendDirectBtnLabel');
const sendDirectResponse  = document.getElementById('sendDirectResponse');
const sendDirectResLabel  = document.getElementById('sendDirectResponseLabel');
const sendDirectResBody   = document.getElementById('sendDirectResponseBody');

const queueForm       = document.getElementById('queueForm');
const queueBtn        = document.getElementById('queueBtn');
const queueBtnLabel   = document.getElementById('queueBtnLabel');
const queueResponse   = document.getElementById('queueResponse');
const queueResLabel   = document.getElementById('queueResponseLabel');
const queueResBody    = document.getElementById('queueResponseBody');

const logEmpty  = document.getElementById('logEmpty');
const logList   = document.getElementById('logList');
const logCount  = document.getElementById('logCount');
const clearLogBtn = document.getElementById('clearLogBtn');

const reloadDashBtn = document.getElementById('reloadDashBtn');
const bullBoard     = document.getElementById('bullBoard');

// ── Server status check ─────────────────────────────────────
async function checkStatus() {
  try {
    const res = await fetch(`${API}/ping`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      statusBadge.className = 'status-badge online';
      statusText.textContent = 'Server online';
    } else {
      throw new Error('non-ok');
    }
  } catch {
    statusBadge.className = 'status-badge offline';
    statusText.textContent = 'Server offline';
  }
}

// Poll every 30 seconds
checkStatus();
setInterval(checkStatus, 30_000);

// ── Toast notifications ─────────────────────────────────────
function toast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <span class="toast-icon">${icons[type] ?? 'ℹ️'}</span>
    <span class="toast-text">${message}</span>
  `;
  document.getElementById('toastContainer').appendChild(el);

  setTimeout(() => {
    el.classList.add('hide');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 3500);
}

// ── Activity log ────────────────────────────────────────────
function addLog(action, detail, type = 'info') {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  logEntries.unshift({ action, detail, type, time });

  renderLog();
}

function renderLog() {
  if (logEntries.length === 0) {
    logEmpty.style.display = '';
    logList.style.display  = 'none';
    logCount.textContent   = '0 events';
    return;
  }

  logEmpty.style.display = 'none';
  logList.style.display  = 'flex';
  logCount.textContent   = `${logEntries.length} event${logEntries.length !== 1 ? 's' : ''}`;

  logList.innerHTML = logEntries.map(e => `
    <div class="log-item">
      <span class="log-dot ${e.type}"></span>
      <div class="log-body">
        <div class="log-action">${e.action}</div>
        <div class="log-detail" title="${e.detail}">${e.detail}</div>
      </div>
      <span class="log-time">${e.time}</span>
    </div>
  `).join('');
}

clearLogBtn.addEventListener('click', () => {
  logEntries = [];
  renderLog();
  toast('Activity log cleared', 'info');
});

// ── Button loading state helpers ────────────────────────────
function setBtnLoading(btn, labelEl, loading, defaultLabel) {
  btn.disabled = loading;
  if (loading) {
    labelEl.innerHTML = '<span class="spinner"></span> Processing…';
  } else {
    labelEl.innerHTML = defaultLabel;
  }
}

// ── Show inline response box ────────────────────────────────
function showResponse(boxEl, labelEl, bodyEl, { success, label, body }) {
  boxEl.className  = `response-box show ${success ? 'success' : 'error'}`;
  labelEl.textContent = label;
  bodyEl.innerHTML    = body;
}

function hideResponse(boxEl) {
  boxEl.className = 'response-box';
}

// ── Send Direct Mail ────────────────────────────────────────
sendDirectBtn.addEventListener('click', async () => {
  hideResponse(sendDirectResponse);
  setBtnLoading(sendDirectBtn, sendDirectBtnLabel, true, '⚡ Send Test Email');

  try {
    const res  = await fetch(`${API}/send/mail`, { method: 'POST' });
    const data = await res.json();

    if (res.ok && data.success) {
      const previewUrl = data.data;
      showResponse(sendDirectResponse, sendDirectResLabel, sendDirectResBody, {
        success: true,
        label: '✅ Email sent!',
        body: previewUrl
          ? `Preview: <a class="preview-link" href="${previewUrl}" target="_blank" rel="noopener">${previewUrl}</a>`
          : 'Email dispatched successfully.',
      });
      addLog('Direct email sent', previewUrl ? `Preview: ${previewUrl}` : 'No preview URL returned', 'success');
      toast('Email sent! Check the preview link.', 'success');
    } else {
      const msg = data.msg || 'Unknown error';
      showResponse(sendDirectResponse, sendDirectResLabel, sendDirectResBody, {
        success: false,
        label: '❌ Failed',
        body: msg,
      });
      addLog('Direct send failed', msg, 'error');
      toast(`Send failed: ${msg}`, 'error');
    }
  } catch (err) {
    const msg = err.message || 'Network error';
    showResponse(sendDirectResponse, sendDirectResLabel, sendDirectResBody, {
      success: false,
      label: '❌ Network Error',
      body: msg,
    });
    addLog('Direct send error', msg, 'error');
    toast('Could not reach the server', 'error');
  } finally {
    setBtnLoading(sendDirectBtn, sendDirectBtnLabel, false, '⚡ Send Test Email');
  }
});

// ── Add to Queue ────────────────────────────────────────────
queueForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideResponse(queueResponse);

  const email   = document.getElementById('qEmail').value.trim();
  const subject = document.getElementById('qSubject').value.trim();
  const message = document.getElementById('qMessage').value.trim();

  if (!email || !subject || !message) {
    toast('Please fill in all fields', 'error');
    return;
  }

  setBtnLoading(queueBtn, queueBtnLabel, true, '📥 Add to Queue');

  try {
    const res  = await fetch(`${API}/add/notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, subject, message }),
    });
    const data = await res.json();

    if (res.ok && data.msg) {
      showResponse(queueResponse, queueResLabel, queueResBody, {
        success: true,
        label: '✅ Queued!',
        body: `Job added for <strong>${email}</strong> — "${subject}"`,
      });
      addLog('Job added to queue', `To: ${email} | Subject: ${subject}`, 'success');
      toast(`Notification queued for ${email}`, 'success');
      queueForm.reset();
    } else {
      const msg = data.msg || data.error || 'Unknown error';
      showResponse(queueResponse, queueResLabel, queueResBody, {
        success: false,
        label: '❌ Failed',
        body: msg,
      });
      addLog('Queue add failed', msg, 'error');
      toast(`Queue error: ${msg}`, 'error');
    }
  } catch (err) {
    const msg = err.message || 'Network error';
    showResponse(queueResponse, queueResLabel, queueResBody, {
      success: false,
      label: '❌ Network Error',
      body: msg,
    });
    addLog('Queue add error', msg, 'error');
    toast('Could not reach the server', 'error');
  } finally {
    setBtnLoading(queueBtn, queueBtnLabel, false, '📥 Add to Queue');
  }
});

// ── Reload dashboard iframe ─────────────────────────────────
reloadDashBtn.addEventListener('click', () => {
  bullBoard.src = bullBoard.src; // eslint-disable-line no-self-assign
  toast('Dashboard refreshed', 'info');
  addLog('Dashboard reloaded', DASHBOARD_URL, 'info');
});
