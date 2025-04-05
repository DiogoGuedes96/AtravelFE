import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Typography,
} from "antd";
import { useState } from "react";

const { Title } = Typography;

interface NewUserDrawerProps {
  form: FormInstance;
}

export default function EditUserDrawer({ form }: NewUserDrawerProps) {
  const [editPassword, setEditPassword] = useState(true);

  const allowEditPassword = () => {
    setEditPassword(false);
  };

  return (
    <>
      <Row>
        <Col>
          <Title style={{ marginTop: 0 }} level={5}>
            Informações do usuário
          </Title>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Form
          form={form}
          layout="vertical"
          style={{ width: "100%" }}
          autoComplete="off"
        >
          <Col span={24}>
            <Form.Item
              label="Nome"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Por favor insira um nome!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Por favor insira um email!",
                },
              ]}
            >
              <Input type="email" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={12} style={{ alignItems: "flex-end", display: "grid" }}>
                {editPassword ? (
                  <Form.Item>
                    <Button
                      onClick={allowEditPassword}
                      className="secundary-button"
                      block
                    >
                      Editar senha
                    </Button>
                  </Form.Item>
                ) : (
                  <Form.Item
                    label="Senha"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Por favor insira uma senha!",
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                )}
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Perfil"
                  name="role"
                  rules={[
                    {
                      required: true,
                      message: "Por favor insira um perfil!",
                    },
                  ]}
                >
                  <Select>
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="user">User</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Form>
      </Row>
    </>
  );
}
