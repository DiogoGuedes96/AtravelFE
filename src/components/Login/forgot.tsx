import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Typography
} from "antd";
import { forgotPassword } from "../../services/user.service";
import { useMutation } from "react-query";
import { AlertService } from "../../services/alert.service";
import DisplayAlert from "../Commons/Alert";

export default function Forgot() {
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const [formForgotPassword] = Form.useForm();

  const { Title, Text } = Typography;

  const { mutate: forgot, isLoading: forgotLoading } = useMutation(forgotPassword, {
    onSuccess: () => {
      setEmailSent(true);

      formForgotPassword.resetFields();
    }
  });

  const onFinish = async (values: any) => {
    AlertService.clearAlert();

    formForgotPassword
      .validateFields()
      .then(values => {
        values.email = values.email.trim();
        forgot(values);
      })
      .catch(() => AlertService.sendAlert([
        { text: 'Campo(s) com preenchimento inválido', type: 'error' }
      ]));
  };

  return (
    <>
      <Title level={2}>
        Redefinir password{" "}
        <Text type="warning" underline strong>
          __
        </Text>
      </Title>

      <DisplayAlert />

      {!emailSent
        ? <Text>Insira o endereço de email associado à sua conta para redefinir a password.</Text>
        : <>
          <Text>Enviamos um email para o endereço fornecido com instruções sobre como redefinir a password, que deverá chegar em breve.
          <br /><br />Caso não tenha recebido, verifique sua caixa de entrada e spam ou solicite um novo email.</Text>
        </>
      }

      {!emailSent
        ? <Form onFinish={onFinish} form={formForgotPassword} autoComplete="off" layout="vertical">
          <Form.Item name="email" label="Email"
            style={{ marginTop: 5, marginBottom: 10 }}
            rules={[
              { required: true, message: "Por favor insira um email válido!" },
              { type: 'email', message: 'Formato de email inválido' }
            ]}>
            <Input key="email_input" id="email_input" size="large" type="email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={forgotLoading} size="large" block style={{ marginTop: 15 }}>
              <Text>Enviar instruções para o email</Text>
            </Button>
          </Form.Item>
        </Form>
        : <Button type="primary" htmlType="button" size="large" block
          style={{ marginTop: 15, marginBottom: 10 }}
          onClick={() => setEmailSent(false)}>
          <Text>Solicitar novo email</Text>
        </Button>
      }
    </>
  );
}
