import { Button, Card, Col, Divider, Form, Input, Row, Space } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import { useState } from 'react';
import FormRoute from './FormRoute';
import ListRoutes from './ListRoutes';
import { useNavigate, useParams } from 'react-router-dom';
import { create, getById, update, syncRoutes } from '../../../services/tables.service';
import { AlertService } from '../../../services/alert.service';
import { all as loadRoutes } from '../../../services/routes.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';

export default function FormTable(props: any) {
    const [routes, setRoutes] = useState<{ id: number, from_zone: string, to_zone: string }[]>([]);

    const [tableRoutes, setTableRoutes] = useState<{
        route_id?: number,
        from_zone: string,
        to_zone: string
        pax14: string,
        pax58: string
    }[]>([]);

    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);

    const { id } = useParams();

    const [formTable] = Form.useForm();
    const navigate = useNavigate();

    const settings = {
        create: { title: 'Criar tabela', alertMessage: 'gravada' },
        edit: { title: 'Editar tabela', alertMessage: 'editada' },
        duplicate: { title: 'Duplicar tabela', alertMessage: 'duplicada' }
    };

    const goTablesList = () => {
        navigate(`/assets/tables/${props.type}`);
    }

    const onAddRoute = (values: any) => {
        setTableRoutes(tableRoutes.concat(values));
        setValuesChanged(true);
    }

    const onUpdateTableRoute = (route_id: any, values: any) => {
        let _tableRoutes = [...tableRoutes];

        let idx = _tableRoutes.findIndex(item => item.route_id == route_id);

        if (idx > -1) {
            _tableRoutes[idx] = values;

            setTableRoutes(_tableRoutes);
            setValuesChanged(true);
        }
    }

    const onRemoveRoute = (route_id: any) => {
        setTableRoutes(tableRoutes.filter((tableRoute: any) => tableRoute.route_id != route_id));
        setValuesChanged(true);
    }

    useQuery(
        ['loadTable', id],
        () => id ? getById(Number(id)) : null,
        {
            onSuccess: response => {
                if (response) {
                    formTable.setFieldsValue({ name: response.data.name });
                    setTableRoutes(response.relationships.routes);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    useQuery(
        ['loadRoutes'],
        () => loadRoutes(),
        {
            onSuccess: response => setRoutes(response.data),
            refetchOnWindowFocus: false
        }
    );

    const { mutate: syncTableRoutes } = useMutation(syncRoutes,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    {
                        text: `A tabela foi ${settings[props.action as keyof typeof settings].alertMessage} com sucesso.`,
                        nextPage: true
                    }
                ]);

                if (!id || props.action) {
                    goTablesList();
                }
            }
        }
    );

    const { mutate: createTable, isLoading: createTableLoading } = useMutation(create, {
        onSuccess: response => syncTableRoutes({
            values: {
                routes: tableRoutes.map(route => {
                    return {
                        id: route.route_id,
                        pax14: route.pax14,
                        pax58: route.pax58
                    }
                })
            },
            id: response.data.id
        })
    });

    const { mutate: updateTable, isLoading: updateTableLoading } = useMutation(update, {
        onSuccess: () => syncTableRoutes({
            values: {
                routes: tableRoutes.map(route => {
                    return {
                        id: route.route_id,
                        pax14: route.pax14,
                        pax58: route.pax58
                    }
                })
            },
            id: Number(id)
        })
    });

    const onSubmit = () => {
        if (!tableRoutes.length) {
            AlertService.sendAlert([
                { text: 'É obrigatório adicionar ao menos uma rota para prosseguir.', type: 'error' }
            ]);

            return;
        }

        formTable
            .validateFields()
                .then(values => {
                    if (!id || props.action == 'duplicate') {
                        createTable({ ...values, type: props.type });
                    } else {
                        updateTable({ values: { ...values, type: props.type }, id: Number(id) });
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
                    form={formTable}
                    name="form_table"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off"
                    onValuesChange={() => setValuesChanged(true)}>

                    <Row>
                        <Col span={12}>
                            <Form.Item label="Título da tabela" name="name"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <Input placeholder="Adiciona título da tabela" size="large" maxLength={25} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <FormRoute routes={routes} existedRoutes={tableRoutes} type={props.type}
                    onAddRoute={onAddRoute} />

                <Divider />

                <ListRoutes routes={routes} tableRoutes={tableRoutes}
                    type={props.type} action={props.action} tableName={`${formTable.getFieldValue('name')} - ${props.label}`}
                    onRemoveRoute={onRemoveRoute} onUpdateTableRoute={onUpdateTableRoute} />

                <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                    <Col></Col>
                    <Col>
                        <Space>
                            <Button loading={createTableLoading || updateTableLoading} size="large"
                                onClick={() => {
                                    if (props.action != 'edit' || valuesChanged) {
                                        setLeaveThePage(true)
                                    } else {
                                        goTablesList();
                                    }
                                }}>Cancelar</Button>

                            <Button type="primary" loading={createTableLoading || updateTableLoading} size="large"
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
                        goTablesList();
                    }}
                    onCancel={() => setLeaveThePage(false)}
                ></ConfirmModal>
            </Card>
        </>
    );
}