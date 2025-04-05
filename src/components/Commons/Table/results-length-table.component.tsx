import { Typography } from "antd";
import { ReactNode } from "react";

const { Text } = Typography;

interface PropsShowDataLength {
    size: number,
    className?: string,
    children?: ReactNode,
    text?: string
}

export default function ShowDataLength({ size, className, children, text }: PropsShowDataLength) {
    return (
        <Text className={className} strong>{text || 'Resultados'}: {size}</Text>
    )
}