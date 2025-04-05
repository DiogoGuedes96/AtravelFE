import { Button, DatePicker, Form, Input, Select, Space, Tooltip } from 'antd';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useEffect, useState } from 'react';
import { getAllWorkers } from '../../../services/reports.service';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useQuery } from 'react-query';
import { downloadExcel, formatCurrency } from '../../../services/utils';
import { EyeOutlined } from '@ant-design/icons';
import { RangePickerProps } from 'antd/es/date-picker';
import ExportBtn from '../../../components/Commons/Export/ExportButton';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

export default function List(props: any) {
    const [workers, setWorkers] = useState([]);
    const [currentPage, setCurrentPage] = useState<number | undefined>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [order, setOrder] = useState<string>('name-asc');
    const [workersToExport, setWorkersToExport] = useState([]);
    const [exportIsLoading, setExportIsLoading] = useState<boolean>(false);
    const [workerId, setWorkerId] = useState<number | string | undefined>(undefined);
    const [workersId, setWorkersId] = useState<(number | string)[]>([]);
    const [formFilter] = Form.useForm();

    const navigate = useNavigate();

    const { isLoading: workerLoading } = useQuery(
        ['loadWorkers', currentPage, search, order, perPage, startDate, endDate, workerId, workersId],
        () => getAllWorkers({
            page: currentPage, type: props.type, per_page: perPage, search,
            start_date: startDate, end_date: endDate,
            worker_id: props.type === 'operators' ? workersId : Number(workerId)
        }),
        {
            onSuccess: response => {
                setWorkers(response.data.map((worker: any) => {
                    return {
                        key: worker.data.id,
                        ...worker.data
                    }
                }));

                setCurrentPage(response.meta.current_page);
                setPerPage(response.meta.per_page);
                setTotal(response.meta.total);
            },
            refetchOnWindowFocus: false
        }
    );

    const { refetch: loadWorkersToExport } = useQuery(
        ['loadWorkersToExport', search, order, startDate, endDate, workerId, workersId],
        () => getAllWorkers({
            type: props.type, search, start_date: startDate, end_date: endDate,
            worker_id: props.type === 'operators' ? workersId : Number(workerId)
        }),
        {
            onSuccess: response => setWorkersToExport(onMapDataToExport(response.data)),
            refetchOnWindowFocus: false,
            enabled: false
        }
    );

    const onSearch = (search_value: any) => {
        console.log('onSearch', search_value)
        setCurrentPage(1);
        setSearch(search_value);
    };

    const onFilter = () => {
        setWorkersToExport([]);

        setCurrentPage(1);
        let start_date = formFilter.getFieldValue('filter_start_date');
        let end_date = formFilter.getFieldValue('filter_end_date');

        setStartDate(start_date ? start_date.format('YYYY-MM-DD') : '');
        setEndDate(end_date ? end_date.format('YYYY-MM-DD') : '');

        if (props.type === 'operators') {
            setWorkersId(formFilter.getFieldValue(props.workerFilter));
        } else {
            setWorkerId(formFilter.getFieldValue(props.workerFilter));
        }
    };

    const onClearFilters = () => {
        setCurrentPage(1);
        setStartDate('');
        setEndDate('');
        setWorkerId('');
        setWorkersId([]);

        setWorkersToExport([]);
    };

    const disabledStartDate: RangePickerProps['disabledDate'] = (current) => {
        let endDate = formFilter.getFieldValue('filter_end_date');

        if (endDate) {
            return current >= endDate;
        }

        return false;
    };

    const disabledEndDate: RangePickerProps['disabledDate'] = (current) => {
        let startDate = formFilter.getFieldValue('filter_start_date');

        if (startDate) {
            return current <= startDate;
        }

        return false;
    };

    const handleTableChange = (
        pagination: PaginationProps,
        filters: Record<string, FilterValue | null>,
        sorter: any
    ) => {
        if (pagination.current !== currentPage) {
            setCurrentPage(pagination.current);
        }

        if (pagination.pageSize !== perPage) {
            setPerPage(pagination.pageSize);
            setCurrentPage(1);
        }

        if (sorter.order) {
            let orderBy = `${sorter.field}-${sorter.order.substr(0, sorter.order.length - 3)}`;

            if (order !== orderBy) {
                setOrder(orderBy);
            }
        }
    };

    const onMapDataToExport = (data: any) => {
        return data.map((worker: any) => {
            if (props.type === 'staff') {
                return {
                    'ID': worker.data.id,
                    [props.label]: worker?.data?.name
                };
            }

            if (props.type === 'operators') {
                return {
                    'ID': worker.data.id,
                    [props.label]: worker?.data?.name,
                    'N° de Reservas': worker?.data?.totalBookings,
                    'N° de Serviços': worker?.data?.totalServices,
                    'Valor total reservas': formatCurrency(worker?.data?.totalValueBookings || 0),
                };
            }

            return {
                'ID': worker.data.id,
                [props.label]: worker?.data?.name,
                'N° de Serviços': worker?.data?.totalServices,
                'Valores': formatCurrency(worker?.data?.totalValueServices || 0),
            };
        });
    };

    const exportData = () => downloadExcel(workersToExport, `Controle-Relatório-${props.label}`);

    const columnsOperator = [
        { title: props.label, dataIndex: 'name', sorter: false, key: 'name' },
        { title: 'N° de Reservas', dataIndex: 'totalBookings', sorter: false, key: 'totalBookings', width: 150 },
        { title: 'N° de Serviços', dataIndex: 'totalServices', sorter: false, key: 'totalServices', width: 150 },
        {
            title: 'Valor total reservas', dataIndex: 'totalValueBookings', sorter: false, key: 'totalValueBookings', width: 200,
            render: (_: any, record: any) => formatCurrency(record?.totalValueBookings || 0)
        },
        {
            title: 'Ação', key: 'action', width: 80,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip placement="top" title="Detalhes">
                        <Button type="text" shape="circle" size="middle"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/control/reports/${props.type}/${record?.id}/details`)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const columnsSupplier = [
        { title: props.label, dataIndex: 'name', sorter: false, key: 'name' },
        { title: 'N° de Serviços', dataIndex: 'totalServices', sorter: false, key: 'totalServices', width: 150 },
        {
            title: 'Valores', dataIndex: 'totalValueServices', sorter: false, key: 'totalValueServices', width: 150,
            render: (_: any, record: any) => formatCurrency(record?.totalValueServices || 0)
        },
        {
            title: 'Ação', key: 'action', width: 80,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip placement="top" title="Detalhes">
                        <Button type="text" shape="circle" size="middle"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/control/reports/${props.type}/${record?.id}/details`)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const columnsStaff = [
        { title: 'Motorista', dataIndex: 'name', sorter: false, key: 'name' },
        {
            title: 'Ação', key: 'action', width: 80,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip placement="top" title="Detalhes">
                        <Button type="text" shape="circle" size="middle"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/control/reports/${props.type}/${record?.id}/details`)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    useEffect(() => {
        formFilter.setFieldsValue({
            filter_start_date: '',
            filter_end_date: '',
            [props.workerFilter]: ''
        });
    }, []);

    useEffect(() => {
        if (!startDate) {
            formFilter.setFieldValue('filter_start_date', '');
        }

        if (!endDate) {
            formFilter.setFieldValue('filter_end_date', '');
        }

        formFilter.setFieldValue(props.workerFilter, props.type === 'operators' ? workersId : workerId);
    }, [startDate, endDate, workerId, workersId]);

    useEffect(() => {
        if (workersToExport.length) {
            exportData();
        }

        setExportIsLoading(false);
    }, [workersToExport]);

    return (
        <>
            <div className="filter_bar">
                <Form
                    form={formFilter}
                    name="filter_services"
                    layout="vertical"
                    className="form_filter_horizontal"
                    autoComplete="off">
                    <Form.Item label={props.label} name={props.workerFilter} className="item_filter">
                        <Select placeholder={`Selecione o ${props.label.toLowerCase().replace('staff', 'motorista')}`}
                            size="large" style={{ width: 350 }} value={props.type === 'operators' ? workersId : workerId}
                            maxTagCount="responsive" mode={props.type === 'operators' ? 'multiple' : undefined}>
                            {props.workers?.data?.map((item: any) => (
                                <Select.Option key={item.data.id} value={item.data.id}>{item.data.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {props.type != 'staff' && <>
                        <Form.Item name="filter_start_date" label="Data início" className='item_filter'>
                            <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}
                                disabledDate={disabledStartDate} />
                        </Form.Item>

                        <Form.Item name="filter_end_date" label="Data fim" className='item_filter'>
                            <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}
                                disabledDate={disabledEndDate} />
                        </Form.Item>
                    </>}

                    <Button onClick={onFilter} size="large">Filtrar</Button>

                    {(startDate || endDate || workerId || workersId.length)
                        ? <Button type="link" onClick={onClearFilters} size="large">Limpar</Button>
                        : ''
                    }
                </Form>
            </div>

            <div className="table">
                <GenericTable
                    columns={
                        props.type == 'staff'
                            ? columnsStaff
                            : (props.type == 'suppliers'
                                ? columnsSupplier
                                : columnsOperator)
                    }
                    dataSource={workers}
                    pagination={{
                        current: currentPage,
                        pageSize: perPage,
                        showSizeChanger: true,
                        total: total
                    }}
                    loading={workerLoading}
                    totalChildren={
                        <div className="zone_result_size_n_export">
                            <ShowDataLength size={total} className="show_result_size" />
                            {props.type !== 'staff' && <ExportBtn disabled={!total} loading={exportIsLoading}
                                onClick={() => {
                                    if (workersToExport.length) {
                                        exportData();
                                    } else {
                                        setExportIsLoading(true);
                                        loadWorkersToExport();
                                    }
                                }} />
                            }
                        </div>
                    }
                    empty={{
                        createTheFirst: !workers.length && !search && !startDate && !endDate,
                        textOne: !workers.length && !search && !startDate && !endDate
                            ? 'Nenhum dado a ser exibido.'
                            : 'Não há resultados para a combinação de filtros selecionada.',
                        textTwo: !workers.length && !search && !startDate && !endDate
                            ? ''
                            : 'Tente novamente com diferentes valores de filtro.',
                        link: '',
                        createText: ''
                    }}
                    handleTableChange={handleTableChange}
                />
            </div>
        </>
    );
}