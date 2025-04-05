import { Button, Card, Divider, Form, Input, Space, Tooltip } from "antd";
import GenericTable from "../../components/Commons/Table/generic-table.component";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import ShowDataLength from "../../components/Commons/Table/results-length-table.component";
import GenericDrawer from "../../components/Commons/Drawer/generic-drawer.component";
import FormZone from "../../components/Zones/form-zone.component";
import { AlertService } from "../../services/alert.service";
import DisplayAlert from "../../components/Commons/Alert";
import { paginateZones, create, deleteZone, edit } from "../../services/zones.service";
import { useMutation, useQuery } from "react-query";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";
import ConfirmModal from "../../components/Commons/Modal/confirm-modal.component";
import { cutLongText } from "../../services/utils";
import ProfilePermissionService from "../../services/profilePermissions.service";

const { Search } = Input;

export default function Zones() {
    const [zoneList, setZoneList] = useState([]);
    const [openFormZone, setOpenFormZone] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number | undefined>(10);
    const [search, setSearch] = useState<string | undefined>(undefined)
    const [sorterName, setSorterName] = useState<string | undefined>(undefined);
    const [removeZone, setRemoveZone] = useState<any | undefined>(undefined);
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [formSearch] = Form.useForm();
    const [formZone] = Form.useForm();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const settings = {
        create: { title: 'Criar nova zona' },
        edit: { title: 'Editar zona' }
    };

    const { data, isLoading: zoneLoading, refetch: RefetchZoneList } = useQuery([
        'zoneList',
        page,
        sorterName,
        search,
        pageSize
    ], () => paginateZones(
            page,
            search,
            sorterName,
            pageSize
    ),
    {
        refetchOnWindowFocus: false
    });

    const {mutate: CreateZoneMutate, isSuccess: isSuccessNewZone, isLoading: isLoadingCreateZone } = useMutation(create);
    const {mutate: UpdateZoneMutate, isSuccess: isSuccessEditZone, isLoading: isLoadingUpdateZone } = useMutation(edit);
    const {mutate: DeleteZoneMutate, isSuccess: isSuccessDeleteZone, isError: isErrorDeleteZone } = useMutation(deleteZone);

    useEffect(() => {
        if (data) {
            setZoneList(data.data.map((zone: any) => {
                return {
                    key: zone.id,
                    ...zone
                };
            }));

            setTotal(data.total);
            setPage(data.current_page);
        }
    }, [data]);

    const clearForm = () => {
        setOpenFormZone(false);
        formZone.resetFields();
        setValuesChanged(false);
    }

    useEffect(() => {
        if (isSuccessNewZone) {
            clearForm();

            setTimeout(() => {
                AlertService.sendAlert([{ text: 'Nova zona gravada com sucesso.' }]);
                
                RefetchZoneList();
            }, 500);
        }
    }, [isSuccessNewZone]);

    useEffect(() => {
        if (isSuccessEditZone) {
            clearForm();

            setTimeout(() => {
                AlertService.sendAlert([{ text: 'Zona editada com sucesso.' }]);
                
                RefetchZoneList();
            }, 500);
        }
    }, [isSuccessEditZone]);

    useEffect(() => {
        if (isSuccessDeleteZone) {
            AlertService.sendAlert([{ text: 'A zona foi apagada com sucesso.' }]);

            if (zoneList.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                RefetchZoneList();
            }
        }

        setRemoveZone(undefined);
    }, [isSuccessDeleteZone, isErrorDeleteZone]);

    const columns = [
        { title: "Zona", dataIndex: "name", sorter: true, key: "name",
            render: (_:any, record: any) => (cutLongText(record.name, 50))
        },
        {
            title: "Ações",
            key: "action",
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission("routes-zones:write") &&
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => showDrawerEditZone(record)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                            onClick={() => setRemoveZone(record)} />
                    </Tooltip>
                </Space>
            ),
            width: "15%",
        },
    ];

    const saveZone = () => {
        formZone
            .validateFields()
            .then((values) => {
                if (!!values.id) {
                    UpdateZoneMutate({ data: { name: values.name }, id: values.id });
                } else {
                    CreateZoneMutate({ name: values.name });
                }
            })
            .catch((error) => {
                console.log("error: ", error);
            });
    };

    const showDrawerNewZone = () => {
        setOpenFormZone(true);
    };

    const showDrawerEditZone = (zone: any) => {
        formZone.setFieldsValue(zone);
        setOpenFormZone(true);
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

    const onLeaveThePage = () => {
        if (!formZone.getFieldValue('id') || valuesChanged) {
            setLeaveThePage(true);
        } else {
            clearForm();
        }
    }

    return (
        <>
            {!openFormZone && <DisplayAlert />}
            <Card
                bodyStyle={{ padding: 8 }}
            >
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_zones"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">
                        <Form.Item name="search_zone" className="item_search">
                            <Search enterButton="Pesquisar" allowClear onSearch={onSearch} size="large" maxLength={255} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission("routes-zones:write") &&
                        <Button type="primary" onClick={showDrawerNewZone} size="large">Criar Zona</Button>
                    }
                </div>
                <Divider />
                <div className="zone_table">
                    <GenericTable
                        columns={columns}
                        dataSource={zoneList}
                        pagination={{
                            current: page,
                            pageSize: pageSize,
                            total: total,
                            showSizeChanger: true
                        }}
                        loading={zoneLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !zoneList.length && !search,
                            textOne: 'Esta tabela encontra-se vazia, uma vez que ainda não foram criadas zonas.',
                            textTwo: profilePermissionService.hasPermission("routes-zones:write")
                                ? `Para começar, crie uma nova zona.`
                                : '',
                            link: profilePermissionService.hasPermission("routes-zones:write")
                                ? () => showDrawerNewZone()
                                : ''
                        }}
                        handleTableChange={handleTableChange}
                    />
                </div>

                <GenericDrawer
                    title={(formZone.getFieldValue('id') ? settings.edit : settings.create).title}
                    children={
                        <>
                            <FormZone form={formZone} onValuesChange={() => setValuesChanged(true)} />

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
                    open={openFormZone}
                    footer={
                        <div className="route_form_space_action_btns">
                            <Button type="primary" block onClick={saveZone} size="large" loading={isLoadingCreateZone || isLoadingUpdateZone}>Gravar</Button>
                            <Button block onClick={onLeaveThePage} size="large" loading={isLoadingCreateZone || isLoadingUpdateZone}>Cancelar</Button>
                        </div>
                    }
                    footerStyle={{ borderTop: "none" }}
                />

                <ConfirmModal
                    open={!!removeZone}
                    title={`Tem certeza que deseja apagar a zona "${removeZone?.name}"?`}
                    okText="Apagar" cancelText="Voltar"
                    onOk={() => DeleteZoneMutate(String(removeZone?.id))}
                    onCancel={() => setRemoveZone(undefined)}
                ></ConfirmModal>
            </Card>
        </>
    )
}