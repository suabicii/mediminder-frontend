# MediMinder Frontend - Instrukcje Uruchomienia

## ✅ Status Projektu

Projekt frontendowy MediMinder został pomyślnie utworzony i skonfigurowany zgodnie ze specyfikacją z pliku `mediminder-stack.md`.

## 🚀 Jak Uruchomić

### 1. Uruchom Backend Django
```bash
cd /home/michael/Documents/Projekty/mediminder/mediminder-backend
python manage.py runserver 8000
```

### 2. Uruchom Frontend React
```bash
cd /home/michael/Documents/Projekty/mediminder/mediminder-frontend
npm run dev
```

### 3. Otwórz Aplikację
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/health/

## 🔧 Funkcjonalności

### ✅ Zaimplementowane
- **React 18** z TypeScript
- **Vite** jako build tool
- **Tailwind CSS** dla stylowania
- **Axios** do komunikacji z API
- **Health Check** - przycisk do sprawdzania połączenia z backendem
- **Responsywny design** (mobile-first)
- **CORS** skonfigurowane poprawnie

### 🎯 Test Health Check
1. Otwórz http://localhost:5173
2. Kliknij przycisk "Check Health"
3. Sprawdź czy otrzymujesz odpowiedź z backendu Django

## 📁 Struktura Projektu

```
mediminder-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (pusty)
│   │   └── HealthCheck.tsx     # Komponent health check
│   ├── pages/                  # Strony (pusty)
│   ├── lib/
│   │   └── api.ts             # Konfiguracja Axios
│   ├── App.tsx                # Główny komponent
│   ├── main.tsx               # Punkt wejścia
│   └── index.css              # Style Tailwind
├── package.json               # Zależności npm
├── vite.config.ts             # Konfiguracja Vite
├── tailwind.config.js         # Konfiguracja Tailwind
├── tsconfig.json              # Konfiguracja TypeScript
└── README.md                  # Dokumentacja
```

## 🔗 Połączenie z Backendem

Frontend automatycznie łączy się z backendem Django:
- **URL**: `http://localhost:8000` (konfigurowalny przez `.env`)
- **Endpoint**: `/api/health/`
- **CORS**: Skonfigurowane dla `http://localhost:5173`

## 🛠️ Dostępne Komendy

```bash
npm run dev      # Uruchom serwer deweloperski
npm run build    # Zbuduj aplikację do produkcji
npm run preview  # Podgląd zbudowanej aplikacji
npm run lint     # Sprawdź kod ESLint
```

## 🎨 Technologie

- **React 18** - Framework UI
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📱 Następne Kroki

Aplikacja jest gotowa do rozszerzenia o funkcje MediMinder:
- Dashboard z lekami
- System przypomnień
- OCR skanowanie etykiet
- Zarządzanie stanem magazynowym
- Autentykacja użytkowników

## ✅ Test Połączenia

Backend i frontend są poprawnie skonfigurowane i komunikują się ze sobą. Health check endpoint zwraca:

```json
{
  "status": "healthy",
  "service": "MediMinder API", 
  "version": "1.0.0",
  "timestamp": "2025-10-25T14:45:13.426376+00:00",
  "message": "Service is running correctly"
}
```
