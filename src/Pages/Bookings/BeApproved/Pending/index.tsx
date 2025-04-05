import { Card, Form } from 'antd';
import DisplayAlert from '../../../../components/Commons/Alert';
import { useEffect, useState } from 'react';
import { getAll, updateStatus } from '../../../../services/bookings.service';
import { AlertService } from '../../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import ModalPending from './Modal';
import TablePending from './Table';
import FilterPending from './Filter';

export default function ListPending(props: any) {
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [order, setOrder] = useState<string>('created_at-desc');
    const [total, setTotal] = useState<number>(0);
    const [bookings, setBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState<number | undefined>(1);
    const [search, setSearch] = useState<string>('');
    const [cancelBooking, setCancelBooking] = useState<any | undefined>(undefined);
    const [approveBooking, setApproveBooking] = useState<any | undefined>(undefined);
    const [styleResults, setStyleResults] = useState<any | undefined>(props.styleResults ?? undefined);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    const [formSearch] = Form.useForm();
    const [formFilter] = Form.useForm();
    const [formCancelBooking] = Form.useForm();

    const navigate = useNavigate();
    const { tab } = useParams();

    const { isLoading: bookingsLoading, refetch: loadBookings } = useQuery(
        ['loadBookings', currentPage, search, order, perPage, startDate, endDate],
        () => getAll({
            page: currentPage, per_page: perPage, order, search, status: 'pending',
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
                    {
                        text: `A reserva ${cancelBooking?.id} foi rejeitada.`,
                        type: 'warning',
                        nextPage: true
                    }
                ]);
                setCancelBooking(undefined);
                navigate('/bookings/bookingsToApprove/rejected/update')
            }
        }
    );

    const onSubmitCancelBooking = () => {
        formCancelBooking
            .validateFields()
            .then(values => cancelBookingMutate({
                values: { ...values, status: 'refused' }, id: cancelBooking?.id
            }))
            .catch(() => null);
    }

    const onSubmitApproveBooking = () => {
        navigate(`/bookings/bookings/${approveBooking.id}/edit/approve`)
    }

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

    const filterProps = {
        formSearch,
        setSearch,
        formFilter,
        startDate,
        endDate,
        status,
        setCurrentPage,
        setStartDate,
        setEndDate,
        setStatus
    }

    const tableProps = {
        setApproveBooking,
        setCancelBooking,
        setCurrentPage,
        setPerPage,
        setOrder,
        bookings,
        currentPage,
        bookingsLoading,
        search,
        startDate,
        endDate,
        status,
        perPage,
        order,
        total,
        styleResults
    }

    const modalProps = {
        cancelBooking,
        approveBooking,
        onSubmitCancelBooking,
        onSubmitApproveBooking,
        setCancelBooking,
        setApproveBooking,
        formCancelBooking
    }

    return (
        <>
            {tab === 'pendent' && <DisplayAlert />}
            <Card bodyStyle={{ padding: 8 }}>
                {!props.hideFilter && <FilterPending {...filterProps} />}
                <div className="table">
                    <TablePending {...tableProps} />
                    <ModalPending {...modalProps} />
                </div>
            </Card>
        </>
    );
}