import { Tabs } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import ListPending from './Pending';
import ListRejected from './Rejected';

export default function BookingsBeApproved(props: any) {
    const { tab } = useParams();
    const navigate = useNavigate();

    const items = [
        {
            key: 'pending',
            label: 'Pendentes',
            children: <div className="content_page"><ListPending /></div>,
        },
        {
            key: 'rejected',
            label: 'Rejeitadas',
            children: <div className="content_page"><ListRejected /></div>
        }
    ];

    return (
        <Tabs
            tabBarStyle={{
                backgroundColor: '#FFF',
                padding: '8px 52px 0px 24px',
                color: '#000',
                marginBottom: 0
            }}
            size="large"
            defaultActiveKey={tab || 'pending'}
            destroyInactiveTabPane={true}
            items={items}
            activeKey={tab}
            onChange={(activeKey: string) => {
                navigate(`/bookings/bookingsToApprove/${activeKey}`);
            }}
        />
    )
}
