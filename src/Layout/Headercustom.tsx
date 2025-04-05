import { Button, Layout as LayoutAnt } from "antd";
import { Typography } from "antd";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { logout } from "../services/user.service";

const { Title, Text } = Typography;
const { Header } = LayoutAnt;

export default function HeaderCustom({
  title,
  user,
  collapsed,
  toggleCollapsed,
}: any) {
  const onLogout = () => {
    logout()
      .finally(() => {
        localStorage.removeItem("user");

        window.location.href = '/';
      })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Button
        onClick={toggleCollapsed}
        style={{
          position: "absolute",
          zIndex: "999",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          padding: "0px",
          marginLeft: "-16px"
        }}
      >
        {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
      </Button>
      <Header
        style={{
          width: "100%",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0px 4px 6px -2px rgba(0, 0, 0, 0.2)",
          zIndex: 9,
          padding: 24
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          alignItems: "center",
        }}>
          <Title style={{ marginTop: 0, marginBottom: 0 }} level={4}>
            {title.split(' / ')[0]}
            {title.split(' / ')[1] && <span style={{ fontSize: 16, fontWeight: 400 }}> / {title.split(' / ')[1]}</span>}
          </Title>
          <div>
            <Text style={{ paddingRight: 10 }}>Olá, {user?.name}</Text>
            <a href="#" onClick={() => {
              onLogout();
            }}>
              <LogoutOutlined /> Sair
            </a>
          </div>
        </div>
      </Header>
    </div>
  );
}
