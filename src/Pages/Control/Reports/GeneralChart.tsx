import { DualAxes } from "@ant-design/charts";
import { getAllWorkers } from '../../../services/reports.service';
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import dayjs from "dayjs";
import { Empty, Spin } from "antd";
import { formatCurrency } from "../../../services/utils";
import ExportBtn from "../../../components/Commons/Export/ExportButton";
import { usePDF } from "@react-pdf/renderer";
import ChartPDF from "./ChartPDF";

interface IProps {
    type: string,
    workerId: number | (number | string)[],
    startDate?: string,
    endDate?: string,
    colors: string[]
}

export default function GeneralChart({
    type, workerId, startDate, endDate, colors
}: IProps) {
    const title = 'Gráfico Geral';

    const dualAxesRef = useRef<any>();
    const [workers, setWorkers] = useState([]);
    const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
    const [pdfInstante, updatePdfInstante] = usePDF({
        document: <ChartPDF title={title} chartBase64Encode={''} />
    });

    const { isLoading } = useQuery(
        ['loadWorkers', startDate, endDate, workerId],
        () => getAllWorkers({
            type, start_date: startDate, end_date: endDate, worker_id: workerId
        }),
        {
            onSuccess: response => {
                setWorkers(response.data.map((worker: any) => {
                    return {
                        'Operador': worker.data.name,
                        'Valor': worker.data.totalValueBookings,
                        'Quantidade de serviços': worker.data.totalServices
                    }
                }));
            },
            refetchOnWindowFocus: false
        }
    );

    const config = {
        data: workers,
        height: 500,
        xField: 'Operador',
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
                    name: datum.Operador,
                    color: column.y.field == 'Valor' ? colors[index] : '#ffc53d',
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
                style: {
                    maxWidth: 80,
                    fill: (data: any, index: number) => colors[index]
                },
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
                shapeField: 'line',
                style: { lineWidth: 2, stroke: '#ffc53d', fill: 'rgba(255,255,255,0)' },
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

    return (<>
        <div className="zone_result_size_n_export">
            <div></div>
            <ExportBtn
                loading={pdfInstante.loading}
                disabled={!workers.length}
                onClick={exportChartToPDF} />
        </div>

        {!workers.length && !isLoading ?
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
