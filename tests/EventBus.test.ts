import { describe, expect, it } from "vitest";
import { gameEventBus } from "../src/game/EventBus";

describe("gameEventBus", () => {
  it("emits typed events and supports unsubscribe", () => {
    let received = "";

    const off = gameEventBus.on("scene:ready", ({ sceneKey }) => {
      received = sceneKey;
    });

    gameEventBus.emit("scene:ready", { sceneKey: "HangarScene" });
    expect(received).toBe("HangarScene");

    off();
    gameEventBus.emit("scene:ready", { sceneKey: "OtherScene" });
    expect(received).toBe("HangarScene");

    gameEventBus.clear();
  });
});
