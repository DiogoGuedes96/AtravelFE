import AssignedService from './AssignedService';
import ServiceDropped from './ServiceDropped';

export default function TimetableCell({
    services,
    theadTds,
    conductor,
    onDroppedService
}: {
    services: any[],
    theadTds: any,
    conductor: any,
    onDroppedService: (service: any) => void
}) {
    return (
        <td style={{ ...theadTds, height: 88 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {services.map((service: any) => (
                    <ServiceDropped key={service.id} service={service} onDroppedService={onDroppedService}>
                        <AssignedService service={service} conductor={conductor} onRemovedService={onDroppedService} />
                    </ServiceDropped>
                ))}
            </div>
        </td>
    )
}