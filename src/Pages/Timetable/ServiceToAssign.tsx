import {
    Badge, Card, Collapse, Image, Space, Tooltip, Typography
} from 'antd';
import {
    ClockCircleOutlined,
    DownOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    ShopOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import PlaneOutlined from '../../assets/images/PlaneOutlined.svg';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';

const { Text } = Typography;

export default function ServiceToAssign({ service, drag }: { service: any, drag?: any }) {
    const totalOfPeople = () => (service?.number_adults + service?.number_children);
    const iconsStyle = { color: '#8c8c8c' };

    return (
        <Card
            size="small"
            ref={drag}
            title={
                <Badge color={service?.serviceType?.data?.color || '#8c8c8c'}
                    text={service?.serviceType?.data?.name} styles={{ indicator: { width: 12, height: 12 } }} />
            }
            style={{
                borderColor: '#d9d9d9',
                marginBottom: 10
            }}
            headStyle={{
                borderBottom: `solid 2.5px ${service?.serviceType?.data?.color || '#8c8c8c'}`
            }}
            extra={<>
                <Tooltip placement="top" title="Hora Pick-up">
                    <Text strong><ClockCircleOutlined style={iconsStyle} /> {dayjs(service?.hour, 'H:mm:ss').format('HH:mm')}</Text>
                </Tooltip>

                <Tooltip placement="top" title="Pax Grupo">
                    <Text strong><TeamOutlined style={{ ...iconsStyle, marginLeft: 8 }} /> {totalOfPeople()}</Text>
                </Tooltip>
            </>}
        >
            <Space direction='vertical'>
                <Tooltip placement="top" title="Local Pick-up">
                    <Text strong><EnvironmentOutlined style={iconsStyle} /> {service?.pickup_location}</Text>
                </Tooltip>

                <Tooltip placement="top" title="Local Drop-off">
                    <Text strong><HomeOutlined style={iconsStyle} /> {service?.dropoff_location}</Text>
                </Tooltip>

                <Tooltip placement="top" title="Cliente">
                    <Text strong><UserOutlined style={iconsStyle} /> {service?.booking?.data?.client_name}</Text>
                </Tooltip>

                <Tooltip placement="top" title="Operador">
                    <Text strong><ShopOutlined style={iconsStyle} /> {service?.booking?.relationships?.operator?.data?.name}</Text>
                </Tooltip>

                <Tooltip placement="top" title="Número Voo">
                    <Text strong>
                        <Image src={PlaneOutlined} style={iconsStyle} preview={false} /> {service?.flight_number}
                    </Text>
                </Tooltip>

                <Collapse ghost style={{ marginLeft: -16, marginTop: -10 }}
                    expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                    items={[
                        {
                            key: 'notes',
                            label: <Text>Observações</Text>,
                            children: <Text>{service?.notes}</Text>
                        }
                    ]} />
            </Space>
        </Card>
    )
}