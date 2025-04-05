import { Button, Card, Space, Tooltip } from "antd";
import DisplayAlert from "../../../components/Commons/Alert";
import GenericTable from "../../../components/Commons/Table/generic-table.component";
import { useState, useEffect } from 'react';
import { CloseCircleFilled, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from "react-query";
import { getAll, remove } from "../../../services/profiles.service";
import { AlertService } from '../../../services/alert.service';
import ConfirmModal from "../../../components/Commons/Modal/confirm-modal.component";
import ProfilePermissionService from "../../../services/profilePermissions.service";

export default function ListProfilePage(props: any) {
    const [removeProfile, setRemoveProfile] = useState<any | undefined>(undefined);
    const [warnRemoveProfileId, setWarnRemoveProfileId] = useState<boolean>(false);

    const navigate = useNavigate();

    const profilePermissionService = ProfilePermissionService.getInstance();

    const toPage = (page: string, profile_id: number = 0) => {
        let pages = {
            create: '/management/users/profilesAndPrivileges/create',
            edit: `/management/users/profilesAndPrivileges/${profile_id}/edit`,
        };

        navigate(pages[page as keyof typeof pages]);
    };

    const onRemoveProfile = (record: any) => {
        if (record.total_users > 0) {
            setWarnRemoveProfileId(true)
        } else {
            setRemoveProfile(record)
        }
    }

    const columns = [
        { title: "Perfil", dataIndex: "description", sorter: false, key: "description" },
        { title: "Utilizadores atribuídos", dataIndex: "total_users", sorter: false, key: "total_users" },
        {
            title: "Ações",
            key: "action",
            render: (_: any, record: any) => (
                profilePermissionService.hasPermission("users-profilesAndPrivileges:write") &&
                <Space size="small">
                    {record.role != 'administrator' &&
                        <Tooltip placement="top" title="Editar">
                            <Button type="default" shape="circle" size="middle"
                                icon={<EditOutlined />}
                                onClick={() => toPage('edit', record.id)} />
                        </Tooltip>
                    }

                    {!record.readonly &&
                        <Tooltip placement="top" title="Apagar">
                            <Button type="default" shape="circle" size="middle"
                                icon={<DeleteOutlined />}
                                onClick={() => onRemoveProfile(record)} />
                        </Tooltip>
                    }
                </Space>
            ),
            width: 100,
        },
    ];

    const [profileList, setProfileList] = useState<{ id: number, name: string }[]>([]);

    const { data: dataProfileList, refetch: RefetchProfileList, isLoading: profileLoading } = useQuery(
        ['profileList'],
        () => getAll(),
        { refetchOnWindowFocus: false }
    );

    const { mutate: removeProfileMutate } = useMutation(remove,
        {
            onSuccess: () => {
                AlertService.sendAlert([
                    { text: 'Perfil apagado com sucesso.' }
                ]);
                setRemoveProfile(undefined);
                RefetchProfileList();
            }
        }
    );

    useEffect(() => {
        if (dataProfileList) {
            setProfileList(dataProfileList.data.map((profile: any) => {
                return {
                    key: profile.id,
                    ...profile
                }
            }));
        }
    }, [dataProfileList])

    return (
        <>
            <DisplayAlert />
            <Card
                bodyStyle={{ padding: 8 }}
                title="Lista de perfis"
                extra={
                    profilePermissionService.hasPermission("users-profilesAndPrivileges:write") &&
                    <Button type="primary" size="large" onClick={() => toPage('create')}>Criar novo</Button>
                }
                headStyle={{
                    paddingTop: 32,
                    paddingBottom: 20,
                    paddingRight: 32,
                    color: '#107B99',
                    fontWeight: 600
                }}
            >
                <div className="profile_table">
                    <GenericTable
                        columns={columns}
                        dataSource={profileList}
                        loading={profileLoading}
                    />

                    <ConfirmModal
                        open={!!removeProfile}
                        title={`Tem certeza que deseja apagar o perfil "${removeProfile?.description}"?`}
                        content="Nenhum utilizador será afetado."
                        okText="Apagar" cancelText="Voltar"
                        onOk={() => removeProfileMutate(removeProfile?.id)}
                        onCancel={() => setRemoveProfile(undefined)}
                    ></ConfirmModal>

                    <ConfirmModal
                        open={!!warnRemoveProfileId}
                        title="Não é possível apagar este perfil pois existem utilizadores associados à ele"
                        content="Antes de continuar, aceda à secção de gestão de utilizadores para editar as associações."
                        okText="Editar associações" cancelText="Voltar"
                        icon={<CloseCircleFilled style={{ color: '#f5222d', marginRight: 10, fontSize: 18 }} />}
                        onOk={() => {
                            setWarnRemoveProfileId(false);
                            navigate('/management/users');
                        }}
                        onCancel={() => setWarnRemoveProfileId(false)}
                    ></ConfirmModal>
                </div>
            </Card>
        </>
    )
}
