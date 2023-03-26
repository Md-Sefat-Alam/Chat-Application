import React from "react";

type Props = {text:string};

export default function SendText({text}: Props) {
  return (
    <div className="send-text-wrapp">
      <div className="send-text">
        <p>{text}</p>
      </div>
    </div>
  );
}
