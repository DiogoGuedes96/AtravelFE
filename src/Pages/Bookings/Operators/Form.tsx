import { Button, Card, Col, DatePicker, Divider, Form, Input, InputNumber, Row, Select, Space, TimePicker } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pending, getById, updatePending } from '../../../services/bookings.service';
import { getAll as loadLocations } from '../../../services/locations.service';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import { EuroCircleOutlined } from '@ant-design/icons';
import { RangePickerProps } from 'antd/lib/date-picker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import ModalAlert from '../../../components/Commons/Modal/modal-alert.component';

const userStorage = localStorage.getItem('user') || '{}';

export default function FormBookingOperators(props: any) {
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [minimum24HourAlert, setMinimum24HourAlert] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [user] = useState(JSON.parse(userStorage));

    const { id } = useParams();
    const [formBooking] = Form.useForm();
    const navigate = useNavigate();

    const settings = {
        create: { title: 'New booking' },
        edit: { title: 'Edit booking' }
    };

    const goBookingsList = () => {
        navigate('/bookings/operators');
    }

    useQuery(
        ['loadBooking', id],
        () => id ? getById(Number(id)) : null,
        {
            onSuccess: response => {
                if (response) {
                    let values = response.data;

                    values.start_date = dayjs(values.start_date);
                    values.hour = dayjs(values.hour, 'HH:mm');

                    formBooking.setFieldsValue(values);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const { data: locations } = useQuery(
        ['loadLocations'],
        () => loadLocations(),
        { refetchOnWindowFocus: false }
    );

    const { mutate: createBooking, isLoading: createBookingLoading } = useMutation(pending, {
        onSuccess: response => {
            AlertService.sendAlert([
                {
                    text: `Booking N° ${response.data.id} submitted successfully.`,
                    nextPage: true
                }
            ]);

            goBookingsList();
        }
    });

    const { mutate: updateBooking, isLoading: updateBookingLoading } = useMutation(updatePending, {
        onSuccess: () => {
            AlertService.sendAlert([
                {
                    text: `Booking N° ${id} has been edited.`,
                    nextPage: true
                }
            ]);

            goBookingsList();
        }
    });

    const findLocationById = (id: Number) => locations?.data.find((location: any) => location.data.id == id);

    const onChangeLocation = (target: string, value: string, option: any) => {
        let location = findLocationById(Number(option?.key));

        formBooking.setFieldsValue({
            [`${target}_location_id`]: location ? location.data.id : undefined,
            [`${target}_location`]: value || ''
        });

        formBooking.validateFields(['pickup_location', 'dropoff_location']);
    }

    const isDateMininum24Hour = (date: string) => dayjs(date).diff(dayjs(), 'hours') >= 24;

    const onSubmit = () => {
        formBooking
            .validateFields()
                .then(values => {
                    values.start_date = typeof values.start_date == 'object'
                        ? dayjs(values.start_date).format('YYYY-MM-DD')
                        : values.start_date;

                    values.hour = typeof values.hour == 'object'
                        ? dayjs(values.hour).format('HH:mm')
                        : values.hour;

                    if (!id) {
                        if (!isDateMininum24Hour(`${values.start_date} ${values.hour}`)) {
                            setMinimum24HourAlert(true);
                        } else {
                            createBooking(values);
                        }
                    } else {
                        updateBooking({ values, id: Number(id) });
                    }
                })
                .catch(() => AlertService.sendAlert([{ text: 'Fields with invalid filling.', type: 'error' }]));
    }

    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        return current && current < dayjs().startOf('day');
    };

    useEffect(() => {
        if (!id && user) {
            formBooking.setFieldValue('operator_id', user?.id);
        }
    }, []);

    return (
        <>
            <DisplayAlert />
            <Card
                color='primary'
                headStyle={{
                    color: '#107B99',
                    fontWeight: 600
                }}
                title={settings[props.action as keyof typeof settings].title}>
                <Form
                    form={formBooking}
                    name="form_booking"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off"
                    onValuesChange={() => setValuesChanged(true)}>
                    <Row gutter={20}>
                        <Col span={12}>
                            <Form.Item label="Operator">
                                <Input disabled value={user?.name} size="large" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Customer" name="client_name"
                                rules={[
                                    { required: true, message: 'Required field' }
                                ]}>
                                <Input size="large" maxLength={255} placeholder="Customer's name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={20}>
                        <Col span={12}>
                            <Form.Item label="Email" name="client_email"
                                rules={[
                                    { required: true, message: 'Required field' },
                                    { type: 'email', message: 'Invaid email format' }
                                ]}>
                                <Input type="email" size="large" maxLength={255} placeholder="email@email.pt" />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="Phone number" name="client_phone">
                                <Input size="large" maxLength={20} placeholder="" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={20}>
                        <Col span={5}>
                            <Form.Item name="start_date" label="Date"
                                rules={[
                                    { required: true, message: 'Required field' }
                                ]}>
                                <DatePicker size="large" placeholder="yyyy-mm-dd" showToday={false}
                                    style={{ width: '100%' }} disabledDate={disabledDate} />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item name="hour" label="Time"
                                rules={[
                                    { required: true, message: 'Required field' }
                                ]}>
                                <TimePicker size="large" placeholder="hh:mm" use12Hours={true} showNow={false}
                                    format={'h:mm a'} style={{ width: '100%' }} changeOnBlur={true} />
                            </Form.Item>
                        </Col>

                        <Col span={5}>
                            <Form.Item label="Amount" name="value"
                                rules={[
                                    { required: true, message: 'Required field' }
                                ]}>
                                <InputNumber min={0} size="large" placeholder="Amount" maxLength={6}
                                    addonAfter={<EuroCircleOutlined style={{ color: '#8C8C8C' }} />} />
                            </Form.Item>
                        </Col>

                        <Col span={5}>
                            <Form.Item label="Number of people" name="pax_group"
                                rules={[
                                    { required: true, message: 'Required field' }
                                ]}>
                                <InputNumber min={0} size="large" placeholder="Number of people" maxLength={3} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col span={5}>
                            <Form.Item label="Reference" name="operator_id">
                                <Input size="large" placeholder="Reference" disabled />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={20}>
                    <Col span={12}>
                            <Form.Item name="pickup_location_id" style={{ display: 'none' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Pick-up Location" name="pickup_location"
                                rules={[
                                    { required: true, message: 'Required field' },
                                    ({ getFieldValue }) => ({
                                        validator: (_, value) => {
                                            if (value && value == getFieldValue('dropoff_location')) {
                                                return Promise.reject(new Error('The Pick-up location cannot be the same as Drop-off location.'));
                                            }

                                            return Promise.resolve();
                                        }
                                    })
                                ]}>
                                <Select placeholder="Select location" size="large" style={{width: '100%'}}
                                    onChange={($event, option: any) => onChangeLocation('pickup', $event, option)}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Input size="large" maxLength={255} placeholder="Local"
                                                onChange={($event) => onChangeLocation('pickup', $event.target.value, { key: 0 })}
                                                onKeyDown={(e) => e.stopPropagation()} />
                                        </>
                                    )}>
                                    {locations?.data.map((item: any) => (
                                        <Select.Option key={item.data.id} value={item.data.name}>{item.data.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="dropoff_location_id" style={{ display: 'none' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Drop-off location" name="dropoff_location"
                                rules={[
                                    { required: true, message: 'Required field' },
                                    ({ getFieldValue }) => ({
                                        validator: (_, value) => {
                                            if (value && value == getFieldValue('pickup_location')) {
                                                return Promise.reject(new Error('The Drop-off location cannot be the same as Pick-up location.'));
                                            }

                                            return Promise.resolve();
                                        }
                                    })
                                ]}>
                                <Select placeholder="Select location" size="large" style={{width: '100%'}}
                                    onChange={($event, option: any) => onChangeLocation('dropoff', $event, option)}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Input size="large" maxLength={255} placeholder="Local"
                                                onChange={($event) => onChangeLocation('dropoff', $event.target.value, { key: 0 })}
                                                onKeyDown={(e) => e.stopPropagation()} />
                                        </>
                                    )}>
                                    {locations?.data.map((item: any) => (
                                        <Select.Option key={item.data.id} value={item.data.name}>{item.data.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="Additional Information" name="additional_information">
                                <Input.TextArea size="large" placeholder="Additional Information"
                                    showCount maxLength={255} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <ConfirmModal
                    open={leaveThePage}
                    title="Are you sure you want to leave without saving changes?"
                    content="All unsaved editing will be lost."
                    okText="Leave" cancelText="Return to booking"
                    onOk={() => {
                        setLeaveThePage(false);
                        goBookingsList();
                    }}
                    onCancel={() => setLeaveThePage(false)}
                ></ConfirmModal>

                <ModalAlert
                    open={minimum24HourAlert}
                    title="Booking must be made with a lead time of at least 24 hours."
                    content="Please contact the company in charge."
                    okText="Leave"
                    onOk={() => setMinimum24HourAlert(false)}
                    onCancel={() => setMinimum24HourAlert(false)}
                ></ModalAlert>
            </Card>

            <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                <Col></Col>
                <Col>
                    <Space>
                        <Button loading={createBookingLoading || updateBookingLoading} size="large"
                            onClick={() => {
                                if (!id || valuesChanged) {
                                    setLeaveThePage(true)
                                } else {
                                    goBookingsList();
                                }
                            }}>Cancel</Button>

                        <Button type="primary" size="large"
                            loading={createBookingLoading || updateBookingLoading}
                            onClick={onSubmit}>Submit</Button>
                    </Space>
                </Col>
            </Row>
        </>
    );
}