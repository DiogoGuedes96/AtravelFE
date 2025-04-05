import { Badge, Button, Card, Divider, Form, Input, Space, Tooltip } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { CloseOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useState } from 'react';
import { getAll, remove } from '../../../services/serviceTypes.service';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import GenericDrawer from '../../../components/Commons/Drawer/generic-drawer.component';
import FormService from './FormService';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import ProfilePermissionService from "../../../services/profilePermissions.service";

const { Search } = Input;

export default function Services(props: any) {
    const [services, setServices] = useState([]);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>('name-asc');
    const [formSearch] = Form.useForm();
    const [openServiceDrawerForm, setOpenServiceDrawerForm] = useState<boolean>(false);
    const [serviceToEdit, setServiceToEdit] = useState<any>();
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [removeService, setRemoveService] = useState<any | undefined>(undefined);

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { isLoading: serviceLoading, refetch: loadServices } = useQuery(
        ['loadServices', search, order],
        () => getAll({ order, search }),
        {
            onSuccess: response => {
                setServices(response.data.map((service: any) => {
                    return {
                        key: service.data.id,
                        ...service.data
                    }
                }));

                setTotal(response.data.length);
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: removeServiceMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'Tipo de serviço apagado com sucesso.' }
                ]);

                setRemoveService(undefined);

                loadServices();
            }
        }
    );

    const onSearch = (search_value: any) => {
        setSearch(search_value);
    };

    const onOpenServiceDrawerForm = (record: any) => {
        setServiceToEdit(record);
        setOpenServiceDrawerForm(true);
    };

    const onCloseServiceDrawerForm = () => {
        setOpenServiceDrawerForm(false);
        setServiceToEdit(undefined);
        setValuesChanged(false);
    };

    const onSavedForm = (successMessage: string) => {
        onCloseServiceDrawerForm();

        setTimeout(() => {
            AlertService.sendAlert([
                { text: successMessage }
            ]);
            
            loadServices();
        }, 500);
    }

    const onLeaveThePage = () => {
        if (!serviceToEdit || valuesChanged) {
            setLeaveThePage(true);
        } else {
            onCloseServiceDrawerForm();
        }
    }

    const columns = [
        {
            title: 'Tipo de serviço', dataIndex: 'name', key: 'name',
            render: (_:any, record: any) => (<Badge color={record.color} text={record.name} styles={{ indicator: { width: 12, height: 12 } }} />)
        },
        {
            title: 'Ações',
            key: 'action',
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission("services-serviceTypes:write") &&
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => onOpenServiceDrawerForm(record)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                            onClick={() => setRemoveService(record)} />
                    </Tooltip>
                </Space>
            ),
            width: '15%',
        },
    ];

    return (
        <>
            {!openServiceDrawerForm && <DisplayAlert />}

            <Card bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_services"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_service" className="item_search">
                            <Search onSearch={onSearch} placeholder="Pesquisa o tipo de serviço" enterButton="Pesquisar" allowClear size="large" maxLength={255} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission("services-serviceTypes:write") &&
                        <Button type="primary" onClick={() => onOpenServiceDrawerForm(undefined)} size="large">Criar novo</Button>
                    }
                </div>

                <Divider />

                <div className="table">
                    <GenericTable
                        columns={columns}
                        dataSource={services}
                        loading={serviceLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !services.length && !search,
                            textOne: 'Esta tabela encontra-se vazia, uma vez que ainda não foram criados tipos de serviços.',
                            textTwo: profilePermissionService.hasPermission("services-serviceTypes:write")
                                ? `Para começar, crie um novo serviço.`
                                : '',
                            link: profilePermissionService.hasPermission("services-serviceTypes:write")
                                ? () => onOpenServiceDrawerForm(undefined)
                                : ''
                        }}
                    />
                </div>

                <GenericDrawer
                    title={!serviceToEdit ? 'Criar novo tipo de serviço' : 'Editar tipo de serviço'}
                    children={
                        <>
                            <FormService service={serviceToEdit} closeForm={onLeaveThePage} savedForm={onSavedForm}
                                unavailableColors={services.map((service: any) => service.color)}
                                onValuesChange={() => setValuesChanged(true)} />

                            <ConfirmModal
                                open={leaveThePage}
                                title="Tem certeza de que deseja sair sem gravar as alterações?"
                                content="Toda a informação não gravada será perdida."
                                okText="Sair" cancelText="Voltar"
                                onOk={() => {
                                    onCloseServiceDrawerForm();
                                    setLeaveThePage(false);
                                }}
                                onCancel={() => setLeaveThePage(false)}
                            ></ConfirmModal>
                        </>
                    }
                    onClose={onLeaveThePage}
                    open={openServiceDrawerForm}
                    footerStyle={{ borderTop: "none" }}
                    bodyStyle={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                    extra={<Button type="text" shape="circle" size="middle" icon={<CloseOutlined />}
                        onClick={onLeaveThePage} />}
                />

                <ConfirmModal
                    open={!!removeService}
                    title={`Tem certeza que deseja apagar o tipo de serviço "${removeService?.name}"?`}
                    okText="Apagar" cancelText="Voltar"
                    onOk={() => removeServiceMutate(removeService?.id)}
                    onCancel={() => setRemoveService(undefined)}
                ></ConfirmModal>
            </Card>
        </>
    );
}