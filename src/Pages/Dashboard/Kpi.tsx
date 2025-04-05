import { Spin, Tag, Typography } from "antd";

const { Text } = Typography;

interface IKpiProps {
    title: string,
    tagText?: string,
    value: number | string,
    isLoading?: boolean
}

export default function Dashboard({
    title,
    tagText,
    value = 0,
    isLoading = false
}: IKpiProps) {
    const style = {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: "-16px",
        gap: 8,
    };

    return (
        <div style={{ textAlign: "center" }}>
            <Text style={{ fontSize: "12px", color: "#00000073" }}>
                {title} {tagText && <Tag color="#cd201f" style={{ marginLeft: "1em" }}>{tagText}</Tag>}
            </Text>

            <div style={style}>
                <Spin spinning={isLoading} size="small">
                    <h2>{value || 0}</h2>
                </Spin>
            </div>
        </div>
    );
}
