import {
    Col,
    Form,
    Input,
    Modal,
    Row,
    Typography,
    notification
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt';
import TimetableRow from './TimetableRow';
import { useMutation } from 'react-query';
import { sendTimetable } from '../../services/bookingServices.service';
import { useEffect, useState } from 'react';

const { Text } = Typography;

interface IDataShareByEmail {
    date: string
    conductor: string
    email: string
    timetable: Blob | string
}

export default function Schedule({
    date,
    services,
    staff,
    suppliers,
    onDroppedService
}: {
    date: Dayjs,
    services: object,
    staff: any[],
    suppliers: any[],
    onDroppedService: (service: any) => void
}) {
    const [shareByEmail, setShareByEmail] = useState<IDataShareByEmail | undefined>(undefined);

    const [formShareByEmail] = Form.useForm();

    const theadTds = {
        width: 120, border: 'solid 1px #f0f0f0', margin: 0, padding: '8px 5px', height: 40
    };

    const hours = [...Array(24)].map((_: undefined, index: number) => {
        let hour = dayjs(index + ':00', 'H:mm').format('HH:mm');

        return (
            <td key={'td_hour_' + index} style={theadTds}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: 120 }}>
                    <Text>{hour}</Text>
                </div>
            </td>
        );
    });

    const getServicesByConductor = (key: string): any[] => services[key as keyof typeof services] || [];

    const conductors = staff.concat(suppliers)
        .sort((a, b) => (a?.data?.name > b?.data?.name) ? 1 : ((b?.data?.name > a?.data?.name) ? -1 : 0))
        .map((item: any) => (
            <TimetableRow
                date={date}
                key={'conductor_' + item?.data?.id}
                conductor={item}
                services={getServicesByConductor(`${item?.data?.type}_${item?.data?.id}`)}
                theadTds={theadTds}
                onDroppedService={onDroppedService}
                onShareByEmail={(data: IDataShareByEmail) => {
                    setShareByEmail(data)
                }} />
        ));

    const { mutate: sendTimetableMutate, isLoading: isSendingTimetableByEmail } = useMutation(sendTimetable,
        {
            onSuccess: () => {
                notification.success({
                    message: 'Escala partilhada com sucesso.',
                    placement: 'topRight'
                });

                setShareByEmail(undefined);
            }
        }
    );

    const onSubmitShareByEmail = () => {
        formShareByEmail
            .validateFields()
            .then(values => {
                let formData = new FormData();
                formData.append('date', shareByEmail?.date || '');
                formData.append('conductor', shareByEmail?.conductor || '');
                formData.append('email', values.email);
                formData.append('timetable', shareByEmail?.timetable || '');

                sendTimetableMutate({ formData });
            }).catch(() => null);
    }

    useEffect(() => {
        formShareByEmail.setFieldValue('email', !!shareByEmail ? shareByEmail.email : '');
    }, [shareByEmail]);

    return (
        <>
            <div style={{ display: 'table', tableLayout: 'fixed', width: '100%' }}>
                <div style={{ display: 'table-cell', width: '100%' }}>
                    <table style={{ border: 'solid 1px #d9d9d9', borderRadius: 10, borderCollapse: 'collapse', overflowX: 'auto', display: 'block', whiteSpace: 'nowrap' }}>
                        <thead>
                            <tr>
                                <td style={{ ...theadTds, backgroundColor: '#fafafa' }}></td>
                                {hours}
                            </tr>
                        </thead>
                        <tbody>
                            {conductors}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                open={!!shareByEmail} maskClosable={false} closeIcon={false} width={430} zIndex={2000}
                okText="Enviar" cancelText="Cancelar envio"
                okButtonProps={{ size: 'large' }} cancelButtonProps={{ size: 'large' }}
                onOk={() => onSubmitShareByEmail()} confirmLoading={isSendingTimetableByEmail}
                onCancel={() => {
                    setShareByEmail(undefined);
                    formShareByEmail.resetFields();
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong style={{ marginTop: 5 }}>Partilhar escala completa do dia</Text>
                </div>

                <Form form={formShareByEmail} name="form_share_by_email" layout="vertical" style={{ marginTop: 5 }}>
                    <Row>
                        <Col span={24}>
                            <Form.Item label="Digite o email do condutor para enviar a escala completa:" name="email"
                                rules={[
                                    { required: true, message: 'Campo obrigatório.' },
                                    { type: 'email', message: 'Formato de email inválido.' }
                                ]}>
                                <Input type="email" size="large" placeholder="emailcondutor@email.pt" maxLength={50} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    )
}