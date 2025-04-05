import { Button, Card, Col, Form, Input, Row, Select, Space, Switch } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { create, getById, update } from '../../../services/workers.service';
import { AlertService } from '../../../services/alert.service';
import { getAll as loadTables } from '../../../services/tables.service';
import { getAll as loadVehicles } from '../../../services/vehicles.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import InputMask from "react-input-mask";

const { TextArea } = Input;

export default function FormWorker(props: any) {
    const [tables, setTables] = useState<{ id: number, name: string }[]>([]);
    const [vehicles, setVehicles] = useState<{ id: number, name: string }[]>([]);
    const [active, setActive] = useState<boolean>(true);
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);

    const { id } = useParams();

    const [formWorker] = Form.useForm();
    const navigate = useNavigate();

    const settings = {
        create: { title: `Criar novo ${props.label.toLowerCase()}` },
        edit: { title: `Editar ${props.label.toLowerCase()}` }
    };

    const goWorkersList = () => {
        navigate(`/assets/${props.type}`);
    }

    useQuery(
        ['loadWorker', id],
        () => id ? getById(Number(id)) : null,
        {
            onSuccess: response => {
                if (response) {
                    formWorker.setFieldsValue(response.data);
                    setActive(response.data.active);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    useQuery(
        ['loadTables'],
        () => loadTables({ type: props.type, status: 'active' }),
        {
            onSuccess: response => setTables(response.data.map((table: any) => {
                return {
                    key: table.data.id,
                    ...table.data
                }
            })),
            refetchOnWindowFocus: false
        }
    );

    useQuery(
        ['loadVehicles'],
        () => loadVehicles(),
        {
            onSuccess: response => setVehicles(response.data.map((vehicle: any) => {
                return {
                    key: vehicle.data.id,
                    ...vehicle.data
                }
            })),
            refetchOnWindowFocus: false
        }
    );

    const { mutate: createWorker, isLoading: createWorkerLoading } = useMutation(create, {
        onSuccess: () => {
            AlertService.sendAlert([
                {
                    text: `Novo ${props.label.toLowerCase()} gravado com sucesso.`,
                    nextPage: true
                }
            ]);

            goWorkersList();
        }
    });

    const { mutate: updateWorker, isLoading: updateWorkerLoading } = useMutation(update, {
        onSuccess: () => {
            AlertService.sendAlert([
                {
                    text: `${props.label} editado com sucesso.`,
                    nextPage: true
                }
            ]);

            goWorkersList();
        }
    });

    const onSubmit = () => {
        formWorker
            .validateFields()
                .then(values => {
                    if (values.vehicle_id === undefined) {
                        values.vehicle_id = null;
                    }

                    if (!id) {
                        createWorker({ ...values, active, type: props.type });
                    } else {
                        updateWorker({ values: { ...values, active, type: props.type }, id: Number(id) });
                    }
                })
                .catch(() => AlertService.sendAlert([
                    { text: 'Campo(s) com preenchimento inválido', type: 'error' }
                ]));
    }

    const onFilterSelectOptions = (
        input: string, option?: { key: string, value: number, children: string }
    ) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase());

    const onChangeActive = (value: boolean) => {
        setActive(value);
    }

    const fields = {
        id: (
            <Form.Item label="ID referência" name="id">
                <Input size="large" disabled={true} placeholder="000" />
            </Form.Item>
        ),
        name: (
            <Form.Item label={`Nome ${props.label}`} name="name"
                rules={[
                    { required: true, message: 'Campo obrigatório' }
                ]}>
                <Input size="large" maxLength={255} />
            </Form.Item>
        ),
        phone: (
            <Form.Item label="Telefone" name="phone"
                rules={[
                    { required: ['suppliers'].includes(props.type), message: 'Campo obrigatório' },
                    {
                        pattern: /^([\d]{3})\s*([\d]{3})\s*([\d]{3})/,
                        message: 'Formato de telefone inválido'
                    }
                ]}>
                <InputMask mask={'999 999 999'} autoComplete="off">
                    <Input size="large" style={{ width: '100%' }} />
                </InputMask>
            </Form.Item>
        ),
        social_denomination: (
            <Form.Item label="Denominação Social" name="social_denomination">
                <Input size="large" maxLength={30} />
            </Form.Item>
        ),
        nif: (
            <Form.Item label="NIF" name="nif"
                rules={[
                    {
                        pattern: /^([\d]{9})/,
                        message: 'NIF inválido'
                    }
                ]}>
                <InputMask mask={'999999999'} autoComplete="off">
                    <Input size="large" style={{ width: '100%' }} />
                </InputMask>
            </Form.Item>
        ),
        responsible_name: (
            <Form.Item label="Nome Responsável" name="responsible_name">
                <Input size="large" maxLength={255} />
            </Form.Item>
        ),
        responsible_phone: (
            <Form.Item label="Telefone Responsável" name="responsible_phone"
                rules={[
                    {
                        pattern: /^([\d]{3})\s*([\d]{3})\s*([\d]{3})/,
                        message: 'Formato de telefone inválido'
                    }
                ]}>
                <InputMask mask={'999 999 999'} autoComplete="off">
                    <Input size="large" style={{ width: '100%' }} />
                </InputMask>
            </Form.Item>
        ),
        address: (
            <Form.Item label="Morada" name="address">
                <Input size="large" showCount maxLength={255} />
            </Form.Item>
        ),
        postal_code: (
            <Form.Item label="Código Postal" name="postal_code"
                rules={[
                    {
                        pattern: /^([\d]{4})-*([\d]{3})/,
                        message: 'Formato do código postal inválido'
                    }
                ]}>
                    <InputMask mask={'9999-999'} autoComplete="off">
                        <Input size="large" style={{ width: '100%' }} />
                    </InputMask>
            </Form.Item>
        ),
        locality: (
            <Form.Item label="Localidade" name="locality">
                <Input size="large" maxLength={50} />
            </Form.Item>
        ),
        table_id: (
            <Form.Item label={`Tabela ${props.label}`} name="table_id"
                rules={[
                    { required: true, message: 'Campo obrigatório' }
                ]}>
                <Select showSearch placeholder="Seleciona tabela" size="large"
                    filterOption={onFilterSelectOptions}>
                    {tables.map((table: any) => (
                        <Select.Option key={table.id} value={table.id}>{table.name}</Select.Option>
                    ))}
                </Select>
            </Form.Item>
        ),
        antecedence: (
            <Form.Item label="Antecedência" name="antecedence">
                <Input size="large" maxLength={255} />
            </Form.Item>
        ),
        vehicle_id: (
            <Form.Item label="Viatura" name="vehicle_id">
                <Select showSearch placeholder="Seleciona viatura" size="large" allowClear
                    filterOption={onFilterSelectOptions}>
                    {vehicles.map((vehicle: any) => (
                        <Select.Option key={vehicle.id} value={vehicle.id}>{vehicle.license}</Select.Option>
                    ))}
                </Select>
            </Form.Item>
        ),
        username: (
            <Form.Item label="Utilizador" name="username">
                <Input size="large" maxLength={50} />
            </Form.Item>
        ),
        email: (
            <Form.Item label="Email" name="email"
                rules={[
                    { required: ['operators', 'staff'].includes(props.type), message: 'Campo obrigatório' },
                    { type: 'email', message: 'Formato de email inválido' }
                ]}>
                <Input type="email" size="large" maxLength={50} />
            </Form.Item>
        ),
        notes: (
            <Form.Item label="Observações" name="notes">
                <TextArea size="large" showCount maxLength={255} />
            </Form.Item>
        )
    };

    return (
        <>
            <DisplayAlert />
            <Card
                headStyle={{
                    color: '#107B99',
                    fontWeight: 600
                }}
                title={settings[props.action as keyof typeof settings].title}>
                <Form
                    form={formWorker}
                    name="form_worker"
                    layout="vertical"
                    className="form_worker"
                    autoComplete="off"
                    onValuesChange={() => setValuesChanged(true)}>

                    {(props.formFields || []).map((row: any, indexRow: number) => {
                        return (
                            <Row key={indexRow} gutter={20}>
                                {row.cols.map((col: any, indexCol: number) => {
                                    return (
                                        <Col key={indexCol} span={col.span}>
                                            {fields[col.field as keyof typeof fields]}
                                        </Col>
                                    )
                                })}
                            </Row>
                        )
                    })}

                    <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                        <Col>
                            {id &&
                                <Form.Item label={`${props.label} ${active ? 'ativo' : 'não ativo'}`} name="active">
                                    <Switch checked={active} onChange={onChangeActive} />
                                </Form.Item>
                            }
                        </Col>
                        <Col>
                            <Space>
                                <Button loading={createWorkerLoading || updateWorkerLoading} size="large"
                                    onClick={() => {
                                        if (!id || valuesChanged) {
                                            setLeaveThePage(true);
                                        } else {
                                            goWorkersList();
                                        }
                                    }}>Cancelar</Button>

                                <Button type="primary" loading={createWorkerLoading || updateWorkerLoading} size="large"
                                    onClick={onSubmit}>Gravar</Button>
                            </Space>
                        </Col>
                    </Row>

                    <ConfirmModal
                        open={leaveThePage}
                        title="Tem certeza de que deseja sair sem gravar as alterações?"
                        content="Toda a informação não gravada será perdida."
                        okText="Sair" cancelText="Voltar"
                        onOk={() => {
                            setLeaveThePage(false);
                            goWorkersList();
                        }}
                        onCancel={() => setLeaveThePage(false)}
                    ></ConfirmModal>
                </Form>
            </Card>
        </>
    );
}