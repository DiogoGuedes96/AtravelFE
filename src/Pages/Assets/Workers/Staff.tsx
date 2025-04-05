import List from './List';
import Form from './Form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Row, Space, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { cutLongText } from '../../../services/utils';
import ProfilePermissionService from "../../../services/profilePermissions.service";

const { Text } = Typography;

export default function WorkesPage(props: any) {
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [details, setDetails] = useState<any>(null);
    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const columns = [
        { title: 'ID Staff', dataIndex: 'id', key: 'id', width: 100 },
        { title: 'Nome Staff', dataIndex: 'name', sorter: true, key: 'name', width: 200,
            render: (_:any, record: any) => (cutLongText(record.name))
        },
        { title: 'NIF', dataIndex: 'nif', key: 'nif' },
        { title: 'Morada', dataIndex: 'address', key: 'address', width: 200,
            render: (_:any, record: any) => (cutLongText(record.address))
        },
        { title: 'Código Postal', dataIndex: 'postal_code', key: 'postal_code' },
        { title: 'Localidade', dataIndex: 'locality', key: 'locality',
            render: (_:any, record: any) => (cutLongText(record.locality))
        }
    ];

    const label = 'Staff';

    const formFields = [
        {
            cols: [
                { field: 'id', span: 6 },
                { field: 'name', span: 18 },
            ]
        },
        {
            cols: [
                { field: 'nif', span: 6},
                { field: 'email', span: 12 },
                { field: 'phone', span: 6 }
            ]
        },
        {
            cols: [
                { field: 'address', span: 12 },
                { field: 'postal_code', span: 6 },
                { field: 'locality', span: 6 }
            ]
        },
        {
            cols: [
                { field: 'vehicle_id', span: 8 },
                { field: 'username', span: 8 }
            ]
        },
        {
            cols: [
                { field: 'table_id', span: 8 }
            ]
        }
    ];

    const onOpenDetails = (record: any) => {
        setDetails(record);
        setOpenDetails(true);
    };

    const onCloseDetails = () => {
        setOpenDetails(false);
        setDetails(null);
    };

    const onMapDataToExport = (data: Array<any>) => {
        return data.map((worker: any) => {
            return {
                'ID': worker.data.id,
                'Staff': worker.data.name,
                'NIF': worker.data.nif,
                'Email': worker.data.email,
                'Telefone': worker.data.phone,
                'Morada': worker.data.address,
                'Código Postal': worker.data.postal_code,
                'Localidade': worker.data.locality,
                'Viatura': worker.relationships.vehicle?.license,
                'Utilizador': worker.data.username,
                'Tabela staff': worker.relationships.table?.data?.name
            }
        })
    };

    return (
        <div className="content_page">
            {props.action == 'list' &&
                <>
                    <List type="staff" label={label} columns={columns} onMapDataToExport={onMapDataToExport} onOpenDetails={onOpenDetails} />

                    <Drawer
                        title="Detalhes" placement="right" closeIcon={false} width={450}
                        open={openDetails} onClose={onCloseDetails}
                        extra={<Button type="text" shape="circle" size="middle" icon={<CloseOutlined />}
                            onClick={onCloseDetails} />}>

                        {details && <>
                            <Row>
                                <Col span={12} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Staff</Text>
                                        <Text>{details.name}</Text>
                                    </Space>
                                </Col>

                                <Col span={12} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>ID referência</Text>
                                        <Text>{details.id}</Text>
                                    </Space>
                                </Col>

                                <Col span={12} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Telefone</Text>
                                        <Text>{details.phone}</Text>
                                    </Space>
                                </Col>

                                <Col span={12} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>NIF</Text>
                                        <Text>{details.nif}</Text>
                                    </Space>
                                </Col>

                                <Col span={24} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Email</Text>
                                        <Text>{details.email}</Text>
                                    </Space>
                                </Col>

                                <Col span={24} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Morada</Text>
                                        <Text>{details.address}</Text>
                                    </Space>
                                </Col>

                                <Col span={12} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Código Postal</Text>
                                        <Text>{details.postal_code}</Text>
                                    </Space>
                                </Col>

                                <Col span={12} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Localidade</Text>
                                        <Text>{details.locality}</Text>
                                    </Space>
                                </Col>

                                <Col span={24} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Viatura</Text>
                                        <Text>{details.vehicle?.license}</Text>
                                    </Space>
                                </Col>

                                <Col span={12} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Utilizador</Text>
                                        <Text>{details.username}</Text>
                                    </Space>
                                </Col>

                                <Col span={12} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Tabela Fornecedor</Text>
                                        <Text>{details.table?.data?.name}</Text>
                                    </Space>
                                </Col>

                                {profilePermissionService.hasPermission(`staff-staff:write`) &&
                                    <Col span={24} style={{ marginBottom: 15 }}>
                                        <Button type="primary" block style={{ marginTop: 20 }}
                                            onClick={() => {
                                                navigate(`/assets/staff/${details.id}/edit`);
                                                onCloseDetails();
                                            }}>
                                                Editar
                                        </Button>
                                    </Col>
                                }
                            </Row>
                        </>}
                    </Drawer>
                </>
            }

            {(props.action && ['create', 'edit'].includes(props.action)) &&
                <Form type="staff" label={label} action={props.action} formFields={formFields} />
            }
        </div>
    )
}
