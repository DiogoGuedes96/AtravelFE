import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row } from "antd";
interface PatientResponsibleProps {
    id: number,
    count: number
    RemoveResponsible?: any
}
export default function PatientResponsible(props: PatientResponsibleProps) {
    return (
        <Row gutter={[16, 16]}>
            <Col span={18}>
                <Form.Item
                    label="Responsável do Utente"
                    name={`patient_responsible_${props.id}`}
                    rules={[
                        {
                            required: false,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
            </Col>
            <Col span={6}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Form.Item
                        label="Telefone"
                        name={`phone_number_${props.id}`}
                        rules={[
                            {
                              required: true,
                              message: "Campo Obrigatório",
                            },
                            {
                              validator: (_, value) => {
                                if (value && value.toString().length !== 9) {
                                  return Promise.reject('O Contacto do Responsável deve 9 dígitos');
                                }
                                return Promise.resolve();
                              },
                            }
                          ]}
                        >
                          <InputNumber
                            style={{ width: "100%" }} maxLength={11} parser={(value) => `${value}`.replace(/[^0-9]/g, '')}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}/>
                    </Form.Item>
                    {props.count > 1 && (
                        <Button className="rounded-white-button" style={{ marginLeft: "10px" }} onClick={() => props.RemoveResponsible(props.id)}><DeleteOutlined /></Button>
                    )}
                </div>
            </Col>
        </ Row>
    )
}
