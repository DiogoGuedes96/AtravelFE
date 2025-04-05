import { Button, Card, Divider, Form, Input, Space, Switch, Tooltip } from 'antd';
import DisplayAlert from '../../../components/Commons/Alert';
import GenericTable from '../../../components/Commons/Table/generic-table.component';
import { CloseOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useState } from 'react';
import { getAll, remove, updateDefault } from '../../../services/serviceStates.service';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { AlertService } from '../../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import GenericDrawer from '../../../components/Commons/Drawer/generic-drawer.component';
import FormServiceState from './FormServiceState';
import ConfirmModal from '../../../components/Commons/Modal/confirm-modal.component';
import ProfilePermissionService from "../../../services/profilePermissions.service";

const { Search } = Input;

export default function ServiceStates(props: any) {
    const [serviceStates, setServiceStates] = useState([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>('name-asc');
    const [formSearch] = Form.useForm();
    const [openServiceStateDrawerForm, setOpenServiceStateDrawerForm] = useState<boolean>(false);
    const [serviceStateToEdit, setServiceStateToEdit] = useState<any>();
    const [leaveThePage, setLeaveThePage] = useState<boolean>(false);
    const [valuesChanged, setValuesChanged] = useState<boolean>(false);
    const [removeServiceState, setRemoveServiceState] = useState<any | undefined>(undefined);

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { isLoading: servicesStateLoading, refetch: loadServiceStates } = useQuery(
        ['loadServiceStates', currentPage, search, order, perPage],
        () => getAll({ page: currentPage, per_page: perPage, order, search }),
        {
            onSuccess: response => {
                setServiceStates(response.data.map((state: any) => {
                    return {
                        key: state.data.id,
                        ...state.data
                    }
                }));

                setCurrentPage(response.meta.current_page);
                setPerPage(response.meta.per_page);
                setTotal(response.meta.total);
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: removeServiceStateMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'Estado de serviço apagado com sucesso.' }
                ]);

                setRemoveServiceState(undefined);

                if (serviceStates.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    loadServiceStates();
                }
            }
        }
    );

    const { mutate: updateDefaultServiceStateMutate, isLoading: updateDefaultLoading } = useMutation(updateDefault,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'O Estado padrão foi editado com sucesso.' }
                ]);

                loadServiceStates();
            }
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
            let orderBy = `${sorter.field}-${sorter.order.substr(0, sorter.order.length - 3)}`;

            if (order != orderBy) {
                setOrder(orderBy);
            }
        }
    };

    const onOpenServiceStateDrawerForm = (record: any) => {
        setServiceStateToEdit(record);
        setOpenServiceStateDrawerForm(true);
    };

    const onCloseServiceStateDrawerForm = () => {
        setOpenServiceStateDrawerForm(false);
        setServiceStateToEdit(undefined);
        setValuesChanged(false);
    };

    const onSavedForm = (successMessage: string) => {
        onCloseServiceStateDrawerForm();

        setTimeout(() => {
            AlertService.sendAlert([
                { text: successMessage }
            ]);

            loadServiceStates();
        }, 500);
    }

    const onLeaveThePage = () => {
        if (!serviceStateToEdit || valuesChanged) {
            setLeaveThePage(true);
        } else {
            onCloseServiceStateDrawerForm();
        }
    }

    const onChangeDefault = (record: any, value: boolean) => {
        updateDefaultServiceStateMutate({
            id: record.id, values: { is_default: value }
        });
    }

    const columns = [
        {
            title: 'Valor padrão', dataIndex: 'is_default', key: 'is_default', width: 150,
            render: (_: any, record: any) => <Switch checked={record.is_default} loading={updateDefaultLoading}
                onChange={($event) => onChangeDefault(record, $event)} />
        },
        { title: 'Estado de serviço', dataIndex: 'name', key: 'name' },
        {
            title: 'Ações',
            key: 'action',
            render: (_: any, record: any) => (
                (
                    profilePermissionService.hasPermission("services-serviceStates:write")
                    && !record.readonly
                ) && <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => onOpenServiceStateDrawerForm(record)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                            onClick={() => setRemoveServiceState(record)} />
                    </Tooltip>
                </Space>
            ),
            width: '15%',
        },
    ];

    return (
        <>
            {!openServiceStateDrawerForm && <DisplayAlert />}

            <Card bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_states"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_state" className="item_search">
                            <Search onSearch={onSearch} placeholder="Pesquisa o estado de serviço" enterButton="Pesquisar" allowClear size="large" maxLength={255} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission("services-serviceStates:write") &&
                        <Button type="primary" onClick={() => onOpenServiceStateDrawerForm(undefined)} size="large">Criar novo</Button>
                    }
                </div>

                <Divider />

                <div className="table">
                    <GenericTable
                        columns={columns}
                        dataSource={serviceStates}
                        pagination={{
                            current: currentPage,
                            pageSize: perPage,
                            showSizeChanger: true,
                            total: total
                        }}
                        loading={servicesStateLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !serviceStates.length && !search,
                            textOne: 'Esta tabela encontra-se vazia, uma vez que ainda não foram criados estados de serviço.',
                            textTwo: profilePermissionService.hasPermission("services-serviceStates:write")
                                ? `Para começar, crie um novo estado de serviço.`
                                : '',
                            link: profilePermissionService.hasPermission("services-serviceStates:write")
                                ? () => onOpenServiceStateDrawerForm(undefined)
                                : ''
                        }}
                        handleTableChange={handleTableChange}
                    />
                </div>

                <GenericDrawer
                    title={!serviceStateToEdit ? 'Novo estado de serviço' : 'Editar estado de serviço'}
                    children={
                        <>
                            <FormServiceState serviceState={serviceStateToEdit} closeForm={onLeaveThePage} savedForm={onSavedForm}
                                onValuesChange={() => setValuesChanged(true)}
                                unavailableColors={serviceStates.map((serviceState: any) => serviceState.color)} />

                            <ConfirmModal
                                open={leaveThePage}
                                title="Tem certeza de que deseja sair sem gravar as alterações?"
                                content="Toda a informação não gravada será perdida."
                                okText="Sair" cancelText="Voltar"
                                onOk={() => {
                                    onCloseServiceStateDrawerForm();
                                    setLeaveThePage(false);
                                }}
                                onCancel={() => setLeaveThePage(false)}
                            ></ConfirmModal>
                        </>
                    }
                    onClose={onLeaveThePage}
                    open={openServiceStateDrawerForm}
                    footerStyle={{ borderTop: "none" }}
                    bodyStyle={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                    extra={<Button type="text" shape="circle" size="middle" icon={<CloseOutlined />}
                        onClick={onLeaveThePage} />}
                />

                <ConfirmModal
                    open={!!removeServiceState}
                    title={`Tem certeza que deseja apagar o estado "${removeServiceState?.name}"?`}
                    okText="Apagar" cancelText="Voltar"
                    onOk={() => removeServiceStateMutate(removeServiceState?.id)}
                    onCancel={() => setRemoveServiceState(undefined)}
                ></ConfirmModal>
            </Card>
        </>
    );
}