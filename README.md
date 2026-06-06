# 4Viso Frontend

Vue 3 frontend for the 4Viso Cargo Intelligence Platform.

## Tech stack

- Vue 3 (Composition API)
- Pinia (state management)
- Vue Router 4
- Axios
- Tailwind CSS
- Vite

## Prerequisites

- Node.js 18 or higher
- npm

## Setup

### 1. Navigate to frontend
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Open `.env` and set:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Start development server
```bash
npm run dev
```

App runs at http://localhost:5173

### 5. Build for production
```bash
npm run build
```

## Project structure
frontend/src/
├── main.js              # App bootstrap
├── App.vue              # Root component
├── api/                 # HTTP layer (one file per domain)
│   ├── client.js        # Axios instance + auto token refresh interceptor
│   ├── auth.js
│   ├── lanes.js
│   ├── nodes.js
│   ├── carriers.js
│   ├── caretakers.js
│   ├── analytics.js
│   └── admin.js
├── stores/              # Pinia state
│   ├── auth.js          # Token, user, role getters
│   ├── lanes.js
│   ├── nodes.js
│   ├── carriers.js
│   ├── caretakers.js
│   └── analytics.js
├── router/
│   └── index.js         # Routes with auth/role guards
├── views/
│   ├── AuthView.vue     # Login / register
│   ├── DashboardView.vue
│   ├── LanesView.vue
│   ├── LaneDetailView.vue
│   ├── BuilderView.vue
│   ├── CaretakersView.vue
│   ├── AnalyticsView.vue
│   └── AdminView.vue
├── components/
│   ├── layout/
│   │   ├── AppLayout.vue
│   │   ├── Sidebar.vue
│   │   └── Topbar.vue
│   ├── ui/
│   │   ├── RiskBadge.vue
│   │   ├── StatusTag.vue
│   │   ├── TempBadge.vue
│   │   ├── RiskFactorTags.vue
│   │   └── WorldMap.vue
│   └── nodes/
│       └── NodeSearch.vue
└── utils/
└── riskFactors.js   # Client-side risk factor calculation

## Views

| Route | View | Access |
|---|---|---|
| /login | AuthView | Guest only |
| /dashboard | DashboardView | All authenticated |
| /lanes | LanesView | All authenticated |
| /lanes/:id | LaneDetailView | All authenticated |
| /builder | BuilderView | Staff + Admin |
| /caretakers | CaretakersView | All authenticated |
| /analytics | AnalyticsView | All authenticated |
| /admin | AdminView | Admin only |

## Security

Three layers of access control:

1. **Router guard** — redirects unauthenticated or unauthorised navigation before component loads
2. **UI guard** — `v-if="auth.canWrite"` hides write controls for read-only roles
3. **API guard** — backend rejects unauthorised requests with 401/403

Token refresh is handled automatically by the Axios interceptor — if a request returns 401 the interceptor pauses the request, refreshes the access token using the stored refresh token, then retries the original request transparently.

## Environment variables

| Variable | Description | Default |
|---|---|---|
| VITE_API_URL | Backend base URL | http://localhost:8000 |