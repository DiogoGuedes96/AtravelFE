import { Subject } from 'rxjs';
import { IAlert } from "../Interfaces/Alert.interfaces";

const subject = new Subject();

export const AlertService = {
    sendAlert: (messages: IAlert[]) => {
        let messagesMap = messages.map(message => {
            if (!message.nextPage) message.nextPage = false;

            return { ...message }
        });

        localStorage.setItem('messages', JSON.stringify(
            messagesMap.filter(message => message.nextPage)
                .map(message => {
                    return { ...message, currentPath: window.location.pathname }
                })
        ));

        return subject.next(messagesMap.filter(message => !message.nextPage));
    },
    clearAlert: () => subject.next([]),
    getAlert: () => subject.asObservable(),
};  