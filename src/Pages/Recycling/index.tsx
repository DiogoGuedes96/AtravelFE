import ListPage from './List';
import Form from './Form';

export default function RecyclingPage(props: any) {
    return (
        <div className="content_page">
            {(!props.action || props.action == 'list') &&
                <ListPage />
            }

            {(props.action && props.action == 'restore') &&
                <Form action={props.action} />
            }
        </div>
    )
}
