import { Modal, Spin } from "antd";
import Voucher from "./Voucher";
import { useState } from "react";
import FormVoucher from "./FormVoucher";
import { useQuery } from "react-query";
import { getById } from "../../../services/bookings.service";
import DisplayAlert from "../../../components/Commons/Alert";
import { AlertService } from "../../../services/alert.service";

export default function ModalVoucher({
    bookingId,
    onClose,
    lang
}: {
    bookingId: number,
    onClose: Function,
    lang: 'en' | 'pt'
}) {
    const [booking, setBooking] = useState<any | undefined>();
    const [isEditBooking, setIsEditBooking] = useState<boolean>(false);

    const langs = {
        en: {
            client_name: 'Client\'s name',
            pax_group: 'Number of people',
            operator: 'Operator',
            time: 'Pick-up time',
            pickup_location: 'Pick-up',
            dropoff_location: 'Drop-off'
        },
        pt: {
            client_name: 'Nome do cliente',
            pax_group: 'Pax grupo',
            operator: 'Operador',
            time: 'Hora início',
            pickup_location: 'Pick-up',
            dropoff_location: 'Drop-off'
        }
    };

    const { isLoading, refetch: loadBooking } = useQuery(
        ['loadBooking', bookingId],
        () => bookingId ? getById(bookingId) : null,
        {
            onSuccess: response => {
                if (response) {
                    setBooking({
                        ...response.data,
                        serviceVouchers: response?.relationships?.serviceVouchers
                    });
                }
            },
            refetchOnWindowFocus: false
        }
    );

    return (<>
        <Modal
            open={!!bookingId} maskClosable={!isEditBooking} closeIcon={!isEditBooking} footer={null}
            width={isEditBooking ? 709 : 582}
            style={{ top: 20 }} bodyStyle={{ padding: '12px 8px' }}
            onCancel={() => onClose()}>

            <DisplayAlert />

            <Spin spinning={isLoading}>
                {isEditBooking
                    ? <FormVoucher booking={booking} labels={langs[lang]}
                        onCancelEditVoucher={() => setIsEditBooking(false)}
                        onSaved={() => {
                            AlertService.sendAlert([
                                { text: `O voucher foi editado com sucesso.` }
                            ]);

                            loadBooking();
                            setIsEditBooking(false);
                        }} />
                    : <Voucher booking={booking} labels={langs[lang]}
                        onClickEdit={() => setIsEditBooking(true)} />
                }
            </Spin>
        </Modal>
    </>);
}