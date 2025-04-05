import React, { useState, useEffect } from "react";
import { Button, Form, Modal, Pagination, Select, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useMutation } from "react-query";
import { addRemenberDelay, setDoneRemember } from "../../services/schedule.service";

const { Title, Text } = Typography;

const optionsRepeatTime = [
    {
        value: 0,
        label: "Adiar por",
    },
    {
        value: 5,
        label: "5 minutos antes",
    },
    {
        value: 15,
        label: "15 minutos antes",
    },
    {
        value: 30,
        label: "30 minutos antes",
    },
];

const rememberLabel = [
    {
        value: 5,
        label: " em 5 minutos",
    },
    {
        value: 15,
        label: " em 15 minutos",
    },
    {
        value: 30,
        label: " em 30 minutos",
    },
];

export default function ModalAlertEvent({ open, event, close }) {
    const [current, setCurrent] = useState(1);
    const [events, setEvents] = useState([]);
    const [selected, setSelected] = useState(0);
    const [FormReschedule] = Form.useForm();
    const [initialValues, setInitialValues] = useState({ rememberTime: 0 });

    useEffect(() => {
        if (event) {
            setEvents(event);
        }
    }, [event]);

    const { mutate: mutateReminderDelay, isSuccess: isSuccessDelay } =
        useMutation("addReminderDelay", addRemenberDelay);

    const { mutate: mutationDone, isSuccess: isSuccessDone } = useMutation(
        "addReminderDelay",
        setDoneRemember
    );

    useEffect(() => {
        if (isSuccessDelay) {
            // message.info(
            //     `O alerta foi silenciado e retornará${getRememberTimeLabel(
            //         FormReschedule.getFieldsValue().rememberTime
            //     )}`
            // );

            if (events.length === 1) {
                close();
            } else {
                const oldSelected = selected;
                const next = oldSelected - 1 < 0 ? 0 : oldSelected - 1;

                setCurrent(next + 1);
                setSelected(next);
                events.splice(oldSelected, 1);
            }
        }
    }, [isSuccessDelay]);

    useEffect(() => {
        if (isSuccessDone) {
            if (events.length === 1) {
                close();
            } else {
                const oldSelected = selected;
                const next = oldSelected - 1 < 0 ? 0 : oldSelected - 1;

                setCurrent(next + 1);
                setSelected(next);
                events.splice(oldSelected, 1);
            }
        }
    }, [isSuccessDone]);

    const onChange = (page) => {
        if (page < 1) {
            page  = 1;
        }

        if (events[(page-1)] === undefined) {
            return;
        }

        setCurrent(page);
        setSelected(page - 1);
    };

    const onFinish = (values) => {
        if (values.rememberTime === 0) {
            // message.error("É necessario informar o tempo.");
            return;
        }

        const data = {
            event_id: events[selected]?.id,
            delay: values.rememberTime,
        };

        mutateReminderDelay(data);
    };

    const getOptionsRepeatTime = (value) => {
        return optionsRepeatTime.find((item) => item.value === value)?.label;
    };

    const getRememberTimeLabel = (value) => {
        console.log(value);

        if (value == 0 || value == undefined || value == null) {
            return 0;
        }

        return value !== null && JSON.parse(value).length > 0
            ? rememberLabel.find((item) => item.value === JSON.parse(value)[0])?.label
            : 0;
    };

    return (
        <>
            {open && events.length && (
                <Modal open={open} footer={null} closable={false}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            margin: "16px 0px",
                        }}
                    >
                        <InfoCircleOutlined
                            style={{ color: "#FAAD14", fontSize: 20 }}
                        />
                        <Title style={{ margin: 0 }} level={4}>
                            Atenção
                        </Title>
                    </div>
                    <Form
                        form={FormReschedule}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={initialValues}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 24,
                            }}
                        >
                            <Text>
                                {events[selected]?.schedule_event?.reminder?.title}
                                {getRememberTimeLabel(
                                    events[selected]?.schedule_event?.reminder?.delay
                                )}
                            </Text>
                            <Form.Item name="rememberTime">
                                <Select
                                    size="large"
                                    options={optionsRepeatTime}
                                />
                            </Form.Item>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-evenly",
                                gap: 16,
                            }}
                        >
                            <Button
                                size="large"
                                onClick={() => {
                                    // message.success("Evento descartado");
                                    const data = {
                                        event_id: events[selected]?.id,
                                    };

                                    mutationDone(data);
                                }}
                                block={true}
                            >
                                Descartar
                            </Button>
                            <Button
                                size="large"
                                type="primary"
                                htmlType="submit"
                                block={true}
                            >
                                Reagendar
                            </Button>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "end",
                                marginTop: 24,
                            }}
                        >
                            <Pagination
                                defaultCurrent={1}
                                pageSize={1}
                                onChange={onChange}
                                total={events.length}
                                size="small"
                            />
                        </div>
                    </Form>
                </Modal>
            )}
        </>
    );
}
