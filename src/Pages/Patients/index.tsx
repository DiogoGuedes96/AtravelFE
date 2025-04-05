import { Button, Card, Divider, Form, Input, Select, Space, message } from "antd";

import { useState } from "react";

import "../../assets/css/secundary-button.css";
import GenericDrawer from "../../components/Commons/Drawer/generic-drawer.component";
import NewPatientDrawer from "../../components/Patient/new-patient-drawer.component";
import { useMutation } from "react-query";
import { patientPost } from "../../services/patient.service";

export default function PatientsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [openDrawerNewPatient, setOpenDrawerNewPatient] = useState(false);
  const [formNewPatient] = Form.useForm();

  const showDrawerNewPatient = () => {
    setOpenDrawerNewPatient(true);
  };
  const onCloseDrawerNewPatient = () => {
    setOpenDrawerNewPatient(false);
  };

  const newPatient = (frmdetails: {}) => patientPost(frmdetails);
  const { mutate: mutatePostPatient, isSuccess: successPostPatient, data: dataPostPatient, error } = useMutation(newPatient);

  const saveNewPatient = () => {
    formNewPatient.validateFields().then((values) => {
      values.birthday = values.birthday.$y + '-' + (values.birthday.$M + 1) + '-' + values.birthday.$D
      mutatePostPatient(values);
      formNewPatient.resetFields();
      onCloseDrawerNewPatient();
      messageApi.open({
        type: 'success',
        content: 'Novo utente criado com sucesso.',
      });
    }).catch((error) => {
      console.info("error: ", error);
    })
  }

  return (
    <Card>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <Space direction="horizontal" align="center" size="large">
          <Form
            layout="vertical"
            autoComplete="off"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            <Form.Item
              style={{ marginBottom: 0 }}
              name="search"
              label="Pesquisar"
              colon={false}
            >
              <Input />
            </Form.Item>
            <Form.Item
              style={{ marginBottom: 0 }}
              name="status"
              label="Status"
              colon={false}
            >
              <Select placeholder="Seleciona">
                <Select.Option value="active">Ativo</Select.Option>
                <Select.Option value="inactive">Inátivo</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button className="secundary-button">Pesquisar</Button>
            </Form.Item>
          </Form>
        </Space>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Space>
            <Button type="primary" onClick={showDrawerNewPatient}>
              Novo Utente
            </Button>
          </Space>
        </div>
      </div>
      <Divider />
      <GenericDrawer
        title="Novo Utente"
        children={<NewPatientDrawer form={formNewPatient} />}
        onClose={onCloseDrawerNewPatient}
        open={openDrawerNewPatient}
        footer={
          <Button type="primary" block onClick={saveNewPatient}>
            Criar Utente
          </Button>
        }
        footerStyle={{ borderTop: "none" }}
      />
    </Card>
  );
}
