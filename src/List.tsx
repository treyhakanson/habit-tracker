import { useCallback, useMemo, useState, useEffect } from "react";
import { CreateListItem, Item } from "./CreateListItem";
import { exlpodeEmoji } from "./exploder";
import { ListItem } from "./ListItem";

export function List() {
  const localItems = JSON.parse(
    localStorage.getItem("items") || "[]"
  ) as Array<Item>;
  const [items, setItems] = useState<Array<Item>>(localItems);

  const addItem = useCallback(
    (item: Item) => {
      const nextItems = [...items, item];
      localStorage.setItem("items", JSON.stringify(nextItems));
      setItems(nextItems);
    },
    [items]
  );

  const onCompleteItem = useCallback(
    (text: string, date: string, minutes: string) => {
      let localItems = JSON.parse(
        localStorage.getItem("items") ?? "[]"
      ) as Array<Item>;
      const itemToUpdate = localItems.find(
        (item) => item.text === text
      ) as Item;
      itemToUpdate.lastCompletion = { date: date, minutes };
      localStorage.setItem("items", JSON.stringify(localItems));
      setItems(localItems);
    },
    []
  );

  const allComplete = useMemo(() => {
    const incomplete = items.filter((item) => {
      if (item.lastCompletion == null) {
        return true;
      }
      const lastCompletedDt = new Date(item.lastCompletion.date);
      return lastCompletedDt.toDateString() !== new Date().toDateString();
    });
    return incomplete.length === 0;
  }, [items]);

  useEffect(() => {
    if (allComplete) {
      // Give animations time to complete
      setTimeout(() => {
        exlpodeEmoji({
          emoji: "⭐️",
          fontSize: "32px",
          origin: { x: window.innerWidth / 2, y: window.innerHeight / 5 },
          count: 8,
        });
      }, 1500);
    }
  }, [allComplete]);

  return (
    <div className="List">
      <header className="Header1">Habit Tracker</header>
      {allComplete && (
        <p className="List__Complete">All tasks completed for today 🎉</p>
      )}
      {items.map((item, i) => (
        <ListItem
          key={i}
          name={item.text.toLowerCase().replaceAll(/\s/g, "_")}
          {...item}
          onComplete={onCompleteItem}
        />
      ))}
      <CreateListItem onCreate={addItem} />
    </div>
  );
}
