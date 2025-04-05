import React from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  Checkbox,
} from "antd";
import { authenticate } from "../../services/user.service";
import { useMutation } from "react-query";
import { AlertService } from "../../services/alert.service";
import DisplayAlert from "../Commons/Alert";
import { useNavigate } from "react-router";

export default function Left() {
  const [formLogin] = Form.useForm();

  const navigate = useNavigate();

  const { Title, Text } = Typography;

  const { mutate: login, isLoading: loginLoading } = useMutation(authenticate, {
    onSuccess: response => {
      localStorage.setItem("user", JSON.stringify(response.user));

      return window.location.replace(response.user.role === 'operator' ? '/bookings/operators' : '/');
    }
  });

  const onFinish = async (values: any) => {
    formLogin
      .validateFields()
      .then(values => {
        values.email = values.email.trim();
        values.password = values.password.trim();

        login(values);
      })
      .catch(() => AlertService.sendAlert([
        { text: 'Campo(s) com preenchimento inválido', type: 'error' }
      ]));
  };

  return (
    <>
      <Title level={2}>
        Login{" "}
        <Text type="warning" underline strong>
          __
        </Text>
      </Title>

      <DisplayAlert />

      <Text>Insira seus dados para aceder a sua conta</Text>

      <Form
        onFinish={onFinish}
        form={formLogin}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="email"
          label="Email"
          style={{ marginTop: 5, marginBottom: 10 }}
          rules={[
            { required: true, message: "Por favor insira um email válido!" },
            { type: 'email', message: 'Formato de email inválido' }
          ]}
        >
          <Input key="email_input" id="email_input" size="large" type="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          style={{ marginTop: 5, marginBottom: 10 }}
          rules={[
            {
              required: true,
              message: "Por favor insira uma password válida!",
            },
          ]}
        >
          <Input.Password
            key="password_input"
            id="password_input"
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 5, marginBottom: 10 }}>
          <Checkbox>Manter-me conectado</Checkbox>
        </Form.Item>

        <Typography.Link onClick={() => navigate('/forgot-password')}>Redefinir password</Typography.Link>

        <Form.Item>
          <Button
            type="primary" htmlType="submit" size="large" block
            loading={loginLoading}
            style={{ marginTop: 15 }}
          >
            <Text>Entrar</Text>
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
