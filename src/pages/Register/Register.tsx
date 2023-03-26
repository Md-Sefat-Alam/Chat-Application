import React, { useEffect } from "react";
import "./register.css";
import { Button, Form, Input, message } from "antd";
import { IRegister } from "./registerTypes";
import { usePostUserMutation } from "../../features/user/userApi";
import { useNavigate } from "react-router-dom";

type Props = {};

export default function Register({}: Props) {
  const navigate = useNavigate();
  const [postUser, { isSuccess, isLoading, isError }] = usePostUserMutation();
  const onFinish = (values: IRegister) => {
    console.log("Success:", values);
    postUser(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    if (!isError && isSuccess) {
      message.success("User has been created.");
      navigate("/login");
    }
    if (!isSuccess && isError) {
      message.error("An error occured!");
    }
  }, [isSuccess, isError, navigate]);

  return (
    <div className="register">
      <h3 className="register-lavel">Add New User</h3>``
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
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirm Password"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button loading={isLoading} type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
