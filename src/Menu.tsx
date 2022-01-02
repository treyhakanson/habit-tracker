import { useCallback, useRef } from "react";
import { Download, Trash2, X } from "react-feather";
import { Button } from "./Button";

interface Props {
  visible: boolean;
  onHide: () => void;
  onClear: () => void;
}

export function Menu({ visible, onHide, onClear }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  const hideMenu = useCallback(() => {
    menuRef.current?.classList.add("MenuWrapper__FadeOut");
  }, []);

  const clearEntries = useCallback(() => {
    localStorage.setItem("items", "[]");
    localStorage.setItem("entries", "[]");
    menuRef.current?.classList.add("MenuWrapper__FadeOut");
    onClear();
  }, [onClear]);

  const downloadEntries = useCallback(() => {
    const entries = localStorage.getItem("entries") ?? "[]";
    const jsonFile = new Blob([entries], { type: "application/json" });

    const downloadLink = document.createElement("a");
    downloadLink.download = "entries.json";
    downloadLink.href = window.URL.createObjectURL(jsonFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      downloadLink.remove();
    }, 0);
  }, []);

  if (!visible) {
    return <noscript />;
  }

  return (
    <div
      ref={menuRef}
      className="MenuWrapper"
      onAnimationEnd={(e) => {
        if (e.animationName === "Menu--fade-out") {
          onHide();
        }
      }}
    >
      <div className="Menu">
        <div className="Menu__Header">
          <h2>Menu</h2>
          <button className="IconButton" type="button" onClick={hideMenu}>
            <X size={18} color="var(--icon--primary)" />
          </button>
        </div>
        <div className="Menu__Content">
          <Button
            onClick={downloadEntries}
            text="Download Entries"
            icon={<Download />}
          />
          <Button
            onClick={clearEntries}
            text="Clear Entries"
            icon={<Trash2 />}
            type="negative"
          />
        </div>
      </div>
    </div>
  );
}
