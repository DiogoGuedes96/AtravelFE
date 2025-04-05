import moment from "moment";
import { cutLongText } from "../../../../services/utils";
import { Button, Space, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import GenericTable from "../../../../components/Commons/Table/generic-table.component";
import ShowDataLength from "../../../../components/Commons/Table/results-length-table.component";

export default function TableRejected(props: any) {
    const {
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
    } = props

    const columns = [
        { title: 'ID Reserva', dataIndex: 'id', key: 'id', sorter: false },
        { 
            title: 'Data', dataIndex: 'start_date', key: 'start_date', sorter: true,
            render: (_:any, record: any) => moment(record.start_date, 'YYYY-MM-DD').format('DD/MM/YYYY')
        },
        { 
            title: 'Hora', dataIndex: 'hour', key: 'hour', sorter: true,
            render: (_: any, record: any) => record.hour ? moment(record.hour, 'H:mm:ss').format('H[:]mm') : ''
        },
        { title: 'Cliente', dataIndex: 'client_name', key: 'client_name', sorter: false,
            render: (_:any, record: any) => (cutLongText(record.client_name, 40))
        },
        {
            title: 'Operador ', dataIndex: 'operator', key: 'operator', sorter: false,
            render: (_:any, record: any) => (cutLongText(record?.operator?.data?.name || '', 40))
        },
        {
            title: 'Ações', key: 'action', width: 100,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip placement="top" title="Detalhes">
                        <Button type="default" shape="circle" size="middle" icon={<EyeOutlined />}
                            onClick={() => onOpenDetails(record)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <GenericTable
            columns={columns}
            dataSource={bookingsRejected}
            pagination={{
                current: currentPage,
                pageSize: perPage,
                showSizeChanger: true,
                total: total
            }}
            loading={bookingsLoadingRejected}
            totalChildren={
                <div className="zone_result_size_n_export">
                    <ShowDataLength 
                        text='Resultados' 
                        size={total} 
                        className="show_result_size" />
                </div>
            }
            empty={{
                createTheFirst: !bookingsRejected.length && !search && !startDate && !endDate,
                textOne: 'Nenhuma reserva reiejtada.',
                textTwo: '',
                link: '',
                createText: ''
            }}
            handleTableChange={handleTableChange}
        />
    )
}