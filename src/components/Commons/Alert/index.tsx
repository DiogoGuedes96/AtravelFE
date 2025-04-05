import { Alert, Button } from "antd";
import { useState } from "react";
import { AlertService } from "../../../services/alert.service";
import { IAlert } from "../../../Interfaces/Alert.interfaces";
import { useNavigate } from "react-router";

export default function DisplayAlert() {
    const [messages, setMessages] = useState<IAlert[]>([]);

    const navigate = useNavigate();

    let storageMessages = JSON.parse(localStorage.getItem('messages') || '[]')
        .filter((message: IAlert) => message.currentPath !== window.location.pathname)
        .map((message: IAlert) => {
            message.nextPage = false;

            return message;
        });

    if (storageMessages.length) {
        setMessages(storageMessages);
        localStorage.removeItem('messages');
    }

    AlertService.getAlert().subscribe((_messages: any) => setMessages(_messages as IAlert[]));

    const onCloseAlert = () => {
        setMessages([]);
        AlertService.clearAlert();
    }

    return (
        <>
            {
                messages.map((message: IAlert, index: number) =>
                    <Alert
                        key={index}
                        message={message.text}
                        type={message?.type || 'success'}
                        description={message?.description || ''}
                        className="alertMessage"
                        showIcon
                        closable
                        onClose={onCloseAlert}
                        action={message?.action
                            ? <Button size='small'
                                onClick={() => navigate(String(message?.action?.toPage))}>
                                {message?.action?.text}
                            </Button> 
                            : null}
                    />
                )
            }
        </>
    )
}