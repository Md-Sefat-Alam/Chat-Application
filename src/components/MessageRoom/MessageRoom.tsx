import { SendOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import React from "react";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { UserMessages } from "../../App";
import SenderText from "../SenderText";
import SendText from "../SendText";

type Props = {
  socket: Socket<any, any>;
  appchatRef: React.MutableRefObject<HTMLDivElement>;
  messages: UserMessages;
  setSendMessage: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<UserMessages>>;
  sendMessage: string;
  handleScroll: () => void;
};

export default function MessageRoom({
  socket,
  appchatRef,
  messages,
  setSendMessage,
  sendMessage,
  setMessages,
  handleScroll,
}: Props) {
  const { id } = useParams();

  return (
    <div className="app-chat-wrap">
      <div ref={appchatRef} className="app-chat">
        <div className="show-chat">
          <SendText text={"You connected with: " + socket.id} />

          {id &&
            messages[id]?.map((message, index) =>
              message.isSend ? (
                <SendText key={index} text={message.message} />
              ) : (
                <SenderText key={index} text={message.message} />
              )
            )}
        </div>
      </div>
      <div className="app-text-box-wrapper">
        <TextArea
          onChange={(e) => setSendMessage(e.target.value)}
          value={sendMessage}
          className="app-text-box"
        />
        <div
          onClick={() => {
            if (sendMessage) {
              socket.emit(
                "send-message",
                {
                  message: sendMessage,
                  id: id,
                  from: socket.id,
                },
                (acknowledgment: any) => {
                  console.log({
                    message: `Message received by server: ${acknowledgment}`,
                    acknowledgment,
                  });
                }
              );

              setMessages((prevMessages) => {
                const userId = id as string;
                const userMessages = prevMessages[userId] || [];
                return {
                  ...prevMessages,
                  [userId]: [
                    ...userMessages,
                    {
                      id: id as string,
                      from: socket.id as string,
                      isSend: true,
                      message: sendMessage,
                      time: new Date().toLocaleDateString(),
                    },
                  ],
                };
              });

              setSendMessage("");
              setTimeout(() => {
                handleScroll();
              }, 50);
            }
          }}
          className="app-text-send-btn"
        >
          <SendOutlined style={{ width: "150px" }} />
        </div>
      </div>
    </div>
  );
}
