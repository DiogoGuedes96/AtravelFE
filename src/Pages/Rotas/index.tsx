import { Tabs } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

import "../../assets/css/zones.css";
import Routes from "./route";
import Zones from "./zone";
import Locations from "./Locations";
import FormLocation from "./FormLocations";
import { all as getZones } from '../../services/zones.service';
import ProfilePermissionService from "../../services/profilePermissions.service";

export default function RoutesAndZonesPage(props: any) {
    const { tab } = useParams();
    const navigate = useNavigate();
    const [zones, setZones] = useState<{ id: number, name: string }[]>([]);

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { refetch: loadZones } = useQuery(
        ['loadZones'],
        () => getZones(),
        {
            onSuccess: response => setZones(response.data),
            refetchOnWindowFocus: false,
            enabled: false
        }
    );

    const onFilterZones = (
        input: string, option?: { key: string, value: number, children: [] }
    ) => (
        typeof option?.children == 'string'
            ? option?.children
            : option?.children.join('') ?? ''
        ).toLowerCase().includes(input.toLowerCase());

    const items = [
        {
            key: 'zones',
            label: 'Zonas',
            children: <div className="content_page"><Zones /></div>,
        },
        {
            key: 'routes',
            label: 'Rotas',
            children: <div className="content_page"><Routes zones={zones} /></div>
        },
        {
            key: 'locations',
            label: 'Locais',
            children: <div className="content_page">
                {(!props.action || props.action == 'list') &&
                    <Locations zones={zones} onFilterZones={onFilterZones} />
                }

                {(props.action && ['create', 'edit'].includes(props.action)) &&
                    <FormLocation zones={zones} onFilterZones={onFilterZones} action={props.action} />
                }
            </div>
        }
    ];

    useEffect(() => {
        if (tab != 'zones' && !zones.length) {
            loadZones();
        }
    }, []);

    return (
        <Tabs
            tabBarStyle={{
                backgroundColor: '#FFF',
                padding: '8px 52px 0px 24px',
                color: '#000',
                marginBottom: 0
            }}
            size="large"
            defaultActiveKey={tab || 'zones'}
            destroyInactiveTabPane={true}
            items={items.filter((item: any) => profilePermissionService.hasPermission([
                `routes-${item.key}:read`, `routes-${item.key}:write`
            ]))}
            onChange={(activeKey: string) => {
                navigate(`/routes/${activeKey}`);

                if (activeKey != 'zones' && !zones.length) {
                    loadZones();
                }
            }}
        />
    )
}