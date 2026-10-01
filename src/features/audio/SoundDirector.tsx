import { useEffect, useRef } from "react";
import type { AdventureWorldId } from "../../domain/adventure";
import { gameEventBus } from "../../game/EventBus";
import { loadAudioSettings } from "../../services/audio/audioSettings";
import {
  gameAudio,
  type SoundscapeId
} from "../../services/audio/gameAudio";

type SoundDirectorProps = {
  scene: string;
  worldId: AdventureWorldId;
  dialogOpen: boolean;
  launching: boolean;
  finale: boolean;
};

function soundscapeFor(
  scene: string,
  worldId: AdventureWorldId,
  finale: boolean
): SoundscapeId {
  if (finale) return "heart-of-ways";
  if (scene === "CinderScene") return "cinder";
  if (scene === "AdventureScene") return worldId;
  return "hangar";
}

export function SoundDirector({
  scene,
  worldId,
  dialogOpen,
  launching,
  finale
}: SoundDirectorProps) {
  const lastLaunching = useRef(false);

  useEffect(() => {
    gameAudio.configure(loadAudioSettings());

    const unlock = () => {
      void gameAudio.unlock();
    };

    const refreshSettings = () => {
      gameAudio.configure(loadAudioSettings());
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("sternenreiter:audio-settings", refreshSettings);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener(
        "sternenreiter:audio-settings",
        refreshSettings
      );
    };
  }, []);

  useEffect(() => {
    gameAudio.setSoundscape(soundscapeFor(scene, worldId, finale));
  }, [finale, scene, worldId]);

  useEffect(() => {
    gameAudio.setDucked(dialogOpen || launching || finale);
  }, [dialogOpen, finale, launching]);

  useEffect(() => {
    if (launching && !lastLaunching.current) {
      void gameAudio.unlock().then(() => gameAudio.play("travel"));
    }
    lastLaunching.current = launching;
  }, [launching]);

  useEffect(() => {
    const offScanner = gameEventBus.on("ui:scanner:pulse", () => {
      gameAudio.play("scanner");
    });
    const offStarPoint = gameEventBus.on("starpoint:completed", () => {
      gameAudio.play("starpoint");
    });
    const offResources = gameEventBus.on("resources:changed", () => {
      gameAudio.play("reward");
    });
    const offLouis = gameEventBus.on("interaction:louis", () => {
      gameAudio.play("louis");
    });
    const offInteract = gameEventBus.on("input:interact", () => {
      gameAudio.play("ui-click");
    });
    const offTravel = gameEventBus.on("world:goto", () => {
      gameAudio.play("travel");
    });

    return () => {
      offScanner();
      offStarPoint();
      offResources();
      offLouis();
      offInteract();
      offTravel();
    };
  }, []);

  return null;
}
