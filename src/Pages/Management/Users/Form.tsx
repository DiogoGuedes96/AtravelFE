import { Button, Card, Form, Input, Space, Select, Col, Row, Switch } from "antd";
import DisplayAlert from "../../../components/Commons/Alert";
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from "react-query";
import { AlertService } from '../../../services/alert.service';
import { create, getById, update } from '../../../services/users.service';
import { useEffect, useState } from "react";
import ConfirmModal from "../../../components/Commons/Modal/confirm-modal.component";

const { Option } = Select;

export default function FormPage(props: any) {
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [checked, setChecked] = useState<boolean>(false);
    const [enablePassword, setEnablePassword] = useState<boolean>(true);

    const [formUser] = Form.useForm();
    const { id } = useParams();

    const navigate = useNavigate();

    const toPage = (page: string) => {
        let pages = {
            create: '/management/users/users/create',
            list: `/management/users/users`,
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const settings = {
        create: { title: 'Criar novo utilizador' },
        edit: { title: 'Editar utilizador' }
    };

    const onSubmit = () => {
        formUser
            .validateFields()
            .then((values) => {
                if (!id) {
                    createUserMutate(values);
                } else {
                    updateUserMutate({ values: { ...values, active: checked }, id: Number(id) });
                }
            })
            .catch(() => AlertService.sendAlert([
                { text: 'Campo(s) com preenchimento inválido', type: 'error' }
            ]));
    };

    const {
        mutate: createUserMutate,
        isLoading: createUserLoading,
        isSuccess: isSuccessNewUser,
        isError: isErrorNewUser
    } = useMutation(create);

    const {
        mutate: updateUserMutate,
        isLoading: updateUserLoading,
        isSuccess: isSuccessEditUser,
        isError: isErrorEditUser
    } = useMutation(update);

    useEffect(() => {
        if (isSuccessNewUser) {
            formUser.resetFields();
            AlertService.sendAlert([{
                text: 'Novo utilizador gravado com sucesso.',
                nextPage: true
             }]);
             toPage('list');
        }

        if (isSuccessEditUser) {
            formUser.resetFields();
            AlertService.sendAlert([{
                text: 'Utilizador editado com sucesso.',
                nextPage: true
             }]);
             toPage('list');
        }
    }, [isSuccessNewUser, isErrorNewUser,isSuccessEditUser, isErrorEditUser]);

    useQuery(
        ['loadUser', id],
        () => id ? getById(Number(id)) : null,
        {
            onSuccess: response => {
                if (response) {
                    formUser.setFieldsValue(response.data);
                    setChecked(response.data.active);

                    setEnablePassword(false);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const isOperatorOrStaffProfile = (): boolean | undefined => {
        if (id) {
            let profile = props.profiles.find((profile: any) => profile.id == formUser.getFieldValue('profile_id'));

            if (profile) return ['operator', 'staff'].includes(profile.role);
        }

        return false;
    };

    return (
        <>
            <DisplayAlert />
            <Card
                title={settings[props.action as keyof typeof settings].title}
                headStyle={{
                    color: '#107B99',
                    fontWeight: 600
                }}>
                <Form form={formUser} name="create_users" layout="vertical" className="form_table" autoComplete="off"
                    onValuesChange={() => setValuesChanged(true)}>

                    <Row gutter={20} style={{ marginTop: 20 }}>
                        <Col span={12}>
                            <Form.Item name="name" label="Nome"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' },
                                ]}>
                                <Input size="large" maxLength={255} placeholder="Nome" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="email" label="Email"
                                rules={[
                                    { type: "email", message: 'Formato do email inválido' },
                                    { required: true, message: 'Campo obrigatório' }
                                ]}>
                                <Input size="large" maxLength={50} placeholder="Email" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            {!enablePassword
                                ? <Button size="large" block style={{ marginTop: 30 }}
                                    onClick={() => setEnablePassword(!enablePassword)}>Editar Password</Button>
                                :
                                <Form.Item name="password" label="Password" data-html="true"
                                    tooltip={
                                        <>
                                            A password deve conter: <br />
                                            - No mínimo 8 caracteres <br />
                                            - Letras maiúsculas, minúsculas, números e caracteres especiais
                                        </>
                                    }
                                    rules={[
                                        { required: true, message: 'Campo obrigatório' },
                                        { min: 8, message: 'A password deve ter no mínimo 8 caracteres' },
                                        {
                                            pattern: new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$"),
                                            message: "A password deve ter letras maiúsculas, minúsculas, números e caracteres especiais"
                                        }
                                    ]}>
                                    <Space.Compact block>
                                        <Input.Password type="password" placeholder="Password" size="large" maxLength={100} />

                                        {props.action == 'edit' &&
                                            <Button size="large" onClick={() => setEnablePassword(!enablePassword)}>Cancelar</Button>
                                        }
                                    </Space.Compact>
                                </Form.Item>
                            }
                        </Col>

                        <Col span={8}>
                            <Form.Item name="profile_id" label="Privilégio"
                                rules={[
                                    { required: true, message: 'Campo obrigatório' },
                                ]}>
                                <Select placeholder="Seleciona privilégio" size="large" showSearch
                                    disabled={isOperatorOrStaffProfile()}
                                    options={props.profiles.map((profile: any) => {
                                        return {
                                            value: profile.id,
                                            label: profile.description,
                                            disabled: ['operator', 'staff'].includes(profile.role)
                                        }
                                    })} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {props.action == 'edit' &&
                        <Row style={{ marginTop: 15 }}>
                            <Col>
                                <Form.Item name="active">
                                    <Row>
                                        <Col flex="auto">
                                            <Switch checked={checked} onChange={($event) => {
                                                setChecked($event);
                                                setValuesChanged(true);
                                            }} />
                                        </Col>
                                        <Col style={{ marginLeft: 10 }}>
                                            Utilizador {checked == true ? 'ativo' : 'não ativo'}
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Col>
                        </Row>
                    }

                    <Row gutter={20} style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                        <Col>
                            <Space>
                                <Button loading={createUserLoading || updateUserLoading} size="large"
                                    onClick={() => {
                                        if (!id || valuesChanged) {
                                            setLeaveThePage(true);
                                        } else {
                                            toPage('list');
                                        }
                                    }}>Cancelar</Button>

                                <Button type="primary" size="large" loading={createUserLoading || updateUserLoading}
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
