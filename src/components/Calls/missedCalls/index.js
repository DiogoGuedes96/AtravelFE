import React, { useState, useEffect } from "react";
import { Table, Space, Typography, Spin } from 'antd';
import callMissed from '../../../assets/images/call-missed.svg';
import { useQuery, useMutation } from "react-query";
import { getCallsMissed } from "../../../services/calls.service";

const { Column } = Table;
const { Text } = Typography;


export default function MissedCalls() {

    const { data, isLoading } = useQuery(['callsMissed'], getCallsMissed)
    const { data:mutationData, isLoading:isLoadingMutation, mutate:mutateCallMissed } = useMutation(['mutationCallsMissed'], getCallsMissed)


    const [callData, setcallData] = useState()
    const [pagination, setPagination] = useState()
    const [currentPage, setCurrentPage] = useState()

    const formatDate = (date) => {
      return date ? (date.split('T')[0]).split("-").reverse().join("/") : ''
    }

    const formatHour = (date) => {
      return date ? date.split('T')[1].split('.')[0]: ''
    }

    const handlepaginations = (page) => {
      setCurrentPage(page)
      mutateCallMissed(page)
    };

    useEffect(() => {
      if (data){
        setcallData(data);
        setPagination({
          total: data?.pagination?.total,
          current: data?.pagination?.currentPage,
          pageSize: data.pagination?.perPage,
        })
      }
    }, [data]);

    useEffect(() => {
      if (mutationData && mutationData?.pagination?.currentPage == currentPage){
        setcallData(mutationData);
        setPagination({
          total: mutationData?.pagination?.total,
          current: mutationData?.pagination?.currentPage,
          pageSize: mutationData?.pagination?.perPage,
        })
      }
    }, [mutationData]);

    return (
        <Table
          dataSource={callData?.calls}
          pagination={{
            showSizeChanger:false,
            total: pagination?.total,
            current: pagination?.current,
            pageSize: pagination?.pageSize,
            onChange:(page) => handlepaginations(page)
          }}
          loading={isLoading || isLoadingMutation}
          bordered
          rowKey={(record) => record.call.id}
          style={{margin: '0 24px'}}
        >
            <Column
                title="Nome"
                dataIndex="name"
                render={(_, record) => (
                    <Space>
                        <img src={callMissed} style={{width:32}} alt="chamada ativa" />
                        <Text>{record.client?.name ? record.client?.name : 'Cliente Não Registado'}</Text>
                    </Space>
            )}/>
            <Column
              title="Data"
              dataIndex="date"
              render={(_, record) => (
                  <Space direction="vertical" size={0}>
                      <Text style={{fontWeight: 600}}>{formatDate(record.call.created_at)}</Text>
                      <Text type="secondary">{formatHour(record.call.created_at)}</Text>
                  </Space>
              )}/>
            <Column
              title="Morada"
              dataIndex="address"
              key="address"
              render={(_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.client?.addresses[0]?.address ? record.client?.addresses[0]?.address : 'N/a'}</Text>
                </Space>
              )}
            />
            <Column
              title="Nif"
              dataIndex="nif"
              key="nif"
              render={(_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.client?.tax_number ? record.client?.tax_number : 'N/a'}</Text>
                </Space>
              )}
            />
            <Column
                title="Contacto Telefónico"
                dataIndex="caller_phone"
                render={(_, record) => (
                    <Space>
                        <Text>{record.call.caller_phone ? record.call?.caller_phone : 'N/a'}</Text>
                    </Space>
                )}
            />
        </Table>
    )
}
