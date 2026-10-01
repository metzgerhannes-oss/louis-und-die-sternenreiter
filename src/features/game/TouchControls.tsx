import { gameEventBus, type MoveDirection } from "../../game/EventBus";

function setMove(direction: MoveDirection, active: boolean) {
  gameEventBus.emit("input:move", { direction, active });
}

type DirectionButtonProps = {
  direction: MoveDirection;
  label: string;
  className?: string;
};

function DirectionButton({ direction, label, className = "" }: DirectionButtonProps) {
  return (
    <button
      type="button"
      className={`touch-direction ${className}`}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setMove(direction, true);
      }}
      onPointerUp={(event) => {
        setMove(direction, false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => setMove(direction, false)}
      onPointerLeave={(event) => {
        if (event.buttons === 0) {
          setMove(direction, false);
        }
      }}
    >
      {direction === "up" ? "▲" : direction === "down" ? "▼" : direction === "left" ? "◀" : "▶"}
    </button>
  );
}

export function TouchControls() {
  return (
    <div className="touch-controls" aria-label="Touch-Steuerung">
      <div className="touch-dpad">
        <DirectionButton direction="up" label="Nach oben" className="touch-up" />
        <DirectionButton direction="left" label="Nach links" className="touch-left" />
        <DirectionButton direction="right" label="Nach rechts" className="touch-right" />
        <DirectionButton direction="down" label="Nach unten" className="touch-down" />
      </div>
      <button
        type="button"
        className="touch-interact"
        onPointerDown={(event) => {
          event.preventDefault();
          gameEventBus.emit("input:interact", undefined);
        }}
      >
        Aktion
      </button>
    </div>
  );
}
