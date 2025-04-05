import { Col, Row, Space, Typography } from "antd";
import moment from "moment";
import { formatCurrency } from "../../../services/utils";

const { Text } = Typography;

export default function ShowDetails({ details, lang }: { details: any, lang: 'en' | 'pt' }) {
    const langs = {
        en: {
            operator: 'Operator',
            reference: 'Reference',
            customer: 'Customer',
            email: 'Email',
            phone_number: 'Phone Number',
            start_date: 'Date',
            time: 'Time',
            pickup_location: 'Pick-up location',
            dropoff_location: 'Drop-off location',
            value: 'Amount',
            pax_group: 'Number of people',
            reason: 'Reason',
            additional_information: 'Additional Information'
        },
        pt: {
            operator: 'Operador',
            reference: 'Referência',
            customer: 'Cliente',
            email: 'Email',
            phone_number: 'Telefone',
            start_date: 'Data',
            time: 'Hora',
            pickup_location: 'Local Pick-up',
            dropoff_location: 'Local Drop-off',
            value: 'Valor',
            pax_group: 'Número de pessoas',
            reason: 'Justificativa',
            additional_information: 'Outras Informações'
        }
    };

    return (<>
        <Row>
            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].operator}</Text>
                    <Text>{details?.operator?.data?.name}</Text>
                </Space>
            </Col>

            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].reference}</Text>
                    <Text>{details?.reference}</Text>
                </Space>
            </Col>

            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].customer}</Text>
                    <Text>{details.client_name}</Text>
                </Space>
            </Col>

            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].email}</Text>
                    <Text>{details.client_email}</Text>
                </Space>
            </Col>

            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].phone_number}</Text>
                    <Text>{details.client_phone}</Text>
                </Space>
            </Col>
        </Row>

        <Row>
            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].start_date}</Text>
                    <Text>{details.start_date}</Text>
                </Space>
            </Col>

            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].time}</Text>
                    <Text>{details.hour ? moment(details.hour, 'H:mm:ss').format('h:mm a') : ''}</Text>
                </Space>
            </Col>

            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].pickup_location}</Text>
                    <Text>{details.pickup_location}</Text>
                </Space>
            </Col>

            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].dropoff_location}</Text>
                    <Text>{details.dropoff_location}</Text>
                </Space>
            </Col>

            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].value}</Text>
                    <Text>{formatCurrency(details.value)}</Text>
                </Space>
            </Col>

            <Col span={12} style={{ marginBottom: 15 }}>
                <Space direction="vertical">
                    <Text strong>{langs[lang as keyof typeof langs].pax_group}</Text>
                    <Text>{details.pax_group}</Text>
                </Space>
            </Col>

            {(details?.additional_information) &&
                <Col span={12} style={{ marginBottom: 15 }}>
                    <Space direction="vertical">
                        <Text strong>{langs[lang as keyof typeof langs].additional_information}</Text>
                        <Text>{details.additional_information}</Text>
                    </Space>
                </Col>
            }

            {(details?.status_reason && ['canceled', 'refused'].includes(details?.status)) &&
                <Col span={12} style={{ marginBottom: 15 }}>
                    <Space direction="vertical">
                        <Text strong>{langs[lang as keyof typeof langs].reason}</Text>
                        <Text>{details.status_reason}</Text>
                    </Space>
                </Col>
            }
        </Row>
    </>);
}