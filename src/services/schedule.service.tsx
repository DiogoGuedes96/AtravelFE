import { del, post, put, get } from "./api.service";

const createBmsReminder = (data: any) => {
    return post("schedule/v2/event/reminder/create", data);
};

const getFilteredClients = (value: any) => {
    return post("/api/clients/filter", { searchInput: value });
};

const getEventsByDates = ({ days }: any) => {
    return post("schedule/v2/event/listByDates", { dates: days });
};

const deleteEvent = ({ id, type }: any) => {
    return del(`schedule/v2/event/reminder/delete/${id}/${type}`);
};

const editBmsReminder = (data: any) => {
    return put("schedule/v2/event/reminder/edit", data);
};

const listCurrentMinute = (data: any) => {
    return get("schedule/v2/event/remember/listCurrentMinute", data);
};

const addRemenberDelay = (data: any) => {
    return post("schedule/v2/event/remember/delay", data);
};

const setDoneRemember = ({ event_id }: any) => {
    return put(`schedule/v2/event/remember/done/${event_id}`);
};

const formatEventToShowFromList = (event: any) => {
    return event.map((item: any) => {
        return {
            title: item.reminder.title,
            date: item.date,
            time: item.time,
            name: item.reminder.client_name,
            contacto: item.reminder.client_phone,
            notes: item.reminder.notes,
            id: item.id,
            key: item.id,
            recurrency_type: item.reminder.recurrency_type
        };
    });
};

export {
    createBmsReminder,
    getFilteredClients,
    getEventsByDates,
    deleteEvent,
    editBmsReminder,
    listCurrentMinute,
    addRemenberDelay,
    setDoneRemember,
    formatEventToShowFromList
};
