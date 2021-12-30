import { useCallback, useEffect, useMemo, useState } from "react";
import { colorBandsForEmoji } from "./color-utils";
import { Check, X } from "react-feather";
import { Item } from "./CreateListItem";

interface Props extends Item {
  name: string;
  deleting: boolean;
  onComplete: (text: string, date: string, minutes: string) => void;
}

export function ListItem({
  name,
  emoji,
  text,
  lastCompletion,
  onComplete,
  deleting,
}: Props) {
  let initialCompleted = false;
  if (lastCompletion != null) {
    const lastCompletedDt = new Date(lastCompletion.date);
    initialCompleted =
      lastCompletedDt.toDateString() === new Date().toDateString();
  }

  const [minutes, setMinutes] = useState(lastCompletion?.minutes ?? "");
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
  }, [deleting, rightActionsShown]);

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
        prev: rightActionsShown,
        current: e.target.value !== "",
      });
    },
    [rightActionsShown]
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
  if (prevLeftActionsShown !== leftActionsShown) {
    leftActionsAnimationClass = leftActionsShown
      ? "List__Item__Action--show"
      : "List__Item__Action--hide";
  }

  return (
    <div className="List__ItemWrapper">
      <button
        type="button"
        className={`List__Item__Action List__Item__Action--delete ${leftActionsAnimationClass}`}
        onClick={() => alert("Deleting")}
      >
        <X color="white" />
      </button>
      <div className={`List__Item ${completed ? "List__Item--completed" : ""}`}>
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
        <input
          id={`${name}__minutes`}
          name={`${name}__minutes`}
          className="List__Item__Input"
          type="number"
          placeholder="0"
          value={minutes}
          onChange={onChangeMinutes}
          onKeyPress={onKeyPress}
          maxLength={4}
        />
        <label
          htmlFor={`${name}__minutes`}
          className="List__Item__InputPostfix"
        >
          {minutesPostfix}
        </label>
      </div>
      <button
        type="button"
        className={`List__Item__Action List__Item__Action--submit ${rightActionsAnimationClass}`}
        onClick={() => completeItem()}
      >
        <Check color="white" />
      </button>
    </div>
  );
}
