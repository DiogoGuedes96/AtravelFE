import { Button, Card, Divider, Form, Input, Modal, Space, Tooltip } from "antd";
import DisplayAlert from "../../components/Commons/Alert";
import GenericTable from "../../components/Commons/Table/generic-table.component";
import GenericDrawer from "../../components/Commons/Drawer/generic-drawer.component";
import ShowDataLength from "../../components/Commons/Table/results-length-table.component";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/lib/table/interface";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { all, create, deleteRoute, edit } from "../../services/routes.service";
import FormRoute from "../../components/Routes/form-routes.component";
import { AlertService } from "../../services/alert.service";
import ConfirmModal from "../../components/Commons/Modal/confirm-modal.component";
import { cutLongText } from "../../services/utils";
import ProfilePermissionService from "../../services/profilePermissions.service";

const { Search } = Input;

export default function Routes(props: any) {
    const [routeList, setRouteList] = useState([]);
    const [openFormRoute, setOpenFormRoute] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number | undefined>(10);
    const [search, setSearch] = useState<string | undefined>(undefined)
    const [sorterName, setSorterName] = useState<string | undefined>(undefined);
    const [removeRoute, setRemoveRoute] = useState<any | undefined>(undefined);
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [formSearch] = Form.useForm();
    const [formRoute] = Form.useForm();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const settings = {
        create: { title: 'Criar nova rota' },
        edit: { title: 'Editar rota' }
    };

    const { data, isLoading: routeLoading, refetch: RefetchRouteList } = useQuery([
        'routeList',
        page,
        sorterName,
        search,
        pageSize
    ], () => all(
            page,
            search,
            sorterName,
            pageSize
    ),
    {
        refetchOnWindowFocus: false
    });

    const { mutate: CreateRouteMutate, isSuccess: isSuccessNewRoute, isLoading: isLoadingCreateRoute } = useMutation(create, {
        onError: (error: any) => {
            if (error?.response?.status !== 422) {
                const data = error.response?.data as { message: string, error: any };
                AlertService.sendAlert([{ text: data.message, type: 'error' }]);
            }
        }
    });
    const { mutate: UpdateRouteMutate, isSuccess: isSuccessEditRoute, isLoading: isLoadingUpdateRoute } = useMutation(edit);
    const { mutate: DeleteRouteMutate, isSuccess: isSuccessDeleteRoute, isError: isErrorDeleteRoute } = useMutation(deleteRoute);

    useEffect(() => {
        if (data) {
            setRouteList(data.data.map((route: any) => {
                return {
                    key: route.id,
                    ...route
                };
            }));
            setTotal(data.meta.total);
            setPage(data.meta.current_page);
        }
    }, [data]);

    useEffect(() => {
        if (isSuccessNewRoute) {
            clearForm();

            setTimeout(() => {
                AlertService.sendAlert([{ text: 'A rota foi criada com sucesso.' }]);
                
                RefetchRouteList();
            }, 500);
        }
    }, [isSuccessNewRoute]);

    useEffect(() => {
        if (isSuccessEditRoute) {
            clearForm();

            setTimeout(() => {
                AlertService.sendAlert([{ text: 'Rota editada com sucesso.' }]);
                
                RefetchRouteList();
            }, 500);
        }
    }, [isSuccessEditRoute]);

    useEffect(() => {
        if (isSuccessDeleteRoute) {
            AlertService.sendAlert([{ text: 'A rota foi apagada com sucesso.' }]);

            if (routeList.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                RefetchRouteList();
            }
        }

        setRemoveRoute(undefined);
    }, [isSuccessDeleteRoute, isErrorDeleteRoute]);

    const columns = [
        { title: "Rota", dataIndex: "from_zone", sorter: true, key: "from_zone",
            render: (_: any, record: { id: number, from_zone: string, to_zone: string }) => (
                cutLongText(record.from_zone + ' - ' + record.to_zone, 120)
            )
        },
        {
            title: "Ações",
            key: "action",
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission("routes-routes:write") &&
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => showDrawerEditRoute(record)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                            onClick={() => setRemoveRoute(record)} />
                    </Tooltip>
                </Space>
            ),
            width: "15%",
        },
    ];

    const showDrawerEditRoute = (route: any) => {
        formRoute.setFieldsValue(route);
        setOpenFormRoute(true);
    };

    const showDrawerNewRoute = () => {
        setOpenFormRoute(true);
    };

    const onSearch = (search_value: any) => {
        setPage(1);
        setSearch(search_value);
    };

    const handleTableChange = (
        pagination: PaginationProps,
        filters: Record<string, FilterValue | null>,
        sorter: any
    ) => {
        if (pagination.current != page) {
            setPage(Number(pagination.current));
        }

        if (pagination.pageSize != pageSize) {
            setPageSize(pagination.pageSize);
            setPage(1);
        }

        if (sorter) {
            setSorterName(sorter.order);
        }
    };

    const clearForm = () => {
        setOpenFormRoute(false);
        formRoute.resetFields();
        setValuesChanged(false);
    }

    const saveRoute = () => {
        formRoute
            .validateFields()
            .then((values) => {
                let data = { from_zone_id: values.from_zone_id, to_zone_id: values.to_zone_id };

                if (!!values.id) {
                    UpdateRouteMutate({ data, id: values.id });
                } else {
                    CreateRouteMutate(data);
                }
            })
            .catch((error) => {
                console.log("error: ", error);
            });
    };

    const onLeaveThePage = () => {
        if (!formRoute.getFieldValue('id') || valuesChanged) {
            setLeaveThePage(true);
        } else {
            clearForm();
        }
    }

    return (
        <>
            {!openFormRoute && <DisplayAlert />}
            <Card
                bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_routes"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">
                        <Form.Item name="search_route" className="item_search">
                            <Search enterButton="Pesquisar" allowClear onSearch={onSearch} size="large" maxLength={255} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission("routes-routes:write") &&
                        <Button type="primary" onClick={showDrawerNewRoute} size="large">Criar Rota</Button>
                    }
                </div>
                <Divider />
                <div className="route_table">
                    <div className="route_table">
                        <GenericTable
                            columns={columns}
                            dataSource={routeList}
                            pagination={{
                                current: page,
                                pageSize: pageSize,
                                total: total,
                                showSizeChanger: true
                            }}
                            loading={routeLoading}
                            totalChildren={
                                <div className="route_result_size_n_export">
                                    <ShowDataLength size={total} className="show_result_size" />
                                </div>
                            }
                            empty={{
                                createTheFirst: !routeList.length && !search,
                                textOne: 'Esta tabela encontra-se vazia, uma vez que ainda não foram criadas rotas.',
                                textTwo: profilePermissionService.hasPermission("routes-routes:write")
                                    ? `Para começar, crie uma nova rota.`
                                    : '',
                                link: profilePermissionService.hasPermission("routes-routes:write")
                                    ? () => showDrawerNewRoute()
                                    : ''
                            }}
                            handleTableChange={handleTableChange}
                        />
                    </div>
                    <GenericDrawer
                        title={(formRoute.getFieldValue('id') ? settings.edit : settings.create).title}
                        children={
                            <>
                                <FormRoute form={formRoute} onValuesChange={() => setValuesChanged(true)} zones={props.zones} />

                                <ConfirmModal
                                    open={leaveThePage}
                                    title="Tem certeza de que deseja sair sem gravar as alterações?"
                                    content="Toda a informação não gravada será perdida."
                                    okText="Sair" cancelText="Voltar"
                                    onOk={() => {
                                        clearForm();
                                        setLeaveThePage(false);
                                    }}
                                    onCancel={() => setLeaveThePage(false)}
                                ></ConfirmModal>
                            </>
                        }
                        onClose={onLeaveThePage}
                        open={openFormRoute}
                        footer={
                            <div className="route_form_space_action_btns">
                                <Button type="primary" block onClick={saveRoute} size="large" loading={isLoadingCreateRoute || isLoadingUpdateRoute}>Gravar</Button>
                                <Button block onClick={onLeaveThePage} size="large" loading={isLoadingCreateRoute || isLoadingUpdateRoute}>Cancelar</Button>
                            </div>
                        }
                        footerStyle={{ borderTop: "none" }}
                    />

                <ConfirmModal
                    open={!!removeRoute}
                    title={`Tem certeza que deseja apagar a rota "${removeRoute?.from_zone + ' - ' + removeRoute?.to_zone}"?`}
                    okText="Apagar" cancelText="Voltar"
                    onOk={() => DeleteRouteMutate(String(removeRoute?.id))}
                    onCancel={() => setRemoveRoute(undefined)}
                ></ConfirmModal>
                </div>
            </Card>
        </>
    )
} 