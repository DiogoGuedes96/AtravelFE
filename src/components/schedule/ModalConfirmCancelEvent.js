import React from "react";
import { Modal, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ModalConfirmCancelEvent({
    open,
    onOk,
    onCancel,
    loading,
}) {
    return (
        <Modal
            okText="Sim"
            cancelText="Não"
            onOk={() => onOk()}
            onCancel={() => onCancel()}
            confirmLoading={loading}
            open={open}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    margin: "16px 0px",
                }}
            >
                <InfoCircleOutlined
                    style={{ color: "#FAAD14", fontSize: 20 }}
                />
                <Title style={{ margin: 0 }} level={4}>
                    Tem certeza que deseja excluir o evento?
                </Title>
            </div>
            <div>
                <Text>O evento e os alarmes serão removidos.</Text>
            </div>
        </Modal>
    );
}
