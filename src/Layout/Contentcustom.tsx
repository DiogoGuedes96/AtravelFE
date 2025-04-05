import { Layout as LayoutAnt, theme } from "antd";
import { Route, Routes } from "react-router-dom";
import PageNotFound from "../Pages/Errors/PageNotFound";
import Dashboard from "../Pages/Dashboard";
import Bookings from "../Pages/Bookings/Bookings";
import BookingOperators from "../Pages/Bookings/Operators";
import ConsultServices from "../Pages/Bookings/Services/Consult";
import Timetable from "../Pages/Timetable";
import Tables from "../Pages/Assets/Tables";
import Operators from "../Pages/Assets/Workers/Operators";
import Suppliers from "../Pages/Assets/Workers/Suppliers";
import Staff from "../Pages/Assets/Workers/Staff";
import Vehicles from "../Pages/Assets/Vehicles";
import Services from "../Pages/Assets/Services";
import Clients from "../Pages/Assets/Clients";
import RoutesAndZonesPage from "../Pages/Rotas";
import Recycling from "../Pages/Recycling";
import UsersAndProfiles from "../Pages/Management/Users";
import CompaniesPage from "../Pages/Management/Company";
import { authorizedAccess } from "../services/utils";
import BookingsBeApproved from "../Pages/Bookings/BeApproved";
import ControlStaff from "../Pages/Control/List/Staff";
import ControlOperators from "../Pages/Control/List/Operators";
import ControlSuppliers from "../Pages/Control/List/Suppliers";
import ControlReports from "../Pages/Control/Reports";

const { Content } = LayoutAnt;

export default function ContentCustom({ content, modulePermissions = [] }: any) {
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const verifyAuthorizedAccess = (permissions: string[]) => authorizedAccess(modulePermissions, permissions);

  return (
    <Content style={{ background: colorBgLayout }} >
      <Routes>
        {verifyAuthorizedAccess(['dashboard-dashboard:read', 'dashboard-dashboard:write'])
          && <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </>
        }

        {verifyAuthorizedAccess(['bookings-bookings:read', 'bookings-bookings:write'])
          && <>
            <Route path="/bookings/bookings" element={<Bookings action="list" />} />
          </>}

        {verifyAuthorizedAccess(['bookings-bookings:write'])
          && <>
            <Route path="/bookings/bookings/create" element={<Bookings action="create" />} />
            <Route path="/bookings/bookings/:id/edit/:approve?" element={<Bookings action="edit" />} />
          </>}

        {verifyAuthorizedAccess(['bookings-services:read', 'bookings-services:write'])
          && <>
            <Route path="/bookings/services" element={<ConsultServices />} />
          </>}

        {verifyAuthorizedAccess(['control-staff:read', 'control-staff:write'])
          && <>
            <Route path="/control/staff" element={<ControlStaff />} />
          </>}

        {verifyAuthorizedAccess(['control-operators:read', 'control-operators:write'])
          && <>
            <Route path="/control/operators" element={<ControlOperators />} />
          </>}

        {verifyAuthorizedAccess(['control-suppliers:read', 'control-suppliers:write'])
          && <>
            <Route path="/control/suppliers" element={<ControlSuppliers />} />
          </>}

        {verifyAuthorizedAccess([
          'control-reportsStaff:read', 'control-reportsStaff:write',
          'control-reportsOperators:read', 'control-reportsOperators:write',
          'control-reportsSuppliers:read', 'control-reportsSuppliers:write',
        ])
          && <>
            <Route path="/control/reports/:tab?/:subTab?" element={<ControlReports />} />
            <Route path="/control/reports/:tab/:id/details" element={<ControlReports />} />
          </>}

        {verifyAuthorizedAccess(['bookings-operators:read', 'bookings-operators:write'])
          && <>
            <Route path="/bookings/operators" element={<BookingOperators action="list" />} />
          </>}

        {verifyAuthorizedAccess(['bookings-operators:write'])
          && <>
            <Route path="/bookings/operators/create" element={<BookingOperators action="create" />} />
            <Route path="/bookings/operators/:id/edit" element={<BookingOperators action="edit" />} />
          </>}

        {verifyAuthorizedAccess(['bookings-bookingsToApprove:read', 'bookings-bookingsToApprove:write'])
          && <>
            <Route path="/bookings/bookingsToApprove/:tab?/:update?" element={<BookingsBeApproved action="list" />} />
          </>}

        {verifyAuthorizedAccess(['timetable-timetable:read', 'timetable-timetable:write'])
          && <>
            <Route path="/timetable" element={<Timetable />} />
          </>}

        {verifyAuthorizedAccess([
          'tables-operators:read', 'tables-operators:write',
          'tables-suppliers:read', 'tables-suppliers:write',
          'tables-staff:read', 'tables-staff:write'
        ])
          && <>
            <Route path="/assets/tables/:tab?" element={<Tables action="list" />} />
          </>}

        {verifyAuthorizedAccess(['tables-operators:write', 'tables-suppliers:write', 'tables-staff:write'])
          && <>
            <Route path="/assets/tables/:tab?/create" element={<Tables action="create" />} />
            <Route path="/assets/tables/:tab?/:id/edit" element={<Tables action="edit" />} />
            <Route path="/assets/tables/:tab?/:id/duplicate" element={<Tables action="duplicate" />} />
          </>}

        {verifyAuthorizedAccess(['operators-operators:read', 'operators-operators:write'])
          && <>
            <Route path="/assets/operators" element={<Operators action="list" />} />
          </>}

        {verifyAuthorizedAccess(['operators-operators:write'])
          && <>
            <Route path="/assets/operators/create" element={<Operators action="create" />} />
            <Route path="/assets/operators/:id/edit" element={<Operators action="edit" />} />
          </>}

        {verifyAuthorizedAccess(['suppliers-suppliers:read', 'suppliers-suppliers:write'])
          && <>
            <Route path="/assets/suppliers" element={<Suppliers action="list" />} />
          </>}

        {verifyAuthorizedAccess(['suppliers-suppliers:write'])
          && <>
            <Route path="/assets/suppliers/create" element={<Suppliers action="create" />} />
            <Route path="/assets/suppliers/:id/edit" element={<Suppliers action="edit" />} />
          </>}

        {verifyAuthorizedAccess(['staff-staff:read', 'staff-staff:write'])
          && <>
            <Route path="/assets/staff" element={<Staff action="list" />} />
          </>}

        {verifyAuthorizedAccess(['staff-staff:write'])
          && <>
            <Route path="/assets/staff/create" element={<Staff action="create" />} />
            <Route path="/assets/staff/:id/edit" element={<Staff action="edit" />} />
          </>}

        {verifyAuthorizedAccess(['vehicles-vehicles:read', 'vehicles-vehicles:write'])
          && <>
            <Route path="/assets/vehicles" element={<Vehicles action="list" />} />
          </>}

        {verifyAuthorizedAccess(['vehicles-vehicles:write'])
          && <>
            <Route path="/assets/vehicles/create" element={<Vehicles action="create" />} />
            <Route path="/assets/vehicles/:id/edit" element={<Vehicles action="edit" />} />
          </>}

        {verifyAuthorizedAccess([
          'services-serviceTypes:read', 'services-serviceTypes:write',
          'services-serviceStates:read', 'services-serviceStates:write'
        ])
          && <>
            <Route path="/assets/services/:tab?" element={<Services />} />
          </>}

        {verifyAuthorizedAccess(['bookings-clients:read', 'bookings-clients:write'])
          && <>
            <Route path="/assets/clients" element={<Clients action="list" />} />
          </>}

        {verifyAuthorizedAccess(['bookings-clients:write'])
          && <>
            <Route path="/assets/clients/create" element={<Clients action="create" />} />
            <Route path="/assets/clients/:id/edit" element={<Clients action="edit" />} />
          </>}

        {verifyAuthorizedAccess(['companies-companies:read', 'companies-companies:write'])
          && <>
            <Route path="/management/company" element={<CompaniesPage />} />
          </>}

        {verifyAuthorizedAccess([
          'users-users:read', 'users-users:write',
          'users-profilesAndPrivileges:read', 'users-profilesAndPrivileges:write'
        ])
          && <>
            <Route path="/management/users/:tab?" element={<UsersAndProfiles action="list" />} />
          </>}

        {verifyAuthorizedAccess(['users-users:write', 'users-profilesAndPrivileges:write'])
          && <>
            <Route path="/management/users/:tab?/create" element={<UsersAndProfiles action="create" />} />
            <Route path="/management/users/:tab?/:id/edit" element={<UsersAndProfiles action="edit" />} />
          </>}

        {verifyAuthorizedAccess([
          'routes-zones:read', 'routes-zones:write',
          'routes-routes:read', 'routes-routes:write',
          'routes-locations:read', 'routes-locations:write'
        ])
          && <>
            <Route path="/routes/:tab?" element={<RoutesAndZonesPage action="list" />} />
          </>}

        {verifyAuthorizedAccess(['routes-zones:write', 'routes-routes:write', 'routes-locations:write'])
          && <>
            <Route path="/routes/:tab?/create" element={<RoutesAndZonesPage action="create" />} />
            <Route path="/routes/:tab?/:id/edit" element={<RoutesAndZonesPage action="edit" />} />
          </>}

        {verifyAuthorizedAccess(['recycling-recycling:read', 'recycling-recycling:write'])
          && <>
            <Route path="/recycling" element={<Recycling action="list" />} />
          </>}

        {verifyAuthorizedAccess(['recycling-recycling:write'])
          && <>
            <Route path="/recycling/:id/restore" element={<Recycling action="restore" />} />
          </>}

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Content>
  );
}