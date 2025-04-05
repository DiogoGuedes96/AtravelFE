import { Tabs } from 'antd';
import List from './List';
import Form from './Form';
import { useNavigate, useParams } from 'react-router-dom';
import ProfilePermissionService from "../../../services/profilePermissions.service";

export default function ClientsPage(props: any) {
    const { tab } = useParams();
    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    return (
        <div className="content_page">
            {(!props.action || props.action == 'list') &&
                <List />
            }

            {(props.action && ['create', 'edit'].includes(props.action)) &&
                <Form action={props.action} />
            }
        </div>
    );
}
