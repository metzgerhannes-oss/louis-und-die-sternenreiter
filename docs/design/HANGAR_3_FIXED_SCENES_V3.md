# Hangar 3 – Fixed Scenes V3 / SCENES 0.9

## Verbindlicher Abnahmestandard

Kapitel 1 verwendet für jeden Storyschritt eine eigenständige, fachlich passende Szene. Ein Bild darf nicht nur technisch vorhanden sein; es muss den jeweiligen Storyzustand unmittelbar erklären.

### Harte Regeln

1. Vor erfolgreicher Torlösung ist **nirgendwo** freier Außenraum sichtbar.
2. Kühlung ist eine echte Wartungs-/Reparaturszene an der beschädigten Leitung.
3. Navigation ist eine echte Cockpit-/Konsolenszene.
4. Systemtest zeigt ein deutlich aktiveres Schiff als der vorherige Reparaturzustand.
5. Das geschlossene Hangartor ist ein eigenes, massives Motiv.
6. Nach Torlösung wechselt nur die Übersicht bzw. die Torszene auf einen offenen Zustand. Andere Detailansichten werden nicht künstlich mit Sternenraum versehen.
7. Keine zusätzliche Person darf in die Crew eingeführt werden. Die bestehende Crew bleibt unverändert.
8. Hotspots liegen auf dem tatsächlich gemeinten Objekt und dürfen sich in der Übersicht nicht gegenseitig überdecken.
9. Auf Landscape-Telefonen dürfen Missionshinweis, Zielmarkierung und Szenentext nicht gleichzeitig große Teile des Bildes verdecken.
10. Kapitelabschluss verwendet dasselbe native offene Torbild wie die Torszene; kein CSS-Sternenfeld.

## Runtime-Assets

| Zustand | Asset |
| --- | --- |
| Übersicht, Blackout | hangar-main-blackout-v3.webp |
| Übersicht, Werkbank versorgt | hangar-main-powered-v3.webp |
| Übersicht, Schiff aktiviert | hangar-main-active-v3.webp |
| Übersicht, Tor geöffnet | hangar-main-open-v3.webp |
| Energieverteiler | hangar-energy-v3.webp |
| Werkbank, dunkel | hangar-workbench-dark-v3.webp |
| Werkbank, Energiezelle sichtbar | hangar-workbench-v3.webp |
| Schiff, dunkel | hangar-ship-dark-v3.webp |
| Schiff, aktiviert | hangar-ship-v3.webp |
| Kühlleitung | hangar-cooling-v3.webp |
| Navigation | hangar-navigation-v3.webp |
| Systemtest | hangar-systemtest-v3.webp |
| Tor geschlossen | hangar-gate-closed-v3.webp |
| Tor geöffnet | hangar-gate-open-v3.webp |
| Crew/Louis | hangar-crew-v3.webp |

## Storyfolge

1. Intro / dunkler Hangar
2. defekten Energieverteiler untersuchen
3. erster Sternenpunkt
4. Werkbank wird aktiv
5. Energiezelle finden und einsetzen
6. Schiff wacht auf
7. beschädigte Kühlleitung reparieren
8. Navigation reaktivieren und sicheren Kurs nach Cinder finden
9. Systemtest abschließen
10. verklemmtes Hangartor untersuchen
11. zweiter Sternenpunkt
12. Hangartor öffnet
13. Start nach Cinder

## Bedienlogik

Die Übersicht hat fünf getrennte Zielzonen: Werkbank, Energieverteiler, Schiff, Hangartor und Louis. Nach geöffneter Torlösung bleibt in der Übersicht nur der Torweg als aktive Rückkehrmöglichkeit sichtbar, damit abgeschlossene Detailbilder keinen widersprüchlich geschlossenen Torzustand mehr zeigen.

Die Detailhotspots markieren konkrete Objekte:
- Energie: Verteiler
- Werkbank: Energiezelle/Arbeitsbereich
- Schiff: Schiffskörper/Systembereich
- Kühlung: beschädigte Leitung
- Navigation: zentrale Konsole
- Systemtest: aktive Schiffssysteme
- Tor: Torfläche
- Crew: Louis

## Technik

- Generator: `scripts/generate-scene-assets-v3.mjs`
- Runtime-Mapping: `src/features/scenes/HangarFixedScene.tsx`
- Story: `src/domain/chapter1.ts`
- Abschluss: `src/app/App.tsx`
- Asset-Check: `scripts/verify-scene-assets.mjs`
- Tests: `tests/hangarScenes.test.ts`
- sichtbare Kennung: **H3 · SCENES 0.9**
