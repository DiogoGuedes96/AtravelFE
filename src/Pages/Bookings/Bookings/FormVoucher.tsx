import { Button, Col, DatePicker, Divider, Form, Input, InputNumber, Row, Space, TimePicker, Typography } from "antd";
import { useEffect } from "react";
import { updateVoucher } from "../../../services/bookings.service";
import { useMutation } from "react-query";
import { RangePickerProps } from 'antd/lib/date-picker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';

const { Text, Title } = Typography;

export default function FormVoucher({
    booking,
    onSaved,
    onCancelEditVoucher,
    labels
}: {
    booking: any,
    onSaved: Function,
    onCancelEditVoucher: Function,
    labels: any
}) {
    const [formVoucher] = Form.useForm();

    const subTitleStyle = {
        color: '#000000'
    }

    const { mutate: updateVoucherMutate, isLoading } = useMutation(updateVoucher,
        {
            onSuccess: () => onSaved()
        }
    );

    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        return current && current < dayjs().startOf('day');
    };

    const onSubmit = () => {
        formVoucher
            .validateFields()
                .then(values => {
                    values.services = values.services.map((service: any) => {
                        return {
                            ...service,
                            start: typeof service.start == 'object'
                                ? dayjs(service.start).format('YYYY-MM-DD')
                                : service.start,
                            hour: typeof service.hour == 'object'
                                ? dayjs(service.hour).format('HH:mm')
                                : service.hour
                        }
                    });

                    updateVoucherMutate({ values, id: booking?.id });
                }).catch(() => null);
    }

    useEffect(() => {
        if (booking) {
            formVoucher.setFieldsValue({
                ...booking?.voucher,
                services: booking?.serviceVouchers?.map((service: any) => {
                    return {
                        ...service.voucher,
                        id: service.id,
                        start: dayjs(service?.voucher?.start),
                        hour: dayjs(service?.voucher?.hour, 'h:mm'),
                    }
                })
            });
        }
    }, [booking]);

    return (<>
        <Title level={5} style={{ marginTop: 10, marginBottom: 20, color: '#107b99' }}>Editar Voucher</Title>

        <Form form={formVoucher} name="form_booking" layout="vertical" style={{ marginTop: 5 }}>
            <Row gutter={20}>
                <Col span={24} style={{ marginBottom: 10 }}>
                    <Text strong style={subTitleStyle}>Empresa</Text>
                </Col>

                <Col span={14}>
                    <Form.Item label="Nome da empresa" name="company_name">
                        <Input size="large" maxLength={50} />
                    </Form.Item>
                </Col>

                <Col span={10}>
                    <Form.Item label="Número de telefone" name="company_phone">
                        <Input size="large" maxLength={20} />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item label="Email" name="company_email"
                        rules={[
                            { type: 'email', message: 'Email inválido.' }
                        ]}>
                        <Input type="email" size="large" maxLength={50} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={20}>
                <Col span={24} style={{ marginBottom: 10 }}>
                    <Text strong style={subTitleStyle}>Cliente</Text>
                </Col>

                <Col span={18}>
                    <Form.Item label="Client Name" name="client_name">
                        <Input size="large" maxLength={50} />
                    </Form.Item>
                </Col>

                <Col span={6}>
                    <Form.Item label="Number of people" name="pax_group">
                        <InputNumber min={0} size="large" placeholder="Pax Grupo" maxLength={3} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>

                <Col span={18}>
                    <Form.Item label="Operator" name="operator">
                        <Input size="large" maxLength={50} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={20}>
                <Col span={24} style={{ marginBottom: 10 }}>
                    <Text strong style={subTitleStyle}>Serviços</Text>
                </Col>

                <Col span={24} style={{ marginBottom: 10 }}>
                    <Form.List name="services">
                        {(serviceVouchers) => <>
                            {serviceVouchers.map((service: any) => {
                                return (<>
                                <Row key={service.id} gutter={20}>
                                    <Form.Item name={[service.key, "id"]} style={{ display: 'none' }}>
                                        <Input />
                                    </Form.Item>

                                    <Col span={6}>
                                        <Form.Item {...service} name={[service.name, 'start']}
                                            fieldId={[service.fieldKey, 'start']} label="Date">
                                            <DatePicker size="large" placeholder="yyyy-mm-dd" showToday={false}
                                                style={{ width: '100%' }} disabledDate={disabledDate} />
                                        </Form.Item>
                                    </Col>

                                    <Col span={6}>
                                        <Form.Item {...service} name={[service.name, 'hour']}
                                            fieldId={[service.fieldKey, 'hour']} label="Pick-up time">
                                            <TimePicker size="large" placeholder="hh:mm" use12Hours={true} showNow={false}
                                                format={'h:mm a'} style={{ width: '100%' }} changeOnBlur={true} />
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}></Col>

                                    <Col span={12}>
                                        <Form.Item {...service} name={[service.name, 'pickup_location']}
                                            fieldId={[service.fieldKey, 'pickup_location']} label="Pick Up">
                                            <Input size="large" maxLength={255} />
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item {...service} name={[service.name, 'dropoff_location']}
                                            fieldId={[service.fieldKey, 'dropoff_location']} label="Drop-off">
                                            <Input size="large" maxLength={255} />
                                        </Form.Item>
                                    </Col>
                                    <Divider style={{ marginTop: 0, marginBottom: 10 }} />
                                </Row>
                            </>)})}
                        </>}
                    </Form.List>
                </Col>
            </Row>
        </Form>

        <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
            <Col></Col>
            <Col>
                <Space>
                    <Button loading={isLoading} size="large"
                        onClick={() => onCancelEditVoucher()}>Voltar</Button>

                    <Button type="primary" loading={isLoading} size="large"
                        onClick={onSubmit}>Gravar</Button>
                </Space>
            </Col>
        </Row>
    </>);
}