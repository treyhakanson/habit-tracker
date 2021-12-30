import { useCallback, useMemo, useState, useEffect } from "react";
import { Sliders, Trash2 } from "react-feather";
import { CreateListItem, Item } from "./CreateListItem";
import { exlpodeEmoji } from "./exploder";
import { ListItem } from "./ListItem";
import { Menu } from "./Menu";

export function List() {
  const localItems = JSON.parse(
    localStorage.getItem("items") || "[]"
  ) as Array<Item>;
  const [items, setItems] = useState<Array<Item>>(localItems);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const addItem = useCallback(
    (item: Item) => {
      if (items.findIndex((other) => other.text === item.text) !== -1) {
        alert("You already have this item in your list.");
        return;
      }
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
    return items.length > 0 && incomplete.length === 0;
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
    <>
      <div className="List">
        <div className="List__Header">
          <h2>Habit Tracker</h2>
          <div className="List__Actions">
            <button
              className="IconButton"
              type="button"
              onClick={() => setMenuVisible(true)}
            >
              <Sliders color="var(--icon--primary)" size={18} />
            </button>
            <button
              className="IconButton"
              type="button"
              onClick={() => setDeleting(true)}
            >
              <Trash2 color="var(--icon--primary)" size={18} />
            </button>
          </div>
        </div>
        {allComplete && (
          <p className="List__Complete">All tasks completed for today 🎉</p>
        )}
        {items.map((item, i) => (
          <ListItem
            key={i}
            name={item.text.toLowerCase().replaceAll(/\s/g, "_")}
            onComplete={onCompleteItem}
            {...item}
          />
        ))}
        <CreateListItem onCreate={addItem} />
      </div>
      <Menu visible={menuVisible} onHide={() => setMenuVisible(false)} />
    </>
  );
}
