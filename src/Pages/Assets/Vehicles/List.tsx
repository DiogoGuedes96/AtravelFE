import { Button, Card, Divider, Form, Input, Space, Tooltip } from "antd";
import DisplayAlert from "../../../components/Commons/Alert";
import GenericTable from "../../../components/Commons/Table/generic-table.component";
import { useState, useEffect } from 'react';
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from "react-query";
import { getAll, remove } from "../../../services/vehicles.service";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";
import { AlertService } from '../../../services/alert.service';
import ConfirmModal from "../../../components/Commons/Modal/confirm-modal.component";
import moment from 'moment';
import ProfilePermissionService from "../../../services/profilePermissions.service";

const { Search } = Input;

export default function ListPage(props: any) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [vehicleLoading, setVehicleLoading] = useState<boolean>(false);
    const [formSearch] = Form.useForm();
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [order, setOrder] = useState<string>('id-asc');
    const [removeVehicle, setRemoveVehicle] = useState<any | undefined>(undefined);
    const [vehicleList, setVehicleList] = useState<{ id: number, name: string }[]>([]);

    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { data: dataVehicleList, refetch: RefetchVehicleList } = useQuery([
        'vehicleList', currentPage, order, search, perPage
    ], () => {
        setVehicleLoading(true);

        return getAll({ page: currentPage, order, search, per_page: perPage })
    }, {
        refetchOnWindowFocus: false
    });

    const { mutate: removeVehicleMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'Viatura apagada com sucesso.' }
                ]);

                setRemoveVehicle(undefined);

                if (vehicleList.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    RefetchVehicleList();
                }
            },
            onError: () => setRemoveVehicle(undefined)
        }
    );

    const onSearch = (search_value: any) => {
        setCurrentPage(1);
        setSearch(search_value);
    }

    const showPageNewVehicle = () => {
        toPage('create');
    }

    const handleTableChange = (
        pagination: PaginationProps,
        filters: Record<string, FilterValue | null>,
        sorter: any
    ) => {
        if (pagination.current != currentPage) {
            setCurrentPage(Number(pagination.current));
        }

        if (pagination.pageSize != perPage) {
            setPerPage(pagination.pageSize);
            setCurrentPage(1);
        }

        if (sorter.order) {     
            let orderBy = `${sorter.field}-${sorter.order.substr(0, sorter.order.length -3)}`;

            if (order != orderBy) {
                setOrder(orderBy);
            }
        }
    };

    const toPage = (page: string, vehicle_id: number = 0) => {
        let pages = {
            create: '/assets/vehicles/create',
            edit: `/assets/vehicles/${vehicle_id}/edit`,
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const columns = [
        { title: "Marca", dataIndex: "brand", sorter: true, key: "brand" },
        { title: "Modelo", dataIndex: "model", sorter: true, key: "model" },
        { title: "Grupo", dataIndex: "group", sorter: true, key: "group",
            render: (_: any, record: any) => (props.groups[record.group])
        },
        { title: "Matrícula", dataIndex: "license", sorter: false, key: "license" },
        { title: "Km Actuais", dataIndex: "km", sorter: true, key: "km" },
        { title: "Ações", key: "action",
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission("vehicles-vehicles:write") &&
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button type="default" shape="circle" size="middle"
                            icon={<EditOutlined />}
                            onClick={() => toPage('edit', record.id)}
                        />
                    </Tooltip>
                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle"
                            icon={<DeleteOutlined />}
                            onClick={() => setRemoveVehicle(record)}
                        />
                    </Tooltip>
                </Space>
            ),
            width: "15%"
        }
    ];

    useEffect(() => {
        if (dataVehicleList) {
            setVehicleList(dataVehicleList.data.map((vehicle:any) => {
                return {
                    key: vehicle.data.id,
                    ...vehicle.data
                }
            }));

            setCurrentPage(dataVehicleList.meta.current_page);
            setPerPage(dataVehicleList.meta.per_page);
            setTotal(dataVehicleList.meta.total);
            setVehicleLoading(false);
        }

    }, [dataVehicleList])

    return (
        <>
            <DisplayAlert />
            <Card bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_vehicles"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_vehicle" className="item_search">
                            <Search placeholder="Pesquisa a viatura" enterButton="Pesquisar" allowClear size="large"
                                maxLength={255} onSearch={onSearch} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission("vehicles-vehicles:write") &&
                        <Button type="primary" size="large" onClick={showPageNewVehicle}>Criar novo</Button>
                    }
                </div>
                <Divider />
                <div className="vehicle_table">
                    <GenericTable
                        columns={columns}
                        dataSource={vehicleList}
                        pagination={{
                            current: currentPage,
                            pageSize: perPage,
                            total: total,
                            showSizeChanger: true
                        }}
                        loading={vehicleLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !vehicleList.length && !search,
                            textOne: 'Esta tabela encontra-se vazia, uma vez que ainda não foram criadas viaturas.',
                            textTwo: profilePermissionService.hasPermission("vehicles-vehicles:write")
                                ? `Para começar, crie uma nova viatura.`
                                : '',
                            link: profilePermissionService.hasPermission("vehicles-vehicles:write")
                                ? `/assets/vehicles/create`
                                : ''
                        }}
                        handleTableChange={handleTableChange}
                    />

                    <ConfirmModal
                        open={!!removeVehicle}
                        title={`Tem certeza que deseja apagar a viatura "${removeVehicle?.license}"?`}
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => removeVehicleMutate(removeVehicle?.id)}
                        onCancel={() => setRemoveVehicle(undefined)}
                    ></ConfirmModal>
                </div>
            </Card>
        </>
    )
}
