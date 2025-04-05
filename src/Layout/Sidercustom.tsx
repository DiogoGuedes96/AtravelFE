import { useEffect, useState } from "react";
import { Layout as LayoutAnt, Menu } from "antd";
import DrawerSchedule from "../components/schedule/DrawerSchedule";
import ModalAlertEvent from "../components/schedule/ModalAlertEvent";
import { useNavigate } from "react-router-dom";
import {
  CalendarOutlined,
  ControlOutlined,
  DeleteOutlined,
  HomeOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  TableOutlined,
  TeamOutlined
} from "@ant-design/icons";

const { Sider } = LayoutAnt;

const routes = [
  {
    key: "dashboard",
    url: "/dashboard",
    icon: <HomeOutlined />,
    label: "Dashboard",
    permissions: ['dashboard-dashboard:read', 'dashboard-dashboard:write']
  },
  {
    key: "bookings",
    url: "/bookings",
    icon: <CalendarOutlined />,
    label: "Serviços",
    children: [
      {
        key: "bookings/bookings",
        label: "Consulta Reservas",
        url: '/bookings/bookings',
        permissions: ['bookings-bookings:read', 'bookings-bookings:write']
      },
      {
        key: "bookings/services",
        label: "Consulta Serviços",
        url: '/bookings/services',
        permissions: ['bookings-services:read', 'bookings-services:write'],
      },
      {
        key: "bookings/operators",
        label: "Operadores",
        url: '/bookings/operators',
        permissions: ['bookings-operators:read', 'bookings-operators:write']
      },
      {
        key: "bookings/bookingsToApprove",
        label: "Reservas a Aprovar",
        url: '/bookings/bookingsToApprove',
        permissions: ['bookings-bookingsToApprove:read', 'bookings-bookingsToApprove:write'],
      }
    ]
  },
  {
    key: "timetable",
    url: "/timetable",
    icon: <TableOutlined />,
    label: "Escalas",
    permissions: ['timetable-timetable:read', 'timetable-timetable:write']
  },
  {
    key: "control",
    url: "/control",
    icon: <TeamOutlined />,
    label: "Controle",
    children: [
      {
        key: "control/staff",
        label: "Staff",
        url: '/control/staff',
        permissions: ['control-staff:read', 'control-staff:write']
      },
      {
        key: "control/operators",
        label: "Operadores",
        url: '/control/operators',
        permissions: ['control-operators:read', 'control-operators:write']
      },
      {
        key: "control/suppliers",
        label: "Fornecedores",
        url: '/control/suppliers',
        permissions: ['control-suppliers:read', 'control-suppliers:write']
      },
      {
        key: "control/reports",
        label: "Relatórios",
        url: '/control/reports',
        permissions: [
          'control-reportsStaff:read', 'control-reportsStaff:write',
          'control-reportsOperators:read', 'control-reportsOperators:write',
          'control-reportsSuppliers:read', 'control-reportsSuppliers:write',
        ]
      }
    ],
    permissions: [
      'control-staff:read', 'control-staff:write',
      'control-operators:read', 'control-operators:write',
      'control-suppliers:read', 'control-suppliers:write',
      'control-reportsStaff:read', 'control-reportsStaff:write',
      'control-reportsOperators:read', 'control-reportsOperators:write',
      'control-reportsSuppliers:read', 'control-reportsSuppliers:write',
    ]
  },
  {
    key: "assets",
    url: "/assets",
    icon: <SettingOutlined />,
    label: "Assets",
    children: [
      {
        key: "assets/tables",
        label: "Tabelas",
        url: '/assets/tables',
        permissions: [
          'tables-operators:read', 'tables-operators:write',
          'tables-suppliers:read', 'tables-suppliers:write',
          'tables-staff:read', 'tables-staff:write'
        ]
      },
      {
        key: "assets/operators",
        label: "Operadores",
        url: '/assets/operators',
        permissions: ['operators-operators:read', 'operators-operators:write']
      },
      {
        key: "assets/suppliers",
        label: "Fornecedores",
        url: '/assets/suppliers',
        permissions: ['suppliers-suppliers:read', 'suppliers-suppliers:write']
      },
      {
        key: "assets/staff",
        label: "Staff",
        url: '/assets/staff',
        permissions: ['staff-staff:read', 'staff-staff:write']
      },
      {
        key: "assets/vehicles",
        label: "Viaturas",
        url: '/assets/vehicles',
        permissions: ['vehicles-vehicles:read', 'vehicles-vehicles:write']
      },
      {
        key: "assets/services",
        label: "Serviços",
        url: '/assets/services',
        permissions: [
          'services-serviceTypes:read', 'services-serviceTypes:write',
          'services-serviceStates:read', 'services-serviceStates:write'
        ]
      },
      {
        key: "assets/clients",
        label: "Clientes",
        url: '/assets/clients',
        permissions: ['bookings-clients:read', 'bookings-clients:write']
      }
    ]
  },
  {
    key: "routes",
    url: "/routes",
    icon: <NodeIndexOutlined />,
    label: "Rotas",
    permissions: [
      'routes-zones:read', 'routes-zones:write',
      'routes-routes:read', 'routes-routes:write',
      'routes-locations:read', 'routes-locations:write'
    ]
  },
  {
    key: "manager",
    url: "/manager",
    icon: <ControlOutlined />,
    label: "Gestão",
    disabled: false,
    children: [
      {
        key: "management/users",
        label: "Utilizadores",
        url: '/management/users',
        permissions: [
          'users-users:read', 'users-users:write',
          'users-profilesAndPrivileges:read', 'users-profilesAndPrivileges:write'
        ]
      },
      {
        key: "management/company",
        label: "Empresa",
        url: '/management/company',
        permissions: ['companies-companies:read', 'companies-companies:write']
      },
      {
        key: "management/app",
        label: "App",
        url: '/management/app',
        disabled: true,
        permissions: ['app-app:read', 'app-app:write']
      }
    ]
  },
  {
    key: "recycling",
    url: "/recycling",
    icon: <DeleteOutlined />,
    label: "Reciclagem",
    permissions: ['recycling-recycling:read', 'recycling-recycling:write']
  }
];

export default function SiderCustom({ modulePermissions, collapsed, setTitle }: any) {
  const navigate = useNavigate();

  const [currentKey, setCurrentKey]: any = useState(null);
  const [currentComponent, setCurrentComponent] = useState(null);
  const [oldCurrentKey, setOldCurrentKey] = useState(null);
  const [isOnlyModule, setIsOnlyModule] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [authorizedRoutes, setAuthorizedRoutes] = useState<any[]>([]);

  const findRouteByPathname = (pathname: String, items: any) => {
    let routeFound = items.find((route: any) => pathname == route.url);

    if (!routeFound) {
      for (let route of items) {
        if (route.children && route.children.length) {
          routeFound = findRouteByPathname(pathname, route.children);

          if (routeFound) {
            routeFound.childLabel = [route.label, routeFound.label].join(' / ');
            return routeFound;
          }
        }
      }
    }

    return routeFound;
  }

  const filterAuthorizedRoutes = (routes: any[]) => {
    return routes.filter((route: any) => {
      if (route?.children?.length) {
        route.children = filterAuthorizedRoutes(route.children);

        if (route.children.length) {
          return route;
        }
      }

      if (route?.permissions?.some((permission: string) => modulePermissions.includes(permission))) {
        return route;
      }
    });
  };

  useEffect(() => {
    if (window.location.pathname) {
      let pathname = window.location.pathname;

      let splittedPathname = pathname.substring(1).split('/');

      if (splittedPathname.length > 2) {
        pathname = '/' + splittedPathname.slice(0, 2).join('/');
      }

      let routeFound = findRouteByPathname(pathname, authorizedRoutes);

      if (routeFound) {
        setTitle(routeFound.childLabel || routeFound.label);
        delete routeFound.childLabel;
        setCurrentKey(routeFound.key);
      }
    }
  }, [window.location.pathname, authorizedRoutes]);

  useEffect(() => {
    if (modulePermissions.length) {
      if (Object.keys(modulePermissions).length === 1) {
        let [module, permission] = Object.keys(modulePermissions)[0].split('-');

        const onlyRoute: any = routes.find(route => route.key === module);

        if (onlyRoute) {
          setIsOnlyModule(true);
          setCurrentKey(onlyRoute.key);
          goToModule(onlyRoute.key);
        }
      } else {
        setAuthorizedRoutes(filterAuthorizedRoutes(routes));
      }
    }
  }, [modulePermissions]);

  const goToModule = (key: string) => {
    if (!window.location.href.includes(key)) {
      navigate(key);
    }
  };

  const closeSchedule = () => {
    setCurrentKey(oldCurrentKey);
    setCurrentComponent(null);
  };

  function MenuComponent({ routes, ...props }: any) {
    return (
      <Menu
        mode="inline"
        onClick={({ key }) => {
          let componentRoute = routes.find((route: any) => route.key === key);

          if (!componentRoute) {
            routes.forEach((route: any) => {
              if (route.children) {
                const childRoute = route.children.find((child: any) => child.key === key);

                if (childRoute) {
                  childRoute.childLabel = [route.label, childRoute.label].join(' / ');
                  componentRoute = childRoute;
                }
              }
            });
          }

          if (!componentRoute) return;

          setTitle(componentRoute.childLabel || componentRoute.label);
          delete componentRoute.childLabel;

          if (componentRoute?.component) {
            setCurrentComponent(componentRoute.component);
            setOldCurrentKey(currentKey);
            setCurrentKey(key);
            return;
          }

          setCurrentKey(key);
          navigate(key);
        }}
        defaultSelectedKeys={[currentKey]}
        defaultOpenKeys={[currentKey ? currentKey.split('/')[0] : currentKey]}
        items={routes.map((route: any) => {
          return {
            key: route.key,
            icon: route.icon,
            label: route.label,
            children: route.children,
            disabled: route.disabled
          };
        })}
      />
    );
  }

  const closeModalAlertEvent = () => {
    setCurrentReminder(null);
  };

  return (
    <>
      {!isOnlyModule && (
        <>
          <Sider
            collapsible
            collapsed={collapsed}
            trigger={null}
            style={{ background: "#FFFFFF", boxShadow: "2px 0px 6px #0000001A", zIndex: 99 }}
          >
            {!collapsed ? (
              <a href="/" className="nav-link">
                <img
                  src="/atravel.png"
                  className="client_logo"
                  alt="logo"
                />
              </a>
            ) : (
              <div style={{ marginTop: 69 }}></div>
            )}

            <MenuComponent routes={authorizedRoutes} />
          </Sider>
          <DrawerSchedule
            open={currentComponent === "DrawerSchedule"}
            onclose={closeSchedule}
          />
          <ModalAlertEvent
            open={currentReminder !== null}
            event={currentReminder}
            close={closeModalAlertEvent}
          />
        </>
      )}
    </>
  );
}
