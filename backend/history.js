// מודול שמירת היסטוריה - שמירה בקובץ JSON עם שמירה של 7 ימים
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// מיקום קובץ ההיסטוריה - בעת פריסה לענן, השתמש בנתיב persistent
const HISTORY_FILE = process.env.HISTORY_FILE || path.join(__dirname, 'data', 'history.json');
const RETENTION_DAYS = 7;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

// ננעל הרצות מקבילות של כתיבה כדי למנוע fחירויות במידה ויש קריאות בו-זמנית
let writeLock = Promise.resolve();

// ודא שתיקיית הנתונים קיימת
async function ensureDataDir() {
  const dir = path.dirname(HISTORY_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // התיקייה כבר קיימת - בסדר
  }
}

// קריאת ההיסטוריה הקיימת
async function readHistory() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}; // הקובץ עדיין לא קיים
    }
    console.error('שגיאה בקריאת היסטוריה:', error.message);
    return {};
  }
}

// כתיבת ההיסטוריה לדיסק
async function writeHistory(history) {
  await ensureDataDir();
  // כתיבה אטומית - דרך קובץ זמני
  const tmpFile = `${HISTORY_FILE}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(history), 'utf-8');
  await fs.rename(tmpFile, HISTORY_FILE);
}

// ניקוי רשומות ישנות (מעל 7 ימים)
function pruneOldEntries(entries) {
  const cutoff = Date.now() - RETENTION_MS;
  return entries.filter(entry => entry.t >= cutoff);
}

// תיעוד מצב נוכחי לכל השירותים
// פורמט מצומצם לחסכון: { t: timestamp, s: status }
// status: 1 = ok, 2 = warning, 3 = error, 4 = maintenance, 0 = unknown
const STATUS_MAP = { ok: 1, warning: 2, error: 3, maintenance: 4, unknown: 0 };
const REVERSE_STATUS_MAP = { 1: 'ok', 2: 'warning', 3: 'error', 4: 'maintenance', 0: 'unknown' };

export async function recordSnapshot(servicesData) {
  writeLock = writeLock.then(async () => {
    try {
      const history = await readHistory();
      const timestamp = Date.now();

      for (const service of servicesData) {
        if (!history[service.id]) {
          history[service.id] = [];
        }
        history[service.id].push({
          t: timestamp,
          s: STATUS_MAP[service.status] ?? 0
        });
        // ניקוי רשומות ישנות
        history[service.id] = pruneOldEntries(history[service.id]);
      }

      await writeHistory(history);
    } catch (error) {
      console.error('שגיאה בשמירת היסטוריה:', error.message);
    }
  });
  return writeLock;
}

// קבלת היסטוריה של שירות בודד - בחלוקה ליום
export async function getServiceHistory(serviceId) {
  const history = await readHistory();
  const entries = history[serviceId] || [];

  return entries.map(e => ({
    timestamp: e.t,
    status: REVERSE_STATUS_MAP[e.s] || 'unknown'
  }));
}

// קבלת סיכום uptime ל-7 ימים - מחולק ליום
// מחזיר מערך של 7 ימים, כל יום עם אחוז uptime וסטטוס דומיננטי
export async function getUptimeSummary() {
  const history = await readHistory();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const result = {};

  for (const [serviceId, entries] of Object.entries(history)) {
    const days = [];

    // עבור על 7 הימים האחרונים, מהיום העתיק ועד להיום
    for (let i = 6; i >= 0; i--) {
      const dayEnd = now - (i * dayMs);
      const dayStart = dayEnd - dayMs;

      // כל הדגימות מהיום הזה
      const dayEntries = entries.filter(e => e.t >= dayStart && e.t < dayEnd);

      if (dayEntries.length === 0) {
        days.push({
          date: new Date(dayStart).toISOString().split('T')[0],
          uptime: null, // אין נתונים
          status: 'no-data',
          samples: 0
        });
        continue;
      }

      // ספירת מצבים
      let okCount = 0;
      let warningCount = 0;
      let errorCount = 0;
      let knownCount = 0; // דגימות עם סטטוס ידוע (לא unknown)

      for (const entry of dayEntries) {
        if (entry.s === 1) { okCount++; knownCount++; }
        else if (entry.s === 2 || entry.s === 4) { warningCount++; knownCount++; }
        else if (entry.s === 3) { errorCount++; knownCount++; }
        // entry.s === 0 (unknown) לא נספר ב-uptime
      }

      // אם אין דגימות עם סטטוס ידוע - נסמן כאין נתונים
      if (knownCount === 0) {
        days.push({
          date: new Date(dayStart).toISOString().split('T')[0],
          uptime: null,
          status: 'no-data',
          samples: dayEntries.length
        });
        continue;
      }

      const uptime = ((okCount + warningCount * 0.5) / knownCount) * 100;

      // הסטטוס הדומיננטי של היום
      let status;
      if (errorCount > knownCount * 0.1) status = 'error';
      else if (warningCount > knownCount * 0.2) status = 'warning';
      else status = 'ok';

      days.push({
        date: new Date(dayStart).toISOString().split('T')[0],
        uptime: Math.round(uptime * 10) / 10,
        status,
        samples: knownCount
      });
    }

    // אחוז uptime כללי לתקופה כולה
    const validDays = days.filter(d => d.uptime !== null);
    const overallUptime = validDays.length > 0
      ? validDays.reduce((sum, d) => sum + d.uptime, 0) / validDays.length
      : null;

    result[serviceId] = {
      days,
      overallUptime: overallUptime !== null ? Math.round(overallUptime * 10) / 10 : null
    };
  }

  return result;
}

// סטטיסטיקות כלליות
export async function getStats() {
  const history = await readHistory();
  let totalSamples = 0;
  for (const entries of Object.values(history)) {
    totalSamples += entries.length;
  }
  return {
    totalSamples,
    serviceCount: Object.keys(history).length,
    retentionDays: RETENTION_DAYS
  };
}
