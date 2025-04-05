import { Button, Col, Form, Input, Row } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import { useEffect } from 'react';
import { create, update } from '../../../services/serviceStates.service';
import { AlertService } from '../../../services/alert.service';
import { useMutation } from 'react-query';

export default function FormServiceState(props: any) {
    const [formServiceState] = Form.useForm();

    const { mutate: createServiceState, isLoading: createServiceStateLoading } = useMutation(create, {
        onSuccess: () => props.savedForm('Novo estado de serviço gravado com sucesso.')
    });

    const { mutate: updateServiceState, isLoading: updateServiceStateLoading } = useMutation(update, {
        onSuccess: () => props.savedForm('Estado de serviço editado com sucesso.')
    });

    const onSubmit = () => {
        formServiceState
            .validateFields()
                .then(values => {
                    if (!props.serviceState) {
                        createServiceState(values);
                    } else {
                        updateServiceState({ values, id: Number(props.serviceState.id) });
                    }
                })
                .catch(() => AlertService.sendAlert([
                    { text: 'Campo(s) com preenchimento inválido', type: 'error' }
                ]));
    }

    useEffect(() => {
        if (props.serviceState) {
            formServiceState.setFieldsValue(props.serviceState);
        }
    }, [props.serviceState])

    return (
        <>
            <div>
                <DisplayAlert />
                <Form
                    form={formServiceState}
                    name="form_table"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off"
                    onValuesChange={() => props.onValuesChange(true)}>

                    <Row>
                        <Col span={24}>
                            <Form.Item label="Nome estado" name="name"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <Input placeholder="Adiciona nome do estado" size="large" maxLength={20} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>

            <div className="route_form_space_action_btns">
                <Button type="primary" loading={createServiceStateLoading || updateServiceStateLoading} size="large"
                    onClick={onSubmit}>Gravar</Button>

                <Button loading={createServiceStateLoading || updateServiceStateLoading}
                    onClick={() => props.closeForm()} size="large">Cancelar</Button>
            </div>
        </>
    );
}