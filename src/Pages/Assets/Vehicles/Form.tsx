import { Button, Card, Form, Input, InputNumber, Space, Select, Col, Row, DatePicker } from "antd";
import DisplayAlert from "../../../components/Commons/Alert";
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from "react-query";
import { AlertService } from '../../../services/alert.service';
import { create, getById, update } from '../../../services/vehicles.service';
import { useEffect, useState } from "react";
import ConfirmModal from "../../../components/Commons/Modal/confirm-modal.component";
import InputMask from "react-input-mask";
import { DatePickerProps } from "antd/lib";

export default function FormPage(props: any) {
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);

    const [formVehicle] = Form.useForm();
    const { id } = useParams();

    const navigate = useNavigate()

    const showPageListVehicle = () => {
        if (!id || valuesChanged) {
            setLeaveThePage(true);
        } else {
            toPage('list');
        }
    }

    const toPage = (page: string, vehicle_id: number = 0) => {
        let pages = {
            create: '/assets/vehicles/create',
            edit: `/assets/vehicles/${vehicle_id}/edit`,
            list: `/assets/vehicles`,
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const settings = {
        create: { title: 'Criar nova viatura' },
        edit: { title: 'Editar viatura' }
    };

    const onSubmit = () => {
        formVehicle
            .validateFields()
            .then((values) => {
                if (!id || props.action == 'create') {
                    createVehicleMutate(values);
                } else {
                    updateVehicleMutate({ values, id: Number(id) });
                }
            })
            .catch(() => AlertService.sendAlert([
                { text: 'Campo(s) com preenchimento inválido', type: 'error' }
            ]));
    };

    const {
        mutate: createVehicleMutate,
        isLoading: createVehicleLoading,
        isSuccess: isSuccessNewVehicle
    } = useMutation(create);

    const {
        mutate: updateVehicleMutate,
        isLoading: updateVehicleLoading,
        isSuccess: isSuccessEditVehicle
    } = useMutation(update);

    useEffect(() => {
        if (isSuccessNewVehicle) {
            formVehicle.resetFields();
            AlertService.sendAlert([{
                text: 'Nova viatura gravada com sucesso.',
                nextPage: true
             }]);
             toPage('list');
        }

        if (isSuccessEditVehicle) {
            formVehicle.resetFields();
            AlertService.sendAlert([{
                text: 'Viatura editada com sucesso.',
                nextPage: true
             }]);
             toPage('list');
        }
    }, [isSuccessNewVehicle, isSuccessEditVehicle]);

    useQuery(
        ['loadVehicle', id],
        () => id ? getById(Number(id)) : null,
        {
            onSuccess: response => {
                if (response) {
                    formVehicle.setFieldsValue(response.data);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    return (
        <>
            <DisplayAlert />
            <Card title={settings[props.action as keyof typeof settings].title}
                headStyle={{
                    color: '#107B99',
                    fontWeight: 600
                }}>
                <Form
                    form={formVehicle}
                    name="create_vehicles"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off"
                    onValuesChange={() => setValuesChanged(true)}>

                    <Row gutter={20} style={{ marginTop: 20 }}>
                        <Col span={8}>
                            <Form.Item name="brand" label="Marca"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' },
                                ]}>
                                <Input size="large" maxLength={25} placeholder="Marca" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="model" label="Modelo"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' },
                                ]}>
                                <Input size="large" maxLength={30} placeholder="Modelo" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="group" label="Grupo"
                                 rules={[
                                    { required: true, message: 'Campo obrigatório' },
                                ]}>
                                <Select size="large" placeholder="Selecione o grupo" options={
                                    Object.keys(props.groups).map((key: string) => {
                                        return { value: key, label: props.groups[key] }
                                    })}>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item name="license" label="Matrícula"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' },
                                    {
                                        pattern: /^([\d]{2})-*([\w]{2})-*([\d]{2})/,
                                        message: 'Formato da matrícula inválido'
                                    }
                                ]}>
                                <InputMask mask={'99-aa-99'} autoComplete="off">
                                    <Input size="large" style={{ width: '100%' }} placeholder="Matrícula" />
                                </InputMask>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item name="km" label="Km Actuais" >
                                <InputNumber size="large" style={{ width: '100%' }}
                                    maxLength={6} precision={0} placeholder="Km Actuais" />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item name="max_capacity" label="Lotação máxima"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <InputNumber size="large" style={{ width: '100%' }}
                                    maxLength={2} precision={0} placeholder="Lotação máxima" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={20} style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                        <Col>
                            <Space>
                                <Button onClick={showPageListVehicle}
                                    loading={createVehicleLoading || updateVehicleLoading} size="large">Cancelar</Button>

                                <Button type="primary" size="large"
                                    loading={createVehicleLoading || updateVehicleLoading}
                                    onClick={onSubmit}>Gravar</Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>

                <ConfirmModal
                    open={leaveThePage}
                    title="Tem certeza de que deseja sair sem gravar as alterações?"
                    content="Toda a informação não gravada será perdida."
                    okText="Sair" cancelText="Voltar"
                    onOk={() => {
                        setLeaveThePage(false);
                        toPage('list');
                    }}
                    onCancel={() => setLeaveThePage(false)}
                ></ConfirmModal>
            </Card>
        </>
    )
}
