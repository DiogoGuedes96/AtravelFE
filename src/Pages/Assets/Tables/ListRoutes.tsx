import { DeleteOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Row, Select, Space, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { useQuery } from 'react-query';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import ExportBtn from '../../../components/Commons/Export/ExportButton';
import { cutLongText, downloadExcel } from '../../../services/utils';

const { Search } = Input;

interface PropsRoutes {
    tableRoutes: any,
    onRemoveRoute: any,
    routes: { id: number, from_zone: string, to_zone: string }[],
    onUpdateTableRoute: any,
    type?: string,
    action?: string,
    tableName?: string
}

export default function ListRoutes({
    tableRoutes,
    onRemoveRoute,
    routes,
    onUpdateTableRoute,
    type,
    action,
    tableName
}: PropsRoutes) {
    const [listRoutes, setListRoutes] = useState<{
        route_id: number,
        from_zone: string,
        to_zone: string,
        route: string,
        pax14: string,
        pax58: string
    }[]>([]);

    const [currentPage, setCurrentPage] = useState<number | undefined>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [removeRouteId, setRemoveRouteId] = useState<number | undefined>(undefined);

    const [formSearch] = Form.useForm();    

    const { refetch: refreshListRoutes } = useQuery(
        ['loadRoutes', currentPage, search, perPage],
        () => {
            let list = tableRoutes.map((route: any) => {
                return {
                    key: route.route_id,
                    ...route,
                    route: `${route.from_zone} - ${route.to_zone}`
                };
            });

            if (search.length) {
                list = list.filter((route: any) => route.route.toLowerCase().includes(search.toLowerCase()));
            }

            setTotal(list.length);
            setListRoutes(list);
        }, { refetchOnWindowFocus: false }
    );

    const handleTableChange = (
        pagination: PaginationProps,
        filters: Record<string, FilterValue | null>,
        sorter: any
    ) => {
        if (pagination.current != currentPage) {
            setCurrentPage(pagination.current);
        }

        if (pagination.pageSize != perPage) {
            setPerPage(pagination.pageSize);
            setCurrentPage(1);
        }
    };

    const onSearch = (search_value: any) => {
        setSearch(search_value);
        setCurrentPage(1);
    };

    const onFilterRoutes = (
        input: string, option?: { key: string, value: number, children: [] }
    ) => (option?.children.join('') ?? '').toLowerCase().includes(input.toLowerCase());

    const exportData = () => downloadExcel(listRoutes.map(route => {
        return {
            'Rota': route.route,
            'Valor Pax 1-4': route.pax14,
            'Valor Pax 5-8': route.pax58
        };
    }), tableName);

    const columns = [
        {
            title: 'Rota', dataIndex: 'route', sorter: false, key: 'route', width: 545,
            render: (_:any, record: any) => (
                <Select
                    showSearch placeholder="Rota" style={{width: '100%'}} size="large"
                    value={record.route_id} filterOption={onFilterRoutes}
                    onChange={(value) => {
                        let newValues = { ...record };
                        newValues.route_id = value;
                        onUpdateTableRoute(record.route_id, newValues);
                    }}>
                    {routes.map((route) => (
                        <Select.Option key={route.id} value={route.id}
                            disabled={tableRoutes.some((item: any) => 
                                item.route_id == route.id
                                && item.route_id != record.route_id
                            )}>
                            {cutLongText(route.from_zone + ' - ' + route.to_zone, 50)}
                        </Select.Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Valor Pax 1-4', dataIndex: 'pax14', key: 'pax14', width: 180,
            render: (_: any, record: any) => (
                <InputNumber value={record.pax14} min={0.1} placeholder="Insira o n° de Pax" size="large" maxLength={5}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    onChange={(value) => {
                        let newValues = { ...record };
                        newValues.pax14 = value;

                        if (type == 'staff') {
                            newValues.pax58 = value;
                        }

                        onUpdateTableRoute(record.route_id, newValues);
                    }} />
            )
        },
        {
            title: 'Valor Pax 5-8', dataIndex: 'pax58', key: 'pax58', width: 180,
            render: (_: any, record: any) => (
                <InputNumber value={record.pax58} min={0.1} placeholder="Insira o n° de Pax" size="large"
                    disabled={type == 'staff'} maxLength={5}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    onChange={(value) => {
                        let newValues = { ...record };
                        newValues.pax58 = value;
                        onUpdateTableRoute(record.route_id, newValues);
                    }} />
            )
        },
        {
            title: 'Ações', key: 'action', width: 50,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip placement="top" title="Apagar">
                        <Button
                            onClick={() => setRemoveRouteId(record.route_id)}
                            type="default" shape="circle" size="middle"
                            icon={<DeleteOutlined />} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    useEffect(() => {
        refreshListRoutes();
    }, [tableRoutes]);

    return (
        <>
            <Form
                form={formSearch}
                name="search_routes"
                layout="vertical"
                className="form_search_horizontal"
                autoComplete="off">

                <Row>
                    <Col span={24}>
                        <div className="zone_result_size_n_export">
                            <Form.Item name="search_route" className="item_search">
                                <Search enterButton="Pesquisar rota" placeholder="Ex: Faro" allowClear size="large"
                                    maxLength={255} onSearch={onSearch} />
                            </Form.Item>

                            <ExportBtn disabled={action != 'edit' || !total} onClick={() => exportData()} />
                        </div>
                    </Col>
                </Row>
            </Form>

            <div className="route_table">
                <GenericTable
                    columns={columns}
                    dataSource={listRoutes}
                    pagination={{
                        current: currentPage,
                        pageSize: perPage,
                        total: total,
                        showSizeChanger: false
                    }}
                    loading={false}
                    handleTableChange={handleTableChange}
                />

                <ConfirmModal
                    open={!!removeRouteId}
                    title="Tem certeza que deseja apagar essa rota?"
                    okText="Apagar" cancelText="Voltar"
                    onOk={() => {
                        onRemoveRoute(removeRouteId);
                        setRemoveRouteId(undefined);
                    }}
                    onCancel={() => setRemoveRouteId(undefined)}
                ></ConfirmModal>
            </div>
        </>
    )
}