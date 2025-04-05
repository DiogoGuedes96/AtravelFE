import { Document, Page, View, Image, StyleSheet } from "@react-pdf/renderer";

export default function ChartPDF({
    title,
    chartBase64Encode
}: {
    title: string,
    chartBase64Encode: string
}) {
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
            lineHeight: '1.5pt',
            marginBottom: 10,
            marginTop: 10
        }
    });

    return (
        <Document title={title}>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <View style={styles.parentSection}>
                    <Image src={chartBase64Encode} style={{ width: '90%' }} />
                </View>
            </Page>
        </Document>
    );
}