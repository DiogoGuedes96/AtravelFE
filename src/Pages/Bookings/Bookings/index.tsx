import ListPage from './List';
import Form from './Form';

export default function BookingsPage(props: any) {
    return (
        <div className="content_page">
            {(!props.action || props.action == 'list') &&
                <ListPage />
            }

            {(props.action && ['create', 'edit'].includes(props.action)) &&
                <Form action={props.action} />
            }
        </div>
    )
}
