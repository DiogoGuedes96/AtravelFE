import { Collapse, Timeline, Typography } from "antd";
import moment from "moment";
import { MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { formatCurrency } from "../../../services/utils";
import { EnumCharges } from "../../../Enums/Charges.enums";

const { Text } = Typography;

export default function ShowHistoric({ historic }: { historic: any[] }) {
    const events = {
        created: {
            title: 'Criação Serviço',
            color: '#107b99'
        },
        updated: {
            title: 'Edição Serviço',
            color: '#d48806'
        }
    };

    const collapseIconStyle = {
        color: '#000000'
    };

    const excludeFields = [
        'parent_id', 'pickup_location_id', 'pickup_zone_id', 'dropoff_location_id', 'dropoff_zone_id',
        'vehicle_id', 'service_type_id', 'staff_id', 'supplier_id', 'service_state_id', 'emphasis'
    ];

    const carTypes = {
        small: 'Carro pequeno',
        large: 'Carro grande'
    }

    const charges = EnumCharges;

    const labelFields = {
        start: 'Data',
        hour: 'Hora',
        number_adults: 'Adultos',
        number_children: 'Crianças',
        number_baby_chair: 'Cadeira de bebê',
        booster: 'Booster',
        service_type: 'Tipo de serviço',
        flight_number: 'Vôo',
        staff: 'Staff',
        supplier: 'Fornecedor',
        vehicle_text: 'Viatura',
        car_type: 'Tipo de carro',
        service_state: 'Estado',
        pickup_location: 'Local Pick-up',
        pickup_zone: 'Zona Pick-up',
        pickup_address: 'Morada Pick-up',
        pickup_reference_point: 'Ponto de referência Pick-up',
        dropoff_location: 'Local Drop-off',
        dropoff_zone: 'Zona Drop-off',
        dropoff_address: 'Morada Drop-off',
        dropoff_reference_point: 'Ponto de referência Drop-off',
        value: 'Val. Reserva',
        charge: 'Cobrança',
        commission: 'Comissão',
        notes: 'Obs. Gerais',
        internal_notes: 'Obs. Internas',
        driver_notes: 'Obs. Motorista'
    };

    const handleFields = (key: string, value: any) => {
        switch (key) {
            case 'start': return moment(value, 'YYYY-MM-DD').format('DD/MM/YYYY');
            case 'hour': return moment(value, 'HH:mm:ss').format('HH:mm');
            case 'car_type': return value ? carTypes[value as keyof typeof carTypes] : '';
            case 'value': return value ? formatCurrency(value) : 0;
            case 'charge': return value ? charges[value as keyof typeof charges] : '';
            case 'commission': return value ? formatCurrency(value) : 0;
            default: return value != null ? value : '';
        }
    };

    return (
        <Timeline mode="left" className="historic-timeline"
            items={historic.map((item: any) => {
                return {
                    label: (<Text style={{ color: '#000000A6' }}>{moment(item.created_at, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm')}</Text>),
                    children: (<>
                        <Text strong style={{ color: events[item.event as keyof typeof events].color }}>{events[item.event as keyof typeof events].title}</Text>
                        <br /><Text>Por</Text> <Text strong>{item?.user?.name}</Text>
                        <br />
                        <Collapse defaultActiveKey={['return']} ghost style={{ marginLeft: -16 }}
                            expandIcon={({ isActive }) => (<>
                                {isActive
                                    ? <MinusSquareOutlined style={collapseIconStyle} />
                                    : <PlusSquareOutlined style={collapseIconStyle} />
                                }
                            </>)}
                            items={[
                                {
                                    key: 'expand', label: '',
                                    children: <div style={{ display: 'flex', flexFlow: 'column wrap' }}>
                                        {Object.entries(item.new_values).filter(([key, value]) => {
                                            return !excludeFields.includes(key);
                                        })
                                        .map(([key, value]) => {
                                            return (<>
                                                <Text key={key} style={{ color: '#000000A7', flex: 1, marginTop: 5 }}>
                                                    - {
                                                        `${labelFields[key as keyof typeof labelFields]}: ${handleFields(key, value)}`
                                                    }
                                                </Text>
                                            </>);
                                        })}
                                    </div>
                                }
                            ]} />
                    </>)
                };
            })} />
    );
}