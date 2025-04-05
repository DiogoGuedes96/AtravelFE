import { Alert, Button, Card, Divider, Dropdown, Modal, Space, Tooltip, Typography } from 'antd';
import { CheckCircleFilled, DeleteOutlined, EditOutlined, EllipsisOutlined, ExclamationCircleOutlined, PlusCircleOutlined, SwapOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import { getAll, remove } from '../../../services/bookingServices.service';
import ProfilePermissionService from '../../../services/profilePermissions.service';
import { getAll as loadServiceTypes } from '../../../services/serviceTypes.service';
import { getAll as loadServiceStates } from '../../../services/serviceStates.service';
import { getAll as loadVehicles } from '../../../services/vehicles.service';
import { getAll as loadWorkers } from '../../../services/workers.service';
import { all as loadZones } from '../../../services/zones.service';
import { getAll as loadLocations } from '../../../services/locations.service';
import { AlertService } from '../../../services/alert.service';
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import moment from 'moment';
import FormService from './Form';
import DisplayAlert from '../../../components/Commons/Alert';
import { formatCurrency } from '../../../services/utils';

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
        create: { title: 'Novo serviço' },
        edit: { title: 'Editar serviço' },
        duplicate: { title: 'Duplicar serviço' },
        createReturn: { title: 'Criar retorno' },
        editReturn: { title: 'Editar retorno' }
    };

    const { isLoading: servicesLoading, refetch: loadServices } = useQuery(
        ['loadServices'],
        () => getAll({ booking_id: bookingId }),
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
        AlertService.clearAlert();
        setServiceToEdit(record);
        setModalFormTitle(title);
        setOpenServiceModalForm(true);
    };

    const onCloseServiceModalForm = () => {
        setOpenServiceModalForm(false);
        setServiceToEdit(undefined);
    };

    const onSavedForm = (successMessage: string, newRecord: any = null, createReturn: boolean = false) => {
        onCloseServiceModalForm();

        if (createReturn) {
            onCreateReturn(newRecord);
        } else if (newRecord) {
            setCreateReturnService({ data: newRecord, message: successMessage });
        }

        setTimeout(() => {
            AlertService.sendAlert([
                { text: successMessage }
            ]);

            loadServices();
        }, 500);
    }

    const onDuplicate = (record: any) => {
        AlertService.clearAlert();
        record.id = null;
        record.driver_notes = null;
        onOpenServiceModalForm(settings.duplicate.title, record);
    };

    const onCreateReturn = (record: any) => {
        AlertService.clearAlert();
        record.parent = { ...record };

        record.parent_id = record.id;
        record.id = null;
        record.staff_id = null;
        record.supplier_id = null;
        record.driver_notes = null;

        let { pickup_location_id, pickup_location, pickup_zone, pickup_zone_id, pickup_address, pickup_reference_point,
            dropoff_location_id, dropoff_location, dropoff_zone, dropoff_zone_id, dropoff_address, dropoff_reference_point
        } = record;

        record.pickup_location_id = dropoff_location_id;
        record.pickup_location = dropoff_location;
        record.pickup_zone_id = dropoff_zone_id;
        record.pickup_zone = dropoff_zone;
        record.pickup_address = dropoff_address;
        record.pickup_reference_point = dropoff_reference_point;
        record.dropoff_location_id = pickup_location_id;
        record.dropoff_location = pickup_location;
        record.dropoff_zone_id = pickup_zone_id;
        record.dropoff_zone = pickup_zone;
        record.dropoff_address = pickup_address;
        record.dropoff_reference_point = pickup_reference_point;

        onOpenServiceModalForm(settings.createReturn.title, record);
    };

    const columns = [
        { title: 'Número', key: 'number',
            render: (_: any, record: any) => (<Space>
                Serviço {record.booking_id}-{record.id}
                {record.emphasis && <Tooltip placement="top" title="Ação necessária">
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                </Tooltip>}
            </Space>)
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
                    <Tooltip placement="top" title="Editar">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => onOpenServiceModalForm(
                                settings.edit.title,
                                { ...record }
                            )} />
                    </Tooltip>

                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                            onClick={() => setRemoveService(record)} />
                    </Tooltip>

                    <Dropdown menu={{
                        items: [
                            {
                                key: 'duplicate', label: 'Duplicar serviço',
                                onClick: () => onDuplicate({ ...record })
                            },
                            {
                                key: 'createReturn', label: 'Criar retorno',
                                onClick: () => onCreateReturn({ ...record })
                            }
                        ]
                    }} placement="bottomRight" arrow>
                        <Tooltip placement="top" title="Mais ações">
                            <Button type="default" shape="circle" size="middle" icon={<EllipsisOutlined />} />
                        </Tooltip>
                    </Dropdown>
                </Space>
            )
        }
    ];

    const formService = (
        <FormService bookingId={bookingId} service={serviceToEdit} isParent={false}
            closeForm={onCloseServiceModalForm} savedForm={onSavedForm}
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
                {profilePermissionService.hasPermission('bookings-services:write') &&
                    <Button type="link" color="primary" icon={<PlusCircleOutlined />}
                    style={{ fontSize: 18, fontWeight: 400 }}
                    onClick={() => onOpenServiceModalForm(settings.create.title, undefined)}>Associar serviço</Button>
                }
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

                <ConfirmModal
                    open={!!createReturnService}
                    icon={<CheckCircleFilled style={{ color: '#52c41a', marginRight: 10, fontSize: 18 }} />}
                    title={createReturnService?.message}
                    content="Deseja criar um serviço de retorno?"
                    okText="Criar retorno" cancelText="Continuar sem retorno"
                    onOk={() => {
                        onCreateReturn(createReturnService?.data);
                        setCreateReturnService(undefined);
                    }}
                    onCancel={() => setCreateReturnService(undefined)}
                ></ConfirmModal>

                <ConfirmModal
                    open={!!removeService} zIndex={2000}
                    title={`Tem certeza que deseja apagar o serviço "${bookingId}-${removeService?.id}"?`}
                    okText="Apagar" cancelText="Voltar"
                    onOk={() => removeServiceMutate(removeService?.id)}
                    onCancel={() => setRemoveService(undefined)}
                ></ConfirmModal>
            </Card>
        </>
    )
}