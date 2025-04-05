import ListPage from "./List"
import FormPage from "./Form"

export default function VehiclesPage(props: any) {
    const groups = {
        small: 'Pequeno',
        large: 'Grande'
    };

    return (
        <div className="content_page">
            {(!props.action || props.action == 'list') &&
                <ListPage groups={groups} />
            }

            {(props.action && ['create', 'edit'].includes(props.action)) &&
                <FormPage groups={groups} action={props.action} />
            }
        </div>
    )
}
