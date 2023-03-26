import React, { useEffect, useRef, useState } from "react";
import {
  AlertTwoTone,
  CloseCircleFilled,
  MailOutlined,
} from "@ant-design/icons";
import { Badge, Button, Card, MenuProps, Popover, Popconfirm } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { message } from "antd";
import { Menu } from "antd";
import "./App.css";
import { useLoginDataMutation } from "./features/user/userApi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAppDispatch } from "./app/hooks";
import MessageRoom from "./components/MessageRoom/MessageRoom";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

// submenu keys of first level
const rootSubmenuKeys = ["user", "sub1", "sub2", "sub4"];
// const socket = io("http://localhost:3010");
export const socket = io("http://localhost:3009/user", {
  auth: { token: localStorage.getItem("token") },
  timeout: 60000,
});

interface INewUserType {
  contact: string;
  email: string;
  full_name: string;
  id: string;
  status: "Pending" | "Approved" | "Rejected" | "Done";
}

interface IMessageType {
  id: string;
  message: string;
  from: string;
  time: string;
  isSend: boolean;
}

export interface UserMessages {
  [userId: string]: IMessageType[];
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const [loginData, { data: user }] = useLoginDataMutation();
  const [newRequstLIst, setNewRequstLIst] = useState<INewUserType[]>([]);

  const appchatRef = useRef<HTMLDivElement>(null!);
  const [messages, setMessages] = useState<UserMessages>({});
  const { id } = useParams();
  const [sendMessage, setSendMessage] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      loginData({
        token,
      })
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [navigate, loginData]);

  const dispatch = useAppDispatch();

  const items: MenuItem[] = newRequstLIst.map((item) => {
    return getItem(
      <Link key={item.id} to={"/message/" + item.id}>
        {item.full_name}
      </Link>,
      item.id,
      <MailOutlined />
    );
  });

  const [openKeys, setOpenKeys] = useState(["sub1"]);

  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  useEffect(() => {
    socket.on("connect_error", (error) => {
      message.error(error.message);
    });
  }, [socket]);

  useEffect(() => {
    socket.on(
      "received-message",
      (
        data: { message: string; id: string; from: string; full_name: string },
        callback
      ) => {
        setMessages((prevMessages) => {
          const userId = data.from;
          const userMessages = prevMessages[userId] || [];
          return {
            ...prevMessages,
            [userId]: [
              ...userMessages,
              { ...data, isSend: false, time: new Date().toLocaleDateString() },
            ],
          };
        });

        showMessage(data.full_name, data.from);

        callback({ data: "received service holder" });

        setTimeout(() => {
          handleScroll();
        }, 50);
        // }
      }
    );
    // if (!socket.id) {
    //   navigate("/");
    // }
  }, []);

  const showMessage = (user: string, from: string) => {
    console.log({ id, from });
    if (id !== from) message.success("New message from " + user);
  };

  const handleScroll = () => {
    appchatRef?.current?.scroll({
      top: appchatRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    socket.on("newUserRequest", (messages: INewUserType) => {
      message.success(`New connection with: ${messages.full_name}`);
      setNewRequstLIst((prev) => [...prev, messages]);
    });
  }, [socket]);

  const content = (
    <div style={{ width: "300px" }}>
      {newRequstLIst.length
        ? newRequstLIst.map((item, index) => {
            return (
              <Card
                key={index}
                hoverable={true}
                style={{
                  marginBottom: 10,
                  padding: 0,
                }}
                size="small"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "start",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "start",
                    }}
                  >
                    <Popconfirm
                      title="Title"
                      description="Open Popconfirm with Promise"
                      onConfirm={() =>
                        new Promise((resolve) => {
                          socket.emit(
                            "userRemoveFromList",
                            item.id,
                            (response: {
                              liveChatClosed: boolean;
                              id: string;
                            }) => {
                              console.log(response);
                              if (response.liveChatClosed) {
                                setNewRequstLIst((prev) =>
                                  prev.filter((item) => item.id !== response.id)
                                );
                                const removeMsg = { ...messages };
                                delete removeMsg[response.id];
                                setMessages(removeMsg);
                              }
                            }
                          );
                          resolve(true);
                        })
                      }
                      onOpenChange={(value) => console.log(value)}
                      onCancel={() => {
                        console.log("canglesd");
                      }}
                    >
                      <CloseCircleFilled
                        style={{
                          fontSize: "25px",
                          color: "tomato",
                          cursor: "pointer",
                        }}
                      />
                    </Popconfirm>
                  </div>
                  <div>
                    <p>{item.full_name}</p>
                    <span>{item.email}</span>
                  </div>
                </div>
              </Card>
            );
          })
        : "You don't have any connected user"}
    </div>
  );

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      event.preventDefault(); // Cancel the default action
      event.returnValue = ""; // Set the return value to an empty string
      // Open a confirmation dialog box
      const confirmationMessage = "Are you sure you want to reload this page?";
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div style={{ maxHeight: "100vh" }}>
      <PageHeader
        ghost={false}
        title={user?.data.full_name}
        subTitle={
          <div>
            {user?.data.email + " - " + socket.id}{" "}
            <Button
              style={{
                backgroundColor: "tomato",
                color: "white",
              }}
              size="small"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "start",
                }}
              >
                <div style={{}}>
                  <Popconfirm
                    title="Logout"
                    description="Are you sure want to logout?"
                    onConfirm={() => {
                      localStorage.removeItem("token");
                      navigate("login");
                    }}
                    onOpenChange={(value) => console.log(value)}
                    onCancel={() => {
                      console.log("canglesd");
                    }}
                  >
                    Logout
                  </Popconfirm>
                </div>
              </div>
            </Button>
          </div>
        }
        style={{ marginRight: "20px" }}
        extra={[
          <Popover
            placement="bottomRight"
            title={"Connected users"}
            content={content}
            trigger="hover"
          >
            <Badge count={newRequstLIst.length}>
              <AlertTwoTone style={{ fontSize: "30px", cursor: "pointer" }} />
            </Badge>
          </Popover>,
        ]}
      ></PageHeader>
      {newRequstLIst.length ? (
        <div className="appwrapper">
          <Menu
            mode="inline"
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            style={{ width: "20%" }}
            items={items}
          />
          <MessageRoom
            socket={socket}
            appchatRef={appchatRef}
            handleScroll={handleScroll}
            messages={messages}
            sendMessage={sendMessage}
            setMessages={setMessages}
            setSendMessage={setSendMessage}
          />
        </div>
      ) : (
        <div
          style={{
            minHeight: "300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>You don't have any conversation</div>
        </div>
      )}
      {/* <Modal
        open={confirmModal && selectedEmit !== undefined}
        title={`Please confirm for new connection`}
        onCancel={handleCancelLive}
        footer={[
          <Button
            onClick={() => {
              if (selectedEmit) {
                socket.emit(selectedEmit, {
                  status: "Approved",
                  socketId: socket.id,
                });
                console.log({ selectedEmit, id: socket.id });
                setNewRequstLIst((prev) =>
                  prev.map((item) => {
                    if (item.id === selectedEmit) {
                      return { ...item, status: "Approved" };
                    }
                    return item;
                  })
                );
                setSelectedEmit(undefined);
                setConfirmModal(false);
              }
            }}
          >
            Connect
          </Button>,
        ]}
        maskClosable={false}
        // confirmLoading={isLoading}
        width={700}
        centered
      >
        <div style={{ minHeight: "200px" }}>
          <p>
            Name:{" "}
            {
              newRequstLIst.find((item) => item.id === selectedEmit)
                ?.full_name
            }
          </p>
          <p>
            Email:{" "}
            {newRequstLIst.find((item) => item.id === selectedEmit)?.email}
          </p>
          <p>
            Contact:{" "}
            {newRequstLIst.find((item) => item.id === selectedEmit)?.contact}
          </p>
        </div>
      </Modal> */}
    </div>
  );
};

export default App;
