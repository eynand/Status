// שרת ראשי - Express עם caching והיסטוריה
import express from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVICES } from './services.js';
import { getServiceStatus } from './statusFetcher.js';
import { recordSnapshot, getUptimeSummary, getServiceHistory, getStats } from './history.js';

const app = express();
const PORT = process.env.PORT || 3001;

// קאש לשעור 60 שניות
const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

app.use(cors());
app.use(express.json());

// הגשת ה-Frontend הסטטי
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(frontendPath));

// פונקציה המבצעת בדיקה ומתעדת
async function performCheck() {
  try {
    const statuses = await Promise.all(
      SERVICES.map(service => getServiceStatus(service))
    );
    cache.set('all_statuses', statuses);
    // תיעוד בהיסטוריה
    await recordSnapshot(statuses);
    return statuses;
  } catch (error) {
    console.error('שגיאה בבדיקה תקופתית:', error.message);
    return null;
  }
}

// בריאות השרת
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// קבלת רשימת השירותים המוגדרים
app.get('/api/services', (req, res) => {
  res.json(SERVICES.map(s => ({
    id: s.id,
    name: s.name,
    hebrewName: s.hebrewName,
    category: s.category,
    color: s.color,
    icon: s.icon,
    publicUrl: s.publicUrl,
    reliability: s.reliability || 'medium',
    reliabilityNote: s.reliabilityNote || ''
  })));
});

// קבלת סטטוס של כל השירותים
app.get('/api/status', async (req, res) => {
  try {
    const cached = cache.get('all_statuses');
    if (cached) {
      return res.json({ cached: true, services: cached, fetchedAt: cache.getTtl('all_statuses') });
    }

    const statuses = await performCheck();
    res.json({ cached: false, services: statuses, fetchedAt: Date.now() });
  } catch (error) {
    console.error('שגיאה בקבלת סטטוסים:', error);
    res.status(500).json({ error: 'שגיאת שרת', message: error.message });
  }
});

// קבלת סטטוס של שירות בודד
app.get('/api/status/:serviceId', async (req, res) => {
  try {
    const service = SERVICES.find(s => s.id === req.params.serviceId);
    if (!service) {
      return res.status(404).json({ error: 'שירות לא נמצא' });
    }

    const cacheKey = `status_${service.id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ cached: true, ...cached });
    }

    const status = await getServiceStatus(service);
    cache.set(cacheKey, status);
    res.json({ cached: false, ...status });
  } catch (error) {
    console.error('שגיאה בקבלת סטטוס:', error);
    res.status(500).json({ error: 'שגיאת שרת', message: error.message });
  }
});

// היסטוריה - סיכום uptime ל-7 ימים לכל השירותים
app.get('/api/history', async (req, res) => {
  try {
    const summary = await getUptimeSummary();
    res.json({ summary, fetchedAt: Date.now() });
  } catch (error) {
    console.error('שגיאה בקבלת היסטוריה:', error);
    res.status(500).json({ error: 'שגיאת שרת', message: error.message });
  }
});

// היסטוריה גולמית של שירות בודד
app.get('/api/history/:serviceId', async (req, res) => {
  try {
    const service = SERVICES.find(s => s.id === req.params.serviceId);
    if (!service) {
      return res.status(404).json({ error: 'שירות לא נמצא' });
    }
    const history = await getServiceHistory(service.id);
    res.json({ service: service.id, name: service.hebrewName, history });
  } catch (error) {
    console.error('שגיאה בקבלת היסטוריית שירות:', error);
    res.status(500).json({ error: 'שגיאת שרת', message: error.message });
  }
});

// סטטיסטיקות
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'שגיאת שרת', message: error.message });
  }
});

// ניקוי קאש (לבדיקות)
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ message: 'הקאש נוקה' });
});

// הפניית כל שאר הנתיבים ל-index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ===========================================================
// בדיקות תקופתיות אוטומטיות לתיעוד היסטוריה
// ===========================================================
const RECORDING_INTERVAL_MS = 5 * 60 * 1000; // כל 5 דקות

async function startPeriodicRecording() {
  console.log('✓ מתחיל תיעוד אוטומטי כל 5 דקות');
  // בדיקה ראשונית מיד
  await performCheck();
  // ואז כל 5 דקות
  setInterval(async () => {
    await performCheck();
  }, RECORDING_INTERVAL_MS);
}

app.listen(PORT, () => {
  console.log(`✓ השרת רץ על פורט ${PORT}`);
  console.log(`✓ API: http://localhost:${PORT}/api/status`);
  console.log(`✓ דשבורד: http://localhost:${PORT}`);
  console.log(`✓ מנטר ${SERVICES.length} שירותים`);
  // הפעלת התיעוד התקופתי
  startPeriodicRecording().catch(err => console.error('שגיאה בהפעלת תיעוד:', err));
});
