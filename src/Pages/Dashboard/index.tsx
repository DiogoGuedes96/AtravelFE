import React from "react";
import { Card, Col, Divider, Row } from "antd";
import ListPending from "../Bookings/BeApproved/Pending";
import { useQuery } from "react-query";
import { getKpis } from "../../services/dashboard.service";
import Kpi from './Kpi';

export default function Dashboard() {
    const { isLoading, data: kpis } = useQuery(
        ['loadKpis'], () => getKpis(), { refetchOnWindowFocus: false }
    );

    const kpisDivider = (key: string) => (<Divider key={key} type="vertical"
        style={{ height: "4em", marginLeft: "2em", marginRight: "2em" }} />)

    const kpisCard = {
        today: 'Serviços Hoje',
        tomorrow: 'Serviços Amanhã',
        unassigned: 'Por Atribuir'
    };

    const appKpisCard = {
        closed: 'Fechados',
        approved: 'Aceites',
        pending: 'Pendentes'
    };

    return (
        <div
            style={{
                margin: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <Row gutter={20}>
                <Col span={12}>
                    <Card title="Serviços">
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            {Object.entries(kpisCard).map(([attr, title], index: number) => (<>
                                <Kpi key={'s'+index} title={title} value={kpis?.data[attr]} isLoading={isLoading}></Kpi>
                                {index < Object.keys(kpisCard).length -1 && kpisDivider('s_divider'+index)}
                            </>))}
                        </div>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Estado dos Serviços">
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            {Object.entries(appKpisCard).map(([attr, title], index: number) => (<>
                                <Kpi key={'es'+index} title={title} value={kpis?.data[attr]} isLoading={isLoading}></Kpi>
                                {index < Object.keys(kpisCard).length -1 && kpisDivider('es_divider'+index)}
                            </>))}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={20}>
                <Col span={24}>
                    <Card title="Reservas por aprovar">
                        <ListPending hideFilter={true} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
