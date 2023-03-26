import React from "react";

type Props = { text: string };

export default function SenderText({ text }: Props) {
  return (
    <div className="sender-text-wrapp">
      <div className="sender-text">
        <p>{text}</p>
      </div>
    </div>
  );
}
