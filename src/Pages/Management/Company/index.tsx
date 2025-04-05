import { useState } from "react";
import { useMutation, useQuery } from "react-query";

import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Result, Row, Space, Spin, Switch, Typography, Upload, UploadFile, message } from "antd";

import DisplayAlert from "../../../components/Commons/Alert";
import ConfirmModal from "../../../components/Commons/Modal/confirm-modal.component";

import { Convert } from "../../../services/convert.service";
import { AlertService } from "../../../services/alert.service";
import { createCompany, getCompanyDetails, updateCompany } from "../../../services/companies.service";

import dayjs from "dayjs";

const { Text, Title } = Typography

export default function CompaniesPage() {
    const [unblockForm, setUnblockForm] = useState<boolean>(false);
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [isEditCompany, setIsEditCompany] = useState<boolean>(false);
    const [companyInitialDetails, setCompanyInitialDetails] = useState<any>({});
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [automaticNotification, setAutomaticNotification] = useState<boolean>(true);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [file, setFile] = useState<UploadFile | any>();

    const [companyForm] = Form.useForm();

    const {
        isLoading: isloadingGetCompany,
        isRefetching: isRefetchingGetCompany,
        refetch: refetchGetCompany,
        isError: isErrorGetCompany
    } = useQuery(
        ['getCompanyDetails'],
        () => getCompanyDetails(),
        {
            onSuccess: (response: any) => {
                if (response?.data) {
                    handleFormInitialValues(response?.data);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const {
        mutate: createCompanyMutate,
        isLoading: createCompanyLoading
    } = useMutation(
        createCompany,
        {
            onSuccess: () => {
                refetchGetCompany();
                setUnblockForm(false);

                AlertService.sendAlert([
                    {
                        text: 'Dados editados com sucesso.'
                    }
                ]);
            }
        }
    );

    const {
        mutate: updateCompanyMutate,
        isLoading: updateCompanyLoading,
    } = useMutation(
        updateCompany,
        {
            onSuccess: () => {
                refetchGetCompany();
                setUnblockForm(false);

                AlertService.sendAlert([
                    {
                        text: 'Dados editados com sucesso.'
                    }
                ]);
            }
        }
    );

    const handleFormInitialValues = (company: any) => {
        let initialValue: Record<string, any> = {};
        const notificationTime = company?.notification_time;
        const [hours, minutes] = notificationTime ? notificationTime.split(":") : [null, null];

        initialValue = {
            id: company.id,
            name: company.name,
            phone: company.phone,
            email: company.email,
            notification_time: company?.notification_time !== null ? dayjs(hours + ":" + minutes, "HH:mm") : null,
            api_key_maps: company.api_key_maps,
        }

        setAutomaticNotification(!!company?.automatic_notification);

        setImageUrl(company?.img_url)
        setCompanyInitialDetails(company);
        setIsEditCompany(true);

        companyForm.setFieldsValue(initialValue);
    }

    const onSubmit = () => {
        companyForm
            .validateFields()
            .then((values: any) => {
                values.image = file;
                values.automatic_notification = automaticNotification;
                values.notification_time = values?.notification_time ? Convert.time(values?.notification_time) : null;

                if (isEditCompany) {
                    values.id = companyInitialDetails?.id;

                    if (!values?.image && imageUrl) {
                        values.img_path = imageUrl;
                    }

                    updateCompanyMutate(values);
                } else {
                    createCompanyMutate(values);
                }
            })
            .catch(() => AlertService.sendAlert([
                { text: 'Campo(s) com preenchimento inválido', type: 'error' }
            ]));
    };

    const handleCancelEdit = () => {
        setLeaveThePage(false)
        setValuesChanged(false);
        setIsEditCompany(false);
        setUnblockForm(false);

        if (Object.keys(companyInitialDetails).length > 0) {
            handleFormInitialValues(companyInitialDetails);
        } else {
            companyForm.resetFields();
            setImageUrl('');
            setAutomaticNotification(false);
        }
    }

    const getBase64 = (img: any, callback: (url: string) => void) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result as string));
        reader.readAsDataURL(img);
    };

    const handleChange = async ({ file: file }: any) => {
        try {
            const allowedExtensions = [".jpg", ".jpeg", ".png"];
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

            if (file.size > 2 * 1024 * 1024) {
                message.error(`${file.name} tem mais de 2MB.`);
                return false;
            }

            if (!allowedExtensions.includes(fileExtension)) {
                message.error(
                    `Apenas são permitidos ficheiros do tipo: ${allowedExtensions.join(", ")}`
                );
                return false;
            }

            getBase64(file, (url) => {
                setImageUrl(url);
            });

            setFile(file);

        } catch (error) {
            message.error(`Erro ao fazer upload da imagem.`);
        }
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    return (
        <>
            <div className="content_page">
                <DisplayAlert />
                <Card>
                    {isErrorGetCompany
                        ? <Result status="error" title="Erro ao carregar os dados da empresa."
                            extra={
                                <Text>
                                    Por favor tente mais tarde.
                                </Text>
                            }
                        />
                        : <>
                            {isloadingGetCompany || isRefetchingGetCompany
                                ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                                </div>
                                : <>
                                    <Text style={{ color: '#107B99', fontWeight: 600, fontSize: 20 }}>Dados da empresa</Text>

                                    <Form disabled={!unblockForm} form={companyForm} name="create_users" layout="vertical" className="form_table" autoComplete="off" onValuesChange={() => setValuesChanged(true)}>
                                        <Row gutter={20} style={{ marginTop: 20 }}>
                                            <Col span={6}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 8, marginTop: 20, height: '100%' }}>
                                                    <Title level={5} style={{ margin: '0px 0px 20px 0px' }}>Logotipo da empresa</Title>

                                                    <Form.Item name="image"
                                                        rules={[
                                                            { required: (!isEditCompany || (isEditCompany && !imageUrl)), message: 'Campo obrigatório' },
                                                        ]}>
                                                        <Upload
                                                            name="img" listType="picture-card" className="upload-image"
                                                            showUploadList={false} beforeUpload={() => false} onChange={handleChange}
                                                            maxCount={1} multiple={false}
                                                            onRemove={() => setImageUrl('')}>

                                                            {imageUrl
                                                                ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
                                                                : uploadButton
                                                            }
                                                        </Upload>
                                                    </Form.Item>

                                                    <Text style={{ fontSize: '12', color: '#595959' }}>JPG, JPEG e PNG de até 2mb</Text>
                                                </div>
                                            </Col>

                                            <Col span={18}>
                                                <Row gutter={20} style={{ marginTop: 20 }}>
                                                    <Col span={24}>
                                                        <Form.Item name="name" label="Nome"
                                                            rules={[
                                                                { required: true, message: 'Campo obrigatório' },
                                                            ]}>
                                                            <Input size="large" maxLength={255} placeholder="Atravel" />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={20} style={{ marginTop: 15 }}>
                                                    <Col span={8}>
                                                        <Form.Item label="Telefone" name="phone"
                                                            rules={[
                                                                { required: true, message: 'Campo obrigatório' }
                                                            ]}>
                                                            <Input size="large" placeholder="Telefone" maxLength={20}
                                                                style={{ width: "100%" }} />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col span={16}>
                                                        <Form.Item name="email" label="Email"
                                                            rules={[
                                                                { type: "email", message: 'Formato do email inválido' },
                                                                { required: true, message: 'Campo obrigatório' }
                                                            ]}>
                                                            <Input size="large" maxLength={50} placeholder="Email" />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Title level={5}>Configurações de envio de escala</Title>

                                                <Row style={{ marginTop: 15, display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                                                    <Col span={4}>
                                                        <Form.Item label="Hora de notificações" name="notification_time"
                                                            style={{ width: "100%" }}>
                                                            <DatePicker picker="time" format="HH:mm" size="large"
                                                                style={{ width: "100%" }} />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col span={19} style={{ marginLeft: 20 }}>
                                                        <Form.Item name="automatic_notification">
                                                            <Row>
                                                                <Col>
                                                                    <Switch checked={automaticNotification} onChange={($event) => {
                                                                        setAutomaticNotification($event);
                                                                        setValuesChanged(true);
                                                                    }} />
                                                                </Col>

                                                                <Col style={{ marginLeft: 10 }}>
                                                                    Envio automático
                                                                </Col>
                                                            </Row>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Title level={5}>Configurações API Key Google Maps</Title>

                                                <Row style={{ marginTop: 15, display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                                                    <Col span={14}>
                                                        <Form.Item label="Chave API Google Maps" name="api_key_maps">
                                                            <Input maxLength={100} size="large" />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Form>

                                    <Row gutter={20} style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Col>
                                            <Space>
                                                {unblockForm &&
                                                    <Button size="large" loading={createCompanyLoading || updateCompanyLoading}
                                                        onClick={() => {
                                                            if (valuesChanged) {
                                                                setLeaveThePage(true);
                                                            } else {
                                                                setUnblockForm(false);
                                                            }
                                                        }}>
                                                        Cancelar
                                                    </Button>
                                                }

                                                <Button type="primary" size="large"
                                                    loading={createCompanyLoading || updateCompanyLoading}
                                                    onClick={() => unblockForm ? onSubmit() : setUnblockForm(true)}>
                                                    {unblockForm ? 'Gravar' : 'Editar'}
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>
                                </>
                            }
                        </>
                    }

                    <ConfirmModal
                        open={leaveThePage}
                        title="Tem certeza de que deseja cancelar as alterações?"
                        content="Toda a informação não gravada será perdida."
                        okText="Sair" cancelText="Voltar"
                        onOk={() => handleCancelEdit()}
                        onCancel={() => setLeaveThePage(false)}
                    ></ConfirmModal>
                </Card>
            </div>
        </>
    )
}
