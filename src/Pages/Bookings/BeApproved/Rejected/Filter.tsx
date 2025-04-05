import { Button, DatePicker, Form, Input } from "antd"
import { RangePickerProps } from "antd/es/date-picker";

const { Search } = Input;

export default function FilterRejected(props: any) {
    const {
        formSearch,
        setCurrentPage,
        setSearch,
        formFilter,
        setStartDate,
        setEndDate,
        startDate,
        endDate,
    } = props

    const onFilter = () => {
        setCurrentPage(1);
        let start_date = formFilter.getFieldValue('filter_start_date');
        let end_date = formFilter.getFieldValue('filter_end_date');

        setStartDate(start_date ? start_date.format('YYYY-MM-DD') : '');
        setEndDate(end_date ? end_date.format('YYYY-MM-DD') : '');
    };

    const onSearch = (search_value: any) => {
        setCurrentPage(1);
        setSearch(search_value);
    };

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

    const onClearFilters = () => {
        setCurrentPage(1);
        setStartDate('');
        setEndDate('');
    };

    return (
        <>
            <div className="search_bar">
                <Form
                    form={formSearch}
                    name="search_bookings"
                    layout="vertical"
                    className="form_search_horizontal"
                    autoComplete="off">

                    <Form.Item name="search_booking" className="item_search">
                        <Search placeholder="Pesquisa por nome do cliente, n° reserva ou referência" enterButton="Pesquisar"
                        allowClear size="large" maxLength={255} onSearch={onSearch} />
                    </Form.Item>
                </Form>
            </div>

            <div className="filter_bar">
                <Form
                    form={formFilter}
                    name="filter_bookings"
                    layout="vertical"
                    className="form_filter_horizontal"
                    autoComplete="off">
                    <Form.Item label="Data início" name="filter_start_date" className="item_filter">
                        <DatePicker size="large" placeholder="dd/mm/aaaa" showToday={false}
                            format={'DD/MM/YYYY'} disabledDate={disabledStartDate} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Data fim" name="filter_end_date" className="item_filter">
                        <DatePicker size="large" placeholder="dd/mm/aaaa" showToday={false}
                            format={'DD/MM/YYYY'} disabledDate={disabledEndDate} style={{ width: '100%' }} />
                    </Form.Item>

                    <Button onClick={onFilter} size="large">Filtrar</Button>
                    
                    {(startDate || endDate)
                        && <Button type="link" onClick={onClearFilters} size="large">Limpar</Button>
                    }
                </Form>
            </div>
        </>
    )
}   