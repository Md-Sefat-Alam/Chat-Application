import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Input, message, Modal, Spin } from "antd";
import { useSelectLiveChatUserMutation } from "../features/user/userApi";
import { ISelectUserSend } from "../pages/Login/loginTypes";
import SenderText from "../components/SenderText";
import SendText from "../components/SendText";
import TextArea from "antd/es/input/TextArea";
import { SendOutlined } from "@ant-design/icons";
import "./LiveChatModal.css";
import { io } from "socket.io-client";

// const socket = io("http://localhost:3009");
const socket = io("http://localhost:3009/user", {
  auth: { token: "accessLocal" },
});

interface IMessageType {
  id: string;
  message: string;
  time: string;
  isSend: boolean;
  from: string;
}

const LiveChatModal: React.FC = () => {
  const [connectInfo, setConnectInfo] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openLive, setOpenLive] = useState(false);
  const [selectLiveChatUser, { data, isLoading, isSuccess }] =
    useSelectLiveChatUserMutation();

  const [messages, setMessages] = useState<IMessageType[]>([]);
  const [sendMessage, setSendMessage] = useState<string>("");
  const appchatRef = useRef<HTMLDivElement>(null!);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [closeTimer, setCloseTimer] = useState<number>(5);
  const [isLiveButton, seiIsLiveButton] = useState<boolean>(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleCancelLive = () => {
    setOpenLive(false);
  };
  const [userInfo, setUserInfo] = useState<ISelectUserSend>();
  const onFinish = async (values: ISelectUserSend) => {
    setLoading(true);
    setOpen(false);
    setOpenLive(true);

    console.log("Success:", values);
    setUserInfo(values);
    const confirmation = await new Promise((resolve, reject) => {
      const connection = () => {
        socket.emit(
          "newUserRequest",
          { ...values, id: socket.id },
          (response: any) => {
            console.log(response);
            if (response === "No longer found") {
              setTimeout(() => {
                connection();
              }, 3000);
            } else if (response === "No user connected now") {
              message.info(response);
              reject(response);
            } else {
              resolve(response);
              console.log(response);
            }
          }
        );
      };
      connection();
    });
    setConnectInfo(confirmation);
    setLoading(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    socket.on(
      "received-message",
      (data: { message: string; id: string; from: string }, callback) => {
        console.log(data);
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            isSend: false,
            from: data.from,
            message: data.message,
            time: new Date().toLocaleDateString(),
          },
        ]);
        callback({ data: "received customer" });
        setTimeout(() => {
          handleScroll();
        }, 50);
      }
    );

    socket.on("closeLiveChat", (data: { liveChatClosed: true; id: number }) => {
      setIsClosed(data.liveChatClosed);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("connect_error", (error) => {
      message.error(error.message);
    });
  }, [socket]);

  const handleScroll = () => {
    appchatRef.current.scroll({
      top: appchatRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (isClosed) {
      message.info(`Live chat will closing in 5s`, 5);
      const timer = setInterval(() => {
        setCloseTimer((prev) => (prev -= 1));
      }, 1000);
      setTimeout(() => {
        setOpenLive(false);
        setOpenLive(false);
        seiIsLiveButton(true);
        clearTimeout(timer);
        setIsClosed(false);
      }, 5000);
    }
  }, [isClosed]);
  return (
    <>
      <Button disabled={isLiveButton} type="primary" onClick={showModal}>
        Go to live chat
      </Button>
      <Modal
        open={open}
        title="Live Chat"
        onCancel={handleCancel}
        footer={false}
        maskClosable={false}
        confirmLoading={isLoading}
      >
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          //   style={{ minWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label="Contact"
            name="contact"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button
              key="back"
              style={{ marginRight: "20px" }}
              onClick={handleCancel}
            >
              Return
            </Button>
            <Button key="submit" htmlType="submit" type="primary">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* start chat modal */}
      <Modal
        open={openLive}
        title={
          loading
            ? "Please wait for a few minutes"
            : `Hello I'm ${connectInfo?.email}`
        }
        onCancel={() => {
          if (!isClosed) handleCancelLive();
        }}
        closeIcon={isClosed ? <div>{closeTimer}</div> : undefined}
        footer={
          !loading
            ? [
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
                            id: connectInfo?.id,
                            from: socket.id,
                            full_name: userInfo?.full_name,
                          },
                          (acknowledgment: any) => {
                            console.log({
                              message: `Message received by server: ${acknowledgment}`,
                              acknowledgment,
                            });
                          }
                        );

                        setMessages((prev) => [
                          ...prev,
                          {
                            id: connectInfo?.id,
                            isSend: true,
                            from: socket.id,
                            message: sendMessage,
                            time: new Date().toLocaleDateString(),
                          },
                        ]);
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
                </div>,
              ]
            : null
        }
        maskClosable={false}
        confirmLoading={isLoading}
        width={700}
        centered
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <div className="chat-id">Chat Id: {socket.id}</div>
          <div className="chat-wrap">
            <div
              ref={appchatRef}
              className="app-chat-live"
              style={
                loading
                  ? {
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }
                  : {}
              }
            >
              {!loading ? (
                <div className="show-chat chat-box-control">
                  {messages.map((item, index) =>
                    item.isSend ? (
                      <SendText key={index} text={item.message} />
                    ) : (
                      <SenderText key={index} text={item.message} />
                    )
                  )}
                </div>
              ) : (
                <Spin size="large" />
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LiveChatModal;
