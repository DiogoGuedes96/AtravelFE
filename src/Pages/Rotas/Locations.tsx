import { Button, Card, Form, Input, Select, Space, Tooltip } from 'antd';
import DisplayAlert from '../../components/Commons/Alert';
import GenericTable from '../../components/Commons/Table/generic-table.component';
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ShowDataLength from '../../components/Commons/Table/results-length-table.component';
import { useState } from 'react';
import { getAll, remove } from '../../services/locations.service';
import { PaginationProps } from 'antd/lib';
import { FilterValue } from 'antd/es/table/interface';
import { useNavigate } from 'react-router-dom';
import { AlertService } from '../../services/alert.service';
import { useMutation, useQuery } from 'react-query';
import ConfirmModal from '../../components/Commons/Modal/confirm-modal.component';
import { cutLongText } from '../../services/utils';
import ProfilePermissionService from "../../services/profilePermissions.service";

const { Search } = Input;

export default function Locations(props: any) {
    const [locations, setLocations] = useState([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number | undefined>(10);
    const [total, setTotal] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [order, setOrder] = useState<string>('name-asc');
    const [removeLocation, setRemoveLocation] = useState<any | undefined>(undefined);
    const [zoneId, setZoneId] = useState<number | undefined>(undefined);
    const [formSearch] = Form.useForm();
    const [formFilter] = Form.useForm();

    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const { isLoading: locationsLoading, refetch: loadLocations } = useQuery(
        ['loadLocations', currentPage, search, order, perPage, zoneId],
        () => getAll({ page: currentPage, per_page: perPage, order, search, zone_id: zoneId }),
        {
            onSuccess: response => {
                setLocations(response.data.map((location: any) => {
                    return {
                        key: location.data.id,
                        ...location.data,
                        ...location.relationships
                    }
                }));

                setCurrentPage(response.meta.current_page);
                setPerPage(response.meta.per_page);
                setTotal(response.meta.total);
            },
            refetchOnWindowFocus: false
        }
    );

    const { mutate: RemoveLocationMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'Local apagado com sucesso.' }
                ]);

                setRemoveLocation(undefined);

                if (locations.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    loadLocations();
                }
            }
        }
    );

    const onSearch = (search_value: any) => {
        setCurrentPage(1);
        setSearch(search_value);
    };

    const onChangeFilters = () => {
        setCurrentPage(1);
        setZoneId(formFilter.getFieldValue('filter_zone'));
    };

    const onClearFilters = () => {
        setCurrentPage(1);
        setZoneId(undefined);
        formFilter.setFieldValue('filter_zone', undefined)
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

    const toPage = (page: string, location_id: number = 0) => {
        let pages = {
            create: '/routes/locations/create',
            edit: `/routes/locations/${location_id}/edit`
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const columns = [
        { title: 'Local', dataIndex: 'name', sorter: true, key: 'name',
            render: (_:any, record: any) => (cutLongText(record.name, 40))
        },
        { title: 'Morada', dataIndex: 'address', sorter: true, key: 'address',
            render: (_:any, record: any) => (cutLongText(record.address, 40))
        },
        {
            title: 'Zona', dataIndex: 'zone_id', sorter: true, key: 'zone_id',
            render: (_:any, record: any) => (cutLongText(record.zone.name, 40))
        },
        {
            title: 'Ações', key: 'action',
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission("routes-locations:write") &&
                <Space size="small">
                    <Tooltip placement="top" title="Editar">
                        <Button
                            type="default" shape="circle" size="middle" icon={<EditOutlined />}
                            onClick={() => toPage('edit', record.id)} />
                    </Tooltip>

                    <Tooltip placement="top" title="Apagar">
                        <Button type="default" shape="circle" size="middle" icon={<DeleteOutlined />}
                            onClick={() => setRemoveLocation(record)} />
                    </Tooltip>
                </Space>
            ),
            width: '15%',
        }
    ];

    return (
        <>
            <DisplayAlert />
            <Card bodyStyle={{ padding: 8 }}>
                <div className="search_bar">
                    <Form
                        form={formSearch}
                        name="search_locations"
                        layout="vertical"
                        className="form_search_horizontal"
                        autoComplete="off">

                        <Form.Item name="search_location" className="item_search">
                            <Search onSearch={onSearch} placeholder="Pesquisa por local ou morada" enterButton="Pesquisar" allowClear size="large" maxLength={255} />
                        </Form.Item>
                    </Form>

                    {profilePermissionService.hasPermission("routes-locations:write") &&
                        <Button type="primary" onClick={() => toPage('create')} size="large">Criar novo</Button>
                    }
                </div>

                <div className="filter_bar">
                    <Form
                        form={formFilter}
                        name="filter_locations"
                        layout="vertical"
                        className="form_filter_horizontal"
                        autoComplete="off">
                        <Form.Item label="Zona" name="filter_zone" className="item_filter">
                            <Select placeholder="Todos" value={zoneId} style={{ width: 200 }} size="large">
                                {props.zones.map((zone: any) => <Select.Option key={zone.id} value={zone.id}>{zone.name}</Select.Option>)}
                            </Select>
                        </Form.Item>

                        <Button onClick={onChangeFilters} size="large">Filtrar</Button>
                        
                        {zoneId && <Button type="link" onClick={onClearFilters} size="large">Limpar</Button>}
                    </Form>
                </div>

                <div className="table">
                    <GenericTable
                        columns={columns}
                        dataSource={locations}
                        pagination={{
                            current: currentPage,
                            pageSize: perPage,
                            showSizeChanger: true,
                            total: total
                        }}
                        loading={locationsLoading}
                        totalChildren={
                            <div className="zone_result_size_n_export">
                                <ShowDataLength size={total} className="show_result_size" />
                            </div>
                        }
                        empty={{
                            createTheFirst: !locations.length && !search,
                            textOne: 'Esta tabela encontra-se vazia, uma vez que ainda não foram criadoas locais.',
                            textTwo: profilePermissionService.hasPermission("routes-zones:write")
                                ? `Para começar, crie um novo local.`
                                : '',
                            link: profilePermissionService.hasPermission("routes-zones:write")
                                ? '/routes/locations/create'
                                : '',
                            createText: 'Criar novo'
                        }}
                        handleTableChange={handleTableChange}
                    />

                    <ConfirmModal
                        open={!!removeLocation}
                        title={`Tem certeza que deseja apagar o local "${removeLocation?.name}"?`}
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => RemoveLocationMutate(removeLocation?.id)}
                        onCancel={() => setRemoveLocation(undefined)}
                    ></ConfirmModal>
                </div>
            </Card>
        </>
    );
}