import { Col, Form, Input, Row, Select } from 'antd'
import DisplayAlert from '../Commons/Alert';

interface PropsFormNewRoute {
    form: any,
    onValuesChange: any,
    zones: Array<any>
}

export default function FormRoute({ form, onValuesChange, zones }: PropsFormNewRoute) {
    const onFilterZones = (
        input: string, option?: { key: string, value: number, children: '' }
    ) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase());

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
                        <Form.Item
                            label="De"
                            name="from_zone_id"
                            rules={[
                                {
                                    required: true,
                                    message: "Por favor selecione uma zona de partida!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (getFieldValue('to_zone_id') !== value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('A zona de partida e chegada não podem ser iguais!'));
                                    },
                                }),
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder="Selecione uma zona de partida"
                                size="large"
                                filterOption={onFilterZones}
                            >
                                {zones.map((zone) => (
                                    <Select.Option key={zone.id} value={zone.id}>
                                        {zone.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label="Para"
                            name="to_zone_id"
                            rules={[
                                {
                                    required: true,
                                    message: "Por favor selecione uma zona de chegada!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (getFieldValue('from_zone_id') !== value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('A zona de partida e chegada não podem ser iguais!'));
                                    },
                                }),
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder="Selecione uma zona de chegada"
                                size="large"
                                filterOption={onFilterZones}
                            >
                                {zones.map((zone) => (
                                    <Select.Option key={zone.id} value={zone.id}>
                                        {zone.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Form>
            </Row>
        </>
    )
}