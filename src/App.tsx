import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import Layout from "./Layout/Layout";
import Login from "./Pages/Login/login";
import { ConfigProvider } from "antd";
import ptPT from 'antd/lib/locale/pt_PT';
import './laravel-echo';
import { useLocation } from "react-router";

export default function App({ children, header }: any) {
  const queryClient = new QueryClient();
  const userStorage = localStorage.getItem("user") || null;
  const [user] = useState(userStorage ? JSON.parse(userStorage) : null);
  const { pathname } = useLocation();

  return (
    <ConfigProvider
      locale={ptPT}
      theme={{
        token: {
          colorPrimary: '#107b99',
          colorBgLayout: '#ebf3f5',
        },
        components: {
          Button: {
            colorPrimary: '#107b99',
            colorLink: '#107b99',
          },
          Menu: {
            itemSelectedBg: '#dfe6e8',
            itemSelectedColor: '#252626',
            itemHoverColor: '#107b99',
            itemColor: '#252626',
          },
          Select: {
            controlItemBgActive: '#d1fdff'
          }
        }
      }} 
    >
      <QueryClientProvider client={queryClient}>
        {(!user || ['/forgot-password', '/reset-password'].includes(pathname))
          ? <Login />
          : <Layout />
        }
      </QueryClientProvider>
    </ConfigProvider>
  );
}
