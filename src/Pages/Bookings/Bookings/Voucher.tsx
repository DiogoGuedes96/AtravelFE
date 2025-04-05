import { useEffect, useState } from "react";
import { CheckCircleFilled, EditOutlined, FilePdfOutlined, PrinterOutlined, ShareAltOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Form, Image, Input, Modal, Row, Space, Typography } from "antd";
import moment from "moment";
import { usePDF } from "@react-pdf/renderer";
import VoucherPDF from "./VoucherPDF";
import { useMutation } from "react-query";
import { sendVoucher } from "../../../services/bookings.service";
import ModalAlert from "../../../components/Commons/Modal/modal-alert.component";

const { Text, Title } = Typography;

export default function Voucher({
    booking,
    labels,
    onClickEdit
}: {
    booking: any,
    labels: any,
    onClickEdit: Function
}) {
    const [shareByEmail, setShareByEmail] = useState<boolean>(false);
    const [formShareByEmail] = Form.useForm();
    const [sentByEmail, setSentByEmail] = useState<boolean>(false);
    const [pdfInstante, updatePdfInstante] = usePDF({ document: <VoucherPDF booking={booking} labels={labels} /> });

    const companyStyle = { color: '#000000a6', padding: 0 }
    const voucherStyle = { color: '#000000e0', padding: 0 }
    const justifySpaceBetween = { display: 'flex', justifyContent: 'space-between' }
    const colorBtns = { color: '#000000aa' }
    const shareWhatsappText = 'Partilhar por WhatsApp';

    const { mutate: sendVoucherMutate, isLoading: isSendingVoucherByEmail } = useMutation(sendVoucher,
        {
            onSuccess: () => {
                setShareByEmail(false);
                setSentByEmail(true);
            }
        }
    );

    const onSubmitShareByEmail = () => {
        formShareByEmail
            .validateFields()
                .then(values => {
                    let formData = new FormData();
                    formData.append('email', values.email);
                    formData.append('voucher', pdfInstante.blob || '');

                    sendVoucherMutate({ formData, id: booking.id });
                }).catch(() => null);
    }

    useEffect(() => {
        updatePdfInstante(<VoucherPDF booking={booking} labels={labels} />);
    }, [booking]);

    return (<>
        <Row>
            <Col span={12}>
                <Space direction="vertical" size={0}>
                    <Image src={booking?.voucher?.company_img || '/atravel.png'} width={200} preview={false} style={{ marginBottom: 10 }} />
                    <Text style={companyStyle}>{booking?.voucher?.company_name}</Text>
                    <Text style={companyStyle}>{booking?.voucher?.company_phone}</Text>
                    <Text style={companyStyle}>{booking?.voucher?.company_email}</Text>
                </Space>
            </Col>
        </Row>

        <Row>
            <Col span={24}>
                <Title level={4} style={justifySpaceBetween}>
                    Voucher
                    <Button size="middle" icon={<EditOutlined style={{ color: '#107b99' }} />}
                        onClick={() => onClickEdit()}>Editar</Button>
                </Title>

                <Space direction="vertical" size={0}>
                    <Text style={voucherStyle}>{labels.client_name}: {booking?.voucher?.client_name}</Text>
                    <Text style={voucherStyle}>{labels.pax_group}: {booking?.voucher?.pax_group}</Text>
                    <Text style={voucherStyle}>{labels.operator}: {booking?.voucher?.operator}</Text>
                </Space>
            </Col>
        </Row>

        {booking?.serviceVouchers?.map((service: any) => (<>
            <Row key={service.id}>
                <Divider />
                <Col span={24}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong style={{ color: '#000000e0' }}>{service?.voucher?.start}</Text>
                        <Text style={voucherStyle}>{labels.time}: {service?.voucher?.hour ? moment(service?.voucher?.hour, 'H:mm:ss').format('h:mm a') : ''}</Text>
                        <Space style={{ ...justifySpaceBetween, width: '100%' }}>
                            <Text style={voucherStyle}>{labels.pickup_location}: {service?.voucher?.pickup_location}</Text>
                            <Text style={voucherStyle}>{labels.dropoff_location}: {service?.voucher?.dropoff_location}</Text>
                        </Space>
                    </Space>
                </Col>
            </Row>
        </>))}

        <Row style={{ marginTop: 40 }}>
            <Space size="small">
                <Button type="link" icon={<PrinterOutlined />} style={colorBtns}
                    href={pdfInstante.url || '#'} target="_blank" loading={pdfInstante.loading}>Imprimir</Button>

                <Button type="link" icon={<FilePdfOutlined />} style={colorBtns}
                    href={pdfInstante.url || '#'} download="voucher.pdf" loading={pdfInstante.loading}>Guardar como PDF</Button>

                <Button type="link" icon={<ShareAltOutlined />} style={colorBtns}
                    onClick={() => setShareByEmail(true)} loading={pdfInstante.loading}>Partilhar por Email</Button>
            </Space>
        </Row>

        <Modal
            open={!!shareByEmail} maskClosable={false} closeIcon={false} width={412} zIndex={2000}
            okText="Enviar" cancelText="Voltar"
            okButtonProps={{ size: 'large' }} cancelButtonProps={{ size: 'large' }}
            onOk={() => onSubmitShareByEmail()} confirmLoading={isSendingVoucherByEmail}
            onCancel={() => setShareByEmail(false)}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ marginTop: 5 }}>Partilhar voucher por email</Text>
            </div>

            <Form form={formShareByEmail} name="form_share_by_email" layout="vertical" style={{ marginTop: 5 }}>
                <Row>
                    <Col span={24}>
                        <Form.Item label="Email" name="email"
                            rules={[
                                { required: true, message: 'Campo obrigatório.' },
                                { type: 'email', message: 'Formato de email inválido.' }
                            ]}>
                            <Input type="email" size="large" placeholder="email@email.pt" maxLength={50} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>

        <ModalAlert
            open={sentByEmail} zIndex={2000}
            icon={<CheckCircleFilled style={{ color: '#52c41a', marginRight: 10, fontSize: 18 }} />}
            title="Voucher enviado com sucesso."
            content={`O voucher foi enviado para o email ${formShareByEmail.getFieldValue('email')}.`}
            okText="Fechar" 
            onOk={() => {
                setSentByEmail(false);
                formShareByEmail.resetFields();
            }}
        ></ModalAlert>
    </>);
}