import type { StarPointDefinition } from "../domain/starPoints";

export type MoveDirection = "up" | "down" | "left" | "right";

export type HotspotInteraction = {
  id: "ship" | "workbench" | "hangar-door";
  title: string;
  text: string;
};

type GameEventMap = {
  "scene:ready": { sceneKey: string };
  "interaction:louis": undefined;
  "interaction:hotspot": HotspotInteraction;
  "interaction:starpoint": StarPointDefinition;
  "starpoint:completed": { id: string; ideaText: string };
  "ui:louis:ping": undefined;
  "input:move": { direction: MoveDirection; active: boolean };
  "input:interact": undefined;
};

type Handler<Payload> = (payload: Payload) => void;

class TypedEventBus<Events extends Record<string, unknown>> {
  private readonly handlers = new Map<keyof Events, Set<Handler<unknown>>>();

  on<Key extends keyof Events>(event: Key, handler: Handler<Events[Key]>): () => void {
    const eventHandlers = this.handlers.get(event) ?? new Set<Handler<unknown>>();
    eventHandlers.add(handler as Handler<unknown>);
    this.handlers.set(event, eventHandlers);

    return () => {
      eventHandlers.delete(handler as Handler<unknown>);
      if (eventHandlers.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  emit<Key extends keyof Events>(event: Key, payload: Events[Key]): void {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers) {
      return;
    }

    for (const handler of eventHandlers) {
      handler(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const gameEventBus = new TypedEventBus<GameEventMap>();
