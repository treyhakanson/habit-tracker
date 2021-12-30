import { useCallback, useRef } from "react";
import { X } from "react-feather";

interface Props {
  visible: boolean;
  onHide: () => void;
}

export function Menu({ visible, onHide }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  const hideMenu = useCallback(() => {
    menuRef.current?.classList.add("MenuWrapper__FadeOut");
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
      </div>
    </div>
  );
}
