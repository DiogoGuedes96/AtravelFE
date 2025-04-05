import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Select,
  Space,
  message,
} from "antd";
import ListGenericTable from "../../components/Commons/Table/generic-table.component";
import {
  DeleteOutlined,
  EditOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { listUserRole } from "../../services/user.service";
import { useQuery } from "react-query";
import { IUser } from "../../Interfaces/Users.interfaces";
import { EnumProfile } from "../../Enums/Profile.enums";

import "../../assets/css/secundary-button.css";
import GenericDrawer from "../../components/Commons/Drawer/generic-drawer.component";
import NewUserDrawer from "../../components/Users/new-user-drawer.component";
import EditUserDrawer from "../../components/Users/edit-user-drawer.component";
import ShowDataLength from "../../components/Commons/Table/results-length-table.component";

export default function UsersPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [userList, setUserList] = useState([]);
  const [openDrawerNewUser, setOpenDrawerNewUser] = useState(false);
  const [openDrawerEditUser, setOpenDrawerEditUser] = useState(false);
  const [formNewUser] = Form.useForm();
  const [formEditUser] = Form.useForm();

  const showDrawerNewUser = () => {
    setOpenDrawerNewUser(true);
  };
  const onCloseDrawerNewUser = () => {
    setOpenDrawerNewUser(false);
  };

  const showDrawerEditUser = (data: IUser) => {
    formEditUser.setFieldValue("name", data.name);
    formEditUser.setFieldValue("email", data.email);
    formEditUser.setFieldValue("role", data.profile?.role);

    setOpenDrawerEditUser(true);
  };
  const onCloseDrawerEditUser = () => {
    setOpenDrawerEditUser(false);
  };

  const saveEditUser = () => {
    formEditUser
      .validateFields()
      .then((values) => {
        formEditUser.resetFields();
        onCloseDrawerEditUser();
        messageApi.open({
          type: "success",
          content: "Usuário editado com sucesso.",
        });
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  };

  const saveNewUser = () => {
    formNewUser
      .validateFields()
      .then((values) => {
        formNewUser.resetFields();
        onCloseDrawerNewUser();
        messageApi.open({
          type: "success",
          content: "Novo usuário criado com sucesso.",
        });
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  };

  const { isLoading: userLoading } = useQuery(
    "userList",
    () => listUserRole("user"),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        let list = [];
        if (data?.users) {
          list = data?.users.map((user: IUser) => {
            user.role =
              EnumProfile[user.profile?.role as keyof typeof EnumProfile] ||
              null;
            user.key = user.id;
            return user;
          });
        }

        setUserList(list);
      },
    }
  );

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
    },
    {
      title: "Perfil",
      dataIndex: "role",
      key: "role",
      width: "15%",
    },
    {
      title: "Ações",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="default"
            shape="circle"
            icon={<EditOutlined />}
            size="middle"
            onClick={() => {
              showDrawerEditUser(record);
            }}
          />
          <Button
            type="default"
            shape="circle"
            icon={<DeleteOutlined />}
            size="middle"
            onClick={() => {
              console.log("delete: ", record);
            }}
          />
        </Space>
      ),
      width: "10%",
    },
  ];

  return (
    <Card>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <Space direction="horizontal" align="center" size="large">
          <Form
            layout="vertical"
            autoComplete="off"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            <Form.Item
              style={{ marginBottom: 0 }}
              name="search"
              label="Pesquisar"
              colon={false}
            >
              <Input />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="link">Pesquisar</Button>
            </Form.Item>
          </Form>
        </Space>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Space>
            <Button type="link">
              <SettingOutlined />
              Gerir perfis
            </Button>
          </Space>
          <Space>
            <Button type="primary" onClick={showDrawerNewUser}>
              Novo usuário
            </Button>
          </Space>
        </div>
      </div>
      <Divider />
      <ListGenericTable
        columns={columns}
        dataSource={userList}
        loading={userLoading}
        totalChildren={<ShowDataLength size={userList.length} />}
      />
      <GenericDrawer
        title="Novo usuário"
        children={<NewUserDrawer form={formNewUser} />}
        onClose={onCloseDrawerNewUser}
        open={openDrawerNewUser}
        footer={
          <Button type="primary" block onClick={saveNewUser}>
            Criar usuário
          </Button>
        }
        footerStyle={{ borderTop: "none" }}
      />
      <GenericDrawer
        title="Editar usuário"
        children={<EditUserDrawer form={formEditUser} />}
        onClose={onCloseDrawerEditUser}
        open={openDrawerEditUser}
        footer={
          <Button type="primary" block onClick={saveEditUser}>
            Editar usuário
          </Button>
        }
        footerStyle={{ borderTop: "none" }}
      />
    </Card>
  );
}
