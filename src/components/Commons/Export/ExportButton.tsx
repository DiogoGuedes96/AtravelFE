import { DownOutlined, ExportOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";

interface PropsExportBtn {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    isDropdown?: boolean;
    items?: any[];
}

export default function ExportBtn({
    onClick,
    disabled = false,
    loading = false,
    isDropdown,
    items
}: PropsExportBtn) {
    return (
        <>{isDropdown
            ? <Dropdown menu={{ items }} placement='bottomRight'>
                <Button
                    type="link"
                    className="show_result_size"
                    style={{ paddingRight: 24, marginBottom: 18 }}
                    disabled={disabled}
                    loading={loading}>
                        Exportar <DownOutlined /></Button>
            </Dropdown>
            : <Button
                type="link"
                className="show_result_size"
                style={{ paddingRight: 24 }}
                onClick={onClick}
                disabled={disabled}
                loading={loading}>
                <ExportOutlined /> Exportar</Button>
        }</>
    )
}