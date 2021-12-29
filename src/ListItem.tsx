import { useCallback, useMemo, useState } from "react";
import { colorBandsForEmoji } from "./color-utils";
import { Check } from "react-feather";
import { Item } from "./CreateListItem";

interface Props extends Item {
  name: string;
  onComplete: (text: string, date: string, minutes: string) => void;
}

export function ListItem({
  name,
  emoji,
  text,
  lastCompletion,
  onComplete,
}: Props) {
  let initialCompleted = false;
  if (lastCompletion != null) {
    const lastCompletedDt = new Date(lastCompletion.date);
    initialCompleted =
      lastCompletedDt.toDateString() === new Date().toDateString();
  }

  const [completed, setCompleted] = useState(initialCompleted);
  const [prevMinutes, setPrevMinutes] = useState("");
  const [minutes, setMinutes] = useState(lastCompletion?.minutes ?? "");

  let animationClass = "";
  if (minutes !== prevMinutes || completed) {
    if (minutes === "" || completed) {
      animationClass = "List__Item__Submit--hide";
    } else {
      animationClass = "List__Item__Submit--show";
    }
  }

  const completeItem = useCallback(() => {
    const dt = new Date().toISOString();
    setCompleted(true);

    const entries = JSON.parse(localStorage.getItem("entries") ?? "[]");
    entries.push([dt, name, minutes]);
    localStorage.setItem("entries", JSON.stringify(entries));

    onComplete(text, dt, minutes);
  }, [name, text, minutes, onComplete]);

  const onKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter" || minutes === "") {
        return;
      }

      completeItem();
    },
    [minutes, completeItem]
  );

  const emojiGradient = useMemo(() => {
    const { p25, p50, p75 } = colorBandsForEmoji(emoji);
    return `linear-gradient(${p25},${p50},${p75})`;
  }, [emoji]);

  const minutesPostfix = parseInt(minutes, 10) > 1 ? "mins" : "min";

  return (
    <div className="List__ItemWrapper">
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
          onChange={(e) => {
            setPrevMinutes(minutes);
            setMinutes(e.target.value);
          }}
          onKeyPress={onKeyPress}
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
        className={`List__Item__Submit ${animationClass}`}
        onClick={() => completeItem()}
      >
        <Check color="white" />
      </button>
    </div>
  );
}
