import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Typography
} from "antd";
import { resetPassword } from "../../services/user.service";
import { useMutation } from "react-query";
import { AlertService } from "../../services/alert.service";
import DisplayAlert from "../Commons/Alert";
import { useLocation } from 'react-router';
import { useNavigate } from "react-router";

export default function Reset() {
  const [passwordRestarted, setPasswordRestarted] = useState<boolean>(false);

  const [formResetPassword] = Form.useForm();

  const navigate = useNavigate();

  const { Title, Text } = Typography;

  function useQuery() {
    const { search } = useLocation();

    return useMemo(() => new URLSearchParams(search), [search]);
  }

  const query = useQuery();

  const { mutate: reset, isLoading: resetLoading } = useMutation(resetPassword, {
    onSuccess: () => {
      AlertService.sendAlert([
        {
          text: 'Password redefinida com sucesso.'
        }
      ]);

      setPasswordRestarted(true);
    },
    onError: (error: any) => {
      AlertService.sendAlert([
        {
          text: error?.response?.data?.message,
          type: 'error',
          nextPage: true
        }
      ]);

      navigate('/forgot-password');
    }
  });

  const onFinish = async (values: any) => {
    formResetPassword
      .validateFields()
      .then(values => reset(values))
      .catch(() => AlertService.sendAlert([
        { text: 'Campo(s) com preenchimento inválido', type: 'error' }
      ]));
  };

  useEffect(() => {
    let token = query.get('token');
    let email = query.get('email');

    if (!token || !email) {
      AlertService.sendAlert([
        {
          text: 'O link de redefinição de password expirou ou é inválido. Por favor, solicite outro email.',
          type: 'error',
          nextPage: true
        }
      ]);

      navigate('/forgot-password');
    }

    formResetPassword.setFieldsValue({
      token,
      email
    });
  }, []);

  return (
    <>
      <Title level={2}>
        Redefinir password{" "}
        <Text type="warning" underline strong>
          __
        </Text>
      </Title>

      <DisplayAlert />

      {!passwordRestarted
        ? <>
          <Text>
            Insira uma nova password para sua conta.
            <br />Certifique-se de atender os seguintes critérios:
            <br /><br />- Pelo menos 8 caracteres de comprimento
            <br />- Deve conter pelo menos uma letra maiúscula
            <br />- Deve incluir pelo menos um caractere especial
          </Text>

          <Form onFinish={onFinish} form={formResetPassword} autoComplete="off" layout="vertical" style={{ marginTop: 20 }}>
            <Form.Item name="token" style={{ display: 'none' }}>
              <Input id="token" />
            </Form.Item>

            <Form.Item name="email" style={{ display: 'none' }}>
              <Input id="email_input" />
            </Form.Item>

            <Form.Item name="password" label="Nova password" data-html="true"
              rules={[
                { required: true, message: 'Campo obrigatório' },
                { min: 8, message: '' },
                {
                  pattern: new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$"),
                  message: "A password inserida não atende aos critérios de segurança mínimos."
                }
              ]}>
              <Input.Password type="password" size="large" maxLength={100} style={{ marginTop: 5 }} />
            </Form.Item>

            <Form.Item name="password_confirmation" label="Repita a nova password" data-html="true"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Campo obrigatório' },
                ({ getFieldValue }) => ({
                  validator: (_, value) => {
                    if (!value || value === getFieldValue('password')) {
                      return Promise.resolve();
                    }

                    return Promise.reject(<span>
                      As passwords não coincidem.
                      <br />Utilize as mesmas passwords nos dois campos.
                    </span>);
                  }
                })
              ]}>
              <Input.Password type="password" size="large" maxLength={100} style={{ marginTop: 5, marginBottom: 10 }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={resetLoading} size="large" block style={{ marginTop: 15 }}>
                <Text>Redefinir password</Text>
              </Button>
            </Form.Item>
          </Form>
        </>
        : <Button type="primary" htmlType="button" size="large" block
          style={{ marginTop: 15, marginBottom: 10 }}
          onClick={() => navigate('/')}>
          <Text>Aceder ao sistema</Text>
        </Button>
      }
    </>
  );
}
