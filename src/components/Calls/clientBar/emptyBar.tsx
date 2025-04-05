import { Empty } from "antd";

export default function EmptyBar({
    text = "Cliente ainda não registado",
    image = Empty.PRESENTED_IMAGE_SIMPLE,
    style = {margin: 'auto'}
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '100%' }}>
            <Empty
                style={style}
                image={image}
                description={
                    <span>
                        {text}
                    </span>
                }
            />
        </div>
    )
}
