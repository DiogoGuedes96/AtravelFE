import {
    Badge, Button, Card, DatePicker, Divider, Drawer,
    Form, Input, Modal, Select, Space, Tooltip, Typography
} from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { useMutation, useQuery } from 'react-query';
import { getAll, remove, getColumns, updateColumns } from '../../../services/bookingServices.service';
import { getAll as loadServiceTypes } from '../../../services/serviceTypes.service';
import { getAll as loadServiceStates } from '../../../services/serviceStates.service';
import { getAll as loadVehicles } from '../../../services/vehicles.service';
import { getAll as loadWorkers } from '../../../services/workers.service';
import { all as loadZones } from '../../../services/zones.service';
import { getAll as loadLocations } from '../../../services/locations.service';
import ProfilePermissionService from '../../../services/profilePermissions.service';
import { AlertService } from '../../../services/alert.service';
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import moment from 'moment';
import { RangePickerProps } from 'antd/lib/date-picker';
import DisplayAlert from '../../../components/Commons/Alert';
import { cutLongText, downloadExcel, formatCurrency } from '../../../services/utils';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import FormService from './Form';
import ExportBtn from '../../../components/Commons/Export/ExportButton';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import { usePDF } from "@react-pdf/renderer";
import ExportServicesPDF from './ExportServicesPDF';
import ShowHistoric from './ShowHistoric';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';

const { Text } = Typography;
const { Search } = Input;

export default function ConsultServices() {
    const [services, setServices] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number | undefined>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [order, setOrder] = useState<string>('created_at-desc');
    const [search, setSearch] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
    const [serviceType, setServiceType] = useState<(number | string)[]>([]);
    const [servicesToExport, setServicesToExport] = useState<any[]>([]);
    const [selectColumns, setSelectColumns] = useState<string[]>([]);
    const [selectColumnsChanged, setSelectColumnsChanged] = useState<boolean>(false);
    const [openHistoric, setOpenHistoric] = useState<boolean>(false);
    const [historic, setHistoric] = useState<any[]>([]);

    const [openServiceModalForm, setOpenServiceModalForm] = useState<boolean>(false);
    const [serviceToEdit, setServiceToEdit] = useState<any>();
    const [removeService, setRemoveService] = useState<any | undefined>(undefined);
    const [modalFormTitle, setModalFormTitle] = useState<string>('');

    const [pdfInstante, updatePdfInstante] = usePDF({
        document: <ExportServicesPDF services={servicesToExport} filters={{ start_date: startDate, end_date: endDate }} />
    });

    const [formSearch] = Form.useForm();
    const [formFilter] = Form.useForm();
    const [formSelectColumns] = Form.useForm();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const settings = {
        edit: { title: 'Editar serviço' }
    };

    const { isLoading: servicesLoading, refetch: loadServices } = useQuery(
        ['loadServices', currentPage, search, order, perPage, startDate, endDate, serviceType],
        () => getAll({
            page: currentPage, per_page: perPage, order, search, withHistoric: '1',
            start_date: startDate, end_date: endDate, service_type_id: serviceType
        }),
        {
            onSuccess: response => {
                setServices(response.data.map((service: any) => {
                    return {
                        key: service.data.id,
                        ...service.data,
                        ...service.relationships
                    }
                }));

                setCurrentPage(response.meta.current_page);
                setPerPage(response.meta.per_page);
                setTotal(response.meta.total);

                if (selectColumns.length) {
                    loadServicesToExport();
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const { refetch: loadServicesToExport, isLoading: exportIsLoading } = useQuery(
        ['loadServicesToExport'],
        () => getAll({ order, search, start_date: startDate, end_date: endDate, service_type_id: serviceType }),
        {
            onSuccess: response => setServicesToExport(onMapDataToExport(
                response.data.map((service: any) => {
                    return {
                        key: service.data.id,
                        ...service.data,
                        ...service.relationships
                    }
                })
            )),
            refetchOnWindowFocus: false,
            enabled: false
        }
    );

    useQuery(
        ['loadColumns'],
        () => getColumns(),
        {
            onSuccess: response => {
                let selectOptions = !response.data.length
                    ? columns.filter((column: any) => !column.fixed).map((column: any) => column.key)
                    : response.data;

                formSelectColumns.setFieldValue('columns', selectOptions);
                setSelectColumns(selectOptions);
                loadServicesToExport();
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: updateSelectColumns } = useMutation(updateColumns, {
        onSuccess: () => {
            setSelectColumnsChanged(false);
            loadServicesToExport();
        }
    });

    const { mutate: removeServiceMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: `Serviço ${removeService.booking_id}-${removeService.id} apagado com sucesso.` }
                ]);

                setRemoveService(undefined);

                if (openServiceModalForm) {
                    onCloseServiceModalForm();
                }

                loadServices();
                loadServicesToExport();
            },
            onError: () => {
                setRemoveService(undefined);

                if (openServiceModalForm) {
                    onCloseServiceModalForm();
                }
            }
        }
    );

    const { data: serviceTypes } = useQuery(
        ['loadServiceTypes'],
        () => loadServiceTypes(),
        { refetchOnWindowFocus: false }
    );

    const { data: serviceStates } = useQuery(
        ['loadServiceStates'],
        () => loadServiceStates(),
        { refetchOnWindowFocus: false }
    );

    const { data: locations } = useQuery(
        ['loadLocations'],
        () => loadLocations(),
        { refetchOnWindowFocus: false }
    );

    const { data: zones } = useQuery(
        ['loadZones'],
        () => loadZones(),
        { refetchOnWindowFocus: false }
    );

    const { data: staff } = useQuery(
        ['loadStaff'],
        () => loadWorkers({ type: 'staff', status: 'active' }),
        { refetchOnWindowFocus: false }
    );

    const { data: suppliers } = useQuery(
        ['loadSuppliers'],
        () => loadWorkers({ type: 'suppliers', status: 'active' }),
        { refetchOnWindowFocus: false }
    );

    const { data: vehicles } = useQuery(
        ['loadVehicles'],
        () => loadVehicles(),
        { refetchOnWindowFocus: false }
    );

    const onOpenServiceModalForm = (title: string, record: any) => {
        setServiceToEdit(record);
        setModalFormTitle(title);
        setOpenServiceModalForm(true);
    };

    const onCloseServiceModalForm = () => {
        setOpenServiceModalForm(false);
        setServiceToEdit(undefined);
    };

    const onSavedForm = (successMessage: string, newRecord: any = null) => {
        onCloseServiceModalForm();

        setTimeout(() => {
            AlertService.sendAlert([
                { text: successMessage }
            ]);

            loadServices();
            loadServicesToExport();
        }, 500);
    }

    const onExportDataToExcel = () => {
        if (servicesToExport.length) {
            downloadExcel(servicesToExport, 'Serviços');
        }
    };

    const onMapDataToExport = (data: Array<any>) => {
        return data.reduce((newData, service: any) => {
            newData.push(service);
            return newData;
        }, [])
            .map((service: any) => {
                return {
                    'Tipo de serviço': service?.serviceType?.data?.name,
                    ...columns.filter((column: any) =>
                        !column.fixed && column.key !== 'emphasis' && (
                            !selectColumns?.length
                            || selectColumns?.includes(column.key)
                        )
                    ).reduce((object, column) => {
                        object[column.title] = typeof column.renderToExport === 'function'
                            ? column.renderToExport(service)
                            : (typeof column.render === 'function'
                                ? column.render('', service)
                                : service[column.key]);

                        return object;
                    }, {})
                }
            })
    };

    const columns: any[] = [
        {
            title: 'Tipo de serviço', key: 'service_type_id', dataIndex: 'service_type_id', sorter: true, fixed: 'left', width: 214,
            render: (_: any, record: any) => (<Space>
                <Badge color={record?.serviceType?.data?.color} text={record?.serviceType?.data?.name} styles={{ indicator: { width: 12, height: 12 } }} />
            </Space>)
        },
        {
            title: 'Data', key: 'start', dataIndex: 'start', sorter: true, width: 130,
            render: (_: any, record: any) => record.start ? moment(record.start, 'YYYY-MM-DD').format('DD/MM/YYYY') : ''
        },
        {
            title: 'Hora', key: 'hour', dataIndex: 'hour', sorter: true, width: 80,
            render: (_: any, record: any) => record.hour ? moment(record.hour, 'H:mm:ss').format('H:mm') : ''
        },
        {
            title: 'Alerta', key: 'emphasis', dataIndex: 'emphasis', width: 100,
            render: (_: any, record: any) => record?.emphasis === true
                ? (<Tooltip placement="top" title="Ação necessária">
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                </Tooltip>)
                : ''
        },
        { title: 'ID Reserva', key: 'booking_id', dataIndex: 'booking_id', width: 100 },
        {
            title: 'ID Serviço', key: 'id', dataIndex: 'id', width: 100,
            render: (_: any, record: any) => `${record.booking_id}-${record?.id}`
        },
        { title: 'Referência', key: 'reference', dataIndex: ['booking', 'data', 'reference'], width: 100 },
        {
            title: 'Motorista', key: 'driver', width: 150,
            render: (_: any, record: any) => (cutLongText(record?.staff?.data?.name || record?.supplier?.data?.name, 20)),
            renderToExport: (record: any) => record?.staff?.data?.name || record?.supplier?.data?.name
        },
        { title: 'N° Voo', key: 'flight_number', width: 100 },
        {
            title: 'Pick-up', key: 'pickup_location', width: 200, dataIndex: 'pickup_location',
            render: (_: any, record: any) => (cutLongText(record?.pickup_location, 20)),
            renderToExport: (record: any) => record?.pickup_location
        },
        {
            title: 'Drop-off', key: 'dropoff_location', width: 200, dataIndex: 'dropoff_location',
            render: (_: any, record: any) => (cutLongText(record?.dropoff_location, 20)),
            renderToExport: (record: any) => record?.dropoff_location
        },
        { title: 'A', key: 'number_adults', dataIndex: 'number_adults', width: 50 },
        { title: 'C', key: 'number_children', dataIndex: 'number_children', width: 50 },
        {
            title: 'Operador', key: 'operator', width: 150,
            render: (_: any, record: any) => cutLongText(record?.booking?.relationships?.operator?.data?.name, 20),
            renderToExport: (record: any) => record?.booking?.relationships?.operator?.data?.name,
        },
        {
            title: 'Obs. Gerais', key: 'notes', dataIndex: 'notes', width: 200,
            render: (_: any, record: any) => (cutLongText(record?.notes)),
            renderToExport: (record: any) => record?.notes
        },
        {
            title: 'Obs. Internas', key: 'internal_notes', dataIndex: 'internal_notes', width: 200,
            render: (_: any, record: any) => (cutLongText(record?.internal_notes)),
            renderToExport: (record: any) => record?.internal_notes
        },
        {
            title: 'Val. Reserva', key: 'value', width: 130,
            render: (_: any, record: any) => formatCurrency(record?.booking?.data?.value)
        },
        {
            title: 'Ações', key: 'action', width: 120, fixed: 'right',
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission(`bookings-services:write`) &&
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => onOpenServiceModalForm(
                                settings.edit.title,
                                { ...record }
                            )} />
                    </Tooltip>

                    <Tooltip placement="top" title="Histórico do serviço">
                        <Button type="default" shape="circle" size="middle" icon={<ClockCircleOutlined />}
                            onClick={() => onOpenHistoric(record?.historic || [])} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const formService = (
        <FormService bookingId={serviceToEdit?.booking_id} showBookingData={true} service={serviceToEdit} isParent={false}
            closeForm={onCloseServiceModalForm} savedForm={onSavedForm}
            setRemoveService={setRemoveService}
            serviceTypes={serviceTypes?.data?.map((item: any) => item.data) || []}
            serviceStates={serviceStates?.data?.map((item: any) => item.data) || []}
            staff={staff?.data || []} suppliers={suppliers?.data || []}
            vehicles={vehicles?.data?.map((item: any) => item.data) || []}
            locations={locations?.data || []}
            zones={zones?.data || []} />
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
        setServiceType(formFilter.getFieldValue('filter_service_type'));
    };

    const onClearFilters = () => {
        setCurrentPage(1);
        setStartDate('');
        setEndDate('');
        setServiceType([]);
    };

    const onOpenHistoric = (historic: any[]) => {
        setHistoric(historic);
        setOpenHistoric(true);
    };

    const onCloseHistoric = () => {
        setOpenHistoric(false);
        setHistoric([]);
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

    const onChangeSelectColumns = () => {
        let selectedColumns = formSelectColumns.getFieldValue('columns');
        setSelectColumns(selectedColumns);
    }

    const onSubmitSelectColumns = () => {
        if (selectColumnsChanged) {
            updateSelectColumns(selectColumns);
        }
    }

    const allColumnsSelected = () => selectColumns.length == columns.filter((column: any) => !column.fixed).length;

    useEffect(() => {
        formFilter.setFieldsValue({
            filter_start_date: dayjs(startDate),
            filter_end_date: dayjs(endDate),
            filter_service_type: []
        });
    }, []);

    useEffect(() => {
        if (!startDate) {
            formFilter.setFieldValue('filter_start_date', '');
        }

        if (!endDate) {
            formFilter.setFieldValue('filter_end_date', '');
        }

        formFilter.setFieldValue('filter_service_type', serviceType);
    }, [startDate, endDate, serviceType]);

    useEffect(() => {
        if (servicesToExport.length) {
            updatePdfInstante(<ExportServicesPDF services={servicesToExport} filters={{ start_date: startDate, end_date: endDate }} />);
        }
    }, [servicesToExport]);

    return (
        <>
            <div className="content_page">
                {!openServiceModalForm && <DisplayAlert />}
                <Card bodyStyle={{ padding: 8 }}>
                    <div className="search_bar">
                        <Form
                            form={formSearch}
                            name="search_bookings"
                            layout="vertical"
                            className="form_search_horizontal"
                            autoComplete="off">

                            <Form.Item name="search_booking" className="item_search">
                                <Search placeholder="Pesquisa" enterButton="Pesquisar"
                                    allowClear size="large" maxLength={255} onSearch={onSearch} />
                            </Form.Item>
                        </Form>
                    </div>

                    <div className="filter_bar">
                        <Form
                            form={formFilter}
                            name="filter_bookings"
                            layout="vertical"
                            className="form_filter_horizontal"
                            autoComplete="off">
                            <Form.Item label="Tipo de serviço" name="filter_service_type" className="item_filter">
                                <Select placeholder="Todos" size="large" mode="multiple" value={serviceType} style={{ width: 200 }}>
                                    {(serviceTypes?.data || []).map((item: any) => (
                                        <Select.Option key={item.data.id} value={item.data.id}>
                                            <Badge color={item.data.color} text={item.data.name} styles={{ indicator: { width: 12, height: 12 } }} />
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Data início" name="filter_start_date" className="item_filter">
                                <DatePicker size="large" placeholder="dd/mm/aaaa" showToday={false}
                                    format={'DD/MM/YYYY'} disabledDate={disabledStartDate} style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="Data fim" name="filter_end_date" className="item_filter">
                                <DatePicker size="large" placeholder="dd/mm/aaaa" showToday={false}
                                    format={'DD/MM/YYYY'} disabledDate={disabledEndDate} style={{ width: '100%' }} />
                            </Form.Item>

                            <Button onClick={onFilter} size="large">Filtrar</Button>

                            {(startDate || endDate || (serviceType && serviceType.length > 0))
                                && <Button type="link" onClick={onClearFilters} size="large">Limpar</Button>
                            }
                        </Form>
                    </div>

                    <div className="table">
                        <GenericTable
                            columns={columns.filter((column: any) =>
                                !selectColumns?.length
                                || (column.fixed || selectColumns?.includes(column.key))
                            )}
                            dataSource={services}
                            pagination={{
                                current: currentPage,
                                pageSize: perPage,
                                showSizeChanger: true,
                                total: total
                            }}
                            loading={servicesLoading}
                            scroll={{ x: 1100 }}
                            totalChildren={
                                <div className="zone_result_size_n_export" style={{ marginTop: 8 }}>
                                    <ShowDataLength className="show_result_size" size={total} />

                                    <Space className="show_result_size">
                                        <Form layout='vertical' form={formSelectColumns} onValuesChange={() => setSelectColumnsChanged(true)}>
                                            <Form.Item name="columns">
                                                <Select placeholder="Todas as colunas" mode="multiple" placement="bottomRight"
                                                    maxTagCount={0} maxTagPlaceholder={(omittedValues) => {
                                                        let label = allColumnsSelected()
                                                            ? 'Todas as colunas'
                                                            : 'Personalizado';

                                                        return (
                                                            <Tooltip title={omittedValues.map(({ label }) => label).join(', ')}>
                                                                <span>{label}</span>
                                                            </Tooltip>
                                                        );
                                                    }}
                                                    dropdownRender={(menu) => (<>
                                                        <Button block type='text' style={{
                                                            display: 'flex', justifyContent: 'space-between',
                                                            backgroundColor: allColumnsSelected() ? '#d1fdff' : ''
                                                        }}
                                                            disabled={allColumnsSelected()}
                                                            onClick={() => {
                                                                let selectOptions = columns
                                                                    .filter((column: any) => !column.fixed)
                                                                    .map((column: any) => column.key);

                                                                formSelectColumns.setFieldValue('columns', selectOptions);
                                                                setSelectColumns(selectOptions);
                                                                setSelectColumnsChanged(true);
                                                            }}>
                                                            Todas as colunas
                                                            {allColumnsSelected() ? <CheckOutlined style={{ color: '#107b99', marginTop: 3 }} /> : ''}
                                                        </Button>
                                                        {menu}
                                                    </>)}
                                                    onChange={onChangeSelectColumns}
                                                    onBlur={onSubmitSelectColumns}
                                                    value={selectColumns} style={{ width: 250 }}
                                                    options={columns.filter((column: any) => !column.fixed)
                                                        .map((item: any) => {
                                                            return {
                                                                key: item.key, value: item.key, label: item.title
                                                            }
                                                        })} />
                                            </Form.Item>
                                        </Form>

                                        <ExportBtn disabled={!total} loading={exportIsLoading || pdfInstante.loading}
                                            isDropdown={true} onClick={() => null}
                                            items={[
                                                { key: 'excel', label: 'Exportar para Excel', onClick: () => onExportDataToExcel() },
                                                {
                                                    key: 'pdf', label: (
                                                        <a href={pdfInstante.url || '#'} download='Serviços.pdf'>Guardar como PDF</a>
                                                    )
                                                },
                                                {
                                                    key: 'print', label: (
                                                        <a href={pdfInstante.url || '#'} target='_blank'>Imprimir</a>
                                                    )
                                                }
                                            ]} />
                                    </Space>
                                </div>
                            }
                            handleTableChange={handleTableChange}
                        />
                    </div>

                    <Modal
                        open={openServiceModalForm} width={1180} style={{ top: 20 }}
                        footer={null} maskClosable={false} closeIcon={false}>
                        <DisplayAlert />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong style={{ marginTop: 10 }}>{modalFormTitle}</Text>
                        </div>

                        <Divider style={{ marginBottom: 0 }}></Divider>

                        {formService}
                    </Modal>

                    <ConfirmModal
                        open={!!removeService} zIndex={2000}
                        title={`Tem certeza que deseja apagar o serviço "${removeService?.booking_id}-${removeService?.id}"?`}
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => removeServiceMutate(removeService?.id)}
                        onCancel={() => setRemoveService(undefined)}
                    ></ConfirmModal>

                    <Drawer
                        title="Histórico da reserva" placement="right" width={450}
                        closeIcon={false} open={openHistoric} onClose={onCloseHistoric}
                        extra={<Button type="text" shape="circle" size="middle" icon={<CloseOutlined />}
                            onClick={onCloseHistoric} />}>
                        {historic && <ShowHistoric historic={historic} />}
                    </Drawer>
                </Card>
            </div>
        </>
    )
}