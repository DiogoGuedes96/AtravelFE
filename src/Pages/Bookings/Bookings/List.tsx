import { Button, Card, DatePicker, Form, Input, Space, Tooltip } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useEffect, useState } from 'react';
import { getAll, remove } from '../../../services/bookings.service';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useNavigate } from 'react-router-dom';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import { cutLongText } from '../../../services/utils';
import ProfilePermissionService from "../../../services/profilePermissions.service";
import moment from 'moment';
import { RangePickerProps } from 'antd/lib/date-picker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import ModalVoucher from './ModalVoucher';

const { Search } = Input;

export default function Bookings(props: any) {
    const [bookings, setBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>('created_at-desc');
    const [removeBooking, setRemoveBooking] = useState<any | undefined>(undefined);
    const [bookingVoucher, setBookingVoucher] = useState<any | undefined>(undefined);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [formSearch] = Form.useForm();
    const [formFilter] = Form.useForm();

    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { isLoading: bookingsLoading, refetch: loadBookings } = useQuery(
        ['loadBookings', currentPage, search, order, perPage, startDate, endDate],
        () => getAll({
            page: currentPage, per_page: perPage, order,
            search, start_date: startDate, end_date: endDate
        }),
        {
            onSuccess: response => {
                setBookings(response.data.map((booking: any) => {
                    return {
                        key: booking.data.id,
                        ...booking.data,
                        ...booking.relationships
                    }
                }));

                setCurrentPage(response.meta.current_page);
                setPerPage(response.meta.per_page);
                setTotal(response.meta.total);
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: RemoveBookingMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: `Reserva n° ${removeBooking?.id} apagada com sucesso.` }
                ]);

                setRemoveBooking(undefined);

                if (bookings.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    loadBookings();
                }
            }
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

    const toPage = (page: string, booking_id: number = 0) => {
        let pages = {
            create: '/bookings/bookings/create',
            edit: `/bookings/bookings/${booking_id}/edit`
        };

        navigate(pages[page as keyof typeof pages]);
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

    const columns = [
        { title: 'ID Reserva', dataIndex: 'id', key: 'id', sorter: true,
            render: (_:any, record: any) => (<Space>
                {record.id}
                {record.emphasis && <Tooltip placement="top" title="Ação necessária">
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                </Tooltip>}
            </Space>)
        },
        {
            title: 'Data da Reserva', dataIndex: 'created_at', key: 'created_at', sorter: true,
            render: (_:any, record: any) => `${moment(record.start_date, 'YYYY-MM-DD').format('DD/MM/YYYY')}${record.hour ? moment(record.hour, 'H:mm:ss').format('[, às] H[h]mm') : ''}`
        },
        {
            title: 'Operador', dataIndex: 'operator', key: 'operator', sorter: false,
            render: (_:any, record: any) => (cutLongText(record?.operator?.data?.name || '', 40))
        },
        { title: 'Referência', dataIndex: 'reference', key: 'reference', sorter: false },
        {
            title: 'Ações', key: 'action', width: 150,
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission("bookings-bookings:write") &&
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => toPage('edit', record.id)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                            onClick={() => setRemoveBooking(record)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Voucher">
                        <Button type="default" shape="circle" size="middle" icon={<FileTextOutlined />}
                            onClick={() => setBookingVoucher(record?.id)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    useEffect(() => {
        formFilter.setFieldsValue({ filter_start_date: '', filter_end_date: '' });
    }, []);

    useEffect(() => {
        if (!startDate) {
            formFilter.setFieldValue('filter_start_date', '');
        }

        if (!endDate) {
            formFilter.setFieldValue('filter_end_date', '');
        }
    }, [startDate, endDate]);

    return (
        <>
            {!bookingVoucher && <DisplayAlert />}
            <Card bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_bookings"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_booking" className="item_search">
                            <Search placeholder="Pesquisa por nome do cliente, nº reserva ou referência" enterButton="Pesquisar"
                            allowClear size="large" maxLength={255} style={{ width: 550 }} onSearch={onSearch} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission("bookings-bookings:write") &&
                        <Button type="primary" onClick={() => toPage('create')} size="large">Nova reserva</Button>
                    }
                </div>

                <div className="filter_bar">
                    <Form
                        form={formFilter}
                        name="filter_bookings"
                        layout="vertical"
                        className="form_filter_horizontal"
                        autoComplete="off">
                        <Form.Item label="Data início" name="filter_start_date" className="item_filter">
                            <DatePicker size="large" placeholder="dd/mm/aaaa" showToday={false}
                                format={'DD/MM/YYYY'} disabledDate={disabledStartDate} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item label="Data fim" name="filter_end_date" className="item_filter">
                            <DatePicker size="large" placeholder="dd/mm/aaaa" showToday={false}
                                format={'DD/MM/YYYY'} disabledDate={disabledEndDate} style={{ width: '100%' }} />
                        </Form.Item>

                        <Button onClick={onFilter} size="large">Filtrar</Button>
                        
                        {(startDate || endDate)
                            && <Button type="link" onClick={onClearFilters} size="large">Limpar</Button>
                        }
                    </Form>
                </div>

                <div className="table">
                    <GenericTable
                        columns={columns}
                        dataSource={bookings}
                        pagination={{
                            current: currentPage,
                            pageSize: perPage,
                            showSizeChanger: true,
                            total: total
                        }}
                        loading={bookingsLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !bookings.length && !search && !startDate && !endDate,
                            textOne: 'Nenhuma reserva criada.',
                            textTwo: '',
                            link: profilePermissionService.hasPermission("bookings-bookings:write")
                                ? '/bookings/bookings/create'
                                : '',
                            createText: 'Nova reserva'
                        }}
                        handleTableChange={handleTableChange}
                    />

                    <ConfirmModal
                        open={!!removeBooking}
                        title={`A reserva n° ${removeBooking?.id} tem serviços associados.`}
                        content='Se apagar esta reserva, todos os serviços associados serão apagados.'
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => RemoveBookingMutate(removeBooking?.id)}
                        onCancel={() => setRemoveBooking(undefined)}
                    ></ConfirmModal>

                    <ModalVoucher bookingId={bookingVoucher} lang='en' onClose={() => setBookingVoucher(undefined)} />
                </div>
            </Card>
        </>
    );
}