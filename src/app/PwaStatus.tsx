import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

type PwaStatusProps = {
  suppressed?: boolean;
};

export function PwaStatus({ suppressed = false }: PwaStatusProps) {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) {
      void updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  if (suppressed || !offlineReady || needRefresh) {
    return null;
  }

  return (
    <aside className="pwa-toast" aria-live="polite">
      <p>Louis & die Sternenreiter ist jetzt auch ohne Verbindung startbereit.</p>
      <div className="pwa-actions">
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
