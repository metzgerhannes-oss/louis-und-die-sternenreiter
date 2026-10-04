import { useState } from "react";
import type { PlayerProfile } from "../domain/profiles";
import { FixedSceneStage } from "../features/scenes/FixedSceneStage";
import { ProfileSelect } from "../features/profiles/ProfileSelect";
import { getChapter1Objective, loadChapter1State } from "../services/chapter1State";
import { loadCrewResources } from "../services/crewResources";
import {
  clearActiveProfile,
  loadActiveProfile,
  saveActiveProfile
} from "../services/profileStorage";
import { browserSpeech } from "../services/speech/browserSpeech";
import { PwaStatus } from "./PwaStatus";

export function App() {
  const [activeProfile, setActiveProfile] = useState<PlayerProfile | null>(() =>
    loadActiveProfile()
  );

  const selectProfile = (profile: PlayerProfile) => {
    saveActiveProfile(profile);
    setActiveProfile(profile);
  };

  const switchProfile = () => {
    browserSpeech.stop();
    clearActiveProfile();
    setActiveProfile(null);
  };

  if (!activeProfile) {
    return (
      <>
        <ProfileSelect onSelect={selectProfile} />
        <PwaStatus />
      </>
    );
  }

  const resources = loadCrewResources();
  const mission = getChapter1Objective(loadChapter1State());

  return (
    <main className="app-shell">
      <FixedSceneStage
        profile={activeProfile}
        mission={mission}
        stardust={resources.stardust}
        onSwitchProfile={switchProfile}
      />
      <PwaStatus />
    </main>
  );
}
