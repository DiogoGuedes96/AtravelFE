import { Select, Table, DatePicker, Col, Row } from "antd";

export default function LastSalesBar({
  values = [],
  handleFilterDays,
  handleFilterDateRange,
  handleTableChange,
}: any) {

  const columns: any = [
    {
      title: "Descrição",
      dataIndex: "description",
      sorter: (a: any, b: any) => a.description.localeCompare(b.description),
      sortDirections: ["ascend", "descend"],
      align: "left",
    },
    {
      title: "Data",
      dataIndex: "date",
      sorter: true,
      align: "right",
    },
    {
      title: "Quantidade",
      dataIndex: "quantity",
      sorter: (a: any, b: any) => a.quantity - b.quantity,
      align: "right",
    },
  ];

  const selectDays = [
    {
      value: 7,
      label: "7 dias",
    },
    {
      value: 15,
      label: "15 dias",
    },
    {
      value: 30,
      label: "1 mês",
    },
  ];

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <Row style={{ paddingBottom: 16 }}>
        <Col flex={2}>
          <Select
            style={{ width: "100%" }}
            defaultValue="7"
            size="large"
            onChange={handleFilterDays}
            options={selectDays}
          />
        </Col>
        <Col offset={1} flex={3}>
          <DatePicker.RangePicker
            style={{ width: "100%" }}
            size="large"
            onChange={handleFilterDateRange}
          />
        </Col>
      </Row>
      <Table
        columns={columns}
        pagination={{
            position: ["bottomRight"]
        }}
        sortDirections={["ascend", "descend"]}
        onChange={handleTableChange}
        dataSource={
          values
            ? values.map((product: any) => {
                return {
                  key: product.id,
                  description: product.name,
                  date: formatDate(product.order_at),
                  quantity: product.quantity,
                };
              })
            : []
        }
      />
    </div>
  );
}
