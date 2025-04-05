import { Button, Card, Col, DatePicker, Divider, Drawer, Form, Input, Modal, Row, Select, Space, Tooltip, Typography } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { CloseOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useEffect, useState } from 'react';
import { getAll, updateStatus } from '../../../services/bookings.service';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useNavigate } from 'react-router-dom';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import { cutLongText, capitalized } from '../../../services/utils';
import ProfilePermissionService from "../../../services/profilePermissions.service";
import { RangePickerProps } from 'antd/lib/date-picker';
import moment from 'moment';
import ShowDetails from './ShowDetails';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';

const { Search } = Input;
const { Text } = Typography;

export default function BookingOperators(props: any) {
    const [bookings, setBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState<number | undefined>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>('created_at-desc');
    const [cancelBooking, setCancelBooking] = useState<any | undefined>(undefined);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [details, setDetails] = useState<any>(null);
    const [status, setStatus] = useState<string>('');

    const [formSearch] = Form.useForm();
    const [formFilter] = Form.useForm();
    const [formCancelBooking] = Form.useForm();

    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const statusOptions = [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'refused', label: 'Refused' },
        { value: 'canceled', label: 'Canceled' }
    ];

    const { isLoading: bookingsLoading, refetch: loadBookings } = useQuery(
        ['loadBookings', currentPage, search, order, perPage, startDate, endDate, status],
        () => getAll({
            page: currentPage, per_page: perPage, order, search, status,
            start_date: startDate, end_date: endDate, created_by: 'operator'
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

    const { mutate: cancelBookingMutate } = useMutation(updateStatus,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: `Booking n° ${cancelBooking?.id} cancelled successfully.`, type: 'warning' }
                ]);
                setCancelBooking(undefined);
                loadBookings();
            }
        }
    );

    const onSubmitCancelBooking = () => {
        formCancelBooking
            .validateFields()
                .then(values => cancelBookingMutate({
                    values: { ...values, status: 'canceled' }, id: cancelBooking?.id
                }))
                .catch(() => null);
    }

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
        setStatus(formFilter.getFieldValue('filter_status'));
    };

    const onClearFilters = () => {
        setCurrentPage(1);
        setStartDate('');
        setEndDate('');
        setStatus('');
    };

    const onOpenDetails = (record: any) => {
        setDetails(record);
        setOpenDetails(true);
    };

    const onCloseDetails = () => {
        setOpenDetails(false);
        setDetails(null);
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
            let orderBy = `${sorter.field}-${sorter.order.substr(0, sorter.order.length -3)}`;

            if (order != orderBy) {
                setOrder(orderBy);
            }
        }
    };

    const toPage = (page: string, booking_id: number = 0) => {
        let pages = {
            create: '/bookings/operators/create',
            edit: `/bookings/operators/${booking_id}/edit`
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
        { title: 'Number', dataIndex: 'id', key: 'id', sorter: false },
        { title: 'Date', dataIndex: 'start_date', key: 'start_date', sorter: true },
        { title: 'Time', dataIndex: 'hour', key: 'hour', sorter: true,
            render: (_: any, record: any) => record.hour ? moment(record.hour, 'H:mm:ss').format('h:mm a') : ''
        },
        { title: 'Customer', dataIndex: 'client_name', key: 'client_name', sorter: false,
            render: (_:any, record: any) => (cutLongText(record.client_name, 40))
        },
        {
            title: 'Operator', dataIndex: 'operator', key: 'operator', sorter: false,
            render: (_:any, record: any) => (cutLongText(record?.operator?.data?.name || '', 40))
        },
        { title: 'Status', dataIndex: 'status', key: 'status', sorter: false,
            render: (_:any, record: any) => capitalized(record.status)
        },
        {
            title: 'Actions', key: 'action', width: 100,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip placement="top" title="Details">
                        <Button type="default" shape="circle" size="middle" icon={<EyeOutlined />}
                            onClick={() => onOpenDetails(record)} />
                    </Tooltip>

                    {(
                        profilePermissionService.hasPermission("bookings-operators:write") &&
                        record?.status == 'pending'
                        && dayjs(`${record.start_date} ${record.hour}`).diff(dayjs(), 'hours') >= 24
                    ) && <>
                            <Tooltip placement="top" title="Edit booking">
                                <Button type="default" shape="circle" size="middle" icon={<EditOutlined />}
                                    onClick={() => toPage('edit', record.id)} />
                            </Tooltip>

                            <Tooltip placement="top" title="Cancel booking">
                                <Button type="default" shape="circle" size="middle" icon={<CloseOutlined />}
                                    onClick={() => setCancelBooking(record)} />
                            </Tooltip>
                        </>
                    }
                </Space>
            )
        }
    ];

    useEffect(() => {
        formFilter.setFieldsValue({ filter_start_date: '', filter_end_date: '', filter_status: '' });
    }, []);

    useEffect(() => {
        if (!startDate) {
            formFilter.setFieldValue('filter_start_date', '');
        }

        if (!endDate) {
            formFilter.setFieldValue('filter_end_date', '');
        }

        formFilter.setFieldValue('filter_status', status);
    }, [startDate, endDate, status]);

    return (
        <>
            <DisplayAlert />
            <Card bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_bookings"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_booking" className="item_search">
                            <Search placeholder="Search for client name, number or reference" enterButton="Search"
                            allowClear size="large" maxLength={255} onSearch={onSearch} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission("bookings-operators:write") &&
                        <Button type="primary" onClick={() => toPage('create')} size="large">New booking</Button>
                    }
                </div>

                <div className="filter_bar">
                    <Form
                        form={formFilter}
                        name="filter_bookings"
                        layout="vertical"
                        className="form_filter_horizontal"
                        autoComplete="off">
                        <Form.Item label="Start Date" name="filter_start_date" className="item_filter">
                            <DatePicker size="large" placeholder="yyyy-mm-dd" showToday={false}
                               disabledDate={disabledStartDate} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item label="End Date" name="filter_end_date" className="item_filter">
                            <DatePicker size="large" placeholder="yyyy-mm-dd" showToday={false}
                               disabledDate={disabledEndDate} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item label="Status" name="filter_status" className="item_filter">
                            <Select placeholder="All" value={status} size="large"
                                options={statusOptions} style={{ width: 170 }} />
                        </Form.Item>

                        <Button onClick={onFilter} size="large">Filter</Button>
                        
                        {(startDate || endDate || status)
                            && <Button type="link" onClick={onClearFilters} size="large">Clear</Button>
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
                            total: total,
                            locale: {
                                items_per_page: '/ page'
                            }
                        }}
                        loading={bookingsLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength text='Results' size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !bookings.length && !search && !startDate && !endDate && !status,
                            textOne: 'No bookings created.',
                            textTwo: '',
                            link: profilePermissionService.hasPermission("bookings-operators:write")
                                ? '/bookings/operators/create'
                                : '',
                            createText: 'New booking'
                        }}
                        handleTableChange={handleTableChange}
                    />

                    <Drawer
                        title="Details" placement="right" closeIcon={false} width={450}
                        open={openDetails} onClose={onCloseDetails}
                        extra={<Button type="text" shape="circle" size="middle" icon={<CloseOutlined />}
                            onClick={onCloseDetails} />}>

                        {details && <>
                            <Row>
                                <Col span={24} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Status</Text>
                                        <Text>{capitalized(details?.status)}</Text>
                                    </Space>
                                </Col>
                            </Row>

                            <ShowDetails details={details} lang="en" />

                            {(
                                profilePermissionService.hasPermission("bookings-operators:write") &&
                                details?.status == 'pending'
                            ) &&
                                <Row>
                                    <Col span={24} style={{ marginBottom: 15 }}>
                                        <Button type="primary" danger block size='large'
                                            style={{ marginTop: 20, backgroundColor: '#f5222d' }}
                                            onClick={() => {
                                                onCloseDetails();
                                                setCancelBooking(details);
                                            }}>
                                                Cancel booking
                                        </Button>
                                    </Col>
                                </Row>
                            }
                        </>}
                    </Drawer>

                    <Modal
                        open={!!cancelBooking} maskClosable={false} closeIcon={false} width={386} style={{ top: 20 }}
                        okText="Cancel booking" cancelText="Return"
                        okButtonProps={{ size: 'large' }} cancelButtonProps={{ size: 'large' }}
                        onOk={onSubmitCancelBooking}
                        onCancel={() => setCancelBooking(undefined)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong style={{ marginTop: 5 }}>Cancel Booking n° {cancelBooking?.id}</Text>
                        </div>
                        <Divider></Divider>

                        <ShowDetails details={cancelBooking} lang="en" />

                        <Form form={formCancelBooking} name="form_booking" layout="vertical" style={{ marginTop: 5 }}>
                            <Row>
                                <Col span={24}>
                                    <Form.Item label="Reason" name="status_reason"
                                        rules={[{
                                            required: true, message: 'Required field.'
                                        }]}>
                                        <Input.TextArea size="large" placeholder="Explain the reason for cancellation."
                                            showCount maxLength={255} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Modal>
                </div>
            </Card>
        </>
    );
}