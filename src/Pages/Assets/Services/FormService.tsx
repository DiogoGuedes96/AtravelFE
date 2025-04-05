import { Badge, Button, Col, Form, Input, Row, Select } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import { useEffect, useState } from 'react';
import { create, update, getColors } from '../../../services/serviceTypes.service';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';

export default function FormService(props: any) {
    const [colors, setColors] = useState<{ value: String, label: string }[]>([]);

    const [formService] = Form.useForm();

    useQuery(
        ['loadColors'],
        () => getColors(),
        {
            onSuccess: response => setColors(response.data),
            refetchOnWindowFocus: false
        }
    );

    const { mutate: createService, isLoading: createServiceLoading } = useMutation(create, {
        onSuccess: () => props.savedForm('Novo tipo de serviço gravado com sucesso.')
    });

    const { mutate: updateService, isLoading: updateServiceLoading } = useMutation(update, {
        onSuccess: () => props.savedForm('Tipo de serviço editado com sucesso.')
    });

    const onSubmit = () => {
        formService
            .validateFields()
                .then(values => {
                    if (!props.service) {
                        createService(values);
                    } else {
                        updateService({ values, id: Number(props.service.id) });
                    }
                })
                .catch(() => AlertService.sendAlert([
                    { text: 'Campo(s) com preenchimento inválido', type: 'error' }
                ]));
    }

    const onFilterColors = (
        input: string, option?: { key: string, value: number, children: '' }
    ) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase());

    useEffect(() => {
        if (props.service) {
            formService.setFieldsValue(props.service);
        }
    }, [props.service])

    return (
        <>
            <div>
                <DisplayAlert />
                <Form
                    form={formService}
                    name="form_table"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off"
                    onValuesChange={() => props.onValuesChange(true)}>

                    <Row>
                        <Col span={24}>
                            <Form.Item label="Nome serviço" name="name"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <Input placeholder="Adiciona nome do tipo de serviço" size="large" maxLength={25} />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="Cor" name="color">
                                <Select placeholder="Seleciona cor" size="large">
                                    {colors
                                        .filter((color: any) => {
                                            return color.value == '#ffffff'
                                                || !props.unavailableColors.includes(color.value)
                                                || (props.service && props.service.color == color.value)
                                        })
                                        .map((color: any) => (
                                            <Select.Option key={color.value} value={color.value}>
                                                <Badge color={color.value} text={color.label} styles={{ indicator: { width: 12, height: 12 } }} />
                                            </Select.Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>

            <div className="route_form_space_action_btns">
                <Button type="primary" loading={createServiceLoading || updateServiceLoading} size="large"
                    onClick={onSubmit}>Gravar</Button>

                <Button loading={createServiceLoading || updateServiceLoading}
                    onClick={() => props.closeForm()} size="large">Cancelar</Button>
            </div>
        </>
    );
}