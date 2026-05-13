# מצב השירותים - Status Monitor

מערכת web בעברית לניטור זמינות של שירותי אינטרנט פופולריים בזמן אמת. שולפת נתונים מ-APIs רשמיים של דפי הסטטוס של ספקי השירותים.

## תכונות

- ✓ ניטור 6 שירותים פופולריים: Spotify, Apple Music, Facebook, Instagram, WhatsApp, YouTube
- ✓ שאיבה מ-APIs רשמיים של דפי הסטטוס
- ✓ **גרף uptime היסטורי של 7 ימים אחרונים** עם tooltip לכל יום
- ✓ ממשק בעברית מלא, מינימליסטי ונקי
- ✓ עיצוב Dark Mode עם מיקרו-אנימציות עדינות
- ✓ רענון אוטומטי כל דקה
- ✓ תיעוד אוטומטי כל 5 דקות לחישוב uptime
- ✓ Caching בשרת למניעת overload על ה-APIs
- ✓ רספונסיבי - עובד יפה במובייל
- ✓ קל לפריסה לענן

## מבנה הפרויקט

```
status-monitor/
├── backend/                    # שרת Node.js + Express
│   ├── server.js              # נקודת כניסה + תיעוד תקופתי
│   ├── services.js            # תצורת השירותים
│   ├── statusFetcher.js       # לוגיקת שליפה
│   ├── history.js             # שמירה ושליפת היסטוריה (7 ימים)
│   ├── data/history.json      # נתוני היסטוריה (נוצר אוטומטית)
│   └── package.json
├── frontend/
│   └── public/
│       ├── index.html         # דף ראשי
│       ├── styles.css         # עיצוב
│       └── app.js             # לוגיקת לקוח
├── Dockerfile                 # להפעלה בקונטיינר
├── docker-compose.yml         # לפיתוח מקומי
├── render.yaml                # פריסה ל-Render
├── railway.json               # פריסה ל-Railway
└── README.md
```

## הפעלה מקומית

### דרישות

- Node.js 18 ומעלה

### צעדים

```bash
# 1. כניסה לתיקיית הפרויקט
cd status-monitor/backend

# 2. התקנת תלויות
npm install

# 3. הפעלת השרת
npm start
```

המערכת תהיה זמינה בכתובת: `http://localhost:3001`

### הפעלה דרך Docker

```bash
# בנייה והפעלה
docker-compose up --build

# הפעלה ברקע
docker-compose up -d
```

## פריסה לענן

### 1. Render.com (מומלץ - חינמי וקל)

1. צור חשבון ב-[Render](https://render.com)
2. דחוף את הפרויקט ל-GitHub
3. ב-Render: לחץ "New Web Service" → חבר את ה-repository
4. Render יזהה אוטומטית את `render.yaml` ויפרוס

### 2. Railway.app

1. צור חשבון ב-[Railway](https://railway.app)
2. לחץ "New Project" → "Deploy from GitHub"
3. בחר את ה-repo - Railway יזהה את `railway.json`

### 3. Vercel / Netlify

לפריסה ב-Vercel/Netlify יש להמיר את ה-backend ל-Serverless Functions. למידע נוסף - ראה תיעוד הפלטפורמה.

### 4. AWS / Azure / Google Cloud

השתמש ב-Dockerfile המסופק:

```bash
# בניית הimage
docker build -t status-monitor .

# הרצה
docker run -p 3001:3001 status-monitor
```

ולאחר מכן Push לרישום Container Registry הרלוונטי.

### 5. VPS (DigitalOcean / Linode / Hetzner)

```bash
# התקנת Node.js ו-PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# פריסה
cd /var/www
git clone <your-repo>
cd status-monitor/backend
npm install --production

# הפעלה כשירות
pm2 start server.js --name status-monitor
pm2 save
pm2 startup
```

הוסף Nginx כ-reverse proxy ו-SSL דרך Let's Encrypt.

## API Endpoints

| Method | נתיב | תיאור |
|--------|------|--------|
| `GET` | `/api/health` | בריאות השרת |
| `GET` | `/api/services` | רשימת השירותים המוגדרים |
| `GET` | `/api/status` | סטטוסים של כל השירותים |
| `GET` | `/api/status/:id` | סטטוס של שירות ספציפי |
| `GET` | `/api/history` | סיכום uptime ל-7 ימים לכל השירותים |
| `GET` | `/api/history/:id` | היסטוריה גולמית של שירות ספציפי |
| `GET` | `/api/stats` | סטטיסטיקות על מספר הדגימות והשירותים |
| `POST` | `/api/cache/clear` | ניקוי קאש |

### דוגמה לתשובה

```json
{
  "cached": false,
  "fetchedAt": 1715539200000,
  "services": [
    {
      "id": "spotify",
      "name": "Spotify",
      "hebrewName": "ספוטיפיי",
      "category": "מוזיקה",
      "status": "ok",
      "statusText": "כל המערכות פועלות",
      "description": "All Systems Operational",
      "incidents": [],
      "lastUpdated": "2026-05-12T18:00:00Z"
    }
  ]
}
```

## הוספת שירותים חדשים

ערוך את `backend/services.js` והוסף ערך חדש למערך `SERVICES`:

```javascript
{
  id: 'discord',
  name: 'Discord',
  hebrewName: 'דיסקורד',
  category: 'מסרים',
  type: 'statuspage',
  apiUrl: 'https://discordstatus.com/api/v2/summary.json',
  publicUrl: 'https://discordstatus.com',
  color: '#5865F2',
  icon: 'discord'  // צריך להוסיף אייקון ל-frontend/public/app.js
}
```

הוסף את האייקון כ-SVG באובייקט `SERVICE_ICONS` ב-`frontend/public/app.js`.

### סוגי שירותים נתמכים

| Type | תיאור | דוגמאות |
|------|-------|---------|
| `statuspage` | API סטנדרטי של Atlassian Statuspage | Spotify, Discord, Cloudflare, GitHub |
| `apple` | פורמט של Apple System Status | Apple Music, iCloud |
| `meta` | דפי הסטטוס של Meta | Facebook, Instagram, WhatsApp |
| `google` | Google Apps Status | YouTube, Gmail, Drive |

## טכנולוגיות

- **Backend**: Node.js + Express
- **Frontend**: HTML + CSS + JavaScript (vanilla, ללא frameworks)
- **גופנים**: Heebo (עברית) + JetBrains Mono (מספרים)
- **Caching**: node-cache (60 שניות)

## הערות חשובות

- **Rate Limiting**: ה-Caching בשרת מוודא שהאתר לא יציף את ה-APIs של ספקי השירותים. אל תקטין את ה-TTL מתחת ל-30 שניות.
- **CORS**: ה-API פתוח כברירת מחדל. אם תרצה להגביל את הגישה, ערוך את הגדרת ה-CORS ב-`server.js`.
- **שירותי Meta**: עבור Facebook/Instagram/WhatsApp - יש סיכוי ש-API לא יחזיר תשובה תקינה (כי Meta לא חושף API פתוח). המערכת תיפול ל-fallback של בדיקת זמינות בסיסית.

## על מערכת ההיסטוריה

המערכת מתעדת אוטומטית את סטטוס השירותים **כל 5 דקות** וזה מאפשר:

- **גרף uptime ל-7 ימים אחורה** מוצג בכל כרטיס עם 7 עמודות (אחת ליום)
- **Tooltip בריחוף** מציג את התאריך, אחוז uptime וסטטוס היום
- **חישוב חכם**: דגימות "לא ידוע" אינן נספרות. אזהרות נספרות כ-50% uptime. תקלות כ-0%.
- **שמירה ב-JSON**: הנתונים נשמרים ב-`backend/data/history.json` (נוצר אוטומטית). פורמט מצומצם לחסכון - מאות דגימות יתפסו פחות מ-100KB.
- **ניקוי אוטומטי**: רשומות מעל 7 ימים נמחקות אוטומטית.

### חשוב לפריסה לענן:

אם אתה פורס ל-Render/Railway/שירותים דומים, ייתכן שהקובץ history.json יימחק בכל פריסה מחדש (בגלל ephemeral filesystem). כדי לשמור את ההיסטוריה לאורך זמן:

- **Render**: הוסף [Persistent Disk](https://render.com/docs/disks) והגדר `HISTORY_FILE=/var/data/history.json` כמשתנה סביבה
- **Railway**: השתמש ב-[Volumes](https://docs.railway.com/guides/volumes) באופן דומה
- **VPS / Docker**: וודא שהתיקייה `backend/data` נשמרת מחוץ לקונטיינר (volume mount)

ניתן להגדיר את הנתיב דרך משתנה הסביבה `HISTORY_FILE`.

## רישיון

MIT - חופשי לשימוש ולשינוי.
