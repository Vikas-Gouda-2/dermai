# DermAI

AI-powered skin health analyzer with real-time face detection, personalized product recommendations, and downloadable reports.

## Features

- 🎥 Real-time camera scan with face detection
- 🤖 AI-powered skin condition analysis
- 💊 Personalized product recommendations
- 📄 Generate downloadable PDF reports
- 👤 User authentication with Firebase
- 📊 Scan history and progress tracking

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS
- **Backend:** FastAPI (Python 3.11+)
- **Authentication:** Firebase
- **Database:** Firestore
- **Hosting:** Vercel (frontend) + Render (backend)

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Firebase project

### Installation

**Backend:**
```bash
cd BACKEND
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

**Frontend:**
```bash
cd "FRONTEND "
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:5173`

## API Endpoints

**Analysis:**
- `POST /api/analyse` - Analyze skin from image
- `GET /api/recommendations` - Get product recommendations

**Users:**
- `POST /api/users/register` - Register user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/scan-history` - Get past scans
- `DELETE /api/users/account` - Delete account

**Reports:**
- `POST /api/reports/generate` - Generate PDF report
- `GET /api/reports/{id}` - Get report
- `DELETE /api/reports/{id}` - Delete report

## Project Structure

```
├── BACKEND/
│   ├── main.py
│   ├── requirements.txt
│   ├── routers/
│   ├── services/
│   └── data/
│
└── FRONTEND /
    ├── src/
    │   ├── pages/
    │   ├── context/
    │   └── utils/
    ├── package.json
    └── vite.config.js
```

## Environment Variables

Create `.env` files using `.env.example` templates:

**Backend (.env):**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email
```

**Frontend (.env.local):**
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_API_URL=http://localhost:8000
```

## License

MIT License
