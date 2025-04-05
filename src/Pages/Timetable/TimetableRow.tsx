import { useDrop } from 'react-dnd';
import Conductor from './Conductor';
import TimetableCell from './TimetableCell';
import { usePDF } from '@react-pdf/renderer';
import TimetablePDF from './TimetablePDF';
import { Dayjs } from 'dayjs';
import { useEffect } from 'react';

export default function TimetableRow({
    date,
    conductor,
    services,
    theadTds,
    onDroppedService,
    onShareByEmail
}: {
    date: Dayjs,
    conductor: any,
    services: any[],
    theadTds: any,
    onDroppedService: (service: any) => void,
    onShareByEmail: (data: {
        date: string,
        conductor: string,
        email: string,
        timetable: Blob | string
    }) => void
}) {
    const [pdfInstante, updatePdfInstante] = usePDF({
        document: <TimetablePDF date={date} conductor={conductor} services={services} />
    });

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'serviceCard',
        drop: () => ({
            type: conductor?.data?.type,
            conductorId: conductor?.data?.id
        }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    const isActive = canDrop && isOver;

    let backgroundColor = '#ffffff';

    if (isActive) {
        backgroundColor = '#136a8333';
    } else if (canDrop) {
        backgroundColor = '#ffffff';
    }

    useEffect(() => {
        updatePdfInstante(<TimetablePDF date={date} conductor={conductor} services={services} />);
    }, [services]);

    return (
        <tr ref={drop} style={{ backgroundColor }}>
            <td style={{ ...theadTds, backgroundColor: '#fafafa', padding: 10, height: 88 }}>
                <Conductor
                    conductor={conductor}
                    totalServices={services.length}
                    onShareByEmail={() => onShareByEmail({
                        date: date.format('DD/MM/YYYY'),
                        conductor: conductor?.data?.name,
                        email: conductor?.data?.email,
                        timetable: pdfInstante.blob || ''
                    })} />
            </td>
            {[...Array(24)].map((_: undefined, index: number) => (
                <TimetableCell
                    key={'td_content_' + conductor?.data?.id + '_' + index}
                    conductor={conductor}
                    theadTds={theadTds}
                    services={services.filter((service: any) => service.hour.split(':')[0] === index.toString().padStart(2, '0'))}
                    onDroppedService={onDroppedService} />
            ))}
        </tr>
    )
}