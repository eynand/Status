// תצורת השירותים - כל שירות עם נקודת ה-API שלו וסוג ההתממשקות
// השירותים מחולקים לפי סוג: statuspage (API סטנדרטי), apple (API קנייני), meta (גרידה)

export const SERVICES = [
  {
    id: 'spotify',
    name: 'Spotify',
    hebrewName: 'ספוטיפיי',
    category: 'מוזיקה',
    type: 'statuspage',
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
    apiUrl: 'https://metastatus.com/api/health/facebook',
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
    apiUrl: 'https://metastatus.com/api/health/instagram',
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
    apiUrl: 'https://metastatus.com/api/health/whatsapp-business-api',
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
    apiUrl: 'https://www.google.com/appsstatus/dashboard/incidents.json',
    publicUrl: 'https://www.google.com/appsstatus/dashboard/',
    serviceKeyword: 'YouTube',
    color: '#FF0000',
    icon: 'youtube'
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
