import { AutoComplete, Button, Card, Col, Divider, Form, Input, InputNumber, Row, Select, Space, Spin, Switch } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { draft, remove, create, getById, update } from '../../../services/bookings.service';
import { getAll as loadOperators } from '../../../services/workers.service';
import { getAll as loadClients } from '../../../services/bookingClients.service';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import { EuroCircleOutlined } from '@ant-design/icons';
import ServiceList from '../../Bookings/Services/List';
import ProfilePermissionService from '../../../services/profilePermissions.service';
import TextArea from 'antd/es/input/TextArea';

export default function FormBooking(props: any) {
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [operators, setOperators] = useState<[]>([]);
    const [clients, setClients] = useState<[]>([]);
    const [operatorId, setOperatorId] = useState<number | undefined>();
    const [emphasis, setEmphasis] = useState<boolean>(false);
    const [anotherClient, setAnotherClient] = useState<string | undefined>();
    const [totalServices, setTotalServices] = useState<number | undefined>(0);
    const [draftBooking, setDraftBooking] = useState<any | undefined>(undefined);
    const [askRemoveDraftBooking, setAskRemoveDraftBooking] = useState<boolean>(false);

    const { id, approve } = useParams();
    const [formBooking] = Form.useForm();
    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const storageDraftKey = 'bookingDraft';

    const settings = {
        create: { title: 'Criar nova reserva' },
        edit: { title: 'Editar reserva' }
    };

    const goBookingsList = () => {
        navigate('/bookings/bookings');
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
        ['loadClients'],
        () => loadClients(),
        {
            onSuccess: response => setClients(response.data.map((client: any) => {
                return {
                    key: client.data.id,
                    ...client.data
                }
            })),
            refetchOnWindowFocus: false
        }
    );

    useQuery(
        ['loadBooking', id],
        () => id ? getById(Number(id)) : null,
        {
            onSuccess: response => {
                if (response) {
                    formBooking.setFieldsValue(response.data);

                    setEmphasis(response.data.emphasis);
                    setOperatorId(response.data.operator_id);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: createDraftBooking } = useMutation(draft, {
        onSuccess: response => {
            if (response) {
                formBooking.setFieldsValue(response.data);
                setDraftBooking(response.data);
                setStorageDraft(response.data);
            }
        }
    });

    const { mutate: removeDraftBookingMutate } = useMutation(remove,
        {
            onSuccess: () => createDraftBooking(undefined),
            onError: () => {
                removeStorageDraft();
                createDraftBooking(undefined);
            }
        }
    );

    const { mutate: createBooking, isLoading: createBookingLoading } = useMutation(create, {
        onSuccess: response => {
            AlertService.sendAlert([
                {
                    text: `Reserva N° ${response.data.id} gravada com sucesso.`,
                    nextPage: true
                }
            ]);

            goBookingsList();
        }
    });

    const { mutate: updateBooking, isLoading: updateBookingLoading } = useMutation(update, {
        onSuccess: () => {
            AlertService.sendAlert([
                {
                    text: `Reserva N° ${id} editada com sucesso.`,
                    nextPage: true
                }
            ]);

            goBookingsList();
        }
    });

    const onSubmit = () => {
        formBooking
            .validateFields()
            .then(values => {
                values.emphasis = emphasis;

                if (!values.deposits_paid) {
                    values.deposits_paid = 0;
                }

                if (!id) {
                    let oldBooking = getStorageDraft();
                    createBooking({ values, id: Number(values.id) });

                    if (oldBooking && oldBooking.id === values.id) {
                        removeStorageDraft();
                    }
                } else {
                    if (approve) {
                        values.status = 'approved';
                    }

                    updateBooking({ values, id: Number(id) });
                }
            })
            .catch(() => AlertService.sendAlert([{ text: 'Campo(s) com preenchimento inválido.', type: 'error' }]));
    }

    const onFilterOperators = (
        input: string, option?: { key: string, value: number, children: string }
    ) => (option?.children || '').toLowerCase().includes(input.toLowerCase());

    const onFilterClients = (
        input: string, option?: { key: string, value: string, children: [] }
    ) => (option!.value.toUpperCase().indexOf(input.toUpperCase()) !== -1);

    const loadDraftBooking = () => {
        formBooking.setFieldsValue(draftBooking);
        setEmphasis(draftBooking.emphasis);
        setOperatorId(draftBooking.operator_id);

        setAskRemoveDraftBooking(false);
    }

    const removeDraftBooking = () => {
        removeDraftBookingMutate(draftBooking?.id);
        setAskRemoveDraftBooking(false);
    }

    const setStorageDraft = (data: any) => {
        localStorage.setItem(storageDraftKey, JSON.stringify(data));
    }

    const getStorageDraft = () => {
        try {
            return localStorage.getItem(storageDraftKey)
                ? JSON.parse(localStorage.getItem(storageDraftKey) || '{}')
                : null;
        } catch (error) {
            removeStorageDraft();

            return null;
        }
    }

    const removeStorageDraft = () => localStorage.removeItem(storageDraftKey);

    const verifyDraftBooking = () => {
        let draft = getStorageDraft();

        if (draft) {
            setDraftBooking(draft);
            setAskRemoveDraftBooking(true);
        } else {
            createDraftBooking(undefined);
        }
    }

    const updateDraftBooking = () => {
        if (!id && draftBooking) {
            let draft = formBooking.getFieldsValue();
            draft.emphasis = emphasis;
            setStorageDraft(draft);
        }
    }

    const alertApprovePendent = () => {
        return AlertService.sendAlert([
            {
                text: 'Reserva ainda não gravada.',
                description: 'Para finalizar a aprovação, é necessário adicionar um serviço.',
                type: 'info'
            }
        ])
    }

    useEffect(() => {
        if (!id) {
            verifyDraftBooking();
        }
        if (approve) {
            alertApprovePendent()
        }
    }, []);

    useEffect(() => {
        if (anotherClient) {
            formBooking.setFieldValue('client_name', anotherClient);
            updateDraftBooking();
        }
    }, [anotherClient]);

    useEffect(() => {
        updateDraftBooking();
    }, [emphasis]);

    return (
        <>
            <DisplayAlert />
            <Card
                color='primary'
                headStyle={{
                    color: '#107B99',
                    fontWeight: 600
                }}
                title={approve ? 'Aprovar reserva' : settings[props.action as keyof typeof settings].title}
                extra={<>
                    <Space>
                        <Switch size="small" checked={emphasis} onChange={() => setEmphasis(!emphasis)} />
                        Criar alerta
                    </Space>
                </>}>
                <Form
                    form={formBooking}
                    name="form_booking"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off"
                    onValuesChange={() => {
                        setValuesChanged(true);
                        updateDraftBooking();
                    }}>

                    <Form.Item name="emphasis" style={{ display: 'none' }}>
                        <Switch checked={emphasis} />
                    </Form.Item>

                    <Row gutter={20}>
                        <Col span={3}>
                            <Form.Item label="ID Reserva" name="id">
                                <Input size="large" disabled />
                            </Form.Item>
                        </Col>

                        <Col span={10}>
                            <Form.Item label="Cliente" name="client_name"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <AutoComplete placeholder="Selecione cliente" size="large" style={{ width: '100%' }}
                                    filterOption={onFilterClients}
                                    onChange={($event, option: any) => {
                                        let client: any = clients.find((client: any) => client.id == option?.key);

                                        if (client) {
                                            formBooking.setFieldsValue({
                                                client_email: client.email,
                                                client_phone: client.phone
                                            });

                                            setAnotherClient('');
                                        }
                                    }}
                                >
                                    {clients.map((client: any) => (
                                        <Select.Option key={client.id} value={client.name}>{client.name}</Select.Option>
                                    ))}
                                </AutoComplete>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item label="Email" name="client_email"
                                rules={[
                                    { type: 'email', message: 'Formato de email inválido' }
                                ]}>
                                <Input type="email" size="large" maxLength={255} placeholder="Email do cliente" />
                            </Form.Item>
                        </Col>

                        <Col span={5}>
                            <Form.Item label="Telefone" name="client_phone">
                                <Input size="large" maxLength={20} placeholder="Telefone do cliente" />
                            </Form.Item>
                        </Col>

                        <Col span={7}>
                            <Form.Item label="Operador" name="operator_id"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <Select showSearch placeholder="Selecione um operador" size="large"
                                    filterOption={onFilterOperators} onChange={(value) => setOperatorId(value)}>
                                    {operators.map((operator: any) => (
                                        <Select.Option key={operator.id} value={operator.id}>{operator.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="Valor reserva" name="value"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <InputNumber min={0} size="large" placeholder="Valor reserva" maxLength={6}
                                    addonAfter={<EuroCircleOutlined style={{ color: '#8C8C8C' }} />} />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="Depósitos" name="deposits_paid">
                                <InputNumber min={0} size="large" placeholder="Depósitos pagos" maxLength={6}
                                    addonAfter={<EuroCircleOutlined style={{ color: '#8C8C8C' }} />} />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="Pax Grupo" name="pax_group"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <InputNumber min={0} size="large" placeholder="N° Pax Grupo" maxLength={3} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col span={5}>
                            <Form.Item label="Referência" name="reference">
                                <Input size="large" value={operatorId} placeholder="Referência" maxLength={10} />
                            </Form.Item>
                        </Col>
                    </Row>
                    {approve && <Row>
                        <Col span={24}>
                            <Form.Item label="Outras Informações" name="additional_information">
                                <TextArea size="large" value={operatorId} placeholder="Outras Informações" disabled />
                            </Form.Item>
                        </Col>
                    </Row>}
                </Form>

                <ConfirmModal
                    open={leaveThePage}
                    title="Tem certeza de que deseja sair sem gravar as alterações?"
                    content="Toda a informação não gravada será perdida."
                    okText="Sair" cancelText="Voltar"
                    onOk={() => {
                        setLeaveThePage(false);
                        goBookingsList();
                    }}
                    onCancel={() => setLeaveThePage(false)}
                ></ConfirmModal>

                <ConfirmModal
                    open={askRemoveDraftBooking}
                    title="Existe uma reserva em processamento, deseja continuar?"
                    okText="Sim" cancelText="Não"
                    onOk={loadDraftBooking}
                    onCancel={removeDraftBooking}
                ></ConfirmModal>
            </Card>

            {profilePermissionService.hasPermission(['bookings-services:write', 'bookings-services:read']) &&
                <ServiceList bookingId={id || draftBooking?.id} totalServices={setTotalServices}
                    operator={operatorId ? operators.find((operator: any) => operator.id == operatorId) : null} />
            }

            <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                <Col></Col>
                <Col>
                    <Space>
                        <Button loading={createBookingLoading || updateBookingLoading} size="large"
                            onClick={() => {
                                if (!id || valuesChanged || approve) {
                                    setLeaveThePage(true)
                                } else {
                                    goBookingsList();
                                }
                            }}>Cancelar</Button>

                        <Button type="primary" size="large" disabled={!totalServices}
                            loading={createBookingLoading || updateBookingLoading}
                            onClick={onSubmit}>{approve ? 'Aprovar' : 'Gravar'}</Button>
                    </Space>
                </Col>
            </Row>
        </>
    );
}