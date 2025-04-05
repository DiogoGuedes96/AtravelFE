import React, { useState } from 'react';
import { Drawer } from 'antd';
import ListEventsSchedule from './ListEventsSchedule';
import FormEvent from './FormEvent';
import ShowSchedule from './ShowSchedule';


export default function DrawerSchedule({ open, onclose }) {

    const [pageview, setPageview] = useState(null);
    const [event, setEvent] = useState(null);

    const showComponent = ({page, event}) => {
        setPageview(page);
        setEvent(event);
    }
            
    return (
        <>
            <Drawer
                size='large'
                closable={false}
                open={open}
                onClose={() => { onclose() }}
            >
                { (pageview == 'list' || pageview == null) && <ListEventsSchedule goTo={showComponent} /> }
                { pageview == 'form' && <FormEvent event={event} goTo={showComponent} /> }
                { pageview == 'show' && event != null && <ShowSchedule event={event} goTo={showComponent} /> }
            </Drawer>
        </>
    );
}