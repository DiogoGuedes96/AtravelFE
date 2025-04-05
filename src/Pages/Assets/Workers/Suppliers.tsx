import List from './List';
import Form from './Form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Row, Space, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { cutLongText } from '../../../services/utils';
import ProfilePermissionService from "../../../services/profilePermissions.service";

const { Text } = Typography;

export default function SuppliersPage(props: any) {
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [details, setDetails] = useState<any>(null);
    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const columns = [
        { title: 'Fornecedor', dataIndex: 'name', sorter: true, key: 'name', width: 200,
            render: (_:any, record: any) => (cutLongText(record.name))
        },
        { title: 'Telefone', dataIndex: 'phone', key: 'phone', width: 120 },
        { title: 'NIF', dataIndex: 'nif', key: 'nif' },
        { title: 'Nome Responsável', dataIndex: 'responsible_name', key: 'responsible_name', width: 200,
            render: (_:any, record: any) => (cutLongText(record.responsible_name))
        },
        { title: 'Email', dataIndex: 'email', key: 'email', width: 150,
            render: (_:any, record: any) => (cutLongText(record.email))
        }
    ];

    const label = 'Fornecedor';

    const formFields = [
        {
            cols: [
                { field: 'name', span: 18 },
                { field: 'nif', span: 6 }
            ]
        },
        {
            cols: [
                { field: 'social_denomination', span: 12 },
                { field: 'phone', span: 6 },
                { field: 'email', span: 6 },
            ]
        },
        {
            cols: [
                { field: 'responsible_name', span: 18},
                { field: 'responsible_phone', span: 6 }
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
                { field: 'table_id', span: 8 },
            ]
        },
        {
            cols: [
                { field: 'notes', span: 24 }
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
                'Fornecedor': worker.data.name,
                'NIF': worker.data.nif,
                'Denominação social': worker.data.social_denomination,
                'Telefone': worker.data.phone,
                'Email': worker.data.email,
                'Nome responsável': worker.data.responsible_name,
                'Telefone responsável': worker.data.responsible_phone,
                'Morada': worker.data.address,
                'Código Postal': worker.data.postal_code,
                'Localidade': worker.data.locality,
                'Tabela operador': worker.relationships.table?.data?.name,
                'Observações': worker.data.notes
            }
        })
    };

    return (
        <div className="content_page">
            {props.action == 'list' &&
                <>
                    <List type="suppliers" label={label} columns={columns} onMapDataToExport={onMapDataToExport} onOpenDetails={onOpenDetails} />

                    <Drawer
                        title="Detalhes" placement="right" closeIcon={false} width={450}
                        open={openDetails} onClose={onCloseDetails}
                        extra={<Button type="text" shape="circle" size="middle" icon={<CloseOutlined />}
                            onClick={onCloseDetails} />}>

                        {details && <>
                            <Row>
                                <Col span={24} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Fornecedor</Text>
                                        <Text>{details.name}</Text>
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
                                        <Text strong>Denominação social</Text>
                                        <Text>{details.social_denomination}</Text>
                                    </Space>
                                </Col>

                                <Col span={24} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Nome responsável</Text>
                                        <Text>{details.responsible_name}</Text>
                                    </Space>
                                </Col>

                                <Col span={24} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Telefone responsável</Text>
                                        <Text>{details.responsible_phone}</Text>
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
                                        <Text strong>Tabela Fornecedor</Text>
                                        <Text>{details.table.data.name}</Text>
                                    </Space>
                                </Col>

                                <Col span={24} style={{ marginBottom: 15 }}>
                                    <Space direction="vertical">
                                        <Text strong>Observações</Text>
                                        <Text>{details.notes}</Text>
                                    </Space>
                                </Col>

                                {profilePermissionService.hasPermission(`${details.type}-${details.type}:write`) &&
                                    <Col span={24} style={{ marginBottom: 15 }}>
                                        <Button type="primary" block style={{ marginTop: 20 }}
                                            onClick={() => {
                                                navigate(`/assets/${details.type}/${details.id}/edit`);
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
                <Form type="suppliers" label={label} action={props.action} formFields={formFields} />
            }
        </div>
    )
}
