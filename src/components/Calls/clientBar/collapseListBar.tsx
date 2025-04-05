import { Collapse, List, Row, Typography } from "antd";
import EmptyBar from "./emptyBar";
const { Text } = Typography;

export default function CollapseListBar({ items }: any) {

    const parseSumTotalValues = (item: any) => {
        const sumTotalValue = item.fa.reduce((sum: any, item: any) => sum + parseFloat(item?.total_value), 0)
            .toLocaleString('pt-PT',
                {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 2
                })
        if (isNaN(sumTotalValue) || sumTotalValue === null || sumTotalValue === undefined) {
            return ''
        }
        return sumTotalValue;
    }

    const parseTotalValue = (item: any) =>{
        const totalValue: any = parseFloat(item?.total_value).toLocaleString('pt-PT',
                {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 2
                })

        if (isNaN(totalValue) || totalValue === null || totalValue === undefined) {
            return 'N/a'
        }
        return totalValue;
    }

    return (
        <Collapse ghost>
            {items.map(
                (item: any, index: any) => <Collapse.Panel
                    className="collapse-list-bar-custom"
                    key={index}
                    header={
                        <Row style={{ display: 'flex', justifyContent: 'space-between'}}>
                            <Text style={{fontSize: 16}}>{item.months > 1 ?
                                `Mais de ${item.months} meses` :
                                `Mais de ${item.months} mês`}</Text>
                            <Text style={{fontSize: 16, fontWeight: 500}}>{
                                item.fa.length > 0 ?
                                parseSumTotalValues(item)
                                    : null
                            }</Text>
                        </Row>
                    }>
                    {item.fa.length > 0 ?
                        <List
                            dataSource={item.fa}
                            renderItem={(item: any, index) => {
                                return (<List.Item key={index} style={{ backgroundColor: '#FAFAFA' }}>
                                    <Text>{item.delivery_date}</Text>
                                    <Text>{parseTotalValue(item)}</Text>
                                </List.Item>)
                            }}
                            />
                        :
                        <div style={{ backgroundColor: '#FAFAFA', padding: '24px', borderRadius: '8px' }}>
                            <EmptyBar
                                text="Sem faturas registadas para o período"
                            />
                        </div>
                    }
                </Collapse.Panel>
            )}
        </Collapse >
    )
}
