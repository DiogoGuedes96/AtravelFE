import {
    Empty, Input, Typography
} from 'antd';
import ServiceToAssign from './ServiceToAssign';
import ServiceDropped from './ServiceDropped';

const { Text } = Typography;

export default function Services({
    services,
    onDroppedService
}: {
    services: any[],
    onDroppedService: (service: any) => void
}) {
    return (
        <>
            <Text strong style={{ color: '#1f1f1f', fontSize: '20px' }}>Serviços por atribuir</Text>

            <div style={{ marginTop: 20 }}>
                {!services.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Sem serviços por atribuir" />}

                {services.map((service: any) => (
                    <ServiceDropped key={service.id} service={service} onDroppedService={onDroppedService}>
                        <ServiceToAssign service={service} />
                    </ServiceDropped>
                ))}
            </div>
        </>
    )
}