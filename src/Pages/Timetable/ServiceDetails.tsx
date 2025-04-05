import {
    Badge, Button, Card, Col, Image, Row, Space, Tag, Typography
} from 'antd';
import {
    CloseCircleOutlined,
    CloseOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    ShopOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import PlaneOutlined from '../../assets/images/PlaneOutlined.svg';
import 'dayjs/locale/pt';
import { useMutation } from 'react-query';
import { update } from '../../services/bookingServices.service';
import { useState } from 'react';
import ConfirmModal from '../../components/Commons/Modal/confirm-modal.component';

const { Text } = Typography;

export default function ServiceDetails({
    service,
    conductor,
    onCloseDetails,
    onRemovedService
}: {
    service: any,
    conductor: any,
    onCloseDetails: () => void,
    onRemovedService: (service: any) => void
}) {
    const [removingService, setRemovingService] = useState<boolean>(false);

    const totalOfPeople = () => (service?.number_adults + service?.number_children);
    const iconsStyle = { color: '#8c8c8c', marginRight: 10 };
    const indentStyle = { marginLeft: 25 };

    const { mutate: updateService } = useMutation(update, {
        onSuccess: () => setRemovingService(false)
    });

    const onRemoveConductor = () => {
        let _service = {
            ...service,
            staff_id: null,
            supplier_id: null
        };

        onRemovedService(_service);

        updateService(
            {
                values: {
                    staff_id: _service.staff_id,
                    supplier_id: _service.supplier_id
                },
                id: service.id
            }
        );
    }

    return (<>
        <Card
            size="small"
            title={<>
                <Badge color={service?.serviceType?.data?.color || '#8c8c8c'} styles={{ indicator: { width: 12, height: 12 } }} /> <Text
                    style={{ whiteSpace: 'normal' }}>{service?.dropoff_location}</Text>
            </>}
            extra={<>
                <CloseOutlined style={{ ...iconsStyle, cursor: 'pointer', marginRight: 2 }}
                    onClick={onCloseDetails} />
            </>}
            headStyle={{
                border: 'none',
                paddingTop: 5
            }}
            style={{
                width: 318,
                borderLeft: `solid 5px ${service?.serviceType?.data?.color || '#8c8c8c'}`,
                marginBottom: 10
            }}
        >
            <Space direction='vertical' size={15}>
                <Space direction='vertical' size={2}>
                    <Space size={10}>
                        <Text strong>
                            Condutor
                        </Text>

                        {conductor?.data?.type === 'staff'
                            ? <Tag style={{ backgroundColor: '#f0f0f0' }}>Motorista</Tag>
                            : <Tag>Fornecedor</Tag>}
                    </Space>

                    <Text>
                        {conductor?.data?.name.split(' ')[0]}
                        <Button size='small' type='text' style={{ color: '#8c8c8c' }}
                            onClick={onRemoveConductor}>
                            <CloseCircleOutlined /> Remover condutor
                        </Button>
                    </Text>
                </Space>

                <Space direction='vertical' size={2}>
                    <Text strong>Cliente</Text>
                    <Text>{service?.booking?.data?.client_name}</Text>
                </Space>

                <Row>
                    <Col span={12} style={{ marginBottom: 15 }}>
                        <Space direction='vertical' size={5}>
                            <Text strong><ShopOutlined style={iconsStyle} />Operador</Text>
                            <Text style={indentStyle}>{service?.booking?.relationships?.operator?.data?.name}</Text>
                        </Space>
                    </Col>

                    <Col span={12} style={{ marginBottom: 15 }}>
                        <Space direction='vertical' size={5}>
                            <Text strong><EnvironmentOutlined style={iconsStyle} />Pick Up</Text>
                            <Text style={indentStyle}>{service?.pickup_location}</Text>
                        </Space>
                    </Col>

                    <Col span={12} style={{ marginBottom: 15 }}>
                        <Space direction='vertical' size={5}>
                            <Text strong>
                                <Image src={PlaneOutlined} style={{ ...iconsStyle, width: 16 }} preview={false} />Número do voo
                            </Text>
                            <Text style={indentStyle}>{service?.flight_number}</Text>
                        </Space>
                    </Col>

                    <Col span={12} style={{ marginBottom: 15 }}>
                        <Space direction='vertical' size={5}>
                            <Text strong><HomeOutlined style={iconsStyle} />Drop-off</Text>
                            <Text style={indentStyle}>{service?.dropoff_location}</Text>
                        </Space>
                    </Col>

                    <Col span={12} style={{ marginBottom: 15 }}>
                        <Space direction='vertical' size={5}>
                            <Text strong><TeamOutlined style={iconsStyle} />Pax Grupo</Text>
                            <Text style={indentStyle}>{totalOfPeople()}</Text>
                        </Space>
                    </Col>

                    <Col span={24} style={{ marginBottom: 15 }}>
                        <Space direction='vertical' size={5}>
                            <Text strong>Observações</Text>
                            <Text>{service?.notes}</Text>
                        </Space>
                    </Col>
                </Row>
            </Space>
        </Card>

        <ConfirmModal
            open={removingService}
            title="Tem certeza que deseja remover o condutor?"
            okText="Remover" cancelText="Voltar"
            onOk={() => onRemoveConductor()}
            onCancel={() => setRemovingService(false)}
        ></ConfirmModal>
    </>)
}