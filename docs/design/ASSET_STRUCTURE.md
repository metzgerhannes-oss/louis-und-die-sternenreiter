# Asset- und Designablage

## Grundsatz

Das neue Spiel arbeitet mit **fertigen Szenenillustrationen**, nicht mit zerlegten Character-Rigs.

## Runtime-Struktur

```
public/
  assets/
    crew/
      *-portrait-v*.webp
    scenes/
      hangar/
      cinder/
      moss/
      junction-12/
      ...
    closeups/
      hangar/
      cinder/
      ...
    props/
    ui/
    audio/
```

## Szenenassets

Jede Szenenillustration erhält:
- Scene-ID
- Version
- Status: draft | approved | replaced
- Ziel-Seitenverhältnis
- Hotspot-Liste
- Zustandsvarianten
- Freigabedatum

## Benennung

Beispiele:
- `hangar-main-v1.webp`
- `hangar-workbench-v1.webp`
- `hangar-main-powered-v1.webp`

Keine Dateinamen wie `final2`, `neu` oder `wirklich_final`.

## Nicht mehr verwendet

- `crew-v5/`
- Character-Körperteile
- Lauf-Sprite-Sheets
- Phaser-spezifische Texturen

Porträts bleiben separat, weil sie in Profilwahl und Dialogen wiederverwendet werden.
