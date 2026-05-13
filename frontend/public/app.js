// ===========================================================
// מצב השירותים - לוגיקת הדשבורד
// ===========================================================

const API_BASE = '/api';
const REFRESH_INTERVAL = 60 * 1000; // דקה

// אייקונים SVG עבור כל שירות (כדי להימנע מתלות בספריות חיצוניות)
const SERVICE_ICONS = {
  spotify: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,

  'apple-music': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.7.164c-.517-.093-1.038-.135-1.564-.15-.04-.003-.083-.01-.124-.013H5.988c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h10.778c.525 0 1.05-.034 1.57-.1.823-.106 1.597-.35 2.296-.81 1.06-.7 1.81-1.638 2.21-2.852.156-.4.232-.83.277-1.252.07-.624.087-1.253.087-1.88V6.124h.058z"/></svg>`,

  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,

  instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,

  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`,

  youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
};

// אלמנטים ב-DOM
const elements = {
  servicesGrid: document.getElementById('services-grid'),
  refreshBtn: document.getElementById('refresh-btn'),
  overallStatus: document.getElementById('overall-status'),
  overallTitle: document.getElementById('overall-title'),
  overallSubtitle: document.getElementById('overall-subtitle'),
  statOk: document.getElementById('stat-ok'),
  statIssues: document.getElementById('stat-issues'),
  lastUpdated: document.getElementById('last-updated'),
  errorBanner: document.getElementById('error-banner'),
  errorMessage: document.getElementById('error-message'),
  template: document.getElementById('service-card-template')
};

let services = [];
let cardElements = {};
let autoRefreshTimer = null;

// ===========================================================
// פונקציות עזר
// ===========================================================

function formatTime(date) {
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorBanner.classList.remove('hidden');
}

function hideError() {
  elements.errorBanner.classList.add('hidden');
}

// ===========================================================
// טעינת השירותים הראשונית
// ===========================================================

async function loadServices() {
  try {
    const response = await fetch(`${API_BASE}/services`);
    if (!response.ok) throw new Error('שגיאה בטעינת השירותים');
    services = await response.json();
    renderServiceCards();
  } catch (error) {
    showError('לא ניתן היה לטעון את רשימת השירותים');
    console.error(error);
  }
}

// ===========================================================
// יצירת כרטיסי השירותים (לפני הטעינה הראשונה)
// ===========================================================

function renderServiceCards() {
  elements.servicesGrid.innerHTML = '';
  cardElements = {};

  services.forEach(service => {
    const card = elements.template.content.cloneNode(true).firstElementChild;

    // אייקון
    const icon = card.querySelector('.card-icon');
    icon.style.backgroundColor = service.color;
    icon.innerHTML = SERVICE_ICONS[service.icon] || `<span>${service.name.charAt(0)}</span>`;

    // שם וקטגוריה
    card.querySelector('.card-name').textContent = service.hebrewName;
    card.querySelector('.card-category').textContent = service.category;

    // קישור
    const link = card.querySelector('.card-link');
    link.href = service.publicUrl;

    // מצב התחלתי: loading
    card.dataset.status = 'unknown';
    card.classList.add('loading');
    card.querySelector('.card-status-text').textContent = 'טוען...';
    card.querySelector('.card-description').textContent = '';

    cardElements[service.id] = card;
    elements.servicesGrid.appendChild(card);
  });
}

// ===========================================================
// עדכון כרטיס בודד
// ===========================================================

function updateServiceCard(serviceData) {
  const card = cardElements[serviceData.id];
  if (!card) return;

  card.classList.remove('loading');
  card.dataset.status = serviceData.status;

  card.querySelector('.card-status-text').textContent = serviceData.statusText;
  card.querySelector('.card-description').textContent = serviceData.description;

  // אירועים פתוחים
  const incidentsEl = card.querySelector('.card-incidents');
  const incidentCount = serviceData.incidents?.length || 0;
  if (incidentCount > 0) {
    incidentsEl.textContent = `${incidentCount} ${incidentCount === 1 ? 'אירוע פעיל' : 'אירועים פעילים'}`;
    incidentsEl.classList.add('has-incidents');
  } else {
    incidentsEl.textContent = '0 אירועים';
    incidentsEl.classList.remove('has-incidents');
  }
}

// ===========================================================
// עדכון גרף Uptime לכרטיס
// ===========================================================

function formatHebrewDate(dateStr) {
  const date = new Date(dateStr);
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const months = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];
  return `יום ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

function isYesterday(dateStr) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
}

function getDayLabel(dateStr) {
  if (isToday(dateStr)) return 'היום';
  if (isYesterday(dateStr)) return 'אתמול';
  return formatHebrewDate(dateStr);
}

function updateServiceUptime(serviceId, uptimeData) {
  const card = cardElements[serviceId];
  if (!card) return;

  const barsContainer = card.querySelector('.uptime-bars');
  const percentEl = card.querySelector('.uptime-percent');

  // אחוז uptime כללי
  if (uptimeData.overallUptime !== null) {
    const pct = uptimeData.overallUptime;
    percentEl.textContent = `${pct.toFixed(1)}%`;
    percentEl.classList.remove('high', 'medium', 'low');
    if (pct >= 99) percentEl.classList.add('high');
    else if (pct >= 95) percentEl.classList.add('medium');
    else percentEl.classList.add('low');
  } else {
    percentEl.textContent = 'אין נתונים';
  }

  // יצירת 7 עמודות
  barsContainer.innerHTML = '';
  uptimeData.days.forEach(day => {
    const bar = document.createElement('div');
    bar.className = 'uptime-bar';
    bar.dataset.status = day.status;

    const dayLabel = getDayLabel(day.date);

    if (day.uptime === null) {
      bar.dataset.tooltip = `${dayLabel} · אין נתונים`;
    } else {
      const statusTexts = {
        'ok': 'תקין',
        'warning': 'ביצועים מופחתים',
        'error': 'תקלות'
      };
      bar.dataset.tooltip = `${dayLabel} · ${day.uptime}% · ${statusTexts[day.status] || day.status}`;
    }

    barsContainer.appendChild(bar);
  });
}

async function loadHistory() {
  try {
    const response = await fetch(`${API_BASE}/history`);
    if (!response.ok) throw new Error('שגיאה בטעינת היסטוריה');
    const data = await response.json();

    // עדכן כרטיסים עם נתוני uptime
    for (const [serviceId, uptimeData] of Object.entries(data.summary)) {
      updateServiceUptime(serviceId, uptimeData);
    }

    // לשירותים ללא נתונים, הצג מקום ריק
    services.forEach(service => {
      if (!data.summary[service.id]) {
        updateServiceUptime(service.id, {
          overallUptime: null,
          days: Array(7).fill(null).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
              date: date.toISOString().split('T')[0],
              uptime: null,
              status: 'no-data',
              samples: 0
            };
          })
        });
      }
    });
  } catch (error) {
    console.error('שגיאה בטעינת היסטוריה:', error);
  }
}

// ===========================================================
// עדכון הסטטוס הכללי
// ===========================================================

function updateOverallStatus(servicesData) {
  const total = servicesData.length;
  const okCount = servicesData.filter(s => s.status === 'ok').length;
  const issuesCount = servicesData.filter(s => s.status === 'warning' || s.status === 'error').length;
  const errorCount = servicesData.filter(s => s.status === 'error').length;

  elements.statOk.textContent = `${okCount}/${total}`;
  elements.statIssues.textContent = issuesCount;

  let level, title, subtitle;
  if (errorCount > 0) {
    level = 'error';
    title = 'יש תקלות פעילות';
    subtitle = `${errorCount} ${errorCount === 1 ? 'שירות חווה תקלה' : 'שירותים חווים תקלה'}`;
  } else if (issuesCount > 0) {
    level = 'warning';
    title = 'דיווחים על בעיות';
    subtitle = `${issuesCount} ${issuesCount === 1 ? 'שירות עם ביצועים מופחתים' : 'שירותים עם ביצועים מופחתים'}`;
  } else {
    level = 'ok';
    title = 'כל המערכות תקינות';
    subtitle = `כל ${total} השירותים פועלים כשורה`;
  }

  elements.overallStatus.dataset.level = level;
  elements.overallTitle.textContent = title;
  elements.overallSubtitle.textContent = subtitle;
}

// ===========================================================
// שליפת כל הסטטוסים
// ===========================================================

async function fetchAllStatuses() {
  try {
    hideError();
    const response = await fetch(`${API_BASE}/status`);
    if (!response.ok) throw new Error('שגיאה בקבלת הסטטוסים');

    const data = await response.json();
    const servicesData = data.services;

    // עדכון כל כרטיס
    servicesData.forEach(updateServiceCard);

    // עדכון סטטוס כללי
    updateOverallStatus(servicesData);

    // טען היסטוריה במקביל (לא חוסם את הסטטוס)
    loadHistory();

    // זמן עדכון
    elements.lastUpdated.textContent = `עודכן: ${formatTime(new Date())}`;

  } catch (error) {
    showError('לא ניתן היה לטעון את הנתונים. ננסה שוב בקרוב.');
    console.error(error);
  }
}

// ===========================================================
// כפתור רענון
// ===========================================================

elements.refreshBtn.addEventListener('click', async () => {
  elements.refreshBtn.classList.add('spinning');
  elements.refreshBtn.disabled = true;

  // ניקוי קאש בשרת לקבלת נתונים טריים
  try {
    await fetch(`${API_BASE}/cache/clear`, { method: 'POST' });
  } catch (e) {
    // לא קריטי
  }

  await fetchAllStatuses();

  setTimeout(() => {
    elements.refreshBtn.classList.remove('spinning');
    elements.refreshBtn.disabled = false;
  }, 600);
});

// ===========================================================
// רענון אוטומטי
// ===========================================================

function startAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(fetchAllStatuses, REFRESH_INTERVAL);
}

// ===========================================================
// אתחול
// ===========================================================

async function init() {
  await loadServices();
  await fetchAllStatuses();
  startAutoRefresh();
}

// כאשר חזרנו ללשונית - רענון מיידי
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    fetchAllStatuses();
  }
});

init();
