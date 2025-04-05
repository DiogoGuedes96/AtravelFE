import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Layout as LayoutAnt } from "antd";
import SiderCustom from "./Sidercustom";
import HeaderCustom from "./Headercustom";
import FooterCustom from "./Footercustom";
import ContentCustom from "./Contentcustom";
import { getUser } from "../services/user.service";

export default function Layout() {
  const userStorage = localStorage.getItem("user") || null;
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(
    userStorage ? JSON.parse(userStorage) : null
  );
  const [title, setTitle] = useState("");

  const {
    data: dataUser,
    isSuccess: isSuccessDataUser,
    isError: isErrorDataUser,
  } = useQuery(["getUser"], getUser, {
    refetchOnWindowFocus: false,
    enabled: !user?.token || !user.canAccess.length,
  });

  if (typeof window !== "undefined" && (window as any).Echo !== undefined) {
    console.log("start listen echo");
    (window as any).Echo.channel("ChannelTesteEvent").listen(
      ".TesteEvent",
      (data: any) => {
        console.log(data);
      }
    );
  }

  const handlePermissions = () => {
    if (user.canAccess) {
      return user.canAccess.reduce((array: any, item: any) => {
        if (typeof item.permissions == 'string') {
          item.permissions = JSON.parse(item.permissions);
        }
        
        Object.entries(item.permissions || []).forEach(([key, value]) => array.push(`${item.module}-${key}:${value}`));

        return array;
      }, []);
    }

    return [];
  }

  useEffect(() => {
    if (isSuccessDataUser && dataUser?.user) {
      localStorage.setItem("user", JSON.stringify(dataUser.user));
      setUser(dataUser.user);
    }
  }, [isSuccessDataUser, dataUser]);

  useEffect(() => {
    if (isErrorDataUser) {
      localStorage.removeItem("user");
      window.location.replace("/login");
    }
  }, [isErrorDataUser]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {user && (
        <LayoutAnt style={{ minHeight: "100vh" }}>
            <SiderCustom modulePermissions={handlePermissions()} collapsed={collapsed} setTitle={setTitle} />
            <LayoutAnt>
              <HeaderCustom
                user={user}
                collapsed={collapsed}
                toggleCollapsed={toggleCollapsed}
                title={title}
              />
              <ContentCustom modulePermissions={handlePermissions()} />
              <FooterCustom />
            </LayoutAnt>
        </LayoutAnt>
      )}
    </>
  );
}
