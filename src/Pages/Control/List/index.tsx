import { Button, Card, Form, Input, DatePicker, Select } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useEffect, useState } from 'react';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useMutation, useQuery } from 'react-query';
import ExportBtn from '../../../components/Commons/Export/ExportButton';
import { downloadExcel } from '../../../services/utils';
import { getAll as loadServices, update as updateServices } from '../../../services/bookingServices.service';
import { getAll as loadBookings, update as updateBookings } from '../../../services/bookings.service';
import { RangePickerProps } from 'antd/lib/date-picker';
import { getAll as loadWorkers } from '../../../services/workers.service';

const { Search } = Input;

export default function List(props: any) {
    const [services, setServices] = useState<any>([]);
    const [currentPage, setCurrentPage] = useState<number | undefined>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>();
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [servicesToExport, setServicesToExport] = useState([]);
    const [exportIsLoading, setExportIsLoading] = useState<boolean>(false);
    const [wasPaid, setWasPaid] = useState<string>('');
    const [workerId, setWorkerId] = useState<number | string | undefined>(undefined);
    const [formSearch] = Form.useForm();
    const [formFilter] = Form.useForm();

    const {
        isLoading: getServicesLoading,
        refetch: refetchData,
        isRefetching: isRefetchingGetServices
    } = useQuery(
        ['loadData', currentPage, search, order, perPage, startDate, endDate, wasPaid, workerId],
        () => {
            if (props.type == 'operators') {
                return loadBookings({
                    page: currentPage, per_page: perPage, was_paid: wasPaid,
                    order, search, start_date: startDate, end_date: endDate,
                    operator_id: Number(workerId), firstService: '1'
                });
            }

            return loadServices({
                page: currentPage, per_page: perPage, was_paid: wasPaid,
                order, search, start_date: startDate, end_date: endDate, onlyWorkerType: props.type,
                staff_id: props.type == 'staff' ? Number(workerId) : undefined,
                supplier_id: props.type == 'suppliers' ? Number(workerId) : undefined
            });
        },
        {
            onSuccess: response => {
                setServices(response.data.map((record: any) => {
                    return {
                        key: record.data.id,
                        ...record.data,
                        ...record.relationships
                    }
                }));

                setServicesToExport([]);
                setCurrentPage(response.meta.current_page);
                setPerPage(response.meta.per_page);
                setTotal(response.meta.total);
            },
            refetchOnWindowFocus: false
        }
    );

    const { refetch: loadDataToExport } = useQuery(
        ['loadDataToExport'],
        () => {
            if (props.type == 'operators') {
                return loadBookings({
                    was_paid: wasPaid, operator_id: Number(workerId), firstService: '1',
                    order, search, start_date: startDate, end_date: endDate,
                });
            }

            return loadServices({
                was_paid: wasPaid, onlyWorkerType: props.type,
                order, search, start_date: startDate, end_date: endDate,
                staff_id: props.type == 'staff' ? Number(workerId) : undefined,
                supplier_id: props.type == 'suppliers' ? Number(workerId) : undefined
            });
        },
        {
            onSuccess: response => setServicesToExport(props.onMapDataToExport(response.data)),
            refetchOnWindowFocus: false,
            enabled: false
        }
    );

    const { data: workers } = useQuery(
        ['loadWorkers'],
        () => loadWorkers({ type: props.type, status: 'active' }),
        { refetchOnWindowFocus: false }
    );

    const { mutate: updateBookingWasPaidMutate } = useMutation(updateBookings, {
        onError: () => refetchData()
    });

    const { mutate: updateServiceWasPaidMutate } = useMutation(updateServices, {
        onError: () => refetchData()
    });

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
        setWasPaid(formFilter.getFieldValue('filter_was_paid'));
        setWorkerId(formFilter.getFieldValue(props.workerFilter));
    };

    const onClearFilters = () => {
        setCurrentPage(1);
        setStartDate('');
        setEndDate('');
        setWasPaid('');
        setWorkerId('')
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
        if (pagination.current != currentPage) {
            setCurrentPage(pagination.current);
        }

        if (pagination.pageSize != perPage) {
            setPerPage(pagination.pageSize);
            setCurrentPage(1);
        }

        if (sorter.order) {
            let orderBy = `${sorter.field}-${sorter.order.substr(0, sorter.order.length - 3)}`;

            if (order != orderBy) {
                setOrder(orderBy);
            }
        }
    };

    const onChangeWasPaid = (checked: boolean, id: number) => {
        const obj = {
            values: { 'was_paid': checked }, id
        };

        if (props.type == 'operators') {
            updateBookingWasPaidMutate(obj);
        } else {
            updateServiceWasPaidMutate(obj);
        }
    };

    const exportData = () => downloadExcel(servicesToExport, `Controle-${props.label}`);

    useEffect(() => {
        formFilter.setFieldsValue({
            filter_start_date: '',
            filter_end_date: '',
            filter_was_paid: '',
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

        formFilter.setFieldValue('filter_was_paid', wasPaid);

        formFilter.setFieldValue(props.workerFilter, workerId);
    }, [startDate, endDate, wasPaid, workerId]);

    useEffect(() => {
        if (servicesToExport.length) {
            exportData();
        }

        setExportIsLoading(false);
    }, [servicesToExport]);

    useEffect(() => {
        if (props.changeWasPaid) {
            onChangeWasPaid(props.changeWasPaid.value, props.changeWasPaid.id);
        }
    }, [props.changeWasPaid]);

    return (
        <>
            <div className="content_page">
                <DisplayAlert />
                <Card bodyStyle={{ padding: 8 }}>
                    <div className="search_bar">
                        <Form
                            form={formSearch}
                            name="search_services"
                            className="form_search_horizontal"
                            autoComplete="off">

                            <Form.Item name="search_services" className="item_search">
                                <Search onSearch={onSearch} placeholder={`Pesquisa por nome`} enterButton="Pesquisar" allowClear size="large" maxLength={255} />
                            </Form.Item>
                        </Form>
                    </div>

                    <div className="filter_bar">
                        <Form
                            form={formFilter}
                            name="filter_services"
                            layout="vertical"
                            className="form_filter_horizontal"
                            autoComplete="off">
                            <Form.Item label={props.label} name={props.workerFilter} className="item_filter">
                                <Select placeholder="Todos" size="large"
                                    style={{ width: 350 }} value={workerId} allowClear>
                                    <Select.Option key={0} value={''}>Todos</Select.Option>
                                    {workers?.data?.map((item: any) => (
                                        <Select.Option key={item.data.id} value={item.data.id}>{item.data.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="filter_start_date" label="Data início" className="item_filter">
                                <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}
                                    disabledDate={disabledStartDate} />
                            </Form.Item>

                            <Form.Item name="filter_end_date" label="Data fim" className="item_filter">
                                <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}
                                    disabledDate={disabledEndDate} />
                            </Form.Item>

                            <Form.Item label="Pagamento" name="filter_was_paid" className="item_filter">
                                <Select placeholder="Todos" value={wasPaid} style={{ width: 120 }} size="large"
                                    options={[
                                        { value: '', label: 'Todos' },
                                        { value: '1', label: 'Pago' },
                                        { value: '0', label: 'Não pago' }
                                    ]} />
                            </Form.Item>

                            <Button onClick={onFilter} size="large">Filtrar</Button>

                            {(startDate || endDate || wasPaid || workerId)
                                && <Button type="link" onClick={onClearFilters} size="large">Limpar</Button>
                            }
                        </Form>
                    </div>

                    <div className="table">
                        <GenericTable
                            columns={props.columns}
                            dataSource={services}
                            pagination={{
                                current: currentPage,
                                pageSize: perPage,
                                showSizeChanger: true,
                                total: total
                            }}
                            loading={getServicesLoading || isRefetchingGetServices}
                            totalChildren={
                                <div className="zone_result_size_n_export">
                                    <ShowDataLength size={total} className="show_result_size" />
                                    <ExportBtn disabled={!total} loading={exportIsLoading}
                                        onClick={() => {
                                            if (servicesToExport.length) {
                                                exportData();
                                            } else {
                                                setExportIsLoading(true);
                                                loadDataToExport();
                                            }
                                        }} />
                                </div>
                            }
                            empty={{
                                createTheFirst: true,
                                textOne: !services.length && !search && !startDate && !endDate
                                    ? 'Nenhum dado a ser tratado.'
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
                </Card>
            </div>
        </>
    );
}