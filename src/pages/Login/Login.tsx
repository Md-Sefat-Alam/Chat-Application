import React, { useEffect } from "react";
import "./login.css";
import { Button, Form, Input, message } from "antd";
import { ILogin } from "./loginTypes";
import { useLazyLoginQuery } from "../../features/user/userApi";
import { useNavigate } from "react-router-dom";
import LiveChatModal from "../../modals/LiveChatModal";

type Props = {};

export default function Login({}: Props) {
  const navigate = useNavigate();
  const [login, { data, isSuccess, isLoading, isError }] = useLazyLoginQuery();
  const onFinish = (values: ILogin) => {
    console.log({ values });
    login(values);
  };

  console.log({ data });

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    if (!isError && isSuccess && data?.token) {
      message.success("Login successfully");
      localStorage.setItem("token", data?.token);
      navigate("/");
    }
    if (!isSuccess && isError) {
      message.error("An error occured!");
    }
  }, [isSuccess, isError, data?.token, navigate]);

  return (
    <div className="login-live-chat">
      <div className="login">
        <h3 className="login-lavel">Login</h3>``
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ minWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter Email" type="email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter Password" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button loading={isLoading} type="primary" htmlType="submit">
              Login
            </Button>
            <Button
              onClick={() => {
                navigate("/admin/register");
              }}
              loading={isLoading}
              type="link"
            >
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="live-chat">
        <LiveChatModal />
      </div>
    </div>
  );
}
