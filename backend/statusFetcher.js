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
// משמש גם כסוג עיקרי לשירותים ללא API ציבורי (Netflix, Disney+, HOT וכו')
async function fetchByPing(service) {
  const testUrl = service.apiUrl || service.publicUrl;
  const startTime = Date.now();
  try {
    // ננסה HEAD תחילה - חוסך bandwidth ומהיר יותר
    let response;
    try {
      response = await fetchWithTimeout(testUrl, {
        method: 'HEAD',
        redirect: 'follow'
      });
    } catch (headError) {
      // אם HEAD נכשל (חלק מהשרתים לא תומכים) - ננסה GET
      response = await fetchWithTimeout(testUrl, {
        method: 'GET',
        redirect: 'follow'
      });
    }

    const responseTime = Date.now() - startTime;
    const status = response.status;

    if (status >= 200 && status < 400) {
      // בדיקת זמני תגובה - איטיות יכולה להעיד על בעיה
      let resultStatus = 'ok';
      let statusText = 'תקין';
      let description = `השירות זמין (${responseTime}ms)`;
      if (responseTime > 5000) {
        resultStatus = 'warning';
        statusText = 'תגובה איטית';
        description = `השירות מגיב לאט (${responseTime}ms)`;
      }
      return {
        status: resultStatus,
        statusText,
        description,
        responseTime,
        incidents: [],
        lastUpdated: new Date().toISOString()
      };
    } else if (status >= 400 && status < 500) {
      return {
        status: 'ok',
        statusText: 'תקין',
        description: `השירות זמין (${responseTime}ms)`,
        responseTime,
        incidents: [],
        lastUpdated: new Date().toISOString()
      };
    } else {
      return {
        status: 'error',
        statusText: 'תקלת שרת',
        description: `שגיאת שרת (קוד ${status})`,
        responseTime,
        incidents: [],
        lastUpdated: new Date().toISOString()
      };
    }
  } catch (e) {
    const isTimeout = e.name === 'AbortError' || e.message.includes('timeout');
    return {
      status: isTimeout ? 'warning' : 'error',
      statusText: isTimeout ? 'איטי' : 'לא נגיש',
      description: isTimeout
        ? 'השירות מגיב באיטיות או לא מגיב'
        : 'לא ניתן ליצור חיבור לשירות',
      incidents: [],
      lastUpdated: new Date().toISOString(),
      error: e.message
    };
  }
}

// בדיקה רב-נקודות (Multi-ping) - מתאים לשירותי streaming
// בודק מספר endpoints (אתר, CDN, API) ומסכם את התוצאות
async function fetchMultiPing(service) {
  const endpoints = service.endpoints || [];
  if (endpoints.length === 0) {
    return await fetchByPing(service);
  }

  // הרצה במקביל של כל הבדיקות
  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const startTime = Date.now();
      try {
        // נסיון HEAD תחילה
        let response;
        try {
          response = await fetchWithTimeout(endpoint.url, {
            method: 'HEAD',
            redirect: 'follow'
          });
        } catch (e) {
          response = await fetchWithTimeout(endpoint.url, {
            method: 'GET',
            redirect: 'follow'
          });
        }
        const responseTime = Date.now() - startTime;
        const ok = response.status >= 200 && response.status < 500; // 4xx גם נחשב חי
        return {
          name: endpoint.name,
          url: endpoint.url,
          ok,
          status: response.status,
          responseTime
        };
      } catch (e) {
        return {
          name: endpoint.name,
          url: endpoint.url,
          ok: false,
          status: 0,
          responseTime: Date.now() - startTime,
          error: e.message
        };
      }
    })
  );

  // ניתוח התוצאות
  const okCount = results.filter(r => r.ok).length;
  const totalCount = results.length;
  const failedEndpoints = results.filter(r => !r.ok);
  const avgResponseTime = Math.round(
    results.filter(r => r.ok).reduce((sum, r) => sum + r.responseTime, 0) /
    Math.max(okCount, 1)
  );

  // הגדרת סטטוס לפי יחס הצלחות
  let status, statusText, description;
  if (okCount === totalCount) {
    // הכל תקין
    status = 'ok';
    statusText = 'תקין';
    if (avgResponseTime > 5000) {
      status = 'warning';
      statusText = 'תגובה איטית';
      description = `כל ${totalCount} נקודות מגיבות אך באיטיות (${avgResponseTime}ms)`;
    } else {
      description = `כל ${totalCount} נקודות הבדיקה מגיבות תקין (${avgResponseTime}ms)`;
    }
  } else if (okCount === 0) {
    // כלום לא תקין
    status = 'error';
    statusText = 'לא נגיש';
    description = `כל ${totalCount} נקודות הבדיקה אינן מגיבות`;
  } else {
    // חלקי
    status = 'warning';
    statusText = 'תקלה חלקית';
    const failedNames = failedEndpoints.map(r => r.name).join(', ');
    description = `${okCount} מתוך ${totalCount} נקודות תקינות. בעיה ב: ${failedNames}`;
  }

  return {
    status,
    statusText,
    description,
    responseTime: avgResponseTime,
    endpoints: results,
    incidents: failedEndpoints.map(r => ({
      name: `נקודת ${r.name} לא מגיבה`,
      status: 'investigating',
      impact: 'minor',
      url: r.url
    })),
    lastUpdated: new Date().toISOString()
  };
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
      case 'multi-ping':
        result = await fetchMultiPing(service);
        break;
      case 'ping':
        result = await fetchByPing(service);
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
      reliability: service.reliability || 'medium',
      reliabilityNote: service.reliabilityNote || '',
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
      reliability: service.reliability || 'medium',
      reliabilityNote: service.reliabilityNote || '',
      status: 'unknown',
      statusText: 'לא ידוע',
      description: 'לא ניתן היה לבדוק את הסטטוס כעת',
      incidents: [],
      lastUpdated: new Date().toISOString(),
      error: error.message
    };
  }
}
