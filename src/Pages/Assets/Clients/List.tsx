import { Button, Card, Divider, Form, Input, Space, Tooltip } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useState } from 'react';
import { getAll, remove } from '../../../services/bookingClients.service';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useNavigate } from 'react-router-dom';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import ProfilePermissionService from "../../../services/profilePermissions.service";
import { cutLongText } from '../../../services/utils';

const { Search } = Input;

export default function List(props: any) {
    const [clients, setClients] = useState([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>('name-asc');
    const [removeClient, setRemoveClient] = useState<any | undefined>(undefined);
    const [formSearch] = Form.useForm();

    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { isLoading: clientLoading, refetch: loadClients } = useQuery(
        ['loadClients', currentPage, search, order, perPage],
        () => getAll({ page: currentPage, per_page: perPage, order, search }),
        {
            onSuccess: response => {
                setClients(response.data.map((client: any) => {
                    return {
                        key: client.data.id,
                        ...client.data
                    }
                }));

                setCurrentPage(response.meta.current_page);
                setPerPage(response.meta.per_page);
                setTotal(response.meta.total);
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: removeClientMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'Cliente apagado com sucesso.' }
                ]);

                setRemoveClient(undefined);

                if (clients.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    loadClients();
                }
            },
            onError: () => setRemoveClient(undefined)
        }
    );

    const onSearch = (search_value: any) => {
        setCurrentPage(1);
        setSearch(search_value);
    };

    const handleTableChange = (
        pagination: PaginationProps,
        filters: Record<string, FilterValue | null>,
        sorter: any
    ) => {
        if (pagination.current != currentPage) {
            setCurrentPage(Number(pagination.current));
        }

        if (pagination.pageSize != perPage) {
            setPerPage(pagination.pageSize);
            setCurrentPage(1);
        }

        if (sorter.order) {     
            let orderBy = `${sorter.field}-${sorter.order.substr(0, sorter.order.length -3)}`;

            if (order != orderBy) {
                setOrder(orderBy);
            }
        }
    };

    const toPage = (page: string, client_id: number = 0) => {
        let pages = {
            create: `/assets/clients/create`,
            edit: `/assets/clients/${client_id}/edit`
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const columns = [
        { title: 'Nome', dataIndex: 'name', sorter: true, key: 'name',
            render: (_: any, record: any) => cutLongText(record.name, 40)
        },
        { title: 'Email', dataIndex: 'email', sorter: false, key: 'email',
            render: (_: any, record: any) => cutLongText(record.email, 40)
        },
        { title: 'Telefone', dataIndex: 'phone', sorter: false, key: 'phone' },
        {
            title: 'Ações',
            key: 'action',
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission(`bookings-clients:write`) &&
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => toPage('edit', record.id)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                            onClick={() => setRemoveClient(record)} />
                    </Tooltip>
                </Space>
            ),
            width: '15%',
        },
    ];

    return (
        <>
            <DisplayAlert />
            <Card bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_clients"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_table" className="item_search">
                            <Search onSearch={onSearch} placeholder="Pesquisa o cliente" enterButton="Pesquisar" allowClear size="large" maxLength={255} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission('bookings-clients:write') &&
                        <Button type="primary" onClick={() => toPage('create')} size="large">Criar novo</Button>
                    }
                </div>

                <Divider />

                <div className="table">
                    <GenericTable
                        columns={columns}
                        dataSource={clients}
                        pagination={{
                            current: currentPage,
                            pageSize: perPage,
                            showSizeChanger: true,
                            total: total
                        }}
                        loading={clientLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !clients.length && !search,
                            textOne: 'Esta tabela encontra-se vazia, uma vez que ainda não foram criados clientes.',
                            textTwo: profilePermissionService.hasPermission(`bookings-clients:write`)
                                ? `Para começar, crie um novo cliente.`
                                : '',
                            link: profilePermissionService.hasPermission(`bookings-clients:write`)
                                ? `/assets/clients/create`
                                : '',
                            createText: 'Criar novo'
                        }}
                        handleTableChange={handleTableChange}
                    />

                    <ConfirmModal
                        open={!!removeClient}
                        title={`Tem certeza que deseja apagar o cliente "${removeClient?.name}"?`}
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => removeClientMutate(removeClient?.id)}
                        onCancel={() => setRemoveClient(undefined)}
                    ></ConfirmModal>
                </div>
            </Card>
        </>
    );
}