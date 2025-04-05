import { Badge, Button, DatePicker, Form, Input, Select, Space } from 'antd';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useEffect, useState } from 'react';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useQuery } from 'react-query';
import { cutLongText, downloadExcel, formatCurrency } from '../../../services/utils';
import { RangePickerProps } from 'antd/es/date-picker';
import ExportBtn from '../../../components/Commons/Export/ExportButton';
import { getAll as loadServices } from '../../../services/bookingServices.service';
import moment from 'moment';
import Title from 'antd/es/typography/Title';
import { getWorkerById } from '../../../services/reports.service';

const { Search } = Input;

export default function Details(props: any) {
    const [services, setServices] = useState([]);
    const [currentPage, setCurrentPage] = useState<number | undefined>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [year] = useState<number>(new Date().getFullYear());
    const [total, setTotal] = useState<number>(0);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [order, setOrder] = useState<string>('start-asc');
    const [formSearch] = Form.useForm();
    const [servicesToExport, setServicesToExport] = useState([]);
    const [exportIsLoading, setExportIsLoading] = useState<boolean>(false);
    const [worker, setWorker] = useState<any>();
    const [formFilter] = Form.useForm();

    useQuery(
        ['loadWorker', props.id],
        () => getWorkerById(Number(props.id), `?byMonth=1&year=${year}`),
        {
            onSuccess: (response: any) => {
                if (response) {
                    setWorker(response?.data);

                    if (props.type !== 'staff' && response) {
                        setServices(response?.data?.byMonth || []);
                        setTotal(response?.data?.byMonth?.length || 0);
                    }
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const {
        isLoading: getServicesLoading
    } = useQuery(
        ['loadData', currentPage, search, order, perPage, startDate, endDate],
        () => {
            if (props.type == 'staff') {
                return loadServices({
                    page: currentPage, per_page: perPage,
                    order, search, start_date: startDate, end_date: endDate, onlyWorkerType: props.type,
                    staff_id: props.type == 'staff' ? Number(props.id) : undefined,
                    supplier_id: props.type == 'suppliers' ? Number(props.id) : undefined
                });
            }

            return [];
        },
        {
            onSuccess: (response: any) => {
                if (props.type == 'staff') {
                    let total = 0;

                    setServices(response.data.map((record: any) => {
                        total += calculateStaffValue({
                            ...record.data,
                            ...record.relationships
                        });

                        return {
                            key: record.data.id,
                            ...record.data,
                            ...record.relationships
                        }
                    }));

                    setTotalValue(total);
                    setServicesToExport([]);
                    setCurrentPage(response.meta.current_page);
                    setPerPage(response.meta.per_page);
                    setTotal(response.meta.total);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const { refetch: loadservicesToExport } = useQuery(
        ['loadservicesToExport', search, order, startDate, endDate],
        () => {
            if (props.type == 'staff') {
                return loadServices({
                    order, search, start_date: startDate, end_date: endDate, onlyWorkerType: props.type,
                    staff_id: props.type == 'staff' ? Number(props.id) : undefined,
                    supplier_id: props.type == 'suppliers' ? Number(props.id) : undefined
                });
            } else {
                return getWorkerById(Number(props.id), `?byMonth=1&year=${year}`);
            }
        },
        {
            onSuccess: response => {
                if (props.type == 'staff') {
                    setServicesToExport(onMapDataToExport(response.data));
                } else {
                    setServicesToExport(onMapDataToExport(response?.data?.byMonth || []));
                }
            },
            refetchOnWindowFocus: false,
            enabled: false
        }
    );

    const onSearch = (search_value: any) => {
        setCurrentPage(1);
        setSearch(search_value);
    };

    const onFilter = () => {
        setCurrentPage(1);
        let start_date = formFilter.getFieldValue('filter_start_date');
        let end_date = formFilter.getFieldValue('filter_end_date');

        setStartDate(start_date ? start_date.format('YYYY-MM-DD') : '');
        setEndDate(end_date ? end_date.format('YYYY-MM-DD') : '');
    };

    const onClearFilters = () => {
        setCurrentPage(1);
        setStartDate('');
        setEndDate('');
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

    const calculateStaffValue = (record: any) => {
        let route = record?.staff?.relationships?.table?.relationships
            ?.routes?.find((route: any) =>
                route.from_zone_id == record?.pickup_zone_id
                && route.to_zone_id == record?.dropoff_zone_id
            );

        if (route) {
            let totalNumberOfPeople = (record?.number_adults || 0) + (record?.number_children || 0);

            let value = totalNumberOfPeople <= 4
                ? route?.pax14
                : (totalNumberOfPeople <= 8
                    ? route?.pax58
                    : 0);

            return value;
        }

        return 0;
    };

    const onMapDataToExport = (data: any) => {
        return data.map((service: any) => {
            if (props.type == 'staff') {
                return {
                    'Data': service?.data?.start ? moment(service.data.start, 'YYYY-MM-DD').format('DD/MM/YYYY') : '',
                    'Pick-up': service.data.pickup_location,
                    'Drop-off': service.data.dropoff_location,
                    'Valor a receber': formatCurrency(calculateStaffValue({
                        ...service.data,
                        ...service.relationships
                    })),
                };
            }

            return {
                'Mês': service?.month,
                [props.type == 'suppliers'
                    ? 'N° de Reservas'
                    : 'N° de Serviços']: service?.quantity,
                'Valor a receber': formatCurrency(service.value || 0),
            };
        });
    };

    const exportData = () => downloadExcel(servicesToExport, `Controle-Relatório-${props.label}`);

    const years = () => {
        let startYear = 2024;
        const currentYear = new Date().getFullYear();
        const years = [];

        while (startYear <= currentYear) {
            years.push({
                value: startYear,
                label: startYear
            });

            startYear++;
        }

        return years;
    }

    const columnsOperator = [
        { title: 'Mês', dataIndex: 'month', key: 'month' },
        { title: 'N° de Reservas', dataIndex: 'quantity', sorter: false, key: 'quantity', width: 150 },
        {
            title: 'Valor a receber', dataIndex: 'value', key: 'value', width: 180,
            render: (_: any, record: any) => record?.value ? formatCurrency(record?.value) : 0
        },
    ];

    const columnsSupplier = [
        { title: 'Mês', dataIndex: 'month', key: 'month' },
        { title: 'N° de Serviços', dataIndex: 'quantity', sorter: false, key: 'quantity', width: 150 },
        {
            title: 'Valor a receber', dataIndex: 'value', key: 'value', width: 180,
            render: (_: any, record: any) => record?.value ? formatCurrency(record?.value) : 0
        },
    ];

    const columnsStaff = [
        {
            title: 'Data', dataIndex: 'start', key: 'start', sorter: true, width: 130,
            render: (_: any, record: any) => record.start ? moment(record.start, 'YYYY-MM-DD').format('DD/MM/YYYY') : ''
        },
        {
            title: 'Pick-up', dataIndex: 'pickup_location', key: 'pickup_location',
            render: (_: any, record: any) => (cutLongText(record?.pickup_location, 20)),
        },
        {
            title: 'Drop-off', dataIndex: 'dropoff_location', key: 'dropoff_location',
            render: (_: any, record: any) => (cutLongText(record?.dropoff_location, 20)),
        },
        {
            title: 'Tipo de serviço', dataIndex: ['serviceType', 'data', 'name'], key: 'serviceType',
            render: (_: any, record: any) => (<Badge color={record?.serviceType?.data?.color} text={record?.serviceType?.data?.name} styles={{ indicator: { width: 12, height: 12 } }} />)
        },
        { title: 'Nome do cliente', dataIndex: ['booking', 'data', 'client_name'], key: 'client_name' },
        {
            title: 'Valor a receber', dataIndex: 'value', key: 'value', sorter: true, width: 180,
            render: (_: any, record: any) => formatCurrency(calculateStaffValue(record))
        },
    ];

    useEffect(() => {
        if (props.type == 'staff') {
            formFilter.setFieldsValue({
                filter_start_date: '',
                filter_end_date: '',
                [props.workerFilter]: ''
            });
        } else {
            formFilter.setFieldValue('filter_year', '');
        }
    }, []);

    useEffect(() => {
        if (props.type == 'staff') {
            if (!startDate) {
                formFilter.setFieldValue('filter_start_date', '');
            }

            if (!endDate) {
                formFilter.setFieldValue('filter_end_date', '');
            }
        } else {
            formFilter.setFieldValue('filter_year', year);
        }
    }, [startDate, endDate, year]);

    useEffect(() => {
        if (servicesToExport.length) {
            exportData();
        }

        setExportIsLoading(false);
    }, [servicesToExport]);

    return (
        <>
            {props.type == 'staff' &&
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_tables"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_table" className="item_search">
                            <Search onSearch={onSearch} placeholder="Pesquisa por local de pick-up ou drop-off" enterButton="Pesquisar" allowClear size="large" maxLength={255} />
                        </Form.Item>
                    </Form>
                </div>
            }

            <div className="filter_bar">
                <Form
                    form={formFilter}
                    name="filter_services"
                    layout="vertical"
                    className="form_filter_horizontal"
                    style={{ width: '100%' }}
                    autoComplete="off">
                    {props.type == 'staff' ? <>
                        <Form.Item name="filter_start_date" label="Data início" className='item_filter'>
                            <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}
                                disabledDate={disabledStartDate} />
                        </Form.Item>

                        <Form.Item name="filter_end_date" label="Data fim" className='item_filter'>
                            <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}
                                disabledDate={disabledEndDate} />
                        </Form.Item>

                        <Button onClick={onFilter} size="large">Filtrar</Button>

                        {(startDate || endDate)
                            && <Button type="link" onClick={onClearFilters} size="large">Limpar</Button>
                        }

                        <Form.Item label="Valor total do período" className='item_filter' style={{ width: 230, position: 'absolute', right: 24 }}>
                            <Input size='large' placeholder='Selecione um periodo' readOnly value={formatCurrency(totalValue)} />
                        </Form.Item>
                    </>
                        : <Form.Item label="Ano" name="filter_year" className="item_filter">
                            <Select value={year} style={{ width: 200 }} size="large"
                                options={years()} />
                        </Form.Item>
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
                    dataSource={services}
                    pagination={props.type == 'staff' ? {
                        current: currentPage,
                        pageSize: perPage,
                        showSizeChanger: true,
                        total: total
                    } : undefined}
                    loading={getServicesLoading}
                    totalChildren={
                        <div className="zone_result_size_n_export">
                            <Space direction='vertical' className="show_result_size">
                                <Title level={4} style={{ fontWeight: 700, float: 'left' }}>{worker?.name}</Title>

                                {props.type == 'staff' && <ShowDataLength size={total} />}
                            </Space>

                            <ExportBtn disabled={!total} loading={exportIsLoading}
                                onClick={() => {
                                    if (servicesToExport.length) {
                                        exportData();
                                    } else {
                                        setExportIsLoading(true);
                                        loadservicesToExport();
                                    }
                                }} />
                        </div>
                    }
                    empty={{
                        createTheFirst: !services.length && !search && !startDate && !endDate,
                        textOne: !services.length && !search && !startDate && !endDate
                            ? 'Nenhum dado a ser exibido.'
                            : 'Não há resultados para a combinação de filtros selecionada.',
                        textTwo: !services.length && !search && !startDate && !endDate
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