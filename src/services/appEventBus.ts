type AppEventMap = {
  "resources:changed": undefined;
  "chapter2:state-changed": undefined;
  "adventure:state-changed": undefined;
  "starpoint:completed": { id: string; ideaText: string };
};

type Handler<Payload> = (payload: Payload) => void;

class TypedEventBus<Events extends Record<string, unknown>> {
  private readonly handlers = new Map<keyof Events, Set<Handler<unknown>>>();

  on<Key extends keyof Events>(
    event: Key,
    handler: Handler<Events[Key]>
  ): () => void {
    const eventHandlers =
      this.handlers.get(event) ?? new Set<Handler<unknown>>();

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
    if (!eventHandlers) return;

    for (const handler of eventHandlers) {
      handler(payload);
    }
  }
}

export const appEventBus = new TypedEventBus<AppEventMap>();
