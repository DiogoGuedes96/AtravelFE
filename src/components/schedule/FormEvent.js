import React, { useEffect, useState } from "react";
import {
    AutoComplete,
    Button,
    DatePicker,
    Divider,
    Form,
    Input,
    Select,
    TimePicker,
    Typography,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import moment from "moment";
import ModalConfirmCancelEvent from "./ModalConfirmCancelEvent";
import { useMutation } from "react-query";
import { createBmsReminder, editBmsReminder, getFilteredClients } from "../../services/schedule.service";

const { Title } = Typography;

const getRecurrencyType = (event) => {
    let recurrency = 'never';

    if (event?.recurrency_type) {
        recurrency = event?.recurrency_type;
    }

    return recurrency;
};

const formatTime = "HH:mm";
const currentDate = new Date();
const currentHour = currentDate.getHours();
const currentMinute = currentDate.getMinutes();
const roundedMinute = Math.floor(currentMinute / 10) * 10;
const optionsRepeatTime = [
    {
        value: 0,
        label: "Não avisar",
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

const optionsRepeat = [
    {
        value: 'never',
        label: "Não repetir",
    },
    {
        value: 'daily',
        label: "Diariamente",
    },
    {
        value: 'weekly',
        label: "Semanalmente",
    },
    {
        value: 'monthly',
        label: "Mensalmente",
    },
    {
        value: 'yearly',
        label: "Anualmente",
    },
];

export default function FormEvent({ goTo, event }) {
    const [FormNewEvent] = Form.useForm();
    const [optionsContact, setOptionsContact] = useState([]);
    const [optionsName, setOptionsName] = useState([]);
    const [client, setClient] = useState(null);
    const [contactSearching, setContactSearching] = useState(null);
    const [btnLoading, setbtnLoading] = useState(false);
    const [openModalConfirmCancelEvent, setOpenModalConfirmCancelEvent] =
        useState(false);
    const [initialValues, setInitialValues] = useState({
        rememberFrequency: getRecurrencyType(event),
        rememberTime: 15,
        time: event?.time
            ? dayjs(
                  `${event.time.split(":")[0]}:${event.time.split(":")[1]}`,
                  formatTime
              )
            : dayjs(`${currentHour}:${roundedMinute}`, formatTime),
        date: event?.date ? dayjs(event.date, "YYYY-MM-DD") : dayjs(),
        title: event?.title || "",
        notes: event?.notes || "",
        name: event?.name || "",
        contacto: event?.contacto || "",
    });

    const { isSuccess, mutate: mutateNewEvent, isLoading: isLoadingCreateEvent } = useMutation(
        "createEvent",
        createBmsReminder
    );

    const { mutate: mutateEditEvent, isSuccess: isSuccessEditEvent, isLoading: isLoadingEditEvent } =
        useMutation("mutateEditEvent", editBmsReminder);

    const {
        data: filteredClients,
        isSuccess: isSuccessFilteredClients,
        mutate: mutateFilteredClients,
    } = useMutation(["mutationFilteredClients"], getFilteredClients);

    useEffect(() => {
        if (isSuccess || isSuccessEditEvent) {
            goTo({ page: "list" });
        }
    }, [isSuccess, isSuccessEditEvent]);

    useEffect(() => {
        FormNewEvent.setFieldsValue(initialValues);
    }, [initialValues]);

    useEffect(() => {
        if (isLoadingCreateEvent || isLoadingEditEvent) {
            setbtnLoading(true);
        }

    }, [isLoadingCreateEvent, isLoadingEditEvent]);

    const onFinish = (values) => {
        if (event?.id) return editEvent(values);

        return createNewEvent(values);
    };

    const getEventRecurency = (values) => {
        let weekdays = undefined;
        let monthDay = undefined;
        let yearDay = undefined;
        let rememberTime = undefined;

        const startDate = dayjs(values.date).format("YYYY-MM-DD");
        const time = new Date(values.time);

        if (values.rememberTime) {
            rememberTime = moment(time)
                .subtract(values.rememberTime, "minutes")
                .format("HH:mm");
        }

        if (values.rememberFrequency == 'daily') {
            weekdays = [1, 2, 3, 4, 5, 6, 7];
        }

        if (values.rememberFrequency == 'weekly') {
            weekdays = [moment(startDate).weekday()];
        }

        if (values.rememberFrequency == 'monthly') {
            weekdays = [moment(startDate).weekday()];
            monthDay = moment(startDate).week() - moment(startDate).startOf('month').week() + 1;
        }

        return {
            weekdays,
            monthDay,
            yearDay,
            time,
            rememberTime,
            startDate,
        };
    };

    const objectEvent = (
        values,
        rememberTime = undefined,
        startDate = undefined,
        weekdays = undefined,
        monthDay = undefined,
        yearDay = undefined,
        time = undefined,
        reminderId = undefined,
        parentId = undefined
    ) => {
        return {
            reminder: {
                id: reminderId,
                parent_id: parentId,
                title: values.title,
                description: "Your reminder description",
                client_id: client?.id || undefined,
                client_name: values.name,
                client_phone: values.contacto,
                notes: values.notes,
                date: startDate,
                time: moment(time).format("HH:mm"),
                delay: [values.rememberTime],
                recurrency_type: values.rememberFrequency,
                status: "active",
                recurrency_week_days: weekdays,
                recurrency_week: monthDay,
            },
        };
    };

    const editEvent = (values) => {
        const { weekdays, monthDay, yearDay, time, rememberTime, startDate } =
            getEventRecurency(values);

        let parentId = undefined;

        if (
            event.date !== startDate ||
            event.time !== moment(time).format("HH:mm:ss") ||
            (event.remember_frequency &&
                event.remember_frequency !== values.rememberFrequency)
        ) {
            parentId = event.id;
        }

        mutateEditEvent(
            objectEvent(
                values,
                rememberTime,
                startDate,
                weekdays,
                monthDay,
                yearDay,
                time,
                event.id,
                parentId
            )
        );
    };

    const createNewEvent = (values) => {
        const { weekdays, monthDay, yearDay, time, rememberTime, startDate } =
            getEventRecurency(values);

        mutateNewEvent(
            objectEvent(
                values,
                rememberTime,
                startDate,
                weekdays,
                monthDay,
                yearDay,
                time
            )
        );
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    function disabledDate(current) {
        return current && current < moment().startOf("day");
    }

    const cancelEvent = () => {
        setOpenModalConfirmCancelEvent(false);
    };

    const searchContactValue = (searchText) => {
        setContactSearching({ value: searchText, label: "phone" });
        mutateFilteredClients(searchText);
    };

    useEffect(() => {
        if (isSuccessFilteredClients) {
            let options = [];
            filteredClients.forEach((client) => {
                if (contactSearching.label == "phone") {
                    formatContactValues(options, client);
                }

                if (contactSearching.label == "name") {
                    options.push({ value: client.name });

                    setOptionsName(options);
                }
            });
        }
    }, [isSuccessFilteredClients]);

    const formatContactValues = (options, client) => {
        const phones = [client?.phone_1, client?.phone_2, client?.phone_3];

        let value =
            phones.find((phone) => {
                return phone.includes(contactSearching.value);
            }) ||
            client?.phone_1 ||
            client?.phone_2 ||
            client?.phone_3 ||
            null;

        if (value) {
            const exist = options.find((option) => option.value == value);

            if (!exist) options.push({ value });
        }

        setOptionsContact(options);
    };

    const selectContactValue = (value) => {
        const client = filteredClients.find(
            (client) =>
                client?.phone_1 == value ||
                client?.phone_2 == value ||
                client?.phone_3 == value
        );

        if (client) {
            FormNewEvent.setFieldsValue({ name: client.name });
            setClient(client);
        }
    };

    const searchNameValue = (searchText) => {
        setContactSearching({ value: searchText, label: "name" });
        mutateFilteredClients(searchText);
    };

    const selectNameValue = (value) => {
        const client = filteredClients.find((client) => client.name == value);

        if (client) {
            FormNewEvent.setFieldsValue({
                contacto: client?.phone_1 || client?.phone_2 || client?.phone_3,
            });
            setClient(client);
        }
    };

    return (
        <>
            <div>
                <Button
                    type="ghost"
                    style={{ padding: 0, margin: 0 }}
                    size="large"
                    onClick={() => goTo({ page: "list" })}
                >
                    <ArrowLeftOutlined /> Voltar
                </Button>
            </div>
            <Form
                form={FormNewEvent}
                layout="vertical"
                initialValues={initialValues}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Title level={5}>
                    <span style={{ color: "#FF4D4FE0" }}>*</span> Adicionar
                    título para evento
                </Title>
                <Form.Item
                    name="title"
                    rules={[
                        {
                            required: true,
                            message: "Por favor, informe o título do evento!",
                        },
                    ]}
                >
                    <Input
                        placeholder="Ex: Ligar para João Neves"
                        maxLength="255"
                        showCount
                    />
                </Form.Item>
                <Divider />
                <Title level={5}>
                    <span style={{ color: "#FF4D4FE0" }}>*</span> Adicionar
                    dados necessários
                </Title>
                <Form.Item
                    name="contacto"
                    rules={[
                        {
                            required: true,
                            message:
                                "Por favor, informe o contacto do cliente!",
                        },
                    ]}
                >
                    <AutoComplete
                        options={optionsContact}
                        onSelect={selectContactValue}
                        onSearch={(text) => searchContactValue(text)}
                        placeholder="Contacto"
                    />
                </Form.Item>
                <Form.Item
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: "Por favor, informe o nome do cliente!",
                        },
                    ]}
                >
                    <AutoComplete
                        options={optionsName}
                        onSelect={selectNameValue}
                        onSearch={(text) => searchNameValue(text)}
                        placeholder="Nome"
                    />
                </Form.Item>
                <Divider />
                <Title level={5}>
                    <span style={{ color: "#FF4D4FE0" }}>*</span> Adicionar Data
                    e Hora do evento
                </Title>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                    }}
                >
                    <Form.Item
                        style={{ width: "100%" }}
                        name="date"
                        rules={[
                            {
                                required: true,
                                message: "Por favor, informe a data do evento!",
                            },
                        ]}
                    >
                        <DatePicker
                            disabledDate={disabledDate}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Form.Item
                        style={{ width: "100%" }}
                        name="time"
                        rules={[
                            {
                                required: true,
                                message: "Por favor, informe a hora do evento!",
                            },
                        ]}
                    >
                        <TimePicker
                            style={{ width: "100%" }}
                            format={formatTime}
                        />
                    </Form.Item>
                </div>
                <Title level={5}>Avisar-me</Title>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                    }}
                >
                    <Form.Item name="rememberTime" style={{ width: "100%" }}>
                        <Select options={optionsRepeatTime} />
                    </Form.Item>
                    <Form.Item
                        name="rememberFrequency"
                        style={{ width: "100%" }}
                    >
                        <Select options={optionsRepeat} />
                    </Form.Item>
                </div>
                <Divider />
                <Title level={5}>Notas</Title>
                <Form.Item name="notes">
                    <Input.TextArea
                        rows={4}
                        placeholder="Adicionar uma nota..."
                        maxLength="1024"
                        showCount
                    />
                </Form.Item>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                    }}
                >
                    {/* <Button
                        size="large"
                        style={{ width: "100%" }}
                        loading={btnLoading}
                        onClick={() => setOpenModalConfirmCancelEvent(true)}
                    >
                        Descartar
                    </Button> */}
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={btnLoading}
                        style={{ width: "100%", color: "#000000" }}
                    >
                        Guardar
                    </Button>
                </div>
            </Form>
            <ModalConfirmCancelEvent
                open={openModalConfirmCancelEvent}
                onOk={cancelEvent}
                onCancel={() => setOpenModalConfirmCancelEvent(false)}
            />
        </>
    );
}
