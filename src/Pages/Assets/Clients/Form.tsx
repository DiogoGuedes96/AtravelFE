import { Button, Card, Col, Form, Input, Row, Space } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { create, getById, update } from '../../../services/bookingClients.service';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';

export default function FormClient(props: any) {
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);

    const { id } = useParams();

    const [formClient] = Form.useForm();
    const navigate = useNavigate();

    const settings = {
        create: { title: 'Criar cliente', alertMessage: 'gravado' },
        edit: { title: 'Editar cliente', alertMessage: 'editado' }
    };

    const goClientsList = () => {
        navigate('/assets/clients');
    }

    useQuery(
        ['loadClient', id],
        () => id ? getById(Number(id)) : null,
        {
            onSuccess: response => {
                if (response) {
                    formClient.setFieldsValue(response.data);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: createClient, isLoading: createClientLoading } = useMutation(create, {
        onSuccess: response => {
            AlertService.sendAlert([
                {
                    text: `Cliente ${settings[props.action as keyof typeof settings].alertMessage} com sucesso.`,
                    nextPage: true
                }
            ]);

            if (!id || props.action) {
                goClientsList();
            }
        }
    });

    const { mutate: updateClient, isLoading: updateClientLoading } = useMutation(update, {
        onSuccess: () => {
            AlertService.sendAlert([
                {
                    text: `Cliente ${settings[props.action as keyof typeof settings].alertMessage} com sucesso.`,
                    nextPage: true
                }
            ]);

            if (!id || props.action) {
                goClientsList();
            }
        }
    });

    const onSubmit = () => {
        formClient
            .validateFields()
                .then(values => {
                    if (!id) {
                        createClient({ ...values });
                    } else {
                        updateClient({ values, id: Number(id) });
                    }
                })
                .catch(() => AlertService.sendAlert([
                    { text: 'Campo(s) com preenchimento inválido', type: 'error' }
                ]));
    }

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
                    form={formClient}
                    name="form_table"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off"
                    onValuesChange={() => setValuesChanged(true)}>

                    <Row gutter={20}>
                        <Col span={8}>
                            <Form.Item label="Nome do cliente" name="name"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <Input placeholder="Nome do cliente" size="large" maxLength={255} />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label="Email" name="email"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' },
                                    { type: 'email', message: 'Formato de email inválido' }
                                ]}>
                                <Input type="email" size="large" maxLength={255} placeholder="Email do cliente" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label="Telefone" name="phone">
                                <Input size="large" maxLength={30} placeholder="Telefone do cliente" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                    <Col></Col>
                    <Col>
                        <Space>
                            <Button loading={createClientLoading || updateClientLoading} size="large"
                                onClick={() => {
                                    if (props.action != 'edit' || valuesChanged) {
                                        setLeaveThePage(true)
                                    } else {
                                        goClientsList();
                                    }
                                }}>Cancelar</Button>

                            <Button type="primary" loading={createClientLoading || updateClientLoading} size="large"
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
                        goClientsList();
                    }}
                    onCancel={() => setLeaveThePage(false)}
                ></ConfirmModal>
            </Card>
        </>
    );
}