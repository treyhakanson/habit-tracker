import { useCallback, useEffect, useMemo, useState } from "react";
import { colorBandsForEmoji } from "./color-utils";
import { Check, X } from "react-feather";
import { Item } from "./CreateListItem";

interface Props extends Item {
  name: string;
  deleting: boolean;
  onComplete: (text: string, date: string, minutes: string) => void;
  onDelete: (text: string) => void;
}

export function ListItem({
  emoji,
  text,
  lastCompletion,
  name,
  onComplete,
  onDelete,
  deleting,
}: Props) {
  let initialCompleted = false;
  let initialMinutes = "";
  if (lastCompletion != null) {
    const lastCompletedDt = new Date(lastCompletion.date);
    initialCompleted =
      lastCompletedDt.toDateString() === new Date().toDateString();
    initialMinutes = initialCompleted ? lastCompletion.minutes : "";
  }

  const [deleted, setDeleted] = useState(false);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [completed, setCompleted] = useState(initialCompleted);
  const [
    { prev: prevRightActionsShown, current: rightActionsShown },
    setRightActionsShown,
  ] = useState({ prev: false, current: false });
  const [
    { prev: prevLeftActionsShown, current: leftActionsShown },
    setLeftActionsShown,
  ] = useState({ prev: false, current: false });

  useEffect(() => {
    if (deleting) {
      setLeftActionsShown({ prev: false, current: true });
      setRightActionsShown({ prev: rightActionsShown, current: false });
    } else {
      setLeftActionsShown({ prev: true, current: false });
      setRightActionsShown({
        prev: false,
        current: !completed && minutes !== "",
      });
    }
  }, [deleting, rightActionsShown, completed, minutes]);

  const completeItem = useCallback(() => {
    const dt = new Date().toISOString();
    setCompleted(true);
    setRightActionsShown({ prev: rightActionsShown, current: false });

    const entries = JSON.parse(localStorage.getItem("entries") ?? "[]");
    entries.push([dt, name, minutes]);
    localStorage.setItem("entries", JSON.stringify(entries));

    onComplete(text, dt, minutes);
  }, [name, text, minutes, rightActionsShown, onComplete]);

  const onKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter" || minutes === "") {
        return;
      }

      completeItem();
    },
    [minutes, completeItem]
  );

  const onChangeMinutes = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMinutes(e.target.value);
      setRightActionsShown({
        prev: e.target.value === "",
        current: e.target.value !== "",
      });
    },
    []
  );

  const emojiGradient = useMemo(() => {
    const { p25, p50, p75 } = colorBandsForEmoji(emoji);
    return `linear-gradient(${p25},${p50},${p75})`;
  }, [emoji]);

  const minutesPostfix = parseInt(minutes, 10) > 1 ? "mins" : "min";

  let rightActionsAnimationClass = "";
  if (prevRightActionsShown !== rightActionsShown) {
    rightActionsAnimationClass = rightActionsShown
      ? "List__Item__Action--show"
      : "List__Item__Action--hide";
  }

  let leftActionsAnimationClass = "";
  if (deleted || prevLeftActionsShown !== leftActionsShown) {
    leftActionsAnimationClass =
      !deleted && leftActionsShown
        ? "List__Item__Action--show"
        : "List__Item__Action--hide";
  }

  return (
    <div
      className={`List__ItemWrapper ${
        deleted ? "List__ItemWrapper--deleted" : ""
      }`}
      onAnimationEnd={(e) => {
        if (e.animationName === "List__ItemWrapper__FadeOut") {
          onDelete(text);
        }
      }}
    >
      <button
        tabIndex={leftActionsShown ? 0 : -1}
        type="button"
        className={`List__Item__Action List__Item__Action--delete ${leftActionsAnimationClass}`}
        onClick={() => {
          setDeleted(true);
        }}
      >
        <X color="white" />
      </button>
      <div
        className={`List__Item ${completed ? "List__Item--completed" : ""} ${
          deleted ? "List__Item--deleted" : ""
        }`}
      >
        <div
          className="List__Item__Border"
          style={{ background: emojiGradient }}
        />
        {completed && (
          <div className="List__Item__CompletedBanner">
            <p className="List__Item__CompletedBanner__Text">
              Completed <strong>{text}</strong>
            </p>
            <p className="List__Item__CompletedBanner__Time">
              {minutes} {minutesPostfix}
            </p>
          </div>
        )}
        <p className="List__Item__Emoji">{emoji}</p>
        <p className="List__Item__Text">{text}</p>
        <form action="#" onSubmit={(e) => e.preventDefault()}>
          <input
            tabIndex={0}
            id={`${name}__minutes`}
            name={`${name}__minutes`}
            className="List__Item__Input"
            type="number"
            inputMode="numeric"
            enterKeyHint="done"
            placeholder="0"
            value={minutes}
            onChange={onChangeMinutes}
            onKeyPress={onKeyPress}
            maxLength={4}
            disabled={deleting}
          />
        </form>
        <label
          htmlFor={`${name}__minutes`}
          className="List__Item__InputPostfix"
          style={{
            color:
              minutes === "" ? "var(--text-color--placeholder)" : undefined,
          }}
        >
          {minutesPostfix}
        </label>
      </div>
      <button
        type="button"
        tabIndex={rightActionsShown ? 0 : -1}
        className={`List__Item__Action List__Item__Action--submit ${rightActionsAnimationClass}`}
        onClick={() => completeItem()}
      >
        <Check color="white" />
      </button>
    </div>
  );
}
