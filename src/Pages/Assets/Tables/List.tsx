import { Button, Card, Divider, Form, Input, Space, Tooltip } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useState } from 'react';
import { getAll, remove } from '../../../services/tables.service';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useNavigate } from 'react-router-dom';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import ProfilePermissionService from "../../../services/profilePermissions.service";

const { Search } = Input;

export default function List(props: any) {
    const [tables, setTables] = useState([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>('name-asc');
    const [removeTable, setRemoveTable] = useState<any | undefined>(undefined);
    const [formSearch] = Form.useForm();

    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { isLoading: tableLoading, refetch: loadTables } = useQuery(
        ['loadTables', currentPage, search, order, perPage],
        () => getAll({ page: currentPage, type: props.type, per_page: perPage, order, search }),
        {
            onSuccess: response => {
                setTables(response.data.map((table: any) => {
                    return {
                        key: table.data.id,
                        ...table.data
                    }
                }));

                setCurrentPage(response.meta.current_page);
                setPerPage(response.meta.per_page);
                setTotal(response.meta.total);
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: removeTableMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'Tabela apagada com sucesso.' }
                ]);

                setRemoveTable(undefined);

                if (tables.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    loadTables();
                }
            },
            onError: () => setRemoveTable(undefined)
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

    const toPage = (page: string, table_id: number = 0) => {
        let pages = {
            create: `/assets/tables/${props.type}/create`,
            edit: `/assets/tables/${props.type}/${table_id}/edit`,
            duplicate: `/assets/tables/${props.type}/${table_id}/duplicate`
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const columns = [
        { title: 'Tabela', dataIndex: 'name', sorter: true, key: 'name' },
        {
            title: 'Ações',
            key: 'action',
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission(`tables-${props.type}:write`) &&
                <Space size="small">
                    <Tooltip placement="top" title="Duplicar">
                        <Button
                            type="default" shape="circle" size="middle" icon={<CopyOutlined />}
                            onClick={() => toPage('duplicate', record.id)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Editar">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => toPage('edit', record.id)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                            onClick={() => setRemoveTable(record)} />
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
                        name="search_tables"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_table" className="item_search">
                            <Search onSearch={onSearch} placeholder="Pesquisa a tabela" enterButton="Pesquisar" allowClear size="large" maxLength={255} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission(`tables-${props.type}:write`) &&
                        <Button type="primary" onClick={() => toPage('create')} size="large">Criar tabela</Button>
                    }
                </div>

                <Divider />

                <div className="table">
                    <GenericTable
                        columns={columns}
                        dataSource={tables}
                        pagination={{
                            current: currentPage,
                            pageSize: perPage,
                            showSizeChanger: true,
                            total: total
                        }}
                        loading={tableLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !tables.length && !search,
                            textOne: 'Esta tabela encontra-se vazia, uma vez que ainda não foram criadas tabelas.',
                            textTwo: profilePermissionService.hasPermission(`tables-${props.type}:write`)
                                ? `Para começar, crie uma nova tabela.`
                                : '',
                            link: profilePermissionService.hasPermission(`tables-${props.type}:write`)
                                ? `/assets/tables/create`
                                : '',
                            createText: 'Criar tabela'
                        }}
                        handleTableChange={handleTableChange}
                    />

                    <ConfirmModal
                        open={!!removeTable}
                        title={`Tem certeza que deseja apagar a tabela "${removeTable?.name}"?`}
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => removeTableMutate(removeTable?.id)}
                        onCancel={() => setRemoveTable(undefined)}
                    ></ConfirmModal>
                </div>
            </Card>
        </>
    );
}