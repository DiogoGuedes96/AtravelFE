import {
    Card, Popover, Space, Typography
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import ServiceDetails from './ServiceDetails';
import { useState } from 'react';
import { cutLongText } from '../../services/utils';

const { Text } = Typography;

export default function AssignedService({
    service,
    drag,
    conductor,
    onRemovedService
}: {
    service: any,
    drag?: any,
    conductor: any,
    onRemovedService: (service: any) => void
}) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Popover trigger="click" placement='left' open={open}
            onOpenChange={() => setOpen(!open)}
            content={
                <div className='timetable-popover'>
                    <ServiceDetails service={service} conductor={conductor}
                        onRemovedService={onRemovedService}
                        onCloseDetails={() => setOpen(false)} />
                </div>
            }>
            <Card
                size="small"
                ref={drag}
                style={{
                    borderColor: '#d9d9d9',
                    marginBottom: 2,
                    borderLeft: `solid 4px ${service?.serviceType?.data?.color || '#8c8c8c'}`,
                    borderRadius: 5,
                    cursor: 'pointer'
                }}
                bodyStyle={{ padding: '0 5px' }}>
                <Space direction='vertical' size={1}>
                    <Text strong>{cutLongText(service?.serviceType?.data?.name, 14)}</Text>
                    <Text strong>{cutLongText(service?.pickup_location, 14)}</Text>
                    <Text strong>{dayjs(service?.hour, 'H:mm:ss').format('HH:mm')}</Text>
                    <Text strong>{cutLongText(service?.dropoff_location, 14)}</Text>
                </Space>
            </Card>
        </Popover>
    )
}