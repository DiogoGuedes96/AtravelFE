import React, { useState, useEffect } from "react";
import { Table, Space, Typography } from "antd";
import { useQuery, useMutation } from "react-query";
import callAll from "../../../assets/images/call-all.svg";
import callMissed from "../../../assets/images/call-missed.svg";
import { getCallsHangup } from "../../../services/calls.service";

const { Column } = Table;
const { Text } = Typography;

export default function AllCalls() {
  const {
    data: mutationData,
    isLoading: isLoadingMutation,
    mutate: mutateCallHangup,
  } = useMutation(["mutationCallsHangup"], getCallsHangup);

  const { data, isLoading }: any = useQuery(["callsHangup"], () => getCallsHangup());

  const [callData, setcallData]: any = useState();
  const [pagination, setPagination]: any = useState();
  const [currentPage, setCurrentPage]: any = useState();

  const formatDate = (date: any) => {
    return date ? date.split("T")[0].split("-").reverse().join("/") : "";
  };

  const formatHour = (date: any) => {
    return date ? date.split("T")[1].split(".")[0] : "";
  };

  const getStatus = (state: any) => {
    return ["32", "18", "19", "31", "34", "42"].includes(state) ? false : true;
  };

  const handlepaginations = (page: any) => {
    setCurrentPage(page);
    mutateCallHangup(page);
  };

  useEffect(() => {
    if (data) {
      setcallData(data);
      setPagination({
        total: data?.pagination?.total,
        current: data?.pagination?.currentPage,
        pageSize: data?.pagination?.perPage,
      });
    }
  }, [data]);

  useEffect(() => {
    if (mutationData && mutationData?.pagination?.currentPage == currentPage) {
      setcallData(mutationData);
      setPagination({
        total: mutationData?.pagination?.total,
        current: mutationData?.pagination?.currentPage,
        pageSize: mutationData?.pagination?.perPage,
      });
    }
  }, [mutationData]);

  return (
    <Table
      dataSource={callData?.calls}
      pagination={{
        showSizeChanger: false,
        total: pagination?.total,
        current: pagination?.current,
        pageSize: pagination?.pageSize,
        onChange: (page) => handlepaginations(page),
      }}
      loading={isLoading || isLoadingMutation}
      bordered
      rowKey={(record: any, index: any) => index}
      style={{ margin: "0 24px" }}
    >
      <Column
        title="Nome"
        dataIndex="name"
        render={(_, record: any) => (
          <Space>
            <img
              src={getStatus(record.call.hangup_status) ? callAll : callMissed}
              style={{ width: 32 }}
              alt={record.succeedded ? "chamada efetuada" : "chamada perdida"}
            />
            <Text>
              {record.client?.name
                ? record.client.name
                : "Cliente Não Registado"}
            </Text>
          </Space>
        )}
      />
      <Column
        title="Data"
        dataIndex="date"
        render={(_, record: any) => (
          <Space direction="vertical" size={0}>
            <Text style={{ fontWeight: 600 }}>
              {formatDate(record.call.created_at)}
            </Text>
            <Text type="secondary">{formatHour(record.call?.created_at)}</Text>
          </Space>
        )}
      />
      <Column
        title="Morada"
        dataIndex="address"
        render={(_, record: any) => (
          <Space direction="vertical" size={0}>
            <Text>
              {record.client?.addresses[0]?.address
                ? record.client.addresses[0]?.address
                : "N/a"}
            </Text>
          </Space>
        )}
      />
      <Column
        title="Nif"
        dataIndex="nif"
        render={(_, record: any) => (
          <Space direction="vertical" size={0}>
            <Text>
              {record.client?.tax_number ? record.client.tax_number : "N/a"}
            </Text>
          </Space>
        )}
      />
      <Column
        title="Contacto Telefónico"
        dataIndex="caller_phone"
        render={(_, record: any) => (
          <Space>
            <Text>
              {record.call?.caller_phone ? record.call.caller_phone : "N/a"}
            </Text>
          </Space>
        )}
      />
      <Column
        title="Status"
        dataIndex="hangup_status"
        render={(_, record: any) => (
          <Text>
            {getStatus(record.call.hangup_status) ? "Completa" : "Perdida"}
          </Text>
        )}
      />
    </Table>
  );
}
