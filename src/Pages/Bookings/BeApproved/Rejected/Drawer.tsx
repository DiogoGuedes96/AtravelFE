import { Button, Drawer } from "antd"
import ShowDetails from "../../Operators/ShowDetails"
import { CloseOutlined } from "@ant-design/icons"

export default function DrawerRejected(props: any) {
    const {
        openDetails,
        onCloseDetails,
        details
    } = props

    return (
        <Drawer
            title="Detalhes" 
            placement="right" 
            closeIcon={false} 
            width={450}
            open={openDetails} 
            onClose={onCloseDetails}
            extra={
                <Button type="text" shape="circle" size="middle" icon={<CloseOutlined />
            }
            onClick={onCloseDetails} />}>
            {details && <ShowDetails details={details} lang="pt" />}
        </Drawer>
    )
}