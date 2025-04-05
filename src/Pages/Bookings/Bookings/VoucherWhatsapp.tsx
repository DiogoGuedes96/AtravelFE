import moment from "moment";

const templateMessage: string = `Dear [dear_client_name],

We trust this message finds you well. We are pleased to inform you that your request for transport services has been successfully processed. As a result, we are thrilled to confirm the issuance of your transport services voucher.

[company_name]
[company_phone]
[company_email]

*Voucher*

Client's name: [client_name]
Number of people: [pax_group]
Operator: [operator]
[services]`;

const templateService: string = `
-----------
*[start]*
Pick-up time: [hour]
Pick-up: [pickup_location]
Drop-off: [dropoff_location]`;

const getVoucher = ({ bookingVoucher, serviceVouchers }: { bookingVoucher: any, serviceVouchers: any[] }) => {
    let services = serviceVouchers?.map((service: any) => (
        templateService
            .replace('[start]', service?.voucher?.start)
            .replace('[hour]', service?.voucher?.hour ? moment(service?.voucher?.hour, 'H:mm:ss').format('h:mm a') : '')
            .replace('[pickup_location]', service?.voucher?.pickup_location)
            .replace('[dropoff_location]', service?.voucher?.dropoff_location)
    )).join('');

    return templateMessage
        .replace('[dear_client_name]', bookingVoucher?.client_name)
        .replace('[company_name]', bookingVoucher?.company_name)
        .replace('[company_phone]', bookingVoucher?.company_phone)
        .replace('[company_email]', bookingVoucher?.company_email)
        .replace('[client_name]', bookingVoucher?.client_name)
        .replace('[pax_group]', bookingVoucher?.pax_group)
        .replace('[operator]', bookingVoucher?.operator)
        .replace('[services]', services);
}

export {
    getVoucher
}
