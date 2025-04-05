import List from '.';
import { Switch, Tooltip } from 'antd';
import { cutLongText, formatCurrency } from '../../../services/utils';
import moment from 'moment';
import { useState } from 'react';

export default function ControlStaffPage(props: any) {
    const [changeWasPaid, setChangeWasPaid] = useState<{ value: boolean, id: number } | undefined>(undefined);

    const calculateValue = (record: any) => {
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

            return formatCurrency(value);
        }

        return formatCurrency(0);
    };

    const columns: any[] = [
        { title: 'Motorista', dataIndex: ['staff', 'data', 'name'], key: 'staff' },
        {
            title: 'Data', dataIndex: 'start', key: 'start', sorter: true,
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
            title: 'Cliente', dataIndex: ['booking', 'data', 'client_name'], key: 'client',
            render: (_: any, record: any) => cutLongText(record?.booking?.data?.client_name, 40)
        },
        {
            title: 'Valor', dataIndex: 'value', key: 'value',
            render: (_: any, record: any) => calculateValue(record)
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

    const label = 'Motoristas';
    const workerFilter = 'filter_staff_id';

    const onMapDataToExport = (data: any) => {
        return data.map((service: any) => {
            return {
                'ID': service.data.id,
                'Motorista': service?.relationships?.staff?.data?.name,
                'Data': service?.data?.start ? moment(service.data.start, 'YYYY-MM-DD').format('DD/MM/YYYY') : '',
                'Pick-up': service.data.pickup_location,
                'Drop-off': service.data.dropoff_location,
                'Cliente': service?.relationships?.booking?.data?.client_name,
                'Valor': calculateValue({
                    ...service.data,
                    ...service.relationships
                }),
                'Pagamento': service?.data?.was_paid ? 'Pago' : 'Não Pago'
            };
        });
    };

    return (
        <div className="content_page">
            <List
                type="staff"
                label={label}
                workerFilter={workerFilter}
                columns={columns}
                onMapDataToExport={onMapDataToExport}
                changeWasPaid={changeWasPaid} />
        </div>
    )
}
