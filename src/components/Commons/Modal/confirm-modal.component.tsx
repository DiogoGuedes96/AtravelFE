import { ExclamationCircleFilled } from "@ant-design/icons";
import { Modal } from "antd";
import { ReactNode } from "react";

interface PropsModal {
    title: string
    open: boolean
    okText: string
    content?: string | undefined
    cancelText?: string
    icon?: ReactNode
    iconCancelButton?: ReactNode
    zIndex?: number
    onOk?: () => void
    onCancel?: (event: any) => void
}

export default function ConfirmModal({
    title,
    open,
    okText,
    cancelText,
    content,
    icon = <ExclamationCircleFilled style={{ color: '#faad14', marginRight: 10, fontSize: 18 }} />,
    iconCancelButton = '',
    zIndex = 1000,
    onOk,
    onCancel
}: PropsModal) {
    return (
        <Modal
            open={open}
            title={<>
                <p style={{ display: 'flex', alignItems: 'start' }}>
                    {icon}
                    <span style={{ marginTop: -5 }}>{title}</span>
                </p>
            </>}
            zIndex={zIndex}
            okText={okText}
            okButtonProps={{ size: 'large' }}
            okType='primary'
            onOk={onOk} onCancel={onCancel}
            cancelText={cancelText}
            cancelButtonProps={{
                size: 'large', icon: iconCancelButton ? iconCancelButton : null
            }}
        >
            {!!content && <p style={{ marginLeft: 31 }}>{content}</p>}
        </Modal>
    )
}