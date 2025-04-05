import { Button, Card, Divider, Dropdown, Modal, Space, Tooltip, Typography } from 'antd';
import { CheckCircleFilled, DeleteOutlined, EllipsisOutlined, EyeOutlined, SwapOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import GenericTable from '../../components/Commons/Table/generic-table.component';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../components/Commons/Modal/confirm-modal.component';
import { getAllTrashed, remove } from '../../services/bookingServices.service';
import ProfilePermissionService from '../../services/profilePermissions.service';
import { getAll as loadServiceTypes } from '../../services/serviceTypes.service';
import { getAll as loadServiceStates } from '../../services/serviceStates.service';
import { getAll as loadVehicles } from '../../services/vehicles.service';
import { getAll as loadWorkers } from '../../services/workers.service';
import { all as loadZones } from '../../services/zones.service';
import { getAll as loadLocations } from '../../services/locations.service';
import { AlertService } from '../../services/alert.service';
import ShowDataLength from '../../components/Commons/Table/results-length-table.component';
import moment from 'moment';
import FormService from '../Bookings/Services/Form';
import DisplayAlert from '../../components/Commons/Alert';
import { formatCurrency } from '../../services/utils';

const { Title, Text } = Typography;

interface PropsServices {
    bookingId?: any,
    totalServices: Function,
    operator?: any
}

export default function ListServices({ bookingId, totalServices, operator }: PropsServices) {
    const [services, setServices] = useState([]);
    const [openServiceModalForm, setOpenServiceModalForm] = useState<boolean>(false);
    const [removeService, setRemoveService] = useState<any | undefined>(undefined);
    const [serviceToEdit, setServiceToEdit] = useState<any>();
    const [createReturnService, setCreateReturnService] = useState<any>();
    const [modalFormTitle, setModalFormTitle] = useState<string>('');

    const profilePermissionService = ProfilePermissionService.getInstance();

    const settings = {
        details: { title: 'Detalhes serviço' }
    };

    const { isLoading: servicesLoading, refetch: loadServices } = useQuery(
        ['loadServices'],
        () => getAllTrashed({ booking_id: bookingId }),
        {
            onSuccess: response => {
                setServices(response.data.map((service: any) => {
                    return {
                        key: service.data.id,
                        ...service.data,
                        ...service.relationships
                    }
                }));
            },
            refetchOnWindowFocus: false,
            enabled: false
        }
    );

    const { data: serviceTypes } = useQuery(
        ['loadServiceTypes'],
        () => loadServiceTypes(),
        { refetchOnWindowFocus: false }
    );

    const { data: serviceStates } = useQuery(
        ['loadServiceStates'],
        () => loadServiceStates(),
        { refetchOnWindowFocus: false }
    );

    const { data: locations } = useQuery(
        ['loadLocations'],
        () => loadLocations(),
        { refetchOnWindowFocus: false }
    );

    const { data: zones } = useQuery(
        ['loadZones'],
        () => loadZones(),
        { refetchOnWindowFocus: false }
    );

    const { data: staff } = useQuery(
        ['loadStaff'],
        () => loadWorkers({ type: 'staff', status: 'active' }),
        { refetchOnWindowFocus: false }
    );

    const { data: suppliers } = useQuery(
        ['loadSuppliers'],
        () => loadWorkers({ type: 'suppliers', status: 'active' }),
        { refetchOnWindowFocus: false }
    );

    const { data: vehicles } = useQuery(
        ['loadVehicles'],
        () => loadVehicles(),
        { refetchOnWindowFocus: false }
    );

    const { mutate: removeServiceMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: `Serviço ${removeService.booking_id}-${removeService.id} apagado com sucesso.` }
                ]);

                setRemoveService(undefined);

                if (openServiceModalForm) {                    
                    onCloseServiceModalForm();
                }

                loadServices();
            },
            onError: () => {
                setRemoveService(undefined);

                if (openServiceModalForm) {                    
                    onCloseServiceModalForm();
                }
            }
        }
    );

    const onOpenServiceModalForm = (title: string, record: any) => {
        setServiceToEdit(record);
        setModalFormTitle(title);
        setOpenServiceModalForm(true);
    };

    const onCloseServiceModalForm = () => {
        setOpenServiceModalForm(false);
        setServiceToEdit(undefined);
    };

    const columns = [
        { title: 'Número', key: 'number',
            render: (_: any, record: any) => `Serviço ${record.booking_id}-${record.id}`
        },
        { title: 'Data', key: 'start', dataIndex: 'start',
            render: (_: any, record: any) => record.start ? moment(record.start, 'YYYY-MM-DD').format('DD/MM/YYYY') : ''
        },
        { title: 'Hora', key: 'hour', dataIndex: 'hour',
            render: (_: any, record: any) => record.hour ? moment(record.hour, 'H:mm:ss').format('H:mm') : ''
        },
        { title: 'Tipo', key: 'service_type_id', dataIndex: 'service_type_id',
            render: (_: any, record: any) => (record?.serviceType?.data?.name)
        },
        { title: 'Staff/Fornecedor', key: 'staff_id', dataIndex: 'staff_id',
            render: (_: any, record: any) => (record?.staff?.data?.name || record?.supplier?.data?.name)
        },
        { title: 'Valor', key: 'value', dataIndex: 'value',
            render: (_: any, record: any) => (record?.value ? formatCurrency(record?.value) : '')
        },
        {
            title: 'Ações', key: 'action', width: 100,
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission(`bookings-services:write`) &&
                <Space size="small">
                    <Tooltip placement="top" title="Detalhes">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EyeOutlined />}
                            onClick={() => onOpenServiceModalForm(
                                settings.details.title,
                                { ...record }
                            )} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const formService = (
        <FormService bookingId={bookingId} service={serviceToEdit} isParent={true}
            closeForm={onCloseServiceModalForm} savedForm={() => null}
            setRemoveService={setRemoveService}
            serviceTypes={serviceTypes?.data?.map((item: any) => item.data) || []}
            serviceStates={serviceStates?.data?.map((item: any) => item.data) || []}
            staff={staff?.data || []} suppliers={suppliers?.data || []}
            vehicles={vehicles?.data?.map((item: any) => item.data) || []}
            locations={locations?.data || []}
            zones={zones?.data || []} operator={operator} />
    );

    useEffect(() => {
        if (bookingId) {
            loadServices();
        }
    }, [bookingId]);

    useEffect(() => {
        totalServices(services.length);
    }, [services.length]);

    return (
        <>
            <Title style={{ marginTop: 25, marginBottom: 25 }} level={3}>
                Serviços
            </Title>

            <Card bodyStyle={{ padding: 8 }}>
                <div className="table">
                    <GenericTable
                        columns={columns} dataSource={services} loading={servicesLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export" style={{ marginTop: 8 }}>
                                <ShowDataLength className="show_result_size" size={services.length} />
                            </div>
                        }
                    />
                </div>

                <Modal
                    open={openServiceModalForm} width={1180} style={{ top: 20 }}
                    footer={null} maskClosable={false} closeIcon={false}>
                        <DisplayAlert />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong style={{ marginTop: 10 }}>{modalFormTitle}</Text>
                        </div>

                        <Divider style={{ marginBottom: 0 }}></Divider>

                        {formService}
                </Modal>
            </Card>
        </>
    )
}