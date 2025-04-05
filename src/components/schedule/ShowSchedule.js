import React from "react";
import { Button, Divider, Typography } from "antd";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";
import { prepareDateToShow } from "../../services/utils";

const { Title, Text } = Typography;

export default function ShowSchedule({ goTo, event }) {
    return (
        <>
            <div>
                <Button
                    type="ghost"
                    style={{ padding: 0, margin: 0 }}
                    size="large"
                    onClick={() => goTo({ page: "list" })}
                >
                    <ArrowLeftOutlined /> Voltar
                </Button>
            </div>
            <div>
                <div>
                    <Title level={5}>{event.title}</Title>
                    <Divider />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text>
                            {prepareDateToShow(event.date).label} - {event.time}
                        </Text>
                        <SyncOutlined
                            style={{ fontSize: 20, color: "#747474" }}
                        />
                    </div>
                    <Divider />
                </div>
                <div>
                    <Title level={5} style={{ marginBottom: 16 }}>
                        Dados do Cliente
                    </Title>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text>Contacto</Text>
                        <Text strong>{event.contacto}</Text>
                    </div>
                    <Divider style={{ margin: "12px 0px" }} />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text>Nome</Text>
                        <Text strong>{event.name}</Text>
                    </div>
                    <Divider style={{ margin: "12px 0px" }} />
                </div>
                <div>
                    <Title level={5}>Notas</Title>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text>{event.notes}</Text>
                    </div>
                </div>
                <div style={{ marginTop: 32, textAlign: "end" }}>
                    <Button
                        onClick={() => goTo({ page: "form", event })}
                        type="primary"
                        style={{ color: "#000000" }}
                        size="large"
                    >
                        Reagendar chamada
                    </Button>
                </div>
            </div>
        </>
    );
}
