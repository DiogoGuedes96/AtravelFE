import List from '.';
import { Switch, Tooltip } from 'antd';
import { cutLongText, formatCurrency } from '../../../services/utils';
import moment from 'moment';
import { useState } from 'react';

export default function ControlOperatorsPage() {
    const [changeWasPaid, setChangeWasPaid] = useState<{ value: boolean, id: number } | undefined>(undefined);

    const columns: any[] = [
        { title: 'Operador', dataIndex: ['operator', 'data', 'name'], key: 'operator' },
        { title: 'Referência', dataIndex: 'operator_id', key: 'operator_id' },
        { title: 'ID Reserva', dataIndex: 'id', key: 'id', sorter: false },
        {
            title: 'Data (1º serviço)', dataIndex: 'start_date', key: 'start_date',
            render: (_: any, record: any) => {
                if (record?.serviceVouchers[0]?.voucher?.start) {
                    return moment(record?.serviceVouchers[0]?.voucher?.start, 'YYYY-MM-DD').format('DD/MM/YYYY');
                }

                return '';
            }
        },
        {
            title: 'Drop-off (1º serviço)', dataIndex: 'dropoff_location', key: 'dropoff_location',
            render: (_: any, record: any) => {
                if (record?.serviceVouchers[0]?.voucher?.dropoff_location) {
                    return cutLongText(record?.serviceVouchers[0]?.voucher?.dropoff_location, 20);
                }

                return '';
            },
        },
        {
            title: 'Cliente', dataIndex: 'client_name', key: 'client',
            render: (_: any, record: any) => cutLongText(record?.client_name, 40)
        },
        {
            title: 'Valor reserva', dataIndex: 'value', key: 'value', width: 130,
            render: (_: any, record: any) => formatCurrency(record?.value || 0)
        },
        {
            title: 'Pagamento', dataIndex: 'was_paid', key: 'was_paid', sorter: true, width: 150,
            render: (_: any, record: any) => {
                return (<Tooltip title={record.was_paid ? 'Cancelar confirmação' : 'Confirmar pagamento'}>
                    <Switch checked={record.was_paid}
                        style={{ marginRight: 10 }}
                        onChange={(event: boolean) => {
                            setChangeWasPaid({ value: event, id: record.id });

                            record.was_paid = event;
                        }} />
                    {record.was_paid ? 'Pago' : 'Não Pago'}
                </Tooltip>);
            }
        }
    ];

    const label = 'Operador';
    const workerFilter = 'filter_operator_id';

    const onMapDataToExport = (data: any) => {
        return data.map((record: any) => {
            return {
                'Operador': record?.relationships?.operator?.data?.name,
                'Referência': record?.data?.operator_id,
                'ID Reserva': record?.data?.id,
                'Data (1º serviço)': record?.relationships?.serviceVouchers[0]?.voucher?.start ? moment(record?.relationships?.serviceVouchers[0]?.voucher?.start, 'YYYY-MM-DD').format('DD/MM/YYYY') : '',
                'Drop-off (1º serviço)': record?.relationships?.serviceVouchers[0]?.voucher?.dropoff_location ? record?.relationships?.serviceVouchers[0]?.voucher?.dropoff_location : '',
                'Cliente': record?.data?.client_name,
                'Valor Reserva': formatCurrency(record?.data?.value || 0),
                'Pagamento': record?.data?.was_paid ? 'Pago' : 'Não Pago'
            };
        });
    };

    return (
        <div className="content_page">
            <List
                type="operators"
                label={label}
                workerFilter={workerFilter}
                columns={columns}
                onMapDataToExport={onMapDataToExport}
                changeWasPaid={changeWasPaid} />
        </div>
    )
}
