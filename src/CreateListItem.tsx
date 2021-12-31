import { useCallback, useState } from "react";

export interface Item {
  emoji: string;
  text: string;
  lastCompletion?: {
    date: string;
    minutes: string;
  };
}

interface Props {
  onCreate: (item: Item) => void;
}

export function CreateListItem({ onCreate }: Props) {
  const [item, setItem] = useState("");

  const onKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") {
        return;
      }

      const match = /([\p{EPres}\p{ExtPict}\u200d\ufe0f]+)(.*)/gu.exec(item);
      if (match === null) {
        alert(
          'The input must be an emoji followed by text; for example "🏃‍♂️ Running"'
        );
        return;
      }

      const [, emoji, text] = match;
      onCreate({ emoji, text: text.trim() });
      setItem("");
    },
    [item, onCreate]
  );

  return (
    <div className="List__Create">
      <label className="List__Create__InputLabel" htmlFor="list-create">
        I want to track...
      </label>
      <input
        id="list-create"
        name="list-create"
        className="List__Create__Input"
        value={item}
        placeholder="🤟 A New Hobby"
        onChange={(e) => {
          setItem(e.target.value);
        }}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}
