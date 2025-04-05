import { Col, Divider, Form, Input, Modal, Row, Typography } from "antd"
import ShowDetails from "../../Operators/ShowDetails"

const { Text } = Typography

export default function ModalPending(props: any) {
    const {
        cancelBooking, 
        approveBooking,
        onSubmitCancelBooking,
        onSubmitApproveBooking,
        setCancelBooking,
        setApproveBooking,
        formCancelBooking
    } = props

    return (
        <Modal
            open={!!cancelBooking || !!approveBooking} 
            maskClosable={false} 
            closeIcon={false} 
            width={386} 
            style={{ top: 20 }}
            okText={cancelBooking ? "Rejeitar" : "Continuar"} 
            cancelText="Voltar"
            okButtonProps={{ size: 'large' }} 
            cancelButtonProps={{ size: 'large' }}
            onOk={cancelBooking ? onSubmitCancelBooking : onSubmitApproveBooking}
            onCancel={() => { cancelBooking ? setCancelBooking(undefined) : setApproveBooking(undefined)}}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ marginTop: 5 }}>
                    {cancelBooking ? "Rejeitar reserva" : "Aprovar reserva"}
                </Text>
            </div>
            <Divider></Divider>
            <ShowDetails details={cancelBooking || approveBooking} lang="pt" />
            
            {cancelBooking 
            && <Form 
                form={formCancelBooking} 
                name="form_booking" 
                layout="vertical" 
                style={{ marginTop: 5 }}>
                <Row>
                    <Col span={24}>
                        <Form.Item 
                            label="Justificativa" 
                            name="status_reason"
                            rules={[{
                                required: true, 
                                message: 'Required field.'
                            }]}>
                            <Input.TextArea 
                                size="large" 
                                placeholder="Explique o motivo da rejeição."
                                showCount maxLength={255} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>}
        </Modal>
    )
}