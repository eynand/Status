// מודול שואב סטטוסים - תומך בסוגי API שונים
import fetch from 'node-fetch';
import { STATUS_TRANSLATIONS, INDICATOR_TRANSLATIONS } from './services.js';

// טיים-אאוט לבקשות
const FETCH_TIMEOUT = 8000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'StatusMonitor/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// שואב סטטוס משירותי Statuspage (Spotify ועוד)
async function fetchStatuspage(service) {
  const response = await fetchWithTimeout(service.apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  const indicator = data.status?.indicator || 'none';
  const translation = INDICATOR_TRANSLATIONS[indicator] || INDICATOR_TRANSLATIONS.none;

  // ספירת אירועים פתוחים
  const incidents = (data.incidents || []).filter(
    inc => inc.status !== 'resolved' && inc.status !== 'completed'
  );

  return {
    status: translation.level,
    statusText: translation.he,
    description: data.status?.description || translation.he,
    incidents: incidents.map(inc => ({
      name: inc.name,
      status: inc.status,
      impact: inc.impact,
      createdAt: inc.created_at,
      updatedAt: inc.updated_at,
      url: inc.shortlink
    })),
    lastUpdated: data.page?.updated_at || new Date().toISOString()
  };
}

// שואב סטטוס מ-Apple System Status (פורמט JS ייחודי)
async function fetchApple(service) {
  const response = await fetchWithTimeout(service.apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  let text = await response.text();
  // Apple עוטף את ה-JSON בקריאת פונקציה JS, יש לחלץ אותו
  // הפורמט: jsonCallback({ ... });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Apple: לא נמצא JSON תקין');
  }
  const data = JSON.parse(jsonMatch[0]);

  // חיפוש השירות הספציפי (כמו Apple Music)
  const services = data.services || [];
  const matched = services.find(s =>
    s.serviceName && s.serviceName.toLowerCase().includes(service.serviceKeyword.toLowerCase())
  );

  if (!matched) {
    // אם לא נמצא, מניחים שתקין
    return {
      status: 'ok',
      statusText: 'תקין',
      description: 'אין דיווחים על תקלות',
      incidents: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Apple מסמן אירועים פתוחים בשדה events
  const openEvents = (matched.events || []).filter(e => !e.resolvedDate);
  const isHealthy = openEvents.length === 0;

  return {
    status: isHealthy ? 'ok' : 'warning',
    statusText: isHealthy ? 'תקין' : 'יש דיווחים על תקלות',
    description: isHealthy ? 'כל המערכות פועלות' : `${openEvents.length} אירועים פעילים`,
    incidents: openEvents.map(e => ({
      name: e.message || e.eventStatus,
      status: e.eventStatus,
      impact: 'minor',
      createdAt: e.startDate,
      updatedAt: e.statusType,
      url: service.publicUrl
    })),
    lastUpdated: new Date().toISOString()
  };
}

// שואב סטטוס משירותי Meta (Facebook, Instagram, WhatsApp)
async function fetchMeta(service) {
  try {
    const response = await fetchWithTimeout(service.apiUrl);
    if (response.ok) {
      const data = await response.json();
      // Meta מחזירים אובייקט עם health/status
      const isHealthy = data.health === 'good' || data.status === 'operational' || data.healthy === true;
      return {
        status: isHealthy ? 'ok' : 'warning',
        statusText: isHealthy ? 'תקין' : 'יש דיווחים על תקלות',
        description: data.description || (isHealthy ? 'כל המערכות פועלות' : 'יש בעיות בשירות'),
        incidents: data.incidents || [],
        lastUpdated: data.updated_at || new Date().toISOString()
      };
    }
  } catch (e) {
    // נופלים לפתרון fallback
  }
  // Fallback: בדיקת זמינות בסיסית של דף הסטטוס הציבורי
  return await fetchByPing(service);
}

// שואב סטטוס משירותי Google (כמו YouTube)
async function fetchGoogle(service) {
  try {
    const response = await fetchWithTimeout(service.apiUrl);
    if (response.ok) {
      const data = await response.json();
      // Google מחזיר מערך אירועים
      const incidents = Array.isArray(data) ? data : (data.incidents || []);
      const relevant = incidents.filter(inc => {
        const serviceName = inc.service_name || inc.service || '';
        return serviceName.toLowerCase().includes(service.serviceKeyword.toLowerCase());
      });

      const openIncidents = relevant.filter(inc => !inc.end || inc.end === null);
      const isHealthy = openIncidents.length === 0;

      return {
        status: isHealthy ? 'ok' : 'warning',
        statusText: isHealthy ? 'תקין' : 'יש דיווחים על תקלות',
        description: isHealthy ? 'כל המערכות פועלות' : `${openIncidents.length} אירועים פעילים`,
        incidents: openIncidents.map(inc => ({
          name: inc.external_desc || inc.description || 'אירוע',
          status: 'investigating',
          impact: inc.severity || 'minor',
          createdAt: inc.begin,
          updatedAt: inc.modified,
          url: inc.uri ? `https://www.google.com${inc.uri}` : service.publicUrl
        })),
        lastUpdated: new Date().toISOString()
      };
    }
  } catch (e) {
    // נופלים לפתרון fallback
  }
  return await fetchByPing(service);
}

// Fallback - בדיקת זמינות בסיסית על ידי ניסיון לגשת ל-URL
async function fetchByPing(service) {
  try {
    const testUrl = service.publicUrl;
    const response = await fetchWithTimeout(testUrl);
    const isHealthy = response.ok;
    return {
      status: isHealthy ? 'ok' : 'warning',
      statusText: isHealthy ? 'תקין' : 'לא נגיש',
      description: isHealthy ? 'השירות זמין' : 'יש בעיה בגישה לשירות',
      incidents: [],
      lastUpdated: new Date().toISOString()
    };
  } catch (e) {
    return {
      status: 'unknown',
      statusText: 'לא ידוע',
      description: 'לא ניתן היה לבדוק את הסטטוס',
      incidents: [],
      lastUpdated: new Date().toISOString(),
      error: e.message
    };
  }
}

// פונקציה ראשית - נתב לפי סוג השירות
export async function getServiceStatus(service) {
  try {
    let result;
    switch (service.type) {
      case 'statuspage':
        result = await fetchStatuspage(service);
        break;
      case 'apple':
        result = await fetchApple(service);
        break;
      case 'meta':
        result = await fetchMeta(service);
        break;
      case 'google':
        result = await fetchGoogle(service);
        break;
      default:
        result = await fetchByPing(service);
    }

    return {
      id: service.id,
      name: service.name,
      hebrewName: service.hebrewName,
      category: service.category,
      color: service.color,
      icon: service.icon,
      publicUrl: service.publicUrl,
      ...result
    };
  } catch (error) {
    console.error(`שגיאה בשליפת סטטוס ל-${service.name}:`, error.message);
    return {
      id: service.id,
      name: service.name,
      hebrewName: service.hebrewName,
      category: service.category,
      color: service.color,
      icon: service.icon,
      publicUrl: service.publicUrl,
      status: 'unknown',
      statusText: 'לא ידוע',
      description: 'לא ניתן היה לבדוק את הסטטוס כעת',
      incidents: [],
      lastUpdated: new Date().toISOString(),
      error: error.message
    };
  }
}
