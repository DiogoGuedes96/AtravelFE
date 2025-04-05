import {
    Badge, Button, Col, DatePicker, Divider, Form, Input, InputNumber, Row,
    Select, Space, Switch, TimePicker, Tooltip, Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { create, update } from '../../../services/bookingServices.service';
import { AlertService } from '../../../services/alert.service';
import { useMutation } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import ProfilePermissionService from '../../../services/profilePermissions.service';
import { DatePickerProps, TimePickerProps } from 'antd/lib';
import moment from 'moment';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import { DeleteOutlined, EuroCircleOutlined, SwapOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../../services/utils';
import { EnumCharges } from '../../../Enums/Charges.enums';

const { Text } = Typography;
const { TextArea } = Input;

interface IPropsFormService {
    bookingId: any
    showBookingData?: boolean
    service?: any
    isParent: boolean
    savedForm: Function
    closeForm: Function
    setRemoveService: Function
    serviceTypes: any[]
    serviceStates: any[]
    staff: any[]
    suppliers: any[]
    vehicles: any[]
    zones: any[]
    locations: any[]
    operator?: any
}

export default function FormService({
    bookingId, showBookingData, service, isParent, savedForm, closeForm, setRemoveService,
    serviceTypes, serviceStates, staff, suppliers, vehicles, zones, locations, operator
}: IPropsFormService) {
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<string>('');
    const [hour, setHour] = useState<string>('');
    const [operatorRoute, setOperatorRoute] = useState<any | undefined>(undefined);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [submitAndCreateReturn, setSubmitAndCreateReturn] = useState<boolean>(false);
    const [vehicleText, setVehicleText] = useState<string>('');
    const [emphasis, setEmphasis] = useState<boolean>(false);

    const [formService] = Form.useForm();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const carTypes = [
        { id: 'small', name: 'Carro pequeno' },
        { id: 'large', name: 'Carro grande' }
    ];

    const charges = Object.entries(EnumCharges).map(charge => {
        return {
            id: charge[0], name: charge[1]
        }
    });

    const btnCancel = () => (<Button loading={createServiceLoading || updateServiceLoading} size="large"
        onClick={() => onLeaveThePage()}>Cancelar</Button>);

    const onLeaveThePage = () => {
        if (!service?.id || valuesChanged) {
            setLeaveThePage(true);
        } else {
            closeForm();
        }
    }

    const getTotalNumberOfPeople = () => (
        Number(formService.getFieldValue('number_adults') || 0)
        +
        Number(formService.getFieldValue('number_children') || 0)
    );

    const { mutate: createService, isLoading: createServiceLoading } = useMutation(create, {
        onSuccess: response => {
            formService.resetFields();

            savedForm(
                !service
                    ? `Serviço ${bookingId}-${response.data.id} associado com sucesso.`
                    : 'Serviço duplicado com sucesso.',
                response.data,
                submitAndCreateReturn
            );
        }
    });

    const { mutate: updateService, isLoading: updateServiceLoading } = useMutation(update, {
        onSuccess: () => {
            formService.resetFields();
            savedForm(`Serviço ${service?.id} editado com sucesso.`);
        }
    });

    const onChangeStartDate: DatePickerProps['onChange'] = (date, dateString) => {
        setStartDate(moment(dateString, 'DD/MM/YYYY').format('YYYY-MM-DD'));
    };

    const onChangeHour: TimePickerProps['onChange'] = (hour, hourString) => {
        setHour(hourString);
    };

    const findLocationById = (id: Number) => locations.find(location => location.data.id == id);

    const onChangeLocation = (target: string, value: string, option: any) => {
        let location = findLocationById(Number(option?.key));

        if (location) {
            formService.setFieldsValue({
                [`${target}_location_id`]: location.data.id,
                [`${target}_location`]: value,
                [`${target}_address`]: location.data.address,
                [`${target}_reference_point`]: location.data.reference_point,
                [`${target}_zone`]: location?.relationships?.zone?.name,
                [`${target}_zone_id`]: location.data.zone_id
            });
        } else {
            formService.setFieldsValue({
                [`${target}_location_id`]: undefined,
                [`${target}_location`]: value || ''
            });
        }

        formService.validateFields(['pickup_location', 'dropoff_location', 'pickup_zone', 'dropoff_zone']);
        updateOperatorRoute();
    }

    const findZoneById = (id: Number) => zones.find(zone => zone.id == id);

    const onChangeZone = (target: string, value: string, option: any) => {
        let zone = findZoneById(Number(option?.key));

        formService.setFieldsValue({
            [`${target}_zone_id`]: zone?.id || undefined,
            [`${target}_zone`]: value || ''
        });

        formService.validateFields(['pickup_zone', 'dropoff_zone']);
        updateOperatorRoute();
    }

    const findVehicleById = (id: Number) => vehicles.find(vehicle => vehicle.id == id);

    const validatedVehicleMask = (value: string): string => {
        let numberMask = /^[0-9]{2}$/;
        let stringMask = /^[a-zA-Z]{2}$/;
        let mask = /^[0-9]{2}[a-zA-Z]{2}[0-9]{2}$/;

        if (value) {
            value = value.replaceAll('_', '').replaceAll('-', '');

            if (!mask.test(value)) {
                if (value.length > 1 && !numberMask.test(value.substring(0, 2))) {
                    return '';
                } else if (value.length > 3 && !stringMask.test(value.substring(2, 4))) {
                    return `${value.substring(0, 2)}-`;
                } else if (value.length > 5 && !numberMask.test(value.substring(4, 6))) {
                    return `${value.substring(0, 2)}-${value.substring(2, 4)}-`;
                }
            }

            return `${value.substring(0, 2)}-${value.substring(2, 4)}-${value.substring(4, 6)}`;
        }

        return '';
    }

    const onChangeVehicle = (value: string, option: any) => {
        let vehicle = findVehicleById(Number(option?.key));

        let validatedValue = validatedVehicleMask(value);

        setVehicleText(validatedValue);

        formService.setFieldsValue({
            ['vehicle_id']: vehicle?.id || undefined,
            ['vehicle_text']: validatedValue,
            ['car_type']: vehicle?.group || undefined
        });
    }

    const onChangeNumberOfPeople = () => {
        formService.validateFields(['car_type']);
        updateValue();
    }

    const findStaffById = (id: Number) => staff.find((_staff: any) => _staff.data.id == id);

    const onChangeStaff = (value: any) => {
        if (value) {
            let _staff = findStaffById(value);

            if (_staff) {
                formService.setFieldsValue({
                    vehicle_id: _staff?.relationships?.vehicle?.id,
                    vehicle_text: _staff?.relationships?.vehicle?.license,
                    car_type: _staff?.relationships?.vehicle?.group
                });
            }
        }

        formService.setFieldValue('supplier_id', undefined);
    }

    const onChangeSupplier = () => {
        if (formService.getFieldValue('staff_id')) {
            formService.setFieldsValue({
                staff_id: undefined,
                vehicle_id: undefined,
                vehicle_text: undefined
            });
        }
    }

    const onSwapLocations = () => {
        let { pickup_location_id, pickup_location, pickup_zone, pickup_zone_id, pickup_address, pickup_reference_point,
            dropoff_location_id, dropoff_location, dropoff_zone, dropoff_zone_id, dropoff_address, dropoff_reference_point
        } = formService.getFieldsValue();

        formService.setFieldsValue({
            pickup_location_id: dropoff_location_id,
            pickup_location: dropoff_location,
            pickup_zone_id: dropoff_zone_id,
            pickup_zone: dropoff_zone,
            pickup_address: dropoff_address,
            pickup_reference_point: dropoff_reference_point,
            dropoff_location_id: pickup_location_id,
            dropoff_location: pickup_location,
            dropoff_zone_id: pickup_zone_id,
            dropoff_zone: pickup_zone,
            dropoff_address: pickup_address,
            dropoff_reference_point: pickup_reference_point
        });

        updateOperatorRoute();
    }

    const updateOperatorRoute = () => {
        const { charge, pickup_zone_id, dropoff_zone_id } = formService.getFieldsValue();

        if (charge == 'operator' && operator && pickup_zone_id && dropoff_zone_id) {
            let route = operator?.table?.relationships?.routes
                ?.find((route: any) => route.from_zone_id == pickup_zone_id && route.to_zone_id == dropoff_zone_id);

            if (route) {
                setOperatorRoute(route);
                return;
            }
        }

        setOperatorRoute(undefined);

        if (charge !== 'operator') {
            formService.setFieldValue('value', 0);
        }
    }

    const updateValue = () => {
        if (operatorRoute) {
            let totalNumberOfPeople = getTotalNumberOfPeople();

            formService.setFieldValue(
                'value',
                totalNumberOfPeople <= 4
                    ? operatorRoute.pax14
                    : (totalNumberOfPeople <= 8
                        ? operatorRoute.pax58
                        : 0)
            );

            formService.validateFields(['value']);
        }
    }

    const onSubmit = () => {
        formService
            .validateFields()
            .then(values => {
                values.emphasis = emphasis;

                values.start = typeof startDate == 'object'
                    ? dayjs(startDate).format('YYYY-MM-DD')
                    : startDate;

                values.hour = typeof hour == 'object'
                    ? dayjs(hour).format('HH:mm')
                    : hour;

                values.booking_id = bookingId;

                if (!values.car_type) {
                    values.car_type = '';
                }

                if (!values.staff_id) {
                    values.staff_id = null;
                }

                if (!values.supplier_id) {
                    values.supplier_id = null;
                }

                if (!service?.id) {
                    createService(values);
                } else {
                    let [booking_id, service_id] = service?.id.split('-');

                    updateService({ values, id: Number(service_id) });
                }
            })
            .catch(() => AlertService.sendAlert([{ text: 'Campo(s) com preenchimento inválido.', type: 'error' }]));
    }

    useEffect(() => {
        if (service) {
            setValuesChanged(false);

            let values = service;

            if (service?.id) {
                values.id = `${bookingId}-${service?.id}`;
            }

            if (values.start) {
                values.start = dayjs(service?.start);
                setStartDate(service?.start);
            }

            if (values.hour) {
                values.hour = dayjs(service?.hour, 'HH:mm');
                setHour(service?.hour);
            }

            setEmphasis(values.emphasis);

            formService.setFieldsValue({
                ...values,
                number_adults: values.number_adults || 0,
                number_children: values.number_children || 0,
                number_baby_chair: values.number_baby_chair || 0,
                booster: values.booster || 0
            });

            if (!serviceTypes.find((type: any) => type.id == service.service_type_id)) {
                formService.setFieldValue('service_type_id', service.serviceType?.data?.id || service.service_type_id);
            }
        } else {
            formService.resetFields();

            formService.setFieldsValue({
                service_state_id: serviceStates.find((state: any) => state.is_default)?.id,
                number_adults: 0,
                number_children: 0,
                number_baby_chair: 0,
                booster: 0
            });

            formService.setFieldValue('service_state_id', serviceStates.find((state: any) => state.is_default)?.id);
        }

        setSubmitAndCreateReturn(false);
    }, [service, bookingId]);

    useEffect(() => {
        if (operatorRoute) {
            updateValue();
        }
    }, [operatorRoute]);

    return (
        <>
            <Form
                form={formService}
                name={`${isParent ? 'parent_' : ''}form_service`} className="form_table"
                layout="vertical" autoComplete="off" style={{ paddingTop: 10 }}
                onValuesChange={() => setValuesChanged(true)}>

                {showBookingData && <>
                    <Text strong style={{ marginTop: 10 }}>Informações da reserva</Text>

                    <Row gutter={20} style={{ marginTop: 10, marginBottom: 20 }}>
                        <Col span={5}>
                            <Space direction='vertical'>
                                <Text strong>ID reserva</Text>
                                <Text>{service?.booking?.data?.id}</Text>
                            </Space>
                        </Col>

                        <Col span={5}>
                            <Space direction='vertical'>
                                <Text strong>Cliente</Text>
                                <Text>{service?.booking?.data?.client_name}</Text>
                            </Space>
                        </Col>

                        <Col span={5}>
                            <Space direction='vertical'>
                                <Text strong>Operador</Text>
                                <Text>{service?.booking?.relationships?.operator?.data?.name}</Text>
                            </Space>
                        </Col>

                        <Col span={5}>
                            <Space direction='vertical'>
                                <Text strong>Valor</Text>
                                <Text>{formatCurrency(service?.booking?.data?.value)}</Text>
                            </Space>
                        </Col>

                        <Col span={4}>
                            <Space direction='vertical'>
                                <Text strong>Pax group</Text>
                                <Text>{service?.booking?.data?.pax_group}</Text>
                            </Space>
                        </Col>
                    </Row>
                </>}

                <Row gutter={20} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Col span={5}>
                        <Text strong>Informações básicas</Text>
                    </Col>
                    <Col span={5} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Space>
                            <Switch size="small" checked={emphasis} onChange={() => setEmphasis(!emphasis)} />
                            Criar alerta
                        </Space>
                    </Col>
                </Row>

                <Row gutter={20} style={{ marginTop: 10 }}>
                    <Form.Item name="parent_id" style={{ display: 'none' }}>
                        <Input />
                    </Form.Item>

                    <Col span={3}>
                        <Form.Item label="ID Serviço" name="id">
                            <Input size="large" disabled />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item name="start" label="Data"
                            rules={[
                                { required: true, message: 'Campo obrigatório' }
                            ]}>
                            <DatePicker size="large" placeholder="Data de serviço" disabled={isParent} showToday={false}
                                format={'DD/MM/YYYY'} style={{ width: '100%' }}
                                onChange={onChangeStartDate} />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item name="hour" label="Hora"
                            rules={[
                                { required: true, message: 'Campo obrigatório' }
                            ]}>
                            <TimePicker size="large" placeholder="Hora de serviço" disabled={isParent}
                                format={'HH:mm'} style={{ width: '100%' }} changeOnBlur={true}
                                onChange={onChangeHour} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={20}>
                    <Col span={3}>
                        <Form.Item label="Adultos" name="number_adults">
                            <InputNumber min={0} size="large" placeholder="Qtd. adultos" disabled={isParent}
                                maxLength={3} style={{ width: '100%' }} onChange={onChangeNumberOfPeople} />
                        </Form.Item>
                    </Col>

                    <Col span={3}>
                        <Form.Item label="Crianças" name="number_children">
                            <InputNumber min={0} size="large" placeholder="Qtd. crianças" disabled={isParent}
                                maxLength={3} style={{ width: '100%' }} onChange={onChangeNumberOfPeople} />
                        </Form.Item>
                    </Col>

                    <Col span={3}>
                        <Form.Item label="Cadeira bebé" name="number_baby_chair">
                            <InputNumber min={0} size="large" placeholder="Qtd. cadeiras bebé" disabled={isParent}
                                maxLength={3} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={3}>
                        <Form.Item label="Booster" name="booster">
                            <InputNumber min={0} size="large" placeholder="Qtd. booster" disabled={isParent}
                                maxLength={3} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item label="Tipo de serviço" name="service_type_id"
                            rules={[
                                { required: true, message: 'Campo obrigatório' }
                            ]}>
                            <Select placeholder="Selecione o tipo" size="large" disabled={isParent}>
                                {serviceTypes.map((item: any) => (
                                    <Select.Option key={item.id} value={item.id}>
                                        <Badge color={item.color} text={item.name} styles={{ indicator: { width: 12, height: 12 } }} />
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item label="N° Vôo" name="flight_number">
                            <Input size="large" placeholder="Número vôo" disabled={isParent} maxLength={10} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={20}>
                    <Col span={5}>
                        <Form.Item label="Staff" name="staff_id">
                            <Select placeholder="Selecione o staff" size="large" disabled={isParent} allowClear
                                onChange={onChangeStaff}>
                                {staff.map((item: any) => (
                                    <Select.Option key={item.data.id} value={item.data.id}>{item.data.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={5}>
                        <Form.Item label="Fornecedor" name="supplier_id">
                            <Select placeholder="Selecione o fornecedor" size="large" disabled={isParent} allowClear
                                onChange={onChangeSupplier}>
                                {suppliers.map((item: any) => (
                                    <Select.Option key={item.data.id} value={item.data.id}>{item.data.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={5}>
                        <Form.Item name="vehicle_id" style={{ display: 'none' }}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Viatura" name="vehicle_text">
                            <Select placeholder="Selecione a viatura" size="large" disabled={isParent} style={{ width: '100%' }}
                                onChange={($event, option: any) => onChangeVehicle($event, option)}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Input size="large" maxLength={8} placeholder="Viatura" value={vehicleText}
                                            onChange={($event) => onChangeVehicle($event.target.value, { key: 0 })}
                                            onKeyDown={(e) => e.stopPropagation()} />
                                    </>
                                )}>
                                {vehicles.map((item: any) => (
                                    <Select.Option key={item.id} value={item.license}>{item.license}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item label="Tipo de carro" name="car_type"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value) {
                                            let total = getTotalNumberOfPeople();

                                            if (
                                                (value == 'small' && total > 4)
                                                || (value == 'large' && (total < 5 || total > 8))
                                            ) {
                                                return Promise.reject(new Error('Nº de pessoas não corresponde com o tipo de carro escolhido.'));
                                            }
                                        }

                                        return Promise.resolve();
                                    }
                                }
                            ]}>
                            <Select placeholder="Selecione o tipo de carro" size="large" disabled={isParent} allowClear>
                                {carTypes.map((item: any) => (
                                    <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={5}>
                        <Form.Item label="Estado" name="service_state_id"
                            rules={[
                                { required: true, message: 'Campo obrigatório' }
                            ]}>
                            <Select placeholder="Selecione o estado" size="large" disabled={isParent}>
                                {serviceStates.map((item: any) => (
                                    <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row style={{ marginBottom: 20 }}>
                    <Col span={11} style={{
                        backgroundColor: '#0000000A',
                        borderRadius: 8,
                        padding: 15
                    }}>
                        <Text strong>Pick Up</Text>

                        <Row gutter={20}>
                            <Col span={12}>
                                <Form.Item name="pickup_location_id" style={{ display: 'none' }}>
                                    <Input />
                                </Form.Item>

                                <Form.Item label="Local" name="pickup_location"
                                    rules={[
                                        { required: true, message: 'Campo obrigatório' }
                                    ]}>
                                    <Select placeholder="Selecione o local" size="large" disabled={isParent} style={{ width: '100%' }}
                                        onChange={($event, option: any) => onChangeLocation('pickup', $event, option)}
                                        dropdownRender={(menu) => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <Input size="large" maxLength={255} placeholder="Nome do local"
                                                    onChange={($event) => onChangeLocation('pickup', $event.target.value, { key: 0 })}
                                                    onKeyDown={(e) => e.stopPropagation()} />
                                            </>
                                        )}>
                                        {locations.map((item: any) => (
                                            <Select.Option key={item.data.id} value={item.data.name}>{item.data.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="pickup_zone_id" style={{ display: 'none' }}>
                                    <Input />
                                </Form.Item>

                                <Form.Item label="Zona" name="pickup_zone"
                                    rules={[
                                        { required: true, message: 'Campo obrigatório' },
                                    ]}>
                                    <Select placeholder="Selecione a zona" size="large" disabled={isParent} style={{ width: '100%' }}
                                        onChange={($event, option: any) => onChangeZone('pickup', $event, option)}
                                        dropdownRender={(menu) => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <Input size="large" maxLength={255} placeholder="Nome da zona"
                                                    onChange={($event) => onChangeZone('pickup', $event.target.value, { key: 0 })}
                                                    onKeyDown={(e) => e.stopPropagation()} />
                                            </>
                                        )}>
                                        {zones.map((item: any) => (
                                            <Select.Option key={item.id} value={item.name}>{item.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Morada" name="pickup_address">
                                    <Input size="large" placeholder="Morada" disabled={isParent} maxLength={255} />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Ponto de referência" name="pickup_reference_point">
                                    <Input size="large" maxLength={100} placeholder="Informações sobre a referência" disabled={isParent} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>

                    <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tooltip placement="top" title="Inverter Pick Up/Drop-off">
                            <Button type="default" size="large" icon={<SwapOutlined />}
                                disabled={isParent} onClick={onSwapLocations} />
                        </Tooltip>
                    </Col>

                    <Col span={11} style={{
                        backgroundColor: '#0000000A',
                        borderRadius: 8,
                        padding: 15
                    }}>
                        <Text strong>Drop-off</Text>

                        <Row gutter={20}>
                            <Col span={12}>
                                <Form.Item name="dropoff_location_id" style={{ display: 'none' }}>
                                    <Input />
                                </Form.Item>

                                <Form.Item label="Local" name="dropoff_location"
                                    rules={[
                                        { required: true, message: 'Campo obrigatório' },
                                    ]}>
                                    <Select placeholder="Selecione o local" size="large" disabled={isParent} style={{ width: '100%' }}
                                        onChange={($event, option: any) => onChangeLocation('dropoff', $event, option)}
                                        dropdownRender={(menu) => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <Input size="large" maxLength={255} placeholder="Nome do local"
                                                    onChange={($event) => onChangeLocation('dropoff', $event.target.value, { key: 0 })}
                                                    onKeyDown={(e) => e.stopPropagation()} />
                                            </>
                                        )}>
                                        {locations.map((item: any) => (
                                            <Select.Option key={item.data.id} value={item.data.name}>{item.data.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="dropoff_zone_id" style={{ display: 'none' }}>
                                    <Input />
                                </Form.Item>

                                <Form.Item label="Zona" name="dropoff_zone"
                                    rules={[
                                        { required: true, message: 'Campo obrigatório' },
                                    ]}>
                                    <Select placeholder="Selecione a zona" size="large" disabled={isParent} style={{ width: '100%' }}
                                        onChange={($event, option: any) => onChangeZone('dropoff', $event, option)}
                                        dropdownRender={(menu) => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <Input size="large" maxLength={255} placeholder="Nome da zona"
                                                    onChange={($event) => onChangeZone('dropoff', $event.target.value, { key: 0 })}
                                                    onKeyDown={(e) => e.stopPropagation()} />
                                            </>
                                        )}>
                                        {zones.map((item: any) => (
                                            <Select.Option key={item.id} value={item.name}>{item.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Morada" name="dropoff_address">
                                    <Input size="large" placeholder="Morada" disabled={isParent} maxLength={255} />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Ponto de referência" name="dropoff_reference_point">
                                    <Input size="large" maxLength={100} placeholder="Informações sobre a referência" disabled={isParent} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Text strong>Valores</Text>
                <Row gutter={20} style={{ marginTop: 10 }}>
                    <Col span={4}>
                        <Form.Item label="Valor" name="value"
                            rules={[
                                { required: true, message: 'Campo obrigatório' }
                            ]}>
                            <InputNumber min={0} size="large" placeholder="Valor" disabled={isParent}
                                maxLength={8} addonAfter={<EuroCircleOutlined style={{ color: '#8C8C8C' }} />} />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item label="Cobrança" name="charge"
                            rules={[
                                { required: true, message: 'Campo obrigatório' }
                            ]}>
                            <Select placeholder="Selecione a cobrança" size="large" disabled={isParent}
                                onChange={updateOperatorRoute}>
                                {charges.map((item: any) => (
                                    <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item label="Comissão" name="commission">
                            <InputNumber min={0} size="large" placeholder="Comissão" disabled={isParent}
                                maxLength={8} addonAfter={<EuroCircleOutlined style={{ color: '#8C8C8C' }} />} />
                        </Form.Item>
                    </Col>
                </Row>

                <Text strong>Outras informações</Text>
                <Row gutter={20} style={{ marginTop: 10 }}>
                    <Col span={8}>
                        <Form.Item label="Observações" name="notes">
                            <TextArea size="large" showCount maxLength={100} disabled={isParent}
                                placeholder="Informações relevantes visíveis a todos" />
                        </Form.Item>
                    </Col>

                    {profilePermissionService.hasProfile(['administrator', 'atravel']) &&
                        <Col span={8}>
                            <Form.Item label="Observações internas" name="internal_notes">
                                <TextArea size="large" showCount maxLength={100} disabled={isParent}
                                    placeholder="Informações relevantes visíveis a Atravel" />
                            </Form.Item>
                        </Col>
                    }

                    <Col span={8} style={{ backgroundColor: service?.driver_notes ? '#faad1450' : 'inherit' }}>
                        <Form.Item label="Observações motorista" name="driver_notes">
                            <TextArea size="large" showCount maxLength={100} readOnly={true}
                                placeholder="Informações relevantes visíveis ao motorista"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            {!isParent
                ? <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                    <Col>
                        {!service?.id
                            ? btnCancel()
                            : <Button size="large" danger type="link" icon={<DeleteOutlined />}
                                onClick={() => setRemoveService({
                                    ...service,
                                    id: service.id.split('-')[1]
                                })}>Apagar serviço</Button>
                        }
                    </Col>
                    <Col>
                        <Space>
                            {!service?.id && !service?.parent_id
                                ? <Button loading={createServiceLoading || updateServiceLoading} size="large"
                                    onClick={() => {
                                        setSubmitAndCreateReturn(true);
                                        onSubmit();
                                    }}>Gravar e criar retorno</Button>
                                : btnCancel()
                            }

                            {isParent
                                ? <Button type="primary" size='large' onClick={() => closeForm()}>Fechar</Button>
                                : <Button type="primary" loading={createServiceLoading || updateServiceLoading} size="large"
                                    onClick={onSubmit}>Gravar</Button>}
                        </Space>
                    </Col>
                </Row>
                : <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                    <Col></Col>
                    <Col>
                        <Button type="primary" size='large' onClick={() => closeForm()}>Fechar</Button>
                    </Col>
                </Row>
            }

            <ConfirmModal
                open={leaveThePage}
                title="Tem certeza de que deseja sair sem gravar as alterações?"
                content="Toda a informação não gravada será perdida."
                okText="Sair" cancelText="Voltar"
                onOk={() => {
                    setLeaveThePage(false);
                    closeForm();
                }}
                onCancel={() => setLeaveThePage(false)}
            ></ConfirmModal>
        </>
    );
}