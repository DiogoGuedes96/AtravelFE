import moment from "moment";
import { cutLongText } from "../../../../services/utils";
import { Button, Space, Tooltip } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import GenericTable from "../../../../components/Commons/Table/generic-table.component";
import ShowDataLength from "../../../../components/Commons/Table/results-length-table.component";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";

export default function TablePending(props: any) {
    const {
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
    } = props

    const columns = [
        { title: 'ID Reserva', dataIndex: 'id', key: 'id', sorter: false },
        { 
            title: 'Data', dataIndex: 'start_date', key: 'start_date', sorter: true,
            render: (_:any, record: any) => 
                moment(record.start_date, 'YYYY-MM-DD').format('DD/MM/YYYY')
        },
        { 
            title: 'Hora', dataIndex: 'hour', key: 'hour', sorter: true,
            render: (_: any, record: any) => 
                record.hour ? moment(record.hour, 'H:mm:ss').format('H[:]mm') : ''
        },
        { title: 'Cliente', dataIndex: 'client_name', key: 'client_name', sorter: false,
            render: (_:any, record: any) => (cutLongText(record.client_name, 40))
        },
        {
            title: 'Operador ', dataIndex: 'operator', key: 'operator', sorter: false,
            render: (_:any, record: any) => 
                (cutLongText(record.operator.data.name, 40))
        },
        {
            title: 'Ações', key: 'action', width: 100,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip placement="top" title="Aprovar">
                        <Button 
                            type="default" 
                            shape="circle" 
                            size="middle" 
                            icon={<CheckOutlined style={{color: '#52C41A'}} />}
                            onClick={() => setApproveBooking(record)} />
                    </Tooltip>
                    <Tooltip placement="top" title="Rejeitar">
                        <Button 
                            type="default" 
                            shape="circle" 
                            size="middle" 
                            icon={<CloseOutlined style={{color: '#F5222D'}} />}
                            onClick={() => setCancelBooking(record)} 
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

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

    return (
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
                <div className="zone_result_size_n_export" style={styleResults}>
                    <ShowDataLength 
                        text='Resultados' 
                        size={total} 
                        className="show_result_size" 
                        />
                </div>
            }
            empty={{
                createTheFirst: !bookings.length && !search && !startDate && !endDate && !status,
                textOne: 'Nenhuma reserva reiejtada.',
                textTwo: '',
                link: '',
                createText: ''
            }}
            handleTableChange={handleTableChange}
        />
    )
}