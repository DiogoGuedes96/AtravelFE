import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import DisplayAlert from '../../components/Commons/Alert';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { create, getById, update } from '../../services/locations.service';
import { AlertService } from '../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../components/Commons/Modal/confirm-modal.component';
import LocationsMap from './LocationsMap';
import { IAlert } from '../../Interfaces/Alert.interfaces';

const { Search } = Input;

export default function FormLocation(props: any) {
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [address, setAddress] = useState<string>('');
    const [latLng, setLatLng] = useState<google.maps.LatLngLiteral>();

    const { id } = useParams();
    const [formLocation] = Form.useForm();
    const navigate = useNavigate();

    const settings = {
        create: { title: 'Criar novo local', alertMessage: 'gravado' },
        edit: { title: 'Editar local', alertMessage: 'editado' }
    };

    const goLocationsList = () => {
        navigate('/routes/locations');
    }

    useQuery(
        ['loadLocation', id],
        () => id ? getById(Number(id)) : null,
        {
            onSuccess: response => {
                if (response) {
                    formLocation.setFieldsValue(response.data);

                    setLatLng({ lat: response.data.lat , lng: response.data.long });
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: createLocation, isLoading: createLocationLoading } = useMutation(create, {
        onSuccess: () => {
            AlertService.sendAlert([
                {
                    text: `Novo local gravado com sucesso.`,
                    nextPage: true
                }
            ]);

            goLocationsList();
        }
    });

    const { mutate: updateLocation, isLoading: updateLocationLoading } = useMutation(update, {
        onSuccess: () => {
            AlertService.sendAlert([
                {
                    text: 'Local editado com sucesso.',
                    nextPage: true
                }
            ]);

            goLocationsList();
        }
    });

    const onChangeAddress = (address_value: string) => {
        setAddress(address_value);
    };

    const onUpdateLatLng = ({ lat, lng }: google.maps.LatLngLiteral) => {
        formLocation.setFieldValue('lat', lat);
        formLocation.setFieldValue('long', lng);

        setValuesChanged(true);
    };

    const onUpdateAddress = (address: number) => {
        formLocation.setFieldValue('address', address);

        setValuesChanged(true);
    };

    const onSubmit = () => {
        formLocation
            .validateFields()
                .then(values => {
                    if (!id) {
                        createLocation(values);
                    } else {
                        updateLocation({ values, id: Number(id) });
                    }
                })
                .catch(error => {
                    let alerts: IAlert[] = [{ text: 'Campo(s) com preenchimento inválido.', type: 'error' }];

                    if (!!!error.values.lat || !!!error.values.long) {
                        alerts.push({ text: 'A seleção do local no mapa é obrigatório.', type: 'error' });
                    }

                    AlertService.sendAlert(alerts);
                });
    }

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
                    form={formLocation}
                    name="form_location"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off"
                    onValuesChange={() => setValuesChanged(true)}>

                    <Form.Item name="lat" style={{display: 'none'}}
                        rules={[{ required: true, message: 'Campo obrigatório' }]}>
                        <InputNumber type="hidden" />
                    </Form.Item>

                    <Form.Item name="long" style={{display: 'none'}}
                        rules={[{ required: true, message: 'Campo obrigatório' }]}>
                        <InputNumber type="hidden" />
                    </Form.Item>

                    <Row>
                        <Col span={12}>
                            <Col span={24}>
                                <Form.Item label="Local" name="name"
                                    rules={[
                                        { required: true, message: 'Campo obrigatório' }
                                    ]}>
                                    <Input size="large" maxLength={80} />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Morada" name="address"
                                    rules={[
                                        { required: true, message: 'Campo obrigatório' }
                                    ]}>
                                    <Search size="large" maxLength={255} onSearch={onChangeAddress} />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Zona" name="zone_id"
                                    rules={[
                                        { required: true, message: 'Campo obrigatório' }
                                    ]}>
                                    <Select showSearch placeholder="Seleciona zona" size="large" filterOption={props.onFilterZones}>
                                        {props.zones.map((zone: any) => <Select.Option key={zone.id} value={zone.id}>{zone.name}</Select.Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Ponto de referência" name="reference_point">
                                    <Input size="large" maxLength={100} />
                                </Form.Item>
                            </Col>
                        </Col>

                        <Col span={12} style={{ padding: 20 }}>
                            <LocationsMap address={address} latLng={latLng}
                                updateLatLng={onUpdateLatLng} updateAddress={onUpdateAddress}></LocationsMap>
                        </Col>
                    </Row>
                </Form>

                <Row style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                    <Col></Col>
                    <Col>
                        <Space>
                            <Button loading={createLocationLoading || updateLocationLoading} size="large"
                                onClick={() => {
                                    if (!id || valuesChanged) {
                                        setLeaveThePage(true)
                                    } else {
                                        goLocationsList();
                                    }
                                }}>Cancelar</Button>

                            <Button type="primary" loading={createLocationLoading || updateLocationLoading} size="large"
                                onClick={onSubmit}>Gravar</Button>
                        </Space>
                    </Col>
                </Row>

                <ConfirmModal
                    open={leaveThePage}
                    title="Tem certeza de que deseja sair sem gravar as alterações?"
                    content="Toda a informação não gravada será perdida."
                    okText="Sair" cancelText="Voltar"
                    onOk={() => {
                        setLeaveThePage(false);
                        goLocationsList();
                    }}
                    onCancel={() => setLeaveThePage(false)}
                ></ConfirmModal>
            </Card>
        </>
    );
}