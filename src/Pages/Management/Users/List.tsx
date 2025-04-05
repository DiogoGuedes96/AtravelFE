import { Button, Card, Form, Input, Space, Tooltip, Select } from "antd";
import DisplayAlert from "../../../components/Commons/Alert";
import GenericTable from "../../../components/Commons/Table/generic-table.component";
import { useState, useEffect } from 'react';
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ShowDataLength from '../../../components/Commons/Table/results-length-table.component';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from "react-query";
import { getAll, remove } from "../../../services/users.service";
import { PaginationProps } from "antd/lib";
import { FilterValue } from "antd/es/table/interface";
import { AlertService } from '../../../services/alert.service';
import ConfirmModal from "../../../components/Commons/Modal/confirm-modal.component";
import { cutLongText } from "../../../services/utils";
import moment from "moment";
import ProfilePermissionService from "../../../services/profilePermissions.service";

const { Search } = Input;

export default function ListPage(props: any) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [formSearch] = Form.useForm();
    const [formFilter] = Form.useForm();
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [order, setOrder] = useState<string>('id-asc');
    const [removeUser, setRemoveUser] = useState<any | undefined>(undefined);
    const [profile, setProfile] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const onSearch = (search_value: any) => {
        setCurrentPage(1);
        setSearch(search_value);
    }

    const showPageNewUser = () => {
        toPage('create');
    }

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

    const toPage = (page: string, user_id: number = 0) => {
        let pages = {
            create: '/management/users/users/create',
            edit: `/management/users/users/${user_id}/edit`,
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const columns = [
        { title: "Nome", dataIndex: "name", sorter: true, key: "name",
            render: (_:any, record: any) => (cutLongText(record.name, 40))
        },
        { title: "Email", dataIndex: "email", sorter: false, key: "email" },
        { title: "Perfil", dataIndex: "profile", sorter: false, key: "profile",
            render: (value:any) => <span>{value?.description}</span>
        },
        { title: "Último login", dataIndex: "last_access", sorter: true, key: "last_access",
            render: (_: any, record: any) => ( record.last_access
                ? moment(record.last_access, 'YYYY-MM-DD H:mm:ss').format('DD/MM/YYYY[, às] H[h]mm')
                : ''
            )
        },
        { title: "Estado", dataIndex: "active", sorter: false, key: "active",
            render: (value:any) => <span>{value == true ? 'Ativo' : 'Não ativo'}</span>,
        },
        { title: "Ações", key: "action", width: "15%",
            render: (_: any, record: any) => (
                (
                    profilePermissionService.hasPermission("users-users:write")
                    && record.profile.role != 'administrator'
                ) &&
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button type="default" shape="circle" size="middle"
                            icon={<EditOutlined />}
                            onClick={() => toPage('edit', record.id)}
                        />
                    </Tooltip>

                    {!['operator', 'staff'].includes(record.profile.role) &&
                        <Tooltip placement="top" title="Apagar">
                            <Button type="default" shape="circle" size="middle"
                                icon={<DeleteOutlined />} onClick={() => setRemoveUser(record)} />
                        </Tooltip>
                    }
                </Space>
            )
        }
    ];

    const [userList, setUserList] = useState<{ id: number, name: string }[]>([]);

    const { data: dataUserList, refetch: RefetchUserList, isLoading: userLoading } = useQuery(
        ['userList', currentPage, order, search, perPage, status, profile],
        () => getAll({ page: currentPage, order, search, per_page: perPage, status, role: profile }),
        { refetchOnWindowFocus: false }
    );

    const { mutate: RemoveUserMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'Utilizador apagado com sucesso.' }
                ]);

                setRemoveUser(undefined);

                if (userList.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    RefetchUserList();
                }
            },
            onError: () => setRemoveUser(undefined)
        }
    );

    const onFilter = () => {
        setCurrentPage(1);
        setStatus(formFilter.getFieldValue('filter_status'));
        setProfile(formFilter.getFieldValue('filter_profile'));
    };

    const onClearFilters = () => {
        setCurrentPage(1);
        setStatus('');
        setProfile('');
    };

    useEffect(() => {
        if (dataUserList) {
            setUserList(dataUserList.data.map((user:any) => {
                return {
                    key: user.id,
                    ...user
                }
            }))
            setCurrentPage(dataUserList.meta.current_page)
            setPerPage(dataUserList.meta.per_page)
            setTotal(dataUserList.meta.total)
        }

    }, [dataUserList]);

    useEffect(() => {
        formFilter.setFieldsValue({ filter_status: '', filter_profile: '' });
    }, []);

    useEffect(() => {
        formFilter.setFieldsValue({ filter_status: status, filter_profile: profile });
    }, [status, profile]);

    return (
        <>
            <DisplayAlert />
            <Card bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_user"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_user" className="item_search">
                            <Search onSearch={onSearch} placeholder="Pesquisa por nome do utilizador ou email" enterButton="Pesquisar" allowClear size="large" maxLength={255} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission("users-users:write") &&
                        <Button type="primary" size="large" onClick={showPageNewUser}>Criar novo</Button>
                    }
                </div>

                <div className="filter_bar">
                    <Form
                        form={formFilter}
                        name="filter_users"
                        layout="vertical"
                        className="form_filter_horizontal"
                        autoComplete="off">

                        <Form.Item label="Perfil" name="filter_profile" className="item_filter">
                            <Select placeholder="Todos" value={profile} style={{ width: 200 }} size="large" showSearch
                                options={[{ value: '', label: 'Todos' }].concat(props.profiles.map((profile: any) => {
                                    return { value: profile.role, label: profile.description }
                                }))} />
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
                        
                        {(status || profile) && <Button type="link" onClick={onClearFilters} size="large">Limpar</Button>}
                    </Form>
                </div>

                <div className="user_table" style={{ marginTop: 20 }}>
                    <GenericTable
                        columns={columns}
                        dataSource={userList}
                        pagination={{
                            current: currentPage,
                            pageSize: perPage,
                            total: total,
                            showSizeChanger: true
                        }}
                        loading={userLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !userList.length && !search,
                            textOne: 'Esta tabela encontra-se vazia, uma vez que ainda não foram criados utilizadores.',
                            textTwo: profilePermissionService.hasPermission("users-users:write")
                                ? `Para começar, crie um novo utilizador.`
                                : '',
                            link: profilePermissionService.hasPermission("users-users:write")
                                ? `/management/users/create`
                                : ''
                        }}
                        handleTableChange={handleTableChange}
                    />

                    <ConfirmModal
                        open={!!removeUser}
                        title={`Tem certeza que deseja apagar o utilizador "${removeUser?.name}"?`}
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => RemoveUserMutate(removeUser?.id)}
                        onCancel={() => setRemoveUser(undefined)}
                    ></ConfirmModal>
                </div>
            </Card>
        </>
    )
}
