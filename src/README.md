# src

Aktive Struktur nach der Fixed-Scene-Neuausrichtung:

- `app/` – App-Shell und PWA-Status
- `features/scenes/` – feste Point-and-Click-Szenen und Hotspots
- `features/story/` – Storydialoge
- `features/starpoints/` – Sternenpunkte / kreative Lösungsdialoge
- `features/companion/` – Louis und Einstellungen
- `features/profiles/` – Profilwahl
- `features/speech/` – Vorlesen und Spracheingabe
- `domain/` – Story, Regeln und Typen
- `services/` – Persistenz, Supabase, Audio/Speech und App-Events

Es gibt bewusst **keinen `game/`-Renderer mehr**. Szenen werden mit React/CSS als feste Illustrationen mit responsiven Hotspots umgesetzt.
