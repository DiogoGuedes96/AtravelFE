import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import DisplayAlert from '../../components/Commons/Alert';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrashedById, restore, forceRemove } from '../../services/bookings.service';
import { getAll as loadOperators } from '../../services/workers.service';
import { getAll as loadClients } from '../../services/bookingClients.service';
import { AlertService } from '../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../components/Commons/Modal/confirm-modal.component';
import { DeleteOutlined, EuroCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import ServiceList from './ServiceList';

export default function FormBooking(props: any) {
    const [operators, setOperators] = useState<[]>([]);
    const [operatorId, setOperatorId] = useState<number | undefined>();
    const [totalServices, setTotalServices] = useState<number | undefined>(0);
    const [forceRemoveBookings, setForceRemoveBookings] = useState<number[]>([]);

    const { id } = useParams();
    const [formBooking] = Form.useForm();
    const navigate = useNavigate();

    const settings = {
        restore: { title: 'Restaurar reserva' }
    };

    const goRecyclingList = () => {
        navigate('/recycling');
    }

    useQuery(
        ['loadOperators'],
        () => loadOperators({ type: 'operators', status: 'active' }),
        {
            onSuccess: response => setOperators(response.data.map((operator: any) => {
                return {
                    key: operator.data.id,
                    ...operator.data,
                    ...operator.relationships
                }
            })),
            refetchOnWindowFocus: false
        }
    );

    useQuery(
        ['loadBooking', id],
        () => getTrashedById(Number(id)),
        {
            onSuccess: response => {
                if (response) {
                    formBooking.setFieldsValue(response.data);
                    setOperatorId(response.data.operator_id);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: restoreBooking, isLoading: restoreBookingLoading } = useMutation(restore, {
        onSuccess: () => {
            AlertService.sendAlert([
                {
                    text: `Reserva N° ${id} restaurada com sucesso.`,
                    nextPage: true,
                    action: {
                        text: 'Visualizar reserva',
                        toPage: `/bookings/bookings/${id}/edit`
                    }
                }
            ]);

            goRecyclingList();
        }
    });

    const { mutate: forceRemoveBookingMutate } = useMutation(forceRemove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    {
                        text: forceRemoveBookings.length > 1
                            ? 'As reservas selecionadas foram apagadas permanentemente.'
                            : `Reserva n° ${forceRemoveBookings[0]} apagada permanentemente.`,
                        nextPage: true
                    }
                ]);

                setForceRemoveBookings([]);

                goRecyclingList();
            }
        }
    );

    return (
        <>
            <DisplayAlert />
            <Card
                color='primary'
                headStyle={{
                    color: '#107B99',
                    fontWeight: 600
                }}
                title={settings[props.action as keyof typeof settings].title}>
                <Form
                    form={formBooking}
                    name="form_booking"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off">
                        <Row gutter={20}>
                            <Col span={3}>
                                <Form.Item label="ID Reserva" name="id">
                                    <Input size="large" disabled />
                                </Form.Item>
                            </Col>

                            <Col span={10}>
                                <Form.Item label="Cliente" name="client_name">
                                    <Input size="large" maxLength={255} placeholder="Nome do cliente" disabled />
                                </Form.Item>
                            </Col>

                            <Col span={6}>
                                <Form.Item label="Email" name="client_email">
                                    <Input type="email" size="large" maxLength={255} placeholder="Email do cliente" disabled />
                                </Form.Item>
                            </Col>

                            <Col span={5}>
                                <Form.Item label="Telefone" name="client_phone">
                                    <Input size="large" maxLength={20} placeholder="Telefone do cliente" disabled />
                                </Form.Item>
                            </Col>

                        <Col span={7}>
                            <Form.Item label="Operador" name="operator_id">
                                <Select showSearch placeholder="Selecione um operador" size="large" disabled>
                                    {operators.map((operator: any) => (
                                        <Select.Option key={operator.id} value={operator.id}>{operator.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="Valor" name="value">
                                <InputNumber min={0} size="large" placeholder="Valor reserva" maxLength={6} disabled
                                    addonAfter={<EuroCircleOutlined style={{ color: '#8C8C8C' }} />} />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="Depósitos" name="deposits_paid">
                                <InputNumber min={0} size="large" placeholder="Depósitos pagos" maxLength={6} disabled
                                    addonAfter={<EuroCircleOutlined style={{color: '#8C8C8C'}} />} />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="Pax Grupo" name="pax_group">
                                <InputNumber min={0} size="large" placeholder="N° Pax Grupo" maxLength={3} style={{ width: '100%' }} disabled />
                            </Form.Item>
                        </Col>

                        <Col span={5}>
                            <Form.Item label="Referência" name="reference">
                                <Input size="large" value={operatorId} placeholder="Referência operador" disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <ServiceList bookingId={id} totalServices={setTotalServices}
                operator={operatorId ? operators.find((operator: any) => operator.id == operatorId) : null} />

            <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                <Col>
                    <Button size="large" danger type="link" icon={<DeleteOutlined />}
                        onClick={() => setForceRemoveBookings([Number(id)])}>Apagar permanentemente</Button>
                </Col>
                <Col>
                    <Space>
                        <Button loading={restoreBookingLoading} size="large"
                            onClick={() => goRecyclingList()}>Cancelar</Button>

                        <Button type="primary" size="large" icon={<HistoryOutlined />}
                            loading={restoreBookingLoading}
                            onClick={() => restoreBooking(Number(id))}>Restaurar reserva</Button>
                    </Space>
                </Col>
            </Row>

            <ConfirmModal
                open={!!forceRemoveBookings.length}
                title={`Tem certeza que deseja apagar a reserva n° ${forceRemoveBookings[0]} permanentemente?`}
                content='Esta ação não pode ser desfeita.'
                okText="Apagar" cancelText="Voltar"
                onOk={() => forceRemoveBookingMutate({ id: forceRemoveBookings })}
                onCancel={() => setForceRemoveBookings([])}
            ></ConfirmModal>
        </>
    );
}