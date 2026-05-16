// תצורת השירותים - כל שירות עם נקודת ה-API שלו וסוג ההתממשקות
//
// רמות אמינות (reliability):
//   'high'   - API רשמי של דף הסטטוס - משקף בדיוק את מצב השירות
//   'medium' - בדיקת endpoint של API/CDN שמשרת את השירות בפועל
//   'low'    - בדיקת זמינות אתר תאגידי בלבד (לא משקף streaming)

export const RELIABILITY_LEVELS = {
  high: {
    label: 'אמינות גבוהה',
    icon: 'check-double',
    description: 'נתונים מ-API רשמי של דף הסטטוס'
  },
  medium: {
    label: 'אמינות בינונית',
    icon: 'check',
    description: 'בדיקת תשתית ה-API/CDN של השירות'
  },
  low: {
    label: 'אמינות נמוכה',
    icon: 'info',
    description: 'בדיקת זמינות אתר תאגידי בלבד - לא בהכרח משקף את זמינות ה-streaming'
  }
};

export const SERVICES = [
  // ===== אמינות גבוהה: APIs רשמיים =====
  {
    id: 'spotify',
    name: 'Spotify',
    hebrewName: 'ספוטיפיי',
    category: 'מוזיקה',
    type: 'statuspage',
    reliability: 'high',
    reliabilityNote: 'API רשמי של Spotify Status',
    apiUrl: 'https://spotify.statuspage.io/api/v2/summary.json',
    publicUrl: 'https://spotify.statuspage.io',
    color: '#1DB954',
    icon: 'spotify'
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    hebrewName: 'אפל מיוזיק',
    category: 'מוזיקה',
    type: 'apple',
    reliability: 'high',
    reliabilityNote: 'API רשמי של Apple System Status',
    apiUrl: 'https://www.apple.com/support/systemstatus/data/system_status_en_US.js',
    publicUrl: 'https://www.apple.com/support/systemstatus/',
    serviceKeyword: 'Apple Music',
    color: '#FA243C',
    icon: 'apple-music'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    hebrewName: 'פייסבוק',
    category: 'רשתות חברתיות',
    type: 'meta',
    reliability: 'medium',
    reliabilityNote: 'בדיקת תשתית Meta (אין API ציבורי)',
    apiUrl: 'https://metastatus.com/api/health/facebook',
    fallbackUrl: 'https://www.facebook.com/',
    publicUrl: 'https://metastatus.com/facebook',
    color: '#1877F2',
    icon: 'facebook'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    hebrewName: 'אינסטגרם',
    category: 'רשתות חברתיות',
    type: 'meta',
    reliability: 'medium',
    reliabilityNote: 'בדיקת תשתית Meta (אין API ציבורי)',
    apiUrl: 'https://metastatus.com/api/health/instagram',
    fallbackUrl: 'https://www.instagram.com/',
    publicUrl: 'https://metastatus.com/instagram',
    color: '#E4405F',
    icon: 'instagram'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    hebrewName: 'וואטסאפ',
    category: 'מסרים',
    type: 'meta',
    reliability: 'medium',
    reliabilityNote: 'בדיקת תשתית Meta (אין API ציבורי)',
    apiUrl: 'https://metastatus.com/api/health/whatsapp-business-api',
    fallbackUrl: 'https://web.whatsapp.com/',
    publicUrl: 'https://metastatus.com/whatsapp-business-api',
    color: '#25D366',
    icon: 'whatsapp'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    hebrewName: 'יוטיוב',
    category: 'וידאו',
    type: 'google',
    reliability: 'high',
    reliabilityNote: 'API רשמי של Google Apps Status',
    apiUrl: 'https://www.google.com/appsstatus/dashboard/incidents.json',
    publicUrl: 'https://www.google.com/appsstatus/dashboard/',
    serviceKeyword: 'YouTube',
    color: '#FF0000',
    icon: 'youtube'
  },

  // ===== אמינות בינונית: בדיקת CDN/API ספציפי =====
  {
    id: 'netflix',
    name: 'Netflix',
    hebrewName: 'נטפליקס',
    category: 'סטרימינג',
    type: 'multi-ping',
    reliability: 'medium',
    reliabilityNote: 'בדיקת CDN ו-API של נטפליקס (nflxso.net) - משקף את תשתית ה-streaming אך לא את החשבון או DRM',
    endpoints: [
      { url: 'https://www.netflix.com/', name: 'אתר ראשי' },
      { url: 'https://assets.nflxext.com/', name: 'CDN נכסים' },
      { url: 'https://occ-0-2773-2774.1.nflxso.net/', name: 'CDN streaming' }
    ],
    publicUrl: 'https://help.netflix.com/en/is-netflix-down',
    color: '#E50914',
    icon: 'netflix'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    hebrewName: 'דיסני פלוס',
    category: 'סטרימינג',
    type: 'multi-ping',
    reliability: 'medium',
    reliabilityNote: 'בדיקת CDN ו-API של דיסני פלוס - משקף את תשתית ה-streaming',
    endpoints: [
      { url: 'https://www.disneyplus.com/', name: 'אתר ראשי' },
      { url: 'https://disney.api.edge.bamgrid.com/', name: 'API Edge' },
      { url: 'https://cannoli.disney-plus.net/', name: 'CDN וידאו' }
    ],
    publicUrl: 'https://www.disneyplus.com/',
    color: '#113CCF',
    icon: 'disney-plus'
  },
  {
    id: 'hbo-max',
    name: 'Max',
    hebrewName: 'מקס (HBO)',
    category: 'סטרימינג',
    type: 'multi-ping',
    reliability: 'medium',
    reliabilityNote: 'בדיקת CDN ו-API של Max',
    endpoints: [
      { url: 'https://www.max.com/', name: 'אתר ראשי' },
      { url: 'https://comet.api.hbo.com/', name: 'API שירות' }
    ],
    publicUrl: 'https://help.max.com',
    color: '#002BE7',
    icon: 'hbo-max'
  },

  // ===== אמינות נמוכה: שירותים ישראליים - רק אתר תאגידי זמין =====
  {
    id: 'hot',
    name: 'HOT',
    hebrewName: 'הוט',
    category: 'טלוויזיה ישראלית',
    type: 'ping',
    reliability: 'low',
    reliabilityNote: 'בדיקת זמינות אתר HOT בלבד. ייתכן שזמינות ה-TV/streaming שונה',
    apiUrl: 'https://www.hot.net.il',
    publicUrl: 'https://www.hot.net.il',
    color: '#E4002B',
    icon: 'hot'
  },
  {
    id: 'cellcom-tv',
    name: 'Cellcom TV',
    hebrewName: 'סלקום TV',
    category: 'טלוויזיה ישראלית',
    type: 'ping',
    reliability: 'low',
    reliabilityNote: 'בדיקת זמינות אתר סלקום בלבד. ייתכן שזמינות ה-TV/streaming שונה',
    apiUrl: 'https://www.cellcom.co.il',
    publicUrl: 'https://www.cellcom.co.il/tv',
    color: '#5C2D91',
    icon: 'cellcom'
  },
  {
    id: 'yes',
    name: 'yes',
    hebrewName: 'yes (סטינג TV)',
    category: 'טלוויזיה ישראלית',
    type: 'ping',
    reliability: 'low',
    reliabilityNote: 'בדיקת זמינות אתר yes בלבד. ייתכן שזמינות ה-TV/streaming שונה',
    apiUrl: 'https://www.yes.co.il',
    publicUrl: 'https://www.yes.co.il',
    color: '#FF6900',
    icon: 'yes'
  },
  {
    id: 'partner-tv',
    name: 'Partner TV',
    hebrewName: 'פרטנר TV',
    category: 'טלוויזיה ישראלית',
    type: 'ping',
    reliability: 'low',
    reliabilityNote: 'בדיקת זמינות אתר פרטנר בלבד. ייתכן שזמינות ה-TV/streaming שונה',
    apiUrl: 'https://www.partner.co.il',
    publicUrl: 'https://www.partner.co.il/tv',
    color: '#00A6C8',
    icon: 'partner'
  },
  {
    id: 'sting-plus',
    name: 'STING TV+',
    hebrewName: 'סטינג TV',
    category: 'טלוויזיה ישראלית',
    type: 'ping',
    reliability: 'low',
    reliabilityNote: 'בדיקת זמינות אתר בלבד. ייתכן שזמינות ה-streaming שונה',
    apiUrl: 'https://www.stingtv.co.il',
    publicUrl: 'https://www.stingtv.co.il',
    color: '#FFB81C',
    icon: 'sting'
  }
];

// מיפוי סטטוסים לעברית
export const STATUS_TRANSLATIONS = {
  operational: { he: 'תקין', level: 'ok' },
  degraded_performance: { he: 'ביצועים מופחתים', level: 'warning' },
  partial_outage: { he: 'תקלה חלקית', level: 'warning' },
  major_outage: { he: 'תקלה משמעותית', level: 'error' },
  under_maintenance: { he: 'בתחזוקה', level: 'maintenance' },
  unknown: { he: 'לא ידוע', level: 'unknown' }
};

// מיפוי דרגות חומרה לעברית
export const INDICATOR_TRANSLATIONS = {
  none: { he: 'כל המערכות פועלות', level: 'ok' },
  minor: { he: 'בעיה קלה', level: 'warning' },
  major: { he: 'תקלה משמעותית', level: 'error' },
  critical: { he: 'תקלה קריטית', level: 'error' },
  maintenance: { he: 'תחזוקה מתוכננת', level: 'maintenance' }
};
