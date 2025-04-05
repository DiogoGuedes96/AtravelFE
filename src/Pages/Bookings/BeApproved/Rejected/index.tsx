import { Card, Form } from 'antd';
import DisplayAlert from '../../../../components/Commons/Alert';
import { useEffect, useState } from 'react';
import { getAll } from '../../../../services/bookings.service';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import DrawerRejected from './Drawer';
import TableRejected from './Table';
import FilterRejected from './Filter';

export default function ListRejected(props: any) {
    const [bookingsRejected, setBookingsRejected] = useState([]);
    const [currentPage, setCurrentPage] = useState<number | undefined>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>('created_at-desc');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [details, setDetails] = useState<any>(null);

    const [formSearch] = Form.useForm();
    const [formFilter] = Form.useForm();

    const { update } = useParams()

    const { isLoading: bookingsLoadingRejected, refetch: loadBookingsRejected } = useQuery(
        ['loadBookingsRejected', currentPage, search, order, perPage, startDate, endDate ],
        () => getAll({
            page: currentPage, per_page: perPage, order, search, status: 'refused',
            start_date: startDate, end_date: endDate, created_by: 'operator'
        }),
        {
            onSuccess: response => {
                setBookingsRejected(response.data.map((booking: any) => {
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
        if (pagination.current !== currentPage) {
            setCurrentPage(pagination.current);
        }

        if (pagination.pageSize !== perPage) {
            setPerPage(pagination.pageSize);
            setCurrentPage(1);
        }

        if (sorter.order) {     
            let orderBy = `${sorter.field}-${sorter.order.substr(0, sorter.order.length -3)}`;

            if (order !== orderBy) {
                setOrder(orderBy);
            }
        }
    };

    useEffect(() => {
        formFilter.setFieldsValue({ filter_start_date: '', filter_end_date: ''});
    }, []);

    useEffect(() => {
        if (!startDate) {
            formFilter.setFieldValue('filter_start_date', '');
        }

        if (!endDate) {
            formFilter.setFieldValue('filter_end_date', '');
        }

    }, [startDate, endDate]);

    useEffect(() => {
        loadBookingsRejected()
    }, [update]);

    const drawerProps = {
        openDetails,
        onCloseDetails,
        details
    }

    const tableProps = { 
        bookingsLoadingRejected,
        handleTableChange,
        onOpenDetails,
        currentPage,
        search,
        startDate,
        endDate,
        bookingsRejected,
        perPage,
        total
    }

    const filterProps = { 
        formSearch,
        setSearch,
        formFilter,
        startDate,
        endDate,
        setCurrentPage,
        setStartDate,
        setEndDate,
    }

    return (
        <>
            <DisplayAlert />
            <Card bodyStyle={{ padding: 8 }}>
                <FilterRejected {...filterProps} />
                <div className="table">
                    <TableRejected {...tableProps}/>
                    <DrawerRejected {...drawerProps} />
                </div>
            </Card>
        </>
    );
}