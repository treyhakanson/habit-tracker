import { useCallback, useMemo, useState } from "react";
import { colorBandsForEmoji } from "./color-utils";
import { Check } from "react-feather";
import { Item } from "./CreateListItem";

interface Props extends Item {
  name: string;
  onComplete: (text: string, date: string, minutes: string) => void;
}

enum ItemStatus {
  Initial = "Initial",
  Completed = "Completed",
  ActionsShown = "ActionsShown",
  ActionsHidden = "ActionsHidden",
}

export function ListItem({
  name,
  emoji,
  text,
  lastCompletion,
  onComplete,
}: Props) {
  let initialStatus = ItemStatus.ActionsHidden;
  if (lastCompletion != null) {
    const lastCompletedDt = new Date(lastCompletion.date);
    initialStatus =
      lastCompletedDt.toDateString() === new Date().toDateString()
        ? ItemStatus.Completed
        : ItemStatus.ActionsHidden;
  }

  const [minutes, setMinutes] = useState(lastCompletion?.minutes ?? "");
  const [prevStatus, setPrevStatus] = useState(ItemStatus.Initial);
  const [status, setStatus] = useState<ItemStatus>(initialStatus);
  const completed = status === ItemStatus.Completed;

  const animationClass = useMemo(() => {
    if (prevStatus === ItemStatus.Initial) {
      return "";
    }
    switch (status) {
      case ItemStatus.ActionsHidden:
      case ItemStatus.Completed:
        return "List__Item__Action--hide";
      case ItemStatus.ActionsShown:
        return "List__Item__Action--show";
    }
  }, [prevStatus, status]);

  const completeItem = useCallback(() => {
    const dt = new Date().toISOString();
    setPrevStatus(status);
    setStatus(ItemStatus.Completed);

    const entries = JSON.parse(localStorage.getItem("entries") ?? "[]");
    entries.push([dt, name, minutes]);
    localStorage.setItem("entries", JSON.stringify(entries));

    onComplete(text, dt, minutes);
  }, [name, text, minutes, status, onComplete]);

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
      setPrevStatus(status);
      setStatus(
        e.target.value === ""
          ? ItemStatus.ActionsHidden
          : ItemStatus.ActionsShown
      );
    },
    [status]
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
          onChange={onChangeMinutes}
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
        className={`List__Item__Action List__Item__Action--submit ${animationClass}`}
        onClick={() => completeItem()}
      >
        <Check color="white" />
      </button>
    </div>
  );
}
