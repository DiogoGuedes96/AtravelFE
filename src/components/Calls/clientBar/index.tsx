import React, { useEffect, useState } from "react";
import { Button, Drawer, List, Row, Space, Tag, Typography } from "antd";
import {
  UserOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import ClientItemBar from "./itemBar";
import CollapseListBar from "./collapseListBar";
import EmptyBar from "./emptyBar";
import LastSalesBar from "./lastSalesBar";
import moment from "moment";
import { useQuery } from "react-query";
import { gray, red, gold } from "@ant-design/colors";
import { getLastSalesAndProducts } from "../../../services/calls.service";

const { Text } = Typography;

export default function ClientBar({ open, onClose, client }: any) {
  const [valuesLastSales, setValuesLastSales] = useState([]);
  const [originalValuesLastSales, setOriginalValuesLastSales] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [period, setPeriod] = useState("7");

  const { data: lastSalesAndProducts } = useQuery(
    "lastSalesAndProducts",
    () => getLastSalesAndProducts(client?.client?.id),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleFilterDays = (value: any) => {
    if (!value) {
      return;
    }
    setPeriod(value);
    const today = moment().subtract(value, "days");
    const filteredValues = originalValuesLastSales.filter((sale: any) => {
      return moment(sale.order_at).isSameOrAfter(today, "day");
    });

    setValuesLastSales(filteredValues);
  };

  useEffect(() => {
    if (lastSalesAndProducts) {
      setOriginalValuesLastSales(
        lastSalesAndProducts?.products ? lastSalesAndProducts?.products : []
      );
      setPendingInvoices(
        lastSalesAndProducts?.orders ? lastSalesAndProducts?.orders : []
      );
    }
  }, [lastSalesAndProducts]);

  useEffect(() => {
    if (originalValuesLastSales.length) {
      handleFilterDays(7);
    }
  }, [originalValuesLastSales]);

  const handleFilterDateRange = (dates: any) => {
    if (!dates) {
      handleFilterDays(period);
      return;
    }

    const [start, end] = dates;
    const startDate = moment(start.$d);
    const endDate = moment(end.$d);
    const filteredSales = originalValuesLastSales.filter((sale: any) => {
      const saleDate = moment(sale.order_at, "YYYY-MM-DD");
      return saleDate
        .startOf("day")
        .isBetween(startDate.startOf("day"), endDate.endOf("day"), null, "[)");
    });
    setValuesLastSales(filteredSales);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      const { field, order } = sorter;

      const sortDirection =
        order === "ascend" ? "asc" : order === "descend" ? "desc" : null;

      setValuesLastSales(sortByDate(originalValuesLastSales, sortDirection));
    }
  };

  function sortByDate(arr: any, direction: any) {
    arr.sort((a: any, b: any) => {
      const aDate = new Date(a.created_at);
      const bDate = new Date(b.created_at);

      if (direction === "asc") {
        return aDate.getTime() - bDate.getTime();
      } else if (direction === "desc") {
        return bDate.getTime() - aDate.getTime();
      } else if (direction === null) {
        return a.id - b.id;
      }
    });

    return arr;
  }

  const getPaymentConditions = (paymentConditions: any) => {
    let condition = "";
    switch (paymentConditions) {
      case "1":
        condition = "Pronto Pagamento";
        break;
      case "2":
        condition = "Factura 30 dias";
        break;
      case "3":
        condition = "Factura a 7 dias";
        break;
      case "4":
        condition = "Factura a 60 dias";
        break;
      case "5":
        condition = "Fim do Mês";
        break;
      case "7":
        condition = "Até dia 5 do Próximo Mês";
        break;
      case "8":
        condition = "Prestações";
        break;
      case "9":
        condition = "Até dia 15 do Próximo Mês";
        break;
      default:
        condition = "Não Definido";
        break;
    }
    return condition;
  };

  const sectionTitle = (icon: any, title: any, alert: any = null) => {
    let sectionIcon = null;
    switch (icon) {
      case UserOutlined:
        sectionIcon = <UserOutlined style={{ fontSize: 22, color: gray[2] }} />;
        break;
      case CreditCardOutlined:
        sectionIcon = (
          <CreditCardOutlined style={{ fontSize: 22, color: gray[2] }} />
        );
        break;
      case HistoryOutlined:
        sectionIcon = (
          <HistoryOutlined style={{ fontSize: 22, color: gray[2] }} />
        );
        break;
      case ShoppingOutlined:
        sectionIcon = (
          <ShoppingOutlined style={{ fontSize: 22, color: gray[2] }} />
        );
        break;
    }

    return (
      <Row style={{ display: "flex", justifyContent: "space-between" }}>
        <Space>
          {sectionIcon}
          <Text style={{ fontWeight: 600 }}>{title}</Text>
        </Space>
        {alert && (
          <Tag style={{ fontWeight: 400 }} color={red[5]}>
            {alert}
          </Tag>
        )}
      </Row>
    );
  };

  const addClientToLocalStorage = (client: any) => {
    if (client?.client) {
      localStorage.setItem("clientFromCall", JSON.stringify(client?.client));
      localStorage.setItem("callerPhone", client?.call?.caller_phone);
    } else {
      localStorage.setItem("callerPhone", client?.call?.caller_phone);
    }
  };
  return (
    <Drawer
      closable={false}
      onClose={onClose}
      open={open}
      width={544}
      footer={
        <div>
          <Button
            type="primary"
            size="large"
            block
            onClick={() => addClientToLocalStorage(client)}
            href="/orders/newOrder"
          >
            Nova Encomenda
          </Button>
        </div>
      }
      footerStyle={{ padding: "40px 24px", borderTop: "none" }}
    >
      <div style={{ height: "100%" }}>
        <div>
          {sectionTitle(
            UserOutlined,
            <Text style={{ fontSize: 16 }}>Cliente</Text>,
            client?.client?.age_debt > 0 ? "Faturas Pendentes" : null
          )}
          <List style={{ marginTop: "1rem" }}>
            <ClientItemBar
              field="Contacto"
              value={client?.call?.caller_phone}
            />
            <ClientItemBar field="Nome" value={client?.client?.name} />
            <ClientItemBar
              field="ID Primavera"
              value={client?.client?.erp_client_id}
            />
          </List>
        </div>
        {!client || !client.client ? (
          <EmptyBar />
        ) : (
          <>
            <div style={{ paddingTop: 32 }}>
              {sectionTitle(
                CreditCardOutlined,
                <Text style={{ fontSize: 16 }}>Condições e dívidas</Text>
              )}
              <List style={{ marginTop: "1rem" }}>
                <ClientItemBar
                  field="Condição de pagamento"
                  value={getPaymentConditions(
                    client?.client?.payment_condition
                  )}
                />
                <ClientItemBar
                  field="Último pagamento"
                  value="20 Jan 2023"
                  extra="(há 105 dias)"
                />
                {client?.client?.age_debt > 0 && client?.client?.total_debt && (
                  <>
                    <ClientItemBar
                      field="Idade da dívida"
                      value={
                        client?.client?.age_debt >= 0
                          ? client?.client?.age_debt + " dias"
                          : "0 dias"
                      }
                    />
                    <ClientItemBar
                      field="Valor total da dívida"
                      value={client?.client?.total_debt.toLocaleString(
                        "pt-PT",
                        {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 2,
                        }
                      )}
                      tag="true"
                    />
                  </>
                )}
              </List>
            </div>
            <div style={{ paddingTop: 32 }}>
              {sectionTitle(
                HistoryOutlined,
                <Text style={{ fontSize: 16 }}>Faturas pendentes</Text>
              )}
              <List style={{ marginTop: "1rem" }}>
                <CollapseListBar items={pendingInvoices} />
              </List>
            </div>
            <div style={{ paddingTop: 32 }}>
              {sectionTitle(
                ShoppingOutlined,
                <Text style={{ fontSize: 16 }}>Últimas compras</Text>
              )}
              <div style={{ marginTop: "1rem" }}>
                <LastSalesBar
                  handleFilterDays={handleFilterDays}
                  handleFilterDateRange={handleFilterDateRange}
                  values={valuesLastSales}
                  handleTableChange={handleTableChange}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
