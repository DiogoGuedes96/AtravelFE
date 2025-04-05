import { cloneElement } from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';
import { useMutation } from 'react-query';
import { update } from '../../services/bookingServices.service';
import { notification } from 'antd';

export default function ServiceDropped({
    children,
    service,
    onDroppedService
}: {
    children: any,
    service: any,
    onDroppedService: (service: any) => void
}) {    
    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: 'serviceCard',
        item: service,
        collect: (monitor: DragSourceMonitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult<any>();

            if (
                !dropResult ||
                (dropResult?.type == 'staff' && item.staff_id == dropResult?.conductorId)
                || (dropResult?.type == 'suppliers' && item.supplier_id == dropResult?.conductorId)
            ) {
                return;
            } else {
                let _service = setConductor(item, dropResult?.conductorId, dropResult?.type);

                onDroppedService(_service);

                updateService(
                    {
                        values: {
                            staff_id: _service.staff_id,
                            supplier_id: _service.supplier_id
                        },
                        id: service.id
                    }
                );
            }
        }
    }));

    const { mutate: updateService } = useMutation(update, {
        onSuccess: () => {
            notification.success({
                message: `Serviço atribuído ao condutor.`,
                placement: 'topRight'
            });
        }
    });

    const setConductor = (item: any, conductorId: number, type: string) => {
        if (type == 'staff') {
            item.staff_id = conductorId;
            item.supplier_id = null;
        }
        
        if (type == 'suppliers') {
            item.supplier_id = conductorId;
            item.staff_id = null;
        }

        return item;
    }

    return isDragging
        ? <div ref={dragPreview} />
        : cloneElement(children, {
            drag
        })
}