# Louis & die Sternenreiter

Ein kindgerechtes Sci-Fi-Abenteuerspiel über Entdecken, Reisen, Tüfteln und das kreative Weitergestalten einer gemeinsamen Galaxie.

## Kernidee

Charly, Philipp und Olli sind als eigene Profile mit individuellen Avataren spielbar. Louis ist ihr gemeinsamer tierischer Begleiter, Erzähler, Vorlese-Helfer und die natürliche Schnittstelle, über die Kinder eigene Ideen für neue Reisen, Orte, Figuren und Missionen einreichen.

Das Spiel besitzt eine abgeschlossene Hauptgeschichte mit sechs Kapiteln und einem echten Ende. Nach dem Finale wird ein Modus für freie Reisen freigeschaltet.

## Technischer Zielstack

- React + TypeScript + Vite für App und UI
- Phaser für das 2D/2.5D-Hauptspiel
- Babylon.js gezielt für 3D-Schiff und besondere Ansichten
- Supabase für Auth, Datenbank, Storage und Edge Functions
- PWA für Browser, iPhone/iPad und Desktop
- Phaser/Web Audio für Musik und Sound
- Web Speech API als erste kostenlose Basis für Vorlesen und Spracheingabe
- GitHub Issues als geprüfter Entwicklungs-Backlog

## Grundsätze

- keine dedizierte oder realistische Gewalt als Spielkern
- Fokus auf Entdecken, Helfen, Rätsel, Reparieren, Handeln und Gestalten
- Space-Western + Garage-Punk + warme Sci-Fi
- Welt-Canon, Spielstand und Kinderideen sind strikt getrennt
- Kinderideen werden nie automatisch Canon
- Louis hält Story, Weltwissen und Ideenfluss zusammen
- spielrelevante Informationen sollen lesbar und vorlesbar sein
- Spracheingabe ist eine gleichwertige Alternative zur Texteingabe

Weitere verbindliche Entscheidungen liegen unter `docs/`.


## Kostenlose Wunsch-KI

Freie Wünsche an Sternenpunkten können über Cloudflare Workers AI interpretiert werden. Die KI liefert nur einen strukturierten Bauplan; die Spielregeln bleiben die einzige Instanz, die Weltzustand verändern darf.

Deployment des Workers:

```bash
npx wrangler deploy
```

Anschließend die öffentliche Worker-URL als `VITE_WISH_API_URL` beim Web-Build setzen. Ohne diese Variable bleibt die App funktionsfähig und speichert/übernimmt freie Wünsche als Offline-Entwurf statt auf einen kostenpflichtigen KI-Anbieter auszuweichen.

Der Worker nutzt die Workers-AI-Bindung `AI` aus `wrangler.toml`. Optional kann `ALLOWED_ORIGIN` auf die produktive GitHub-Pages-Origin begrenzt werden.
