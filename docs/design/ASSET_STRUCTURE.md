# Asset- und Designablage

## Grundsatz

Es gibt drei getrennte Ebenen:

### 1. Dokumentierte Designquelle
`docs/design/`

Hier liegen Regeln und freigegebene visuelle Referenzen.

### 2. Runtime-Assets
`public/assets/`

Nur optimierte Dateien, die das Spiel tatsächlich lädt.

### 3. Source-Art
Große editierbare Quelldateien werden nicht automatisch in den normalen Web-Build übernommen.

## Vorgeschlagene Struktur

```
docs/
  design/
    DESIGN_SYSTEM_V1.md
    AVATAR_SYSTEM_V1.md
    PRODUCT_LAYOUTS_V1.md
    ASSET_STRUCTURE.md
    reference/
      ASSET_MANIFEST.md
      avatars/
        charly/
        philipp/
        olli/
        louis/
      layouts/
        l01-profile-select/
        l02-game-hud/
        l03-louis-dialog/
        l04-creator/
        l05-star-map/
        l06-journal/
        l07-ship/
        l08-hangar-upgrade/
        l09-results/
        l10-parent-review/
      world/
        hangar/
        ships/
        cinder/
        moss/
        junction-12/

public/
  assets/
    avatars/
      charly/
      philipp/
      olli/
      louis/
    environments/
      hangar/
      cinder/
      moss/
      junction-12/
    ships/
    props/
    ui/
      icons/
      textures/
    audio/
      music/
      ambient/
      sfx/
      voice/
```

## ASSET_MANIFEST

Jedes freigegebene Asset bekommt einen Eintrag:

```
ID:
Name:
Version:
Status: draft | approved | replaced
Reference file:
Runtime file:
Used by:
Approved date:
Notes:
```

Das verhindert, dass später unklar ist, welche Grafik die freigegebene Version war.

## Versionsregel

Dateien:
- `*_v1`
- `*_v2`

Nicht:
- `final`
- `final2`
- `neu`
- `wirklich_final`

Wenn V2 freigegeben wird, bleibt V1 im Manifest als ersetzt dokumentiert.

## Große Quelldateien

Krita/Blender/PSD-artige Arbeitsdateien können sehr groß werden.

Empfehlung:
- kleine relevante Source-Files optional unter `art-source/`
- große Binärdateien nicht in normale Git-Historie kippen
- im Manifest immer festhalten, wo der Master erzeugt wurde

Runtime-Exports bleiben immer im Repository.
