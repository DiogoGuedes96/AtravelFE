import { Tabs } from 'antd';
import { EnumTypeTables } from '../../../Enums/TypeTables.enums';
import List from './List';
import Form from './Form';
import { useNavigate, useParams } from 'react-router-dom';
import ProfilePermissionService from "../../../services/profilePermissions.service";

export default function TablesPage(props: any) {
    const { tab } = useParams();
    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const items = Object.keys(EnumTypeTables).map(key => {
        let label = EnumTypeTables[key as keyof typeof EnumTypeTables];

        return {
            key,
            label,
            children: <div className="content_page">
                {(!props.action || props.action == 'list') &&
                    <List type={key} label={label} />
                }

                {(props.action && ['create', 'edit', 'duplicate'].includes(props.action)) &&
                    <Form type={key} label={label} action={props.action} />
                }
            </div>
        };
    });

    return (
        <Tabs
            tabBarStyle={{
                backgroundColor: '#FFF',
                padding: '8px 52px 0px 24px',
                color: '#000',
                marginBottom: 0
            }}
            size="large"
            defaultActiveKey={tab || 'operators'}
            destroyInactiveTabPane={true}
            items={items.filter((item: any) => profilePermissionService.hasPermission([
                `tables-${item.key}:read`, `tables-${item.key}:write`
            ]))}
            onChange={(activeKey: string) => navigate(`/assets/tables/${activeKey}`)}
        />
    )
}
