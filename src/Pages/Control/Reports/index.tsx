import { Button, Card, Tabs } from 'antd';
import { EnumTypeReports } from '../../../Enums/TypeReports.enums';
import { useNavigate, useParams } from 'react-router-dom';
import ProfilePermissionService from "../../../services/profilePermissions.service";
import { getAll as loadWorkers } from '../../../services/workers.service';
import List from './List';
import { capitalized } from '../../../services/utils';
import DisplayAlert from '../../../components/Commons/Alert';
import Details from './Details';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Charts from './Charts';
import { useQuery } from 'react-query';
import { useEffect } from 'react';

export default function ReportsPage(props: any) {
    const { tab, subTab, id } = useParams();
    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const tabBarStyle = {
        backgroundColor: '#FFF',
        padding: '8px 52px 0px 24px',
        color: '#000',
        marginBottom: 0
    };

    const { data: workers, refetch: refetchWorkersFilter } = useQuery(
        ['loadWorkers'],
        () => loadWorkers({ type: tab || 'operators', status: 'active' }),
        { refetchOnWindowFocus: false }
    );

    const items = Object.keys(EnumTypeReports).map(key => {
        let label = EnumTypeReports[key as keyof typeof EnumTypeReports];

        const workerFilter = `filter_${key == 'staff' ? key : key.substring(0, key.length - 1)}_id`;

        return {
            key,
            label,
            children: (
                <div className="content_page">
                    <DisplayAlert />

                    {id && <Button type="link" size="large" icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(`/control/reports/${tab}`)}
                    >Voltar para lista</Button>}

                    <Card bodyStyle={{ padding: 8 }}>
                        {id ? <Details type={tab || 'operators'} id={id} label={label} />
                            : (key == 'operators'
                                ? <Tabs
                                    tabBarStyle={tabBarStyle}
                                    size="large"
                                    defaultActiveKey={subTab || 'table'}
                                    destroyInactiveTabPane={true}
                                    items={[
                                        {
                                            key: 'table',
                                            label: 'Tabela',
                                            children: <List
                                                type={key}
                                                label={label}
                                                workerFilter={workerFilter}
                                                workers={workers} />
                                        },
                                        {
                                            key: 'graphics',
                                            label: 'Gráficos',
                                            children: <Charts
                                                type={key}
                                                label={label}
                                                workerFilter={workerFilter}
                                                workers={workers} />
                                        }
                                    ]}
                                    onChange={(activeKey: string) => navigate(`/control/reports/${tab || 'operators'}/${activeKey}`)}
                                />
                                : <List
                                    type={key}
                                    label={label}
                                    workerFilter={workerFilter}
                                    workers={workers} />
                            )
                        }
                    </Card>
                </div>
            )
        };
    });

    useEffect(() => {
        if (tab) {
            refetchWorkersFilter();
        }
    }, [tab]);

    return (
        <Tabs
            tabBarStyle={tabBarStyle}
            size="large"
            defaultActiveKey={tab || 'operators'}
            destroyInactiveTabPane={true}
            items={items.filter((item: any) => profilePermissionService.hasPermission([
                `control-reports${capitalized(item.key)}:read`, `control-reports${capitalized(item.key)}:write`
            ]))}
            onChange={(activeKey: string) => navigate(`/control/reports/${activeKey}`)}
        />
    )
}
