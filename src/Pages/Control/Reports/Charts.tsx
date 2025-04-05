import { DatePicker, Form, Segmented, Select } from "antd";
import { useEffect, useState } from "react";
import GeneralChart from "./GeneralChart";
import IndividualChart from "./IndividualChart";
import { RangePickerProps } from "antd/es/date-picker";

enum Segments {
    GENERAL = 'general',
    INDIVIDUAL = 'individual'
}

export default function Charts(props: any) {
    const [segment, setSegment] = useState<string | number>(Segments.GENERAL);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [workerId, setWorkerId] = useState<number | string | undefined>('');
    const [workersId, setWorkersId] = useState<number | (number | string)[]>([]);

    const [formFilter] = Form.useForm();

    const years = () => {
        let startYear = 2024;
        const currentYear = new Date().getFullYear();
        const years = [];

        while (startYear <= currentYear) {
            years.push({
                value: startYear,
                label: startYear
            });

            startYear++;
        }

        return years;
    }

    const months = [
        { label: 'Todos', value: '' },
        { label: 'Janeiro', value: '01' },
        { label: 'Fevereiro', value: '02' },
        { label: 'Março', value: '03' },
        { label: 'Abril', value: '04' },
        { label: 'Maio', value: '05' },
        { label: 'Junho', value: '06' },
        { label: 'Julho', value: '07' },
        { label: 'Agosto', value: '08' },
        { label: 'Setembro', value: '09' },
        { label: 'Outubro', value: '10' },
        { label: 'Novembro', value: '11' },
        { label: 'Dezembro', value: '12' },
    ];

    const colors = [
        '#f1dd1c', '#6d2fd0', '#e9b20c', '#4d73fe', '#76c12b', '#acd826', '#d9421d', '#4750ea', '#67bec3', '#e59401', '#e06400', '#eb2f96', '#d24692'
    ];

    const disabledStartDate: RangePickerProps['disabledDate'] = (current) => {
        let endDate = formFilter.getFieldValue('filter_end_date');

        if (endDate) {
            return current >= endDate;
        }

        return false;
    };

    const disabledEndDate: RangePickerProps['disabledDate'] = (current) => {
        let startDate = formFilter.getFieldValue('filter_start_date');

        if (startDate) {
            return current <= startDate;
        }

        return false;
    };

    const onFilterWorker = () => {
        if (segment == Segments.GENERAL) {
            setWorkersId(formFilter.getFieldValue(props.workerFilter));
        } else {
            setWorkerId(formFilter.getFieldValue(props.workerFilter));
        }
    };

    const onFilterYear = () => {
        setYear(formFilter.getFieldValue('filter_year') || new Date().getFullYear());
    };

    const onFilterStartDate = () => {
        let start_date = formFilter.getFieldValue('filter_start_date');
        setStartDate(start_date ? start_date.format('YYYY-MM-DD') : '');
    };

    const onFilterEndDate = () => {
        let end_date = formFilter.getFieldValue('filter_end_date');
        setEndDate(end_date ? end_date.format('YYYY-MM-DD') : '');
    };


    useEffect(() => {
        if (!startDate) {
            formFilter.setFieldValue('filter_start_date', '');
        }

        if (!endDate) {
            formFilter.setFieldValue('filter_end_date', '');
        }

        formFilter.setFieldsValue({
            filter_year: year,
            [props.workerFilter]: segment == Segments.GENERAL ? workersId : workerId
        });
    }, [startDate, endDate, year, workerId, workersId]);

    useEffect(() => {
        formFilter.setFieldsValue({
            filter_year: new Date().getFullYear(),
            filter_start_date: '',
            filter_end_date: '',
            [props.workerFilter]: segment == Segments.GENERAL ? [] : undefined
        });
    }, []);

    useEffect(() => {
        formFilter.setFieldValue(props.workerFilter, segment == Segments.GENERAL ? [] : '');
        setWorkerId(undefined);
        setWorkersId([]);
    }, [segment]);

    return (<>
        <div className="filter_bar" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Segmented value={segment} options={[
                { label: 'Geral', value: 'general', },
                { label: 'Individual', value: 'individual' }
            ]}
                onChange={(value: string | number) => setSegment(value)} />

            <Form
                form={formFilter}
                name="filter_services"
                layout="vertical"
                className="form_filter_horizontal"
                autoComplete="off">
                {segment == Segments.GENERAL
                    ? <>
                        <Form.Item name="filter_start_date" label="Data início" className='item_filter'>
                            <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}
                                disabledDate={disabledStartDate} onChange={onFilterStartDate} />
                        </Form.Item>

                        <Form.Item name="filter_end_date" label="Data fim" className='item_filter'>
                            <DatePicker size="large" placeholder="dd/mm/aaaa" format={"DD/MM/YYYY"}
                                disabledDate={disabledEndDate} onChange={onFilterEndDate} />
                        </Form.Item>
                    </>
                    : <Form.Item label="Ano" name="filter_year" className="item_filter">
                        <Select value={year} style={{ width: 100 }} size="large" options={years()}
                            onChange={onFilterYear} />
                    </Form.Item>
                }

                <Form.Item label={props.label} name={props.workerFilter} className="item_filter">
                    <Select placeholder={segment == Segments.GENERAL ? 'Todos' : 'Selecione o operador'}
                        size="large" style={{ width: 350 }} value={segment == Segments.GENERAL ? workersId : workerId} maxTagCount="responsive"
                        onChange={onFilterWorker} mode={segment == Segments.GENERAL ? 'multiple' : undefined}>
                        {props.workers?.data?.map((item: any) => (
                            <Select.Option key={item.data.id} value={item.data.id}>{item.data.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </div>

        {segment == Segments.GENERAL &&
            <GeneralChart
                type={props.type}
                workerId={workersId}
                startDate={startDate}
                endDate={endDate}
                colors={colors} />}

        {segment == Segments.INDIVIDUAL &&
            <IndividualChart
                type={props.type}
                workerId={workerId}
                year={year} />}
    </>)
}
