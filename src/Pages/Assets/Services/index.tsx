import { Tabs } from 'antd';
import Services from './Services';
import ServiceStates from './ServiceStates';
import { useNavigate, useParams } from 'react-router-dom';
import ProfilePermissionService from "../../../services/profilePermissions.service";
import { capitalized } from '../../../services/utils';

export default function ServicesPage() {
    const { tab } = useParams();
    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const items = [
        {
            key: 'types',
            label: 'Tipos de serviço',
            children: <div className="content_page"><Services /></div>
        },
        {
            key: 'states',
            label: 'Estados de serviço',
            children: <div className="content_page"><ServiceStates /></div>
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
            defaultActiveKey={tab || 'types'}
            destroyInactiveTabPane={true}
            items={items.filter((item: any) => profilePermissionService.hasPermission([
                `services-service${capitalized(item.key)}:read`, `services-service${capitalized(item.key)}:write`
            ]))}
            onChange={(activeKey: string) => navigate(`/assets/services/${activeKey}`)}
        />
    )
}
