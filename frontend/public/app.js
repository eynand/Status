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

  youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,

  netflix: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.31.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/></svg>`,

  'disney-plus': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.043 4.92c.156-.04.398.022.398.022.041.04.04.092-.026.13-.063.041-.45.176-.45.176-.03.013-.06.011-.063-.018-.003-.024.014-.244.14-.31zm.844-.117c0 .098-.005.21-.106.213-.072.002-.114-.094-.122-.144-.025-.155-.013-.295.061-.346.121-.082.171.187.167.277zm-1.443 1.13c.21-.018.354.024.443.111.082.08.043.18.001.225-.044.043-.144.073-.265.075-.305.005-.519-.146-.55-.224-.024-.063.027-.16.371-.187zm9.84.156c.082.087.187.323.187.435 0 .102-.022.182-.043.235-.027.064-.092.122-.142.122-.105 0-.232-.116-.232-.341 0-.184.107-.422.23-.451zm-.66.038c.155.014.214.156.211.301-.003.151-.029.317-.114.342-.097.029-.246-.058-.273-.247-.027-.187.018-.412.176-.396zM18.4 4.94c.039.041.044.13.018.196-.025.063-.116.105-.18.087-.103-.029-.156-.13-.144-.197.011-.069.084-.122.181-.13.077-.007.106.026.125.044zm-9.358.158c.082-.046.21-.067.273.012.072.092.078.235.014.31-.067.078-.171.085-.226.063-.082-.033-.146-.117-.146-.21 0-.094.041-.142.085-.175zm2.156.041c.064.005.106.083.105.144 0 .063-.039.137-.122.137-.061 0-.108-.026-.142-.063-.044-.05-.052-.105-.027-.146.026-.043.094-.077.186-.072zm6.456-.012c.06.027.085.092.071.156-.026.135-.171.149-.222.143-.06-.007-.13-.062-.13-.156 0-.07.071-.171.281-.143zM5.572 12.36c.07-.057.232-.193.452-.193.32 0 .47.298.47.51 0 .272-.221.486-.469.486-.255 0-.482-.193-.482-.452 0-.165.069-.273.029-.351zm6.193 2.176c-.058-.005-.097.026-.117.077-.011.026-.018.057-.025.085-.027.108-.052.272.044.405.122.171.337.142.392.071.072-.094.04-.247-.013-.39-.044-.119-.144-.245-.281-.248zm10.66 1.93c0-1.59-2.31-2.881-9.7-2.881-.815 0-1.604.018-2.36.054.108.072.222.151.341.244.236-.013.485-.022.744-.022 5.875 0 7.84 1.078 7.84 1.926 0 .881-1.785 1.51-3.65 1.834-.025.011-.041.029-.041.041 0 .024.043.038.099.039 4.118-.137 6.727-.687 6.727-1.235zM18.42 11.95c.08.13.121.293.121.484 0 .523-.314 1.13-1.011 1.665-1.058.808-2.787 1.404-5.084 1.404-.144 0-.291-.001-.435-.008.018.022.04.044.061.064.131.013.262.018.398.018 2.314 0 4.107-.586 5.219-1.395.741-.541 1.114-1.114 1.114-1.683 0-.244-.067-.388-.246-.515-.041-.024-.085-.027-.137-.034zm-7.025-.34c0-.063.073-.075.085-.057.045.07-.034.235-.092.235-.014 0-.027 0-.014-.018.044-.063.063-.123.021-.16zm-1.62.115c.117 0 .219.099.219.214 0 .117-.099.217-.218.217a.218.218 0 0 1-.214-.217c0-.115.097-.214.213-.214zm5.394 1.55c-.18 0-.398-.117-.398-.328 0-.211.171-.328.398-.328.226 0 .394.13.394.328-.001.213-.181.328-.394.328zm-1.853.045a.41.41 0 0 1-.422-.413.41.41 0 0 1 .422-.411c.246 0 .435.184.435.411 0 .226-.196.413-.435.413zm-2.103-.117c.117 0 .224.105.224.247 0 .14-.107.245-.224.245-.118 0-.214-.105-.214-.245 0-.142.097-.247.214-.247z"/></svg>`,

  'hbo-max': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.45 4.5c-.32-.83-1.17-1.4-2.13-1.4H3.69c-.96 0-1.81.57-2.13 1.4-.34.88-.04 1.83.66 2.36L12 12.83l9.79-5.97c.7-.53 1-1.48.66-2.36zM1.55 8.84v9.66c0 1.21.99 2.2 2.2 2.2h16.5c1.21 0 2.2-.99 2.2-2.2V8.84L12 14.91 1.55 8.84zM7.5 11.5h2v5h-2v-2H6v2H4v-5h2v1.5h1.5V11.5zm9 0v5h-2v-5h2zm-5.5 1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/></svg>`,

  hot: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h4v6h4V4h4v16h-4v-6H7v6H3V4zm17 0h-4v3h-2v3h2v10h4V10h2V7h-2V4z"/></svg>`,

  cellcom: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="4"/><path d="M4 12h4M16 12h4M12 4v4M12 16v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

  yes: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h4l2 4 2-4h4l-4 7v5h-4v-5L3 6zm14 0h6v3h-4v2h3v3h-3v2h4v3h-6V6z"/></svg>`,

  partner: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,

  sting: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.5 3.61L12 11.4 5.5 7.79 12 4.18zM5 9.39l6 3.33v7.16l-6-3.33V9.39zm14 7.16l-6 3.33v-7.16l6-3.33v7.16z"/></svg>`
};

// אייקונים SVG לרמות אמינות
const RELIABILITY_ICONS = {
  high: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline><polyline points="14 13 8 19 6 17"></polyline></svg>`,
  medium: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  low: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
};

const RELIABILITY_LABELS = {
  high: 'אמינות גבוהה',
  medium: 'אמינות בינונית',
  low: 'אמינות נמוכה'
};
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
  template: document.getElementById('service-card-template'),
  reliabilityInfoBtn: document.getElementById('reliability-info-btn'),
  reliabilityPanel: document.getElementById('reliability-panel')
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

function createServiceCard(service) {
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

  // Reliability badge
  const reliability = service.reliability || 'medium';
  const reliabilityEl = card.querySelector('.card-reliability');
  reliabilityEl.dataset.reliability = reliability;
  reliabilityEl.querySelector('.reliability-icon').innerHTML = RELIABILITY_ICONS[reliability];
  reliabilityEl.querySelector('.reliability-label').textContent = RELIABILITY_LABELS[reliability];
  reliabilityEl.title = service.reliabilityNote || '';

  // מצב התחלתי: loading
  card.dataset.status = 'unknown';
  card.classList.add('loading');
  card.querySelector('.card-status-text').textContent = 'טוען...';
  card.querySelector('.card-description').textContent = '';

  return card;
}

function renderServiceCards() {
  elements.servicesGrid.innerHTML = '';
  cardElements = {};

  // קיבוץ לפי קטגוריות תוך שמירה על סדר השירותים בקובץ
  const grouped = {};
  const categoriesOrder = [];
  services.forEach(service => {
    if (!grouped[service.category]) {
      grouped[service.category] = [];
      categoriesOrder.push(service.category);
    }
    grouped[service.category].push(service);
  });

  // יצירת מקטעים לפי קטגוריות
  categoriesOrder.forEach(category => {
    const servicesInCategory = grouped[category];

    // כותרת קטגוריה
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <h3>${category}</h3>
      <span class="category-count">${servicesInCategory.length}</span>
    `;
    elements.servicesGrid.appendChild(header);

    // גריד פנימי לקטגוריה
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'category-grid';

    servicesInCategory.forEach(service => {
      const card = createServiceCard(service);
      cardElements[service.id] = card;
      categoryGrid.appendChild(card);
    });

    elements.servicesGrid.appendChild(categoryGrid);
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
// טוגל פאנל מקרא אמינות
// ===========================================================

elements.reliabilityInfoBtn.addEventListener('click', () => {
  elements.reliabilityPanel.classList.toggle('hidden');
});

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
