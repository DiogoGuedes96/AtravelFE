import React, { useState, useEffect } from "react";
import { useMutation } from "react-query";
import { Typography, Card, Empty, Tag, Button, Popconfirm, Divider } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query'
import { getCallsInProgress, terminateCall } from "../../../services/calls.service";
import emptyCalls from '../../../assets/images/empty-calls.svg';
import { gray, red } from '@ant-design/colors';
import ClientBar from "../clientBar";

const { Text } = Typography;


export default function ActiveCalls() {

    const userLogged: any = localStorage.getItem('user');

    const { data:mutationData, mutate:mutateTerminateCall } = useMutation(['mutationTerminateCall'], terminateCall)
    const [open, setOpen] = useState(false);
    const [queryData, setQueryData]: any = useState();
    const [popconfirmVisibilities, setPopconfirmVisibilities] = useState([]);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [client, setClient]: any = useState(null);
    const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(userLogged) : null);
    const [terminateCallPermissions, setTerminateCallPermissions] = useState(false);

    const showDrawer = (value: any) => {
        setOpen(true);
        setClient(value);
    };

    const onClose = () => {
        setOpen(false);
        setClient(null);
    };

    const { data } = useQuery(['callsInProgress'], getCallsInProgress, {
        refetchInterval: 5000
    })

    const handleOkTerminateCall = (call: any) => {
        setConfirmLoading(true);
        mutateTerminateCall({callId: call?.id})
        removeCallFromCallsArray(call);
        handleClosePopconfirm(call?.id);
        setConfirmLoading(false);
    }

    const removeCallFromCallsArray = (call: any) => {
        if (call) {
            const newArray = queryData.filter(
                (item: any) => item.call.id !== call.id
              );
            setQueryData(newArray);
        }
      };

    const handleOpenPopconfirm = (cardId: any) => {
        setPopconfirmVisibilities((prevVisibilities: any) =>
          prevVisibilities.map((visibility: any, index: any) => index === cardId ? true : visibility)
        );
    };

    const handleClosePopconfirm = (cardId: any) => {
        setPopconfirmVisibilities((prevVisibilities: any) =>
          prevVisibilities.map((visibility: any, index: any) => index === cardId ? false : visibility)
        );
    };

    useEffect(() => {
        if (data) {
            setQueryData(data?.calls);
        }
    }, [data])


    useEffect(() => {
        const module = user?.canAccess?.find((module: any) => module.module === 'calls');

        if (module.permissions) {
          const permissions = JSON.parse(module.permissions);

          if (permissions ){
            if(permissions['terminateCalls'] === false || permissions['terminateCalls'] === undefined){
                setTerminateCallPermissions(false);
            }else {
                setTerminateCallPermissions(true);
            }
          };

        }
    }, [user])

    return (
        <>
            {(queryData?.length == undefined || queryData.length == 0) &&
                <Empty
                    style={{
                        width: '100%',
                        marginTop: "35vh",
                        padding: "10px"
                    }}
                    image={emptyCalls}
                    imageStyle={{ height: 50 }}
                    description={
                        <span style={{ textAlign: 'center', color: '#00000073', opacity: '1' }}>
                            Não há chamadas ativas
                        </span>

                    }
                />
            }
            <div style={{ margin: '0 24px' }}>
                {queryData &&
                    queryData.map((value: any, i: any) => {
                        return (
                            <Card
                                className="card-custom"
                                bordered={false}
                                extra={
                                    client?.client?.age_debt > 0 ?
                                        <Tag
                                            style={{ fontWeight: 400, fontSize: 14 }}
                                            color={red[5]}>
                                            Faturas Pendentes
                                        </Tag> : null
                                }
                                style={{
                                    width: '100%',
                                    marginBottom: '16px',
                                    cursor: 'pointer'
                                }}
                                key={i}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <div style={{ display: 'flex', gap: 16, width: '100%' }} onClick={() => showDrawer(value)}>
                                        <Text style={{ fontSize: 16, color: gray[8], fontWeight: 600 }}>{value.call?.caller_phone ? value.call?.caller_phone : 'N/a'}</Text>
                                        <Text style={{ fontSize: 16, color: gray[6], fontWeight: 400 }}>{value.client?.name ? value.client?.name : 'Cliente Não Registado'}</Text>
                                    </div>
                                    {terminateCallPermissions &&
                                        <div>
                                            <Popconfirm
                                                title="Tem a certeza que quer remover esta ligação?"
                                                description={<Text style={{ fontSize: 14, color: gray[8], fontWeight: 500 }}>{'(+351) '}{value.call?.caller_phone ? value.call?.caller_phone : 'N/a'}</Text>}
                                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                                okText="Sim"
                                                placement="topRight"
                                                cancelText="Não"
                                                open={popconfirmVisibilities[value.call]}
                                                onOpenChange={(visible) => {
                                                    if (visible) {
                                                      handleOpenPopconfirm(value.call);
                                                    } else {
                                                      handleClosePopconfirm(value.call);
                                                    }
                                                  }
                                                }
                                                okButtonProps={{
                                                    loading: confirmLoading,
                                                }}
                                                onConfirm={() => handleOkTerminateCall(value.call)}
                                                onCancel={() => handleClosePopconfirm(value.call)}
                                            >
                                                <Button
                                                    style={{
                                                    width: '38px',
                                                    height: '38px',
                                                }}
                                                    onClick={(visible) => {
                                                        if (visible) {
                                                          handleOpenPopconfirm(value.call);
                                                        } else {
                                                          handleClosePopconfirm(value.call);
                                                        }
                                                      }
                                                    }
                                                    shape="circle"
                                                    icon={<DeleteFilled />}
                                                />

                                            </Popconfirm>
                                        </div>
                                    }
                                </div>
                                {value.client &&
                                    <>
                                        <Divider  style={{ margin: 8 }} />
                                        <div style={{ display: 'flex',  flexDirection: 'row', gap: 16, width: '100%', paddingTop: 16 }} onClick={() => showDrawer(value)}>
                                            {value.client?.addresses[0]?.address ?
                                                <Text style={{ fontSize: 16, color: gray[2], fontWeight: 400 }}>{value.client?.addresses[0]?.address ? value.client?.addresses[0]?.address : 'N/a'}</Text> :
                                                null}
                                            {value.client?.tax_number ?
                                                <Text style={{ fontSize: 16, color: gray[2], fontWeight: 400 }}>Nif: {value.client?.tax_number ? value.client?.tax_number : 'N/a'}</Text> :
                                                null}
                                            {value.client?.tax_number ?
                                                <Text style={{ fontSize: 16, color: gray[2], fontWeight: 400 }}>ID Primavera: {value.client?.erp_client_id ? value.client?.erp_client_id : 'N/a'}</Text> :
                                                null}
                                        </div>
                                    </>
                                }
                            </Card>
                        )
                    })
                }
            </div>
            { client && <ClientBar open={open} onClose={onClose} client={client} />}
        </>
    )
}
