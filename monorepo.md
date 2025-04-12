# Migrationsplan: Monorepo-Struktur

## Aktuelle Struktur
```
/
├── client/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       └── types/
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── vite.ts
│   ├── db.ts (optional)
│   └── gemini.ts
└── shared/
    └── schema.ts
```

## Zielstruktur
```
/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes.ts
│   │   │   ├── storage.ts
│   │   │   └── vite.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── pages/
│       │   └── types/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── schema/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ai-helpers/
│   │   ├── src/
│   │   │   ├── gemini-helpers.ts
│   │   │   ├── openai-helpers.ts (optional)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── utils/
│       ├── src/
│       │   ├── date-formatters.ts
│       │   ├── string-utils.ts
│       │   ├── task-helpers.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── turbo.json
└── tsconfig.base.json
```

## 1. Migrationsschritte für Shared-Pakete ✅

### Schema-Paket
- [x] Erstellen von packages/schema/package.json
- [x] Erstellen von packages/schema/tsconfig.json
- [x] Erstellen von packages/schema/src/index.ts mit Typen und Schemas
- [ ] Aktualisieren aller Importe, die auf @shared/schema verweisen

### UI-Paket
- [x] Erstellen von packages/ui/package.json
- [x] Erstellen von packages/ui/tsconfig.json
- [x] Extrahieren gemeinsamer UI-Komponenten aus client/src/components
- [x] Implementieren von Basis-Komponenten (Button, Card, Typography, etc.)
- [ ] Migrieren spezieller UI-Komponenten (EnergyLevelBadge, PriorityBadge, etc.)

### AI-Helpers-Paket
- [x] Erstellen von packages/ai-helpers/package.json
- [x] Erstellen von packages/ai-helpers/tsconfig.json
- [x] Extrahieren von server/gemini.ts als gemini-helpers.ts
- [ ] Implementieren einer OpenAI-Alternative (optional)
- [ ] Vereinheitlichen der API-Schnittstellen

### Utils-Paket
- [x] Erstellen von packages/utils/package.json
- [x] Erstellen von packages/utils/tsconfig.json
- [x] Extrahieren von Hilfsfunktionen aus client/src/lib/utils.ts
- [x] Organisieren nach Kategorien (Datum, String, Task, etc.)

## 2. Migrationsschritte für Apps

### Backend App
- [ ] Erstellen von apps/backend/package.json mit Abhängigkeiten zu @adhd-Paketen
- [ ] Erstellen von apps/backend/tsconfig.json
- [ ] Migrieren von server/*.ts Dateien nach apps/backend/src/
- [ ] Anpassen der Imports, um @adhd-Pakete zu verwenden

### Frontend App
- [ ] Erstellen von apps/frontend/package.json mit Abhängigkeiten zu @adhd-Paketen
- [ ] Erstellen von apps/frontend/tsconfig.json
- [ ] Migrieren von client/src nach apps/frontend/src
- [ ] Anpassen der Imports, um @adhd-Pakete zu verwenden
- [ ] Konfigurieren des Vite-Builds

## 3. Build- und Dev-Setup

### Root-Konfiguration
- [x] turbo.json für Turborepo-Konfiguration
- [x] tsconfig.base.json für gemeinsame TypeScript-Konfiguration
- [ ] Root package.json für Workspace-Konfiguration

### Scripts
- [ ] Dev-Skript zum gleichzeitigen Starten von Frontend und Backend
- [ ] Build-Skript zum Bauen aller Pakete und Apps
- [ ] Lint- und Test-Skripts

## 4. Testplan
- [ ] Überprüfen der NLP-Funktionalität (Natürliche Spracheingabe)
- [ ] Überprüfen des Aufgaben-CRUD (Erstellen, Lesen, Aktualisieren, Löschen)
- [ ] Überprüfen der AI-Breakdown-Funktionalität
- [ ] Überprüfen der Emoji-Vorschläge
- [ ] Überprüfen der Benutzeroberfläche und Reaktionsfähigkeit

## 5. Vorteile der Monorepo-Struktur

1. **Bessere Code-Organisation**: Klare Trennung von Verantwortlichkeiten
2. **Wiederverwendbarkeit**: Gemeinsam genutzte Pakete können in mehreren Apps verwendet werden
3. **Konsistenz**: Einheitliche API- und UI-Komponenten
4. **Leichtere Wartung**: Unabhängige Updates und Tests einzelner Pakete
5. **Skalierbarkeit**: Einfaches Hinzufügen neuer Funktionen und Apps