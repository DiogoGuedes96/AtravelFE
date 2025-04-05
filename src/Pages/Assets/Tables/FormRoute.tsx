import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, InputNumber, Row, Select } from 'antd';

interface PropsAddRoute {
    onAddRoute: any,
    existedRoutes: any[],
    routes: { id: number, from_zone: string, to_zone: string }[],
    type?: string
}

export default function FormRoute({ onAddRoute, existedRoutes, routes, type }: PropsAddRoute) {
    const [formRoute] = Form.useForm();

    const onFilterRoutes = (
        input: string, option?: { key: string, value: number, children: [] }
    ) => (option?.children.join('') ?? '').toLowerCase().includes(input.toLowerCase());

    const onSubmit = () => {
        formRoute
            .validateFields()
            .then(values => {
                let route = routes.find(item => item.id == values.id);

                onAddRoute({
                    route_id: values.id,
                    pax14: values.pax14,
                    pax58: values.pax58,
                    from_zone: route ? route.from_zone : '',
                    to_zone: route ? route.to_zone : ''
                });

                formRoute.resetFields();
            })
            .catch(() => null);
    };

    return (
        <>
            <Form
                form={formRoute}
                name="form_route"
                layout="vertical"
                className="form_route"
                autoComplete="off">

                <Row>
                    <Col span={7} style={{ marginRight: 20 }}>
                        <Form.Item label="Rota" name="id"
                            rules={[
                                { required: true, message: 'Campo obrigatório' }
                            ]}>
                            <Select showSearch placeholder="Rota" size="large" filterOption={onFilterRoutes}>
                                {routes.map((route: any) => (
                                        <Select.Option key={route.id} value={route.id}
                                            disabled={existedRoutes.some((item: any) => item.route_id == route.id)}>
                                            {route.from_zone} - {route.to_zone}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={3} style={{ marginRight: -20 }}>
                        <Form.Item label="Valor Pax 1-4" name="pax14"
                            rules={[
                                { required: true, message: 'Campo obrigatório' }
                            ]}>

                            {}
                            <InputNumber min={0.1} size="large" maxLength={5}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                onPressEnter={onSubmit} onChange={(value) => {
                                    if (type == 'staff') {
                                        formRoute.setFieldValue('pax58', value);
                                    }
                                }} />
                        </Form.Item>
                    </Col>

                    <Col span={3} style={{ marginRight: -20 }}>
                        <Form.Item label="Valor Pax 5-8" name="pax58"
                            rules={[
                                { required: true, message: 'Campo obrigatório' }
                            ]}>
                            <InputNumber onPressEnter={onSubmit} min={0.1} size="large" maxLength={5} disabled={type == 'staff'}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} />
                        </Form.Item>
                    </Col>

                    <Col span={3}>
                        <Button type="primary" style={{ marginTop: 30 }} onClick={onSubmit} size="large">
                            <PlusCircleOutlined />
                            Adicionar rota
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}