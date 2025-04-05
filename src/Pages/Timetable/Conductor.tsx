import { MailOutlined } from '@ant-design/icons';
import {
    Space, Tag, Tooltip, Typography
} from 'antd';

const { Text } = Typography;

export default function Conductor({
    conductor,
    totalServices,
    onShareByEmail
}: {
    conductor: any,
    totalServices: number,
    onShareByEmail: () =>void
}) {
    return (<>
        <Space direction='vertical' size={2}>
            {conductor?.data?.type == 'staff'
                ? <Tag style={{ backgroundColor: '#f0f0f0' }}>Motorista</Tag>
                : <Tag>Fornecedor</Tag>}
            <Text strong>
                {conductor?.data?.name.split(' ')[0]}

                {!!totalServices &&
                    <Tooltip placement="top" title="Partilhar escala do dia por email">
                        <MailOutlined style={{
                            color: '#107b99', cursor: 'pointer',
                            fontSize: 12, marginLeft: 5
                        }}
                        onClick={onShareByEmail} />
                    </Tooltip>}
            </Text>
            <Text style={{ fontSize: 12 }}>
                {totalServices} serviços
            </Text>
        </Space>
    </>)
}