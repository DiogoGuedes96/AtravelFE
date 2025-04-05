import { Col, DatePicker, Form, FormInstance, Input, InputNumber, Row, Select, Switch, Typography, message } from "antd";
import React, { useState } from 'react';

import {
  PlusOutlined
} from "@ant-design/icons";
import { EnumTransportFeature } from "../../Enums/TransportFeature";
import PatientResponsible from "./patient-responsible.component";
interface NewPatientDrawerProps {
  form: FormInstance;
}

const { TextArea } = Input;
const { Title } = Typography;

export default function NewPatientDrawer({ form }: NewPatientDrawerProps) {
  const [statusChecked, setStatusChecked] = useState(true);
  const [responsibleAdd, setResponsibleAdd] = useState([0]);
  const [numberResponsible, setNumberResponsible] = useState(1);
  const SwitchChange = () => {
    setStatusChecked((prev) => !prev);
    form.setFieldsValue({ status: statusChecked });
  };

  const AddResponsible = () => {
    setResponsibleAdd([...responsibleAdd, numberResponsible]);
    setNumberResponsible(numberResponsible + 1);
  }

  const RemoveResponsible = (valueToRemove: any) => {
    const updatedResponsible = responsibleAdd.filter((item) => item !== valueToRemove);
    setResponsibleAdd(updatedResponsible);
  }

  const REQUIRED_FIELD = "Campo obrigatório";

  return (
    <>
      <Row>
        <Col>
          <Title style={{ marginTop: 0 }} level={5}>
            Informações do Utente
          </Title>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Form
          form={form}
          layout="vertical"
          style={{ width: "100%" }}
          autoComplete="off"
          initialValues={
            {
              'status': statusChecked
            }
          }
        >
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={18}>
                <Form.Item
                  label="Nome Utente"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Número Utente"
                  name="patient_number"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD,
                    },
                    {
                      validator: (_, value) => {
                        if (value && value.toString().length !== 9) {
                          return Promise.reject('O Número de Utente deve conter 9 dígitos');
                        }
                        return Promise.resolve();
                      },
                    }
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }} maxLength={9} />
                </Form.Item>
              </Col>
            </ Row>
          </Col>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Form.Item
                  label="NIF"
                  name="nif"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD,
                    },
                    {
                      validator: (_, value) => {
                        if (value && value.toString().length !== 9) {
                          return Promise.reject('O NIF deve conter 9 dígitos');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '80%' }}
                    maxLength={9}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Data nascimento"
                  name="birthday"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD,
                    },
                  ]}
                >
                  <DatePicker placeholder="ex: 2015-08-27" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: false
                    },
                    {
                      type: 'email',
                      message: 'O email deve conter um formato válido',
                    },
                  ]}
                >
                  <Input type="email" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={18}>
                <Form.Item
                  label="Morada"
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD,
                    },
                  ]}
                >
                  <Input showCount
                    maxLength={255} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Código postal"
                  name="postal_code"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD,
                    },
                    {
                      validator: (_, value) => {
                        if (value && value.toString().length !== 7) {
                          return Promise.reject('O código-postal deve conter 7 dígitos');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="xxxx-xxx"
                    formatter={value => `${value}`.replace(/^(\d{4})/, '$1-')}
                    parser={value => value ? value.toString().replace(/[^0-9]/g, '') : ''}
                    maxLength={8}
                  />
                </Form.Item>
              </Col>
            </ Row>
          </Col>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={14}>
                <Form.Item
                  label="Localidade"
                  name="postal_code_address"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  label="Caracteristica do transporte"
                  name="transport_feature"
                  rules={[
                    {
                      required: true,
                      message: REQUIRED_FIELD,
                    },
                  ]}
                >
                  <Select placeholder="Seleciona">
                    {Object.keys(EnumTransportFeature).map(key => (
                      <Select.Option key={key} value={key}>
                        {EnumTransportFeature[key as keyof typeof EnumTransportFeature]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </ Row>
          </Col>
          <Col span={24}>
            {
              responsibleAdd.map((key) => (
                <PatientResponsible
                  id={key}
                  count={responsibleAdd.length}
                  RemoveResponsible={RemoveResponsible}
                />
              ))
            }
            <div className="add_patient_responsible" onClick={AddResponsible}>
              <PlusOutlined />
              <p>Adicionar Responsável</p>
            </div>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Observações"
              name="patient_observations"
              rules={[
                {
                  required: true,
                  message: REQUIRED_FIELD
                },
              ]}
            >
              <TextArea autoSize={{ minRows: 3, maxRows: 5 }} showCount
                maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label=""
              name="status"
              rules={[
                {
                  required: false,
                },
              ]}

            >
              <Switch defaultChecked={true} onClick={SwitchChange} /> {statusChecked ? 'Ativo' : 'Inátivo'}
            </Form.Item>
          </Col>
        </Form>
      </Row>
    </>
  );
}
