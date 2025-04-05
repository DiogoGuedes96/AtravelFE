import { Document, Page, Text, View, Image, Svg, Line, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";

export default function ExportServicesPDF({
    services,
    filters
}: {
    services: any[],
    filters?: {
        start_date?: string,
        end_date?: string
    }
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

    return (
        <Document title="Lista de serviços">
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View fixed style={{
                    ...styles.parentSection, flexDirection: 'row', fontSize: '12pt',
                    marginBottom: 10, marginTop: 10
                }}>
                    <Image src="/atravel.png" style={{ width: 100, marginRight: 20 }} />
                    <Text style={{ fontWeight: 'bold', marginTop: 10, marginRight: 10 }}>Lista de serviços</Text>
                    <Text style={{ marginTop: 12, marginRight: 10, fontSize: '10pt' }}>
                        {filters?.start_date
                            ? moment(filters.start_date, 'YYYY-MM-DD').format('DD/MM/YYYY')
                            : 'dd/mm/aaaa'} - {filters?.end_date
                            ? moment(filters.end_date, 'YYYY-MM-DD').format('DD/MM/YYYY')
                            : 'dd/mm/aaaa'}
                    </Text>
                    <Text style={{ marginTop: 12, marginRight: 40, marginLeft: 'auto', fontSize: '10pt' }} render={({ pageNumber, totalPages }) => (
                        `${String(pageNumber).padStart(2, '0')} de ${String(totalPages).padStart(2, '0')} página${totalPages > 1 ? 's' : ''}`
                    )} />
                </View>

                <View style={{ width: '95%' }}>
                    {services.map((service: any, index: number) => (<>
                        <View key={'service_'+service.id+'_index_'+index} wrap={false} style={{
                            ...styles.parentSection,
                            flexDirection: 'row', flexWrap: 'wrap',
                            marginTop: 5, marginBottom: 5
                        }}>
                            {Object.keys(service).map((column: string, index2: number) => (
                                <View key={`service_${service.id}_index_${index}_column_${index2}`} style={styles.section}>
                                    <Text style={{ fontWeight: 700 }}>{column}</Text>
                                    <br /><Text style={{ flexWrap: 'wrap' }}>{service[column]}</Text>
                                </View>
                            ))}
                        </View>

                        <Svg key={'svg_'+service.id} height="2" width="800">
                            <Line x1="0" y1="2" x2="800" y2="2" strokeWidth={2} stroke="rgb(0,0,0)" />
                        </Svg>
                    </>))}
                </View>
            </Page>
        </Document>
    );
}