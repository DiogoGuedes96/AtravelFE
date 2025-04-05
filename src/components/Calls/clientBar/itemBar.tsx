import { List, Tag, Typography } from "antd";
import { gray } from '@ant-design/colors';
const { Text } = Typography;

export default function ClientItemBar({ field, value, extra, tag } : any) {
    return (
        <>
            { value &&
                <List.Item style={{ padding: '12px 0px' }}>
                    <Text style={{ fontSize: 16, color: gray[5] }}>{field}</Text>
                    <div>
                        { extra && <Text style={{ fontSize: 16, color: gray[4] }}>{extra} | </Text> }
                        { tag ?
                            <Tag color="red">
                                <Text style={{ color:"#CF1322", fontWeight: 400 }}>{value}</Text>
                            </Tag>:
                            <Text style={{ fontSize: 16, fontWeight: 500 }}>{value}</Text>
                        }
                    </div>
                </List.Item>
            }
        </>
    )
}
