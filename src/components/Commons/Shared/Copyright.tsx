import React from 'react';
import { Typography } from "antd";

const { Text } = Typography;

export default function Copyright() {
    return (
        <Text type="secondary" style={{ display: "flex", justifyContent: "center" }}>
            © Copyrights, {new Date().getFullYear()} Todos os direitos reservados
        </Text>
    );
}