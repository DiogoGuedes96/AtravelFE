import { Col, Form, Input, Row } from 'antd'
import DisplayAlert from '../Commons/Alert'

interface PropsFormNewZone {
    form: any,
    onValuesChange: any
}

export default function FormZone({ form, onValuesChange }: PropsFormNewZone) {
    return (
        <>
            <DisplayAlert />
            <Row gutter={[16, 16]}>
                <Form
                    form={form}
                    layout="vertical"
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onValuesChange={() => onValuesChange(true)}
                >
                    <Form.Item name="id" style={{display: 'none'}}><Input type='hidden' /></Form.Item>

                    <Col span={24}>
                        <Form.Item label="Nome" name="name"
                            rules={[
                                { required: true, message: "Por favor insira um nome para a zona!" }
                            ]}>
                            <Input size="large" maxLength={50} />
                        </Form.Item>
                    </Col>
                </Form>
            </Row>
        </>
    )
}