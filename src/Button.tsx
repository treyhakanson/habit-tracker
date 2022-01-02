import { cloneElement, ReactElement } from "react";
import { IconProps } from "react-feather";

interface Props {
  onClick: () => void;
  text: string;
  icon: ReactElement<IconProps>;
  type?: "default" | "negative";
}

export function Button({ onClick, text, icon, type = "default" }: Props) {
  let color;
  let buttonClass = "";
  switch (type) {
    case "default":
      color = "var(--icon--primary)";
      break;
    case "negative":
      color = "var(--negative-color)";
      buttonClass = "Button--negative";
      break;
  }

  return (
    <button className={`Button ${buttonClass}`} type="button" onClick={onClick}>
      {cloneElement(icon, { className: "Button__Icon", size: 18, color })}
      <p className="Button__Text">{text}</p>
    </button>
  );
}
