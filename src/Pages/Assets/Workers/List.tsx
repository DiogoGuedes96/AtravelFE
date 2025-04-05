import { Button, Card, Form, Input, Modal, Select, Space, Tooltip } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useEffect, useState } from 'react';
import { getAll, remove, update } from '../../../services/workers.service';
import { getAll as loadTables } from '../../../services/tables.service';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useNavigate } from 'react-router-dom';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import ExportBtn from '../../../components/Commons/Export/ExportButton';
import { cutLongText, downloadExcel } from '../../../services/utils';
import ProfilePermissionService from "../../../services/profilePermissions.service";

const { Search } = Input;

export default function List(props: any) {
    const [workers, setWorkers] = useState([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>('name-asc');
    const [status, setStatus] = useState<string>('');
    const [tableId, setTableId] = useState<number | string>('');
    const [tables, setTables] = useState<{ id: number, name: string }[]>([]);
    const [isModalTableOpen, setIsModalTableOpen] = useState<boolean>(false);
    const [dataAssociateTable, setDataAssociateTable] = useState<{id: number, table_id: number}>();
    const [removeWorker, setRemoveWorker] = useState<any | undefined>(undefined);
    const [workersToExport, setWorkersToExport] = useState([]);
    const [exportIsLoading, setExportIsLoading] = useState<boolean>(false);
    const [formSearch] = Form.useForm();
    const [formFilter] = Form.useForm();

    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { isLoading: workerLoading, refetch: loadWorkers } = useQuery(
        ['loadWorkers', currentPage, search, order, perPage, status, tableId],
        () => getAll({
            page: currentPage, type: props.type, per_page: perPage, table_id: tableId,
            order, search, status
        }),
        {
            onSuccess: response => {
                setWorkers(response.data.map((worker: any) => {
                    return {
                        key: worker.data.id,
                        ...worker.data,
                        ...worker.relationships
                    }
                }));

                setWorkersToExport([]);
                setCurrentPage(response.meta.current_page);
                setPerPage(response.meta.per_page);
                setTotal(response.meta.total);
            },
            refetchOnWindowFocus: false
        }
    );

    const { refetch: loadWorkersToExport } = useQuery(
        ['loadWorkersToExport'],
        () => getAll({ type: props.type, order, search, status }),
        {
            onSuccess: response => setWorkersToExport(props.onMapDataToExport(response.data)),
            refetchOnWindowFocus: false,
            enabled: false
        }
    );

    useQuery(
        ['loadTables'],
        () => loadTables({ type: props.type, status: 'active' }),
        {
            onSuccess: response => setTables(response.data.map((table: any) => {
                return {
                    key: table.data.id,
                    ...table.data
                }
            })),
            refetchOnWindowFocus: false
        }
    );

    const { mutate: removeWorkerMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: `${props.label} apagado com sucesso.` }
                ]);

                setRemoveWorker(undefined);

                if (workers.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    loadWorkers();
                }
            }
        }
    );

    const { mutate: updateTableId, isLoading: updateTableIdLoading } = useMutation(update, {
        onSuccess: () => {
            AlertService.sendAlert([
                { text: 'Associação de tabela editada com sucesso.' }
            ]);

            onHideTableModal();
            loadWorkers();
        }
    });

    const onShowTableModal = (id: number, table_id: number) => {
        setDataAssociateTable({id, table_id});
        setIsModalTableOpen(true);
    }

    const onHideTableModal = () => {
        setIsModalTableOpen(false);
        setDataAssociateTable(undefined);
    }

    const onSearch = (search_value: any) => {
        setCurrentPage(1);
        setSearch(search_value);
    };

    const onFilter = () => {
        setCurrentPage(1);
        setStatus(formFilter.getFieldValue('filter_status'));
        setTableId(formFilter.getFieldValue('filter_table'));
    };

    const onClearFilters = () => {
        setCurrentPage(1);
        setStatus('');
        setTableId('');
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

    const onFilterTables = (
        input: string, option?: { key: string, value: number, children?: string }
    ) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase());

    const toPage = (page: string, worker_id: number = 0) => {
        let pages = {
            create: `/assets/${props.type}/create`,
            edit: `/assets/${props.type}/${worker_id}/edit`
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const exportData = () => downloadExcel(workersToExport, props.label);

    const columns = [
        ...props.columns,
        {
            title: 'Tabela Associada', dataIndex: 'table', key: 'table', width: 200, sorter: true,
            render: (_:any, record: any) => (
                <>
                    {profilePermissionService.hasPermission(`${props.type}-${props.type}:write`) &&
                        <Tooltip placement="top" title="Editar tabela associada">
                            <Button
                                type="text" shape="circle" size="middle" icon={<EditOutlined style={{color: '#8C8C8C'}} />}
                                onClick={() => onShowTableModal(record.id, record?.table?.data?.id)} />
                        </Tooltip>
                    }
                    {cutLongText(record?.table?.data?.name)}
                </>
            )
        },
        {
            title: 'Estado', dataIndex: 'active', key: 'active', sorter: true,
            render: (_:any, record: any) => (record.active ? 'Ativo' : 'Não ativo')
        },
        {
            title: 'Ações', key: 'action', width: 60,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip placement="top" title="Detalhes">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EyeOutlined />}
                            onClick={() => props.onOpenDetails(record)} />
                    </Tooltip>

                    {profilePermissionService.hasPermission(`${props.type}-${props.type}:write`) &&
                    <>
                        <Tooltip placement="top" title="Editar">
                            <Button
                                type="default" shape="circle" size="middle" icon={<EditOutlined />}
                                onClick={() => toPage('edit', record.id)} />
                        </Tooltip>

                        <Tooltip placement="top" title="Apagar">
                            <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                                onClick={() => setRemoveWorker(record)} />
                        </Tooltip>
                    </>}
                </Space>
            )
        }
    ];

    useEffect(() => {
        formFilter.setFieldsValue({ filter_status: '', filter_table: '' });
    }, []);

    useEffect(() => {
        formFilter.setFieldsValue({ filter_status: status, filter_table: tableId });
    }, [status, tableId]);

    useEffect(() => {
        if (workersToExport.length) {
            exportData();
        }

        setExportIsLoading(false);
    }, [workersToExport]);

    return (
        <>
            <DisplayAlert />
            <Card bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_workers"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_worker" className="item_search">
                            <Search onSearch={onSearch} placeholder={`Pesquisa o ${props.label.toLowerCase()}`} enterButton="Pesquisar" allowClear size="large" maxLength={255} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission(`${props.type}-${props.type}:write`) &&
                        <Button type="primary" onClick={() => toPage('create')} size="large">Criar novo</Button>
                    }
                </div>

                <div className="filter_bar">
                    <Form
                        form={formFilter}
                        name="filter_workers"
                        layout="vertical"
                        className="form_filter_horizontal"
                        autoComplete="off">

                        <Form.Item label="Tabela" name="filter_table" className="item_filter">
                            <Select placeholder="Todas" value={tableId} style={{ width: 200 }} size="large"
                            showSearch filterOption={onFilterTables}>
                                <Select.Option key="0" value="">Todas</Select.Option>
                                {tables.map((table: any) => (
                                    <Select.Option key={table.id} value={table.id}>{table.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Estado" name="filter_status" className="item_filter">
                            <Select placeholder="Todos" value={status} style={{ width: 200 }} size="large"
                                options={[
                                    { value: '', label: 'Todos' },
                                    { value: 'active', label: 'Ativos' },
                                    { value: 'inactive', label: 'Não Ativos' }
                                ]} />
                        </Form.Item>

                        <Button onClick={onFilter} size="large">Filtrar</Button>
                        
                        {(status || tableId) && <Button type="link" onClick={onClearFilters} size="large">Limpar</Button>}
                    </Form>
                </div>

                <div className="table">
                    <GenericTable
                        columns={columns}
                        dataSource={workers}
                        pagination={{
                            current: currentPage,
                            pageSize: perPage,
                            showSizeChanger: true,
                            total: total
                        }}
                        loading={workerLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                                <ExportBtn disabled={!total} loading={exportIsLoading}
                                    onClick={() => {
                                        if (workersToExport.length) {
                                            exportData();
                                        } else {
                                            setExportIsLoading(true);
                                            loadWorkersToExport();
                                        }
                                    }} />
                            </div>
                        }
                        empty={{
                            createTheFirst: !workers.length && !search && !status,
                            textOne: `Esta tabela encontra-se vazia, uma vez que ainda não foram criados ${props.label.toLowerCase()}${props.type != 'staff' ? 'es' : ''}.`,
                            textTwo: profilePermissionService.hasPermission(`${props.type}-${props.type}:write`) ?
                                `Para começar, crie um novo ${props.label.toLowerCase()}.`
                                : '',
                            link: profilePermissionService.hasPermission(`${props.type}-${props.type}:write`) ?
                                `/assets/${props.type}/create`
                                : ''
                        }}
                        handleTableChange={handleTableChange}
                    />

                    <ConfirmModal
                        open={!!removeWorker}
                        title={`Tem certeza que deseja apagar o ${props.label.toLowerCase()} "${removeWorker?.name}"?`}
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => removeWorkerMutate(removeWorker?.id)}
                        onCancel={() => setRemoveWorker(undefined)}
                    ></ConfirmModal>
                </div>
            </Card>

            <Modal title="Editar tabela associada" open={isModalTableOpen}
                okText='Associar tabela' okType='primary' cancelText='Voltar' confirmLoading={updateTableIdLoading}
                onOk={() => updateTableId({
                    values: { type: props.type, table_id: dataAssociateTable?.table_id },
                    id: Number(dataAssociateTable?.id) 
                })}
                onCancel={onHideTableModal}>
                <Form layout="vertical">
                    <Form.Item label="Tabela" name="associate_table">
                        <Select
                            showSearch placeholder="Seleciona tabela" style={{width: '100%'}} size="large"
                            value={dataAssociateTable?.table_id} filterOption={onFilterTables}
                            onChange={(value) => setDataAssociateTable({id: Number(dataAssociateTable?.id), table_id: value})}>
                            {tables.map((table: any) => (
                                <Select.Option key={table.id} value={table.id}>{table.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}