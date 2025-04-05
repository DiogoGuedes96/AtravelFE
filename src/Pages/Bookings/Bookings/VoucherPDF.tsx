import { Document, Page, Text, View, Image, Svg, Line, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";

export default function VoucherPDF({ booking, labels }: { booking: any, labels: any }) {
    const styles = StyleSheet.create({
        page: {
            marginTop: 20,
            marginLeft: 20,
            marginRight: 20,
            fontSize: '14pt'
        },
        parentSection: {
            paddingLeft: 5,
            paddingRight: 5,
            color: '#000000a6',
            lineHeight: '1.5pt'
        }
    });

    return (
        <Document title="Voucher">
            <Page size="A4" orientation="portrait" style={styles.page}>
                <View style={{ ...styles.parentSection, marginBottom: 10, marginTop: 10 }}>
                    <Image src={booking?.voucher?.company_imgbase64 || '/atravel.png'} style={{ width: 200, marginBottom: 20 }} />
                    <br /><Text>{booking?.voucher?.company_name}</Text>
                    <br /><Text>{booking?.voucher?.company_phone}</Text>
                    <br /><Text>{booking?.voucher?.company_email}</Text>
                </View>

                <View wrap={false} style={{
                    ...styles.parentSection,
                    marginTop: 5, marginBottom: 25
                }}>
                    <Text style={{ fontWeight: 700, fontSize: '20pt', margin: '10 0', color: '#000000' }}>Voucher</Text>
                    <br /><Text>{labels.client_name}: {booking?.voucher?.client_name}</Text>
                    <br /><Text>{labels.pax_group}: {booking?.voucher?.pax_group}</Text>
                    <br /><Text>{labels.operator}: {booking?.voucher?.operator}</Text>
                </View>

                <View style={{ width: '95%' }}>
                    {booking?.serviceVouchers.map((service: any, index: number) => (<>
                        <Svg key={'svg_'+service.id} height="1" width="550">
                            <Line x1="0" y1="1" x2="550" y2="1" strokeWidth={1} stroke="rgb(0,0,0)" />
                        </Svg>

                        <View key={'service_'+service.id+'_index_'+index} wrap={false} style={{
                            ...styles.parentSection, marginTop: 10, marginBottom: 10
                        }}>
                            <Text style={{ color: '#000000' }}>{service?.voucher?.start}</Text>
                            <br /><Text>{labels.time}: {service?.voucher?.hour ? moment(service?.voucher?.hour, 'H:mm:ss').format('h:mm a') : ''}</Text>
                            <br />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                <Text style={{ flexGrow: 1, flexWrap: 'wrap' }}>{labels.pickup_location}: {service?.voucher?.pickup_location}</Text>
                                <Text style={{ flexGrow: 1, flexWrap: 'wrap', textAlign: 'right' }}>{labels.dropoff_location}: {service?.voucher?.dropoff_location}</Text>
                            </View>
                        </View>
                    </>))}
                </View>
            </Page>
        </Document>
    );
}