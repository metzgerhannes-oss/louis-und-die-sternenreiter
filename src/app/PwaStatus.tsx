import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaStatus() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <aside className="pwa-toast" aria-live="polite">
      <p>
        {offlineReady
          ? "Louis & die Sternenreiter ist jetzt auch ohne Verbindung startbereit."
          : "Eine neue Version ist verfügbar."}
      </p>
      <div className="pwa-actions">
        {needRefresh && (
          <button type="button" onClick={() => void updateServiceWorker(true)}>
            Aktualisieren
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setOfflineReady(false);
            setNeedRefresh(false);
          }}
        >
          Schließen
        </button>
      </div>
    </aside>
  );
}
