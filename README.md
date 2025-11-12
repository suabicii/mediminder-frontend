# MediMinder Frontend

Aplikacja frontendowa dla MediMinder - systemu monitorowania leczenia i suplementacji.

## 🚀 Szybki Start

### Wymagania
- Node.js 18+ 
- npm lub yarn

### Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Skonfiguruj zmienne środowiskowe:
```bash
cp env.example .env
```

3. Edytuj plik `.env` i ustaw URL backendu:
```bash
VITE_API_URL=http://localhost:8000
```

4. Uruchom aplikację w trybie deweloperskim:
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:5173

## 🔧 Konfiguracja

### Zmienne Środowiskowe

- `VITE_API_URL` - URL backendu Django (domyślnie: http://localhost:8000)

### Połączenie z Backendem

Aplikacja automatycznie łączy się z backendem Django pod adresem `/api/health/` aby sprawdzić status połączenia.

## 📁 Struktura Projektu

```
src/
├── components/          # Komponenty React
│   ├── ui/             # Komponenty UI (shadcn/ui)
│   └── HealthCheck.tsx # Komponent sprawdzania zdrowia API
├── pages/              # Strony aplikacji
├── lib/                # Utilities
│   └── api.ts          # Konfiguracja Axios
├── App.tsx             # Główny komponent
├── main.tsx            # Punkt wejścia
└── index.css           # Style Tailwind CSS
```

## 🛠️ Dostępne Skrypty

- `npm run dev` - Uruchom serwer deweloperski
- `npm run build` - Zbuduj aplikację do produkcji
- `npm run preview` - Podgląd zbudowanej aplikacji
- `npm run lint` - Sprawdź kod ESLint

## 🎨 Technologie

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## 🔗 Integracja z Backendem

Frontend komunikuje się z backendem Django przez REST API:

- **Health Check**: `GET /api/health/`
- **Authentication**: JWT tokens (przygotowane)
- **CORS**: Skonfigurowane dla localhost:5173

## 📱 Funkcjonalności

- ✅ Sprawdzanie statusu połączenia z backendem
- ✅ Responsywny design (mobile-first)
- ✅ TypeScript dla type safety
- ✅ Przygotowane do rozszerzenia o funkcje MediMinder

## 🚀 Deployment

Aplikacja jest przygotowana do deploy na Vercel:

1. Połącz repozytorium z Vercel
2. Ustaw zmienne środowiskowe w panelu Vercel
3. Automatyczny deploy przy każdym push do main branch