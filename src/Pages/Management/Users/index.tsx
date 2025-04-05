import { Tabs } from 'antd';
import ListPage from "./List";
import ListProfilePage from "./ListProfile";
import FormPage from "./Form";
import FormProfilePage from "./FormProfile";
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { getAll as getProfiles } from "../../../services/profiles.service";
import ProfilePermissionService from "../../../services/profilePermissions.service";

export default function UsersPage(props: any) {
    const { tab } = useParams();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<any[]>([]);

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { refetch: loadProfiles } = useQuery(
        ['loadProfiles'],
        () => getProfiles(),
        {
            onSuccess: response => setProfiles(response.data),
            refetchOnWindowFocus: false
        }
    );

    const items = [
        {
            key: 'users',
            label: 'Utilizadores',
            children: <div className="content_page">
                {(!props.action || props.action == 'list') &&
                    <ListPage profiles={profiles} />
                }

                {(props.action && ['create', 'edit'].includes(props.action)) &&
                    <FormPage action={props.action} profiles={profiles} />
                }
            </div>
        },
        {
            key: 'profilesAndPrivileges',
            label: 'Perfis e privilégios',
            children: <div className="content_page">
                {(props.action && props.action == 'list') &&
                    <ListProfilePage action={props.action} />
                }

                {(props.action && ['create', 'edit'].includes(props.action)) &&
                    <FormProfilePage action={props.action} />
                }
            </div>
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
            defaultActiveKey={tab || 'users'}
            key={tab || 'users'}
            destroyInactiveTabPane={true}
            items={items.filter((item: any) => profilePermissionService.hasPermission([
                `users-${item.key}:read`, `users-${item.key}:write`
            ]))}
            onChange={(activeKey: string) => {
                navigate(`/management/users/${activeKey}`);

                if (activeKey == 'users') {
                    loadProfiles();
                }
            }}
        />
    )
}
