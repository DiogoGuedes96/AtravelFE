import { Button, Card, Form, Input, Space, Col, Row, Radio } from "antd";
import DisplayAlert from "../../../components/Commons/Alert";
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from "react-query";
import { AlertService } from '../../../services/alert.service';
import { create, getById, update, syncPermissions, getModulePermissions } from '../../../services/profiles.service';
import { useEffect, useState } from "react";
import { HomeOutlined, CalendarOutlined, TableOutlined, UserSwitchOutlined, SettingOutlined, NodeIndexOutlined, ControlOutlined, DeleteOutlined } from "@ant-design/icons";
import ConfirmModal from "../../../components/Commons/Modal/confirm-modal.component";

export default function FormProfilePage(props: any) {
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [modulePermissions, setModulePermissions] = useState<any[]>([]);
    const [modulePermissionsList, setModulePermissionsList] = useState<any[]>([]);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [readonly, setReadonly] = useState<boolean>(false);
    const [selectedGroup, setSelectedGroup] = useState<string>();

    const [formProfile] = Form.useForm();
    const { id } = useParams();

    const navigate = useNavigate()

    const toPage = (page: string) => {
        let pages = {
            create: '/management/users/profilesAndPrivileges/create',
            list: `/management/users/profilesAndPrivileges`,
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const settings = {
        create: { title: 'Criar novo perfil' },
        edit: { title: 'Editar perfil' },
        profilesAndPrivileges: { title: 'Lista de perfis' }
    };

    const onSubmit = () => {
        formProfile
            .validateFields()
            .then((values) => {
                setModulePermissions(Object.keys(values).filter(key => key != 'description').reduce(
                    (acumulador: Array<any>, item: any) => {
                        let [module, permission] = item.split('-');

                        let moduleFound = acumulador.findIndex(item => item.module == module);

                        if (moduleFound == -1) {
                            acumulador.push({
                                module: module,
                                permissions: {
                                    [permission]: values[item]
                                }
                            });
                        } else {
                            acumulador[moduleFound].permissions[permission] = values[item];
                        }

                        return acumulador;
                    },
                    []
                ));

                values = {
                    description: values.description
                }

                if (!id || props.action == 'create') {
                    createProfileMutate(values);
                } else {
                    updateProfileMutate({ values: { ...values }, id: Number(id) });
                }
            })
            .catch(() => AlertService.sendAlert([
                { text: 'Campo(s) com preenchimento inválido.', type: 'error' }
            ]));
    };

    const {
        mutate: createProfileMutate,
        data: profileCreated,
        isLoading: createProfileLoading,
        isSuccess: isSuccessNewProfile
    } = useMutation(create);

    const {
        mutate: syncPermissionsMutate,
        isLoading: syncPermissionsLoading,
        isSuccess: isSuccessNewPermissions
    } = useMutation(syncPermissions);

    const {
        mutate: updateProfileMutate,
        isLoading: updateProfileLoading,
        isSuccess: isSuccessEditProfile
    } = useMutation(update);

    useEffect(() => {
        if (isSuccessNewProfile) {
            syncPermissionsMutate({
                values: {
                    module_permissions: modulePermissions
                },
                id: profileCreated.data.id
            });
        }

        if (isSuccessEditProfile) {
            syncPermissionsMutate({
                values: {
                    module_permissions: modulePermissions
                },
                id: Number(id)
            });
        }

        if (isSuccessNewPermissions) {
            AlertService.sendAlert([{
                text: id ? 'Perfil editado com sucesso.' : 'Novo perfil gravado com sucesso.',
                nextPage: true
            }]);

            toPage('list');
        }
    }, [isSuccessNewProfile, isSuccessEditProfile, isSuccessNewPermissions]);

    useQuery(['loadProfile', id], () => id ? getById(Number(id)) : null, {
        onSuccess: response => {
            if (response) {
                let module_permissions = response.data.module_permissions.reduce((objeto: any, item: any) => {
                    if (typeof item.permissions == 'string') {
                        item.permissions = JSON.parse(item.permissions);
                    }

                    Object.entries(item.permissions).forEach(([key, value]) => {
                        objeto[`${item.module}-${key}`] = value;
                    });

                    return objeto;
                }, {});

                formProfile.setFieldsValue({
                    description: response.data.description,
                    ...module_permissions
                });

                let permissions = Object.values(module_permissions);

                onSelectGroupAll(permissions);

                setReadonly(response.data.readonly);
            }
        },
        refetchOnWindowFocus: false
    });

    useQuery(['loadPermissions'], () => getModulePermissions(), {
        onSuccess: (response: any) => {
            if (response) {
                setModulePermissionsList(response.data)
            }
        },
        refetchOnWindowFocus: false
    });

    const findPermission = (module: string, permission: string) => {
        let moduleFound = modulePermissionsList.find(modulePermission => modulePermission.module == module);

        if (moduleFound) {
            return moduleFound.permissions.find((_permission: any) => _permission.value == permission);
        }

        return null;
    }

    const sections = [
        {
            label: 'Dashboard',
            icon: <HomeOutlined className="icon-permissions" />,
            permissions: ['dashboard-dashboard']
        },
        {
            label: 'Serviços',
            icon: <CalendarOutlined className="icon-permissions" />,
            permissions: ['bookings-bookings', 'bookings-services', 'bookings-operators', 'bookings-bookingsToApprove'],
            blocked: [
                'bookings-operators',
            ]
        },
        {
            label: 'Escalas',
            icon: <TableOutlined className="icon-permissions" />,
            permissions: ['timetable-timetable']
        },
        {
            label: 'Controle',
            icon: <UserSwitchOutlined className="icon-permissions" />,
            permissions: [
                'control-staff', 'control-operators', 'control-suppliers',
                'control-reportsStaff', 'control-reportsOperators', 'control-reportsSuppliers'
            ]
        },
        {
            label: 'Assets',
            icon: <SettingOutlined className="icon-permissions" />,
            permissions: [
                'tables-operators', 'tables-suppliers', 'tables-staff',
                'operators-operators', 'suppliers-suppliers', 'staff-staff',
                'vehicles-vehicles', 'services-serviceTypes', 'services-serviceStates'
            ]
        },
        {
            label: 'Rotas',
            icon: <NodeIndexOutlined className="icon-permissions" />,
            permissions: ['routes-zones', 'routes-routes', 'routes-locations']
        },
        {
            label: 'Gestão',
            icon: <ControlOutlined className="icon-permissions" />,
            permissions: [
                'users-users', 'users-profilesAndPrivileges',
                'companies-companies', 'app-app'
            ]
        },
        {
            label: 'Reciclagem',
            icon: <DeleteOutlined className="icon-permissions" />,
            permissions: ['recycling-recycling']
        }
    ];

    const onInitialValues = (group: (string | undefined) = undefined) => {
        const initialValues = sections.reduce((objeto: any, section: any) => {
            section.permissions.forEach((permission: any) => {
                if (section?.blocked?.includes(permission)) {
                    if (props.action == 'create') {
                        objeto[permission] = 'none';
                        return objeto;
                    }
                    return;
                }

                objeto[permission] = group;
            });

            return objeto;
        }, {});

        formProfile.setFieldsValue(initialValues);
    };

    const onSelectGroupAll = (permissions: any[]) => {
        if (permissions.every((permission, index, permissions) => permission == permissions[0])) {
            setSelectedGroup(String(permissions[0]));
        } else {
            setSelectedGroup(undefined);
        }
    }

    const onChangePermission = () => {
        let permissions = Object.entries(formProfile.getFieldsValue())
            .filter(([key, value]: any) => key != 'description')
            .map(permission => permission[1]);

        onSelectGroupAll(permissions);
    };

    useEffect(() => {
        if (!id) {
            setSelectedGroup('none');
        }
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            onInitialValues(selectedGroup);
        }
    }, [selectedGroup]);

    return (
        <>
            <DisplayAlert />
            <Card
                title={settings[props.action as keyof typeof settings].title}
                headStyle={{
                    color: '#107B99',
                    fontWeight: 600
                }}>
                <Form
                    form={formProfile}
                    name="create_users"
                    layout="vertical"
                    className="form_table"
                    autoComplete="off"
                    onValuesChange={() => setValuesChanged(true)}>

                    <Row gutter={20} style={{ marginTop: 20 }}>
                        <Col span={12}>
                            <Form.Item
                                name="description"
                                label="Nome do perfil"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Campo obrigatório',
                                    }
                                ]}>
                                <Input size="large" maxLength={20} disabled={!!id && readonly} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="form-row-radio">
                        <Radio.Group name="selectedGroup" style={{ width: "100%", padding: "17px 25px" }}
                            value={selectedGroup}
                            onChange={($event) => {
                                setSelectedGroup($event.target.value);
                                setValuesChanged(true);
                            }}>
                            <Row>
                                <Col span={10}></Col>
                                <Col span={14}>
                                    <Row>
                                        <Col span={8}>
                                            <Radio value="write">Tudo (Escrita)</Radio>
                                        </Col>
                                        <Col span={8}>
                                            <Radio value="read">Tudo (Leitura)</Radio>
                                        </Col>
                                        <Col span={8}>
                                            <Radio value="none">Tudo (Sem permissão)</Radio>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Radio.Group>
                    </div>

                    {sections.map((section: any, index: any) => {
                        return (
                            <div className="form-row-radio" key={'section_' + index}>
                                <div className="form-row-radio__title-box">
                                    {section.icon}
                                    <span>{section.label}</span>
                                </div>

                                {section.permissions.map((item: any, index2: any) => {
                                    let [module, permission] = item.split('-')
                                    let permissionFound: any = findPermission(module, permission)
                                    let isDesabled = false;

                                    if (permissionFound) {
                                        if (section?.blocked?.includes(item)) {
                                            isDesabled = true;
                                        }

                                        return (
                                            <Form.Item
                                                name={item}
                                                key={'section_' + index + '_' + index2}
                                                style={{ marginBottom: 0 }}
                                                rules={[
                                                    { required: true, message: 'Campo obrigatório' }
                                                ]}>
                                                <Radio.Group style={{ width: "100%", padding: "15px 25px" }}
                                                    onChange={($event) => onChangePermission()}>
                                                    <Row>
                                                        <Col span={10}>
                                                            <span>{permissionFound.label}</span>
                                                        </Col>
                                                        <Col span={14}>
                                                            <Row>
                                                                {Object.entries(permissionFound.permissions).map(([key, value]: any, index3: any) => {
                                                                    return (
                                                                        <Col span={8} key={'section_' + index + '_' + index2 + '_' + index3}>
                                                                            <Radio disabled={isDesabled} value={key}>{value}</Radio>
                                                                        </Col>
                                                                    )
                                                                })}
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </Radio.Group>
                                            </Form.Item>
                                        )
                                    }
                                })}
                            </div>
                        )
                    })}

                    <Row gutter={20} style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                        <Col>
                            <Space>
                                <Button loading={createProfileLoading || updateProfileLoading} size="large"
                                    onClick={() => {
                                        if (!id || valuesChanged) {
                                            setLeaveThePage(true);
                                        } else {
                                            toPage('list');
                                        }
                                    }}>Cancelar</Button>

                                <Button type="primary" size="large"
                                    loading={createProfileLoading || updateProfileLoading}
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
