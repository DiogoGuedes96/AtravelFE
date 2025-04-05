import { Document, Page, Text, View, Image, Svg, Line, StyleSheet } from "@react-pdf/renderer";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";

export default function TimetablePDF({
    date,
    conductor,
    services
}: {
    date: Dayjs,
    conductor: any,
    services: any[]
}) {
    const styles = StyleSheet.create({
        page: {
            marginTop: 20,
            marginLeft: 20,
            marginRight: 20
        },
        parentSection: {
            paddingLeft: 5,
            paddingRight: 5
        },
        section: {
            paddingLeft: 1,
            paddingRight: 1,
            margin: 5,
            fontSize: '10pt',
            flexGrow: 1
        }
    });

    const columns = [
        { field: 'hour', label: 'Hora', width: 20 },
        { field: 'number_adults', label: 'Adultos', width: 20 },
        { field: 'number_children', label: 'Crianças', width: 20 },
        { field: 'booster', label: 'Booster', width: 20 },
        { field: 'notes', label: 'Observações' },
        { field: 'pickup_location', label: 'Local Pick-up' },
        { field: 'pickup_address', label: 'Morada Pick-up' },
        { field: 'pickup_zone', label: 'Zona' },
        { field: 'dropoff_location', label: 'Local Drop-off' },
        { field: 'dropoff_address', label: 'Morada drop-off' },
        { field: 'dropoff_zone', label: 'Zona' }
    ];

    const handleFields = (key: string, value: any) => {
        switch (key) {
            case 'hour': return moment(value, 'HH:mm:ss').format('HH:mm'); break;
            case 'number_adults': case 'number_children': case 'booster': return value || 0; break;
            default: return value != null ? value : '';
        }
    };

    return (
        <Document title="Escala de serviços">
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View fixed style={{
                    ...styles.parentSection, flexDirection: 'row', fontSize: '12pt',
                    marginBottom: 10, marginTop: 10
                }}>
                    <Image src="/atravel.png" style={{ width: 100, marginRight: 20 }} />
                    <Text style={{ fontWeight: 'bold', marginTop: 10, marginRight: 10 }}>Escala de serviços</Text>
                    <Text style={{ marginTop: 12, marginRight: 10, fontSize: '10pt' }}>
                        {conductor?.data?.name} - {date.format('DD/MM/YYYY')}
                    </Text>
                    <Text style={{ marginTop: 12, marginRight: 40, marginLeft: 'auto', fontSize: '10pt' }} render={({ pageNumber, totalPages }) => (
                        `${String(pageNumber).padStart(2, '0')} de ${String(totalPages).padStart(2, '0')} página${totalPages > 1 ? 's' : ''}`
                    )} />
                </View>

                <View style={{ width: '95%' }}>
                    {services.map((service: any, index: number) => (<>
                        <View key={'service_' + service.id + '_index_' + index} wrap={false} style={{
                            ...styles.parentSection,
                            flexDirection: 'row', flexWrap: 'wrap',
                            marginTop: 5, marginBottom: 5
                        }}>
                            {columns.map((column: { field: string, label: string, width?: number }) => (
                                <View style={{ ...styles.section, width: column.width || 50 }}>
                                    <Text style={{ fontWeight: 700 }}>{column.label}</Text>
                                    <br /><Text style={{ flexWrap: 'wrap' }}>
                                        {handleFields(column.field, service[column.field])}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <Svg key={'svg_' + service.id} height="2" width="800">
                            <Line x1="0" y1="2" x2="800" y2="2" strokeWidth={2} stroke="rgb(0,0,0)" />
                        </Svg>
                    </>))}
                </View>
            </Page>
        </Document>
    );
}