import { DualAxes } from "@ant-design/charts";
import { getWorkerById } from '../../../services/reports.service';
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Empty, Spin } from "antd";
import { formatCurrency } from "../../../services/utils";
import Title from "antd/es/typography/Title";
import { usePDF } from "@react-pdf/renderer";
import ChartPDF from "./ChartPDF";
import ExportBtn from "../../../components/Commons/Export/ExportButton";

interface IProps {
    type: string,
    workerId: number | string | undefined,
    year: number
}

export default function IndividualChart({
    type, workerId, year
}: IProps) {
    const title = 'Gráfico Individual';

    const dualAxesRef = useRef<any>();
    const [worker, setWorker] = useState<any>();
    const [services, setServices] = useState<any[]>([]);
    const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
    const [pdfInstante, updatePdfInstante] = usePDF({
        document: <ChartPDF title={title} chartBase64Encode={''} />
    });

    const { isLoading } = useQuery(
        ['loadWorker', year, workerId],
        () => workerId ? getWorkerById(Number(workerId), `?byMonth=1&year=${year}`) : null,
        {
            onSuccess: (response: any) => {
                if (response) {
                    setWorker(response?.data);

                    setServices((response?.data?.byMonth || []).map((service: any) => {
                        return {
                            'Mês': service.month.substring(0, 3),
                            'Mês extenso': service.month,
                            'Valor': service.value,
                            'Quantidade de serviços': service.quantity
                        }
                    }));
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const config = {
        data: services,
        height: 500,
        xField: 'Mês',
        legend: {
            color: {
                itemMarker: (field: string) => {
                    return field === 'Quantidade de serviços' ? 'line' : 'rect';
                },
                itemMarkerFill: '#1783ff',
                itemMarkerStroke: '#ffc53d'
            }
        },
        tooltip: (
            datum: any,
            index: number,
            data: any,
            column: any,
        ) => {
            return (
                {
                    name: column.y.field,
                    color: column.y.field == 'Valor' ? '#1783ff' : '#ffc53d',
                    field: column.y.field,
                    value: column.y.field == 'Valor'
                        ? formatCurrency(column.y.value[index])
                        : column.y.value[index]
                }
            );
        },
        children: [
            {
                type: 'interval',
                yField: 'Valor',
                style: { maxWidth: 80 },
                axis: {
                    y: {
                        type: 'interval',
                        labelFormatter: (datum: any) => formatCurrency(datum || 0)
                    }
                }
            },
            {
                type: 'line',
                yField: 'Quantidade de serviços',
                style: { lineWidth: 2, stroke: '#ffc53d' },
                axis: { y: { position: 'right' } }
            }
        ]
    };

    const exportChartToPDF = () => {
        updatePdfInstante(<ChartPDF
            title={title}
            chartBase64Encode={dualAxesRef.current?.toDataURL('image/png', 1)} />);

        setTimeout(() => {
            setIsExportingPDF(true);
        }, 1000);
    };

    useEffect(() => {
        if (isExportingPDF) {
            window.open(pdfInstante.url || '#', '_blank');

            setIsExportingPDF(false);
        }
    }, [isExportingPDF]);

    useEffect(() => {
        if (!workerId) {
            setServices([]);
        }
    }, [workerId]);

    return (<>
        <div className="zone_result_size_n_export">
            {worker?.name && <Title level={4} style={{ fontWeight: 700, float: 'left' }}>{worker?.name}</Title>}

            <ExportBtn
                loading={pdfInstante.loading}
                disabled={!workerId || !services.length}
                onClick={exportChartToPDF} />
        </div>

        {(!workerId || !services.length) && !isLoading ?
            <Empty
                image="/empty-table.svg"
                imageStyle={{ height: 85 }}
                description="Nenhum dado a ser exibido">
            </Empty> : ''
        }

        <Spin spinning={isLoading}>
            <DualAxes {...config} ref={dualAxesRef} />
        </Spin>
    </>)
}
