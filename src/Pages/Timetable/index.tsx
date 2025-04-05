import {
    Badge, Button, Card, Col, DatePicker,
    Form, Row, Select, Spin, Switch, Tooltip, Typography
} from 'antd';
import { LeftOutlined, RetweetOutlined, RightOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { getAll } from '../../services/bookingServices.service';
import { getAll as loadServiceTypes } from '../../services/serviceTypes.service'
import { getAll as loadWorkers } from '../../services/workers.service';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import DisplayAlert from '../../components/Commons/Alert';
import { capitalized } from '../../services/utils';
import Services from './Services';
import Schedule from './Schedule';
import { DatePickerProps } from 'antd/lib';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { Text } = Typography;

export default function Timetable() {
    const [date, setDate] = useState(dayjs());
    const [serviceType, setServiceType] = useState<(number | string)[]>([]);
    const [staffId, setStaffId] = useState<number | string | undefined>(undefined);
    const [supplierId, setSupplierId] = useState<number | string | undefined>(undefined);
    const [showStaff, setShowStaff] = useState<boolean>(true);
    const [showSupplier, setShowSupplier] = useState<boolean>(true);
    const [services, setServices] = useState<any[]>([]);

    const [formDate] = Form.useForm();
    const [formFilter] = Form.useForm();

    const { isLoading: servicesLoading, refetch: loadServices } = useQuery(
        ['loadServices', date, serviceType],
        () => getAll({
            start_date: date.format('YYYY-MM-DD'), end_date: date.format('YYYY-MM-DD'),
            service_type_id: serviceType, order: 'hour-asc'
        }),
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
            refetchOnWindowFocus: false
        }
    );

    const { data: serviceTypes } = useQuery(
        ['loadServiceTypes'],
        () => loadServiceTypes(),
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

    const toNextDate = () => setDate(date.add(1, 'day'));
    const toPreviewDate = () => setDate(date.subtract(1, 'day'));

    const onFilterServiceType = () => {
        setServiceType(formFilter.getFieldValue('filter_service_type'));
    };

    const onFilterStaffId = () => {
        setStaffId(formFilter.getFieldValue('filter_staff_id'));
    };

    const onFilterSupplierId = () => {
        setSupplierId(formFilter.getFieldValue('filter_supplier_id'));
    };

    const onChangeDate: DatePickerProps['onChange'] = (date, dateString) => {
        setDate(date || dayjs());
    };

    const onDroppedService = (service: any) => {
        const nextServices = [...services];
        const serviceToUpdate = nextServices.find((item: any) => item.id === service.id);

        serviceToUpdate.staff_id = service.staff_id;
        serviceToUpdate.supplier_id = service.supplier_id;

        setServices(nextServices);
    }

    useEffect(() => {
        formFilter.setFieldsValue({ filter_staff_id: '', filter_supplier_id: '', filter_service_type: [] });
    }, []);

    useEffect(() => {
        formDate.setFieldValue('filter_date', date);
    }, [date]);

    useEffect(() => {
        formFilter.setFieldValue('filter_service_type', serviceType);
        formFilter.setFieldValue('filter_staff_id', staffId);
        formFilter.setFieldValue('filter_supplier_id', supplierId);
    }, [staffId, supplierId, serviceType]);

    return (
        <>
            <div className="content_page">
                <DisplayAlert />
                <Card bodyStyle={{ padding: 8 }}>
                    <div className="search_bar">
                        <Form
                            form={formDate}
                            name="search_services"
                            className="form_search_horizontal"
                            autoComplete="off"
                            colon={false}>
                            <Text style={{ marginBottom: 5, marginRight: 15 }}>
                                <LeftOutlined style={{ cursor: 'pointer', color: '#8c8c8c', marginRight: 15 }}
                                    onClick={() => toPreviewDate()} />
                                <RightOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }}
                                    onClick={() => toNextDate()} />
                            </Text>

                            <Form.Item name="filter_date" className="item_search">
                                <DatePicker placeholder="dd/mm/aaaa" format={'DD/MM/YYYY'} onChange={onChangeDate} />
                            </Form.Item>

                            <Text strong style={{ color: '#1f1f1f', fontSize: '20px' }}>{capitalized(date.locale('PT').format('dddd'))}, {date.format('DD/MM/YYYY')}</Text>
                        </Form>

                        <Tooltip placement="top" title="Sincroniza a escala manualmente">
                            <Button size="large" type="link" icon={<RetweetOutlined />}
                                loading={servicesLoading}
                                onClick={() => loadServices()}>Atualizar escala</Button>
                        </Tooltip>
                    </div>

                    <div className="filter_bar container">
                        <Form
                            form={formFilter}
                            name="filter_services"
                            layout="vertical"
                            className="form_filter_horizontal"
                            autoComplete="off" style={{ width: '100%' }}>
                            <Row gutter={20} style={{ width: '100%' }}>
                                <Col span={8}>
                                    <Form.Item label="Tipo de serviço" name="filter_service_type" className="item_filter">
                                        <Select placeholder="Todos" size="large"
                                            value={serviceType} allowClear onChange={onFilterServiceType}>
                                            {(serviceTypes?.data || []).map((item: any) => (
                                                <Select.Option key={item.data.id} value={item.data.id}>
                                                    <Badge color={item.data.color} text={item.data.name} styles={{ indicator: { width: 12, height: 12 } }} />
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item label="Motorista" name="filter_staff_id" style={{ marginBottom: 3 }}>
                                        <Select placeholder="Todos" size="large"
                                            value={staffId} onChange={onFilterStaffId}
                                            allowClear onClear={() => onFilterStaffId()}>
                                            {staff?.data?.map((item: any) => (
                                                <Select.Option key={item.data.id} value={item.data.id}>{item.data.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Switch size="small" checked={showStaff} onChange={() => setShowStaff(!showStaff)}/> Exibir motoristas
                                </Col>

                                <Col span={8}>
                                    <Form.Item label="Fornecedor" name="filter_supplier_id" style={{ marginBottom: 3 }}>
                                        <Select placeholder="Todos" size="large"
                                            value={supplierId} onChange={onFilterSupplierId}
                                            allowClear onClear={() => onFilterSupplierId()}>
                                            {suppliers?.data?.map((item: any) => (
                                                <Select.Option key={item.data.id} value={item.data.id}>{item.data.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Switch size="small" checked={showSupplier} onChange={() => setShowSupplier(!showSupplier)}/> Exibir fornecedores
                                </Col>
                            </Row>
                        </Form>
                    </div>

                    {servicesLoading
                        ? <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
                            <Spin />
                        </div>
                        : <DndProvider backend={HTML5Backend}>
                            <div className="content_page" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: 338, marginRight: 30 }}>
                                    <Services
                                        services={services.filter((service: any) => !service.staff_id && !service.supplier_id)}
                                        onDroppedService={onDroppedService} />
                                </div>

                                <div style={{ width: '100%' }}>
                                    <Schedule
                                        date={date}
                                        services={services
                                            .filter((service: any) => service.staff_id || service.supplier_id)
                                            .reduce((obj, service) => {
                                                let key = service.staff_id
                                                    ? `staff_${service.staff_id}`
                                                    : `suppliers_${service.supplier_id}`;

                                                if (!obj[key]) {
                                                    obj[key] = [];
                                                }

                                                obj[key].push(service);

                                                return obj;
                                            }, {})
                                        }
                                        staff={showStaff && !supplierId
                                            ? (
                                                staff?.data?.filter((item: any) => !staffId || item?.data?.id === staffId)
                                                || []
                                            )
                                            : []
                                        }
                                        suppliers={showSupplier && !staffId
                                            ? (
                                                suppliers?.data?.filter((item: any) => !supplierId || item?.data?.id === supplierId)
                                                || []
                                            )
                                            : []
                                        }
                                        onDroppedService={onDroppedService} />
                                </div>
                            </div>
                        </DndProvider>
                    }
                </Card>
            </div>
        </>
    )
}