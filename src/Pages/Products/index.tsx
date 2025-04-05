import React, { useEffect, useState } from "react";
import { Button, Table, Input, Space, Avatar } from "antd";
import { QueryClient, useQuery } from "react-query";
import { UserOutlined } from "@ant-design/icons";
import { getProducts, getUnitsProducts } from "../../services/products.service";
import SidebarProducts from "../../components/SidebarProduct";

const { Search } = Input;

export default function ManagerProductsPage() {
  const [selected, setSelectedRows]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [filters, setFilters] = useState([]);
  const [itemSelected, setItemSelected] = useState(null);
  const [sortOrder, setSortOrder]: any = useState(null);
  const [sorter, setSorter]: any = useState(null);
  const [filterSelected, setFilterSelected] = useState(null);
  const [reloadQuery, setReloadQuery] = useState(0);
  const queryClient = new QueryClient();

  const { data: dataProducts } = useQuery(
    ["products", page, perPage, search, sorter, filterSelected, reloadQuery],
    async () => {
      return await getProducts(page, perPage, search, sorter, filterSelected);
    }
  );

  const { data: dataUnitProducts } = useQuery(
    ["units-products", reloadQuery],
    getUnitsProducts,
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (filters?.unit?.length > 0) {
      setFilterSelected(filters.unit);
      queryClient.invalidateQueries("products");
      return;
    } else if (filters?.unit == null || filters?.unit?.length === 0) {
      setFilterSelected(null);
      queryClient.invalidateQueries("products");
    }

    if (sorter.field) {
      const { field, order }: { field: any, order: string|null } = sorter;
      const sortDirection =
        order === "ascend" ? "asc" : order === "descend" ? "desc" : null;

      setSorter({ field, sortDirection });
      setSortOrder(order);
      queryClient.invalidateQueries("products");
      return;
    }
  };

  function handlePageChange(newPage: any) {
    setPage(newPage);
    queryClient.invalidateQueries("products");
  }

  function handleSizePageChange(current: any, size: any) {
    setPerPage(size);
    setPage(1);
    queryClient.invalidateQueries("products");
  }

  const onSearch = (value: any) => {
    if (value) {
      setSearchLoading(true);
      setSearch(value);
      setPage(1);
      queryClient.invalidateQueries("products");
    }
  };

  useEffect(() => {
    if (dataUnitProducts && dataUnitProducts.length > 0) {
      setFilters(dataUnitProducts.map((unit: any) => ({ text: unit, value: unit })));
    }
  }, [dataUnitProducts]);

  useEffect(() => {
    if (dataProducts && dataProducts.data.length > 0) {
      setTotal(dataProducts.total);

      const newData = dataProducts.data.map((item: any, index: any) => {
        return {
          key: index,
          id: item.id,
          name: item.name.trim(),
          erp_product_id: item.erp_product_id,
          unit: item.sell_unit,
          avg_price: isNumber(item.avg_price) ? item.avg_price : 0,
          images: item?.images.length ? item.images[0].image_url : null,
          active: item.active,
        };
      });

      setItems(newData);
      setSearchLoading(false);
    }

    if (dataProducts && dataProducts.data.length === 0) {
      setItems([]);
      setSearchLoading(false);
    }
  }, [dataProducts]);

  const columns = [
    {
      width: 50,
      render: (_: any, record: any) => {
        return (
          <Space>
            {record.images ? (
              <Avatar shape="square" size="large" src={record.images} />
            ) : (
              <Avatar shape="square" size="large" icon={<UserOutlined />} />
            )}
          </Space>
        );
      },
    },
    {
      title: "Descrição",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "Artigo",
      dataIndex: "erp_product_id",
      sorter: true,
    },
    {
      title: "Unidade",
      dataIndex: "unit",
      filters: filters,
      render: (_: any, record: any) => {
        return (
          <Space>
            <span>{record?.unit}</span>
          </Space>
        );
      },
    },
    {
      title: "Preço",
      dataIndex: "avg_price",
      sorter: true,
      render: (_: any, record: any) => {
        return (
          <Space>
            <span>
              {formatPrice(
                record?.avg_price && isNumber(record.avg_price)
                  ? record.avg_price
                  : 0
              )}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Ação",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button onClick={() => editProduct(record.id, record)} type="link">
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  function isNumber(value: any) {
    return !isNaN(value);
  }

  const isFloat = (number: any) => {
    return !!(number % 1);
  };

  const formatPrice = (price: any) => {
    return price.toLocaleString("pt-PT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      if (selectedRowKeys.length === 0) {
        setSelectedRows([]);
        return;
      }

      setSelectedRows(selectedRowKeys);
    },
  };

  const editProduct: any = (id: any, item: any) => {
    if (typeof id != "number" && selected.length > 0) {
      setLoading(true);
      setOpen(true);
    } else {
      setSelectedRows([id]);
      setItemSelected(item);
      setOpen(true);
    }
  };

  const onCloseDrawer = (isSuccess: any) => {
    setSelectedRows([]);
    setItemSelected(null);
    setLoading(false);
    setOpen(false);
    setReloadQuery((prevValue) => prevValue + 1);

    if (isSuccess) {
      queryClient.invalidateQueries("products");
      queryClient.invalidateQueries("units-products");
    }
  };

  const hasSelected = selected.length > 0;

  return (
    <div style={{ margin: 16 }}>
      <Space
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Space>
          {hasSelected
            ? `
                        ${selected.length}
                        ${
                          selected.length > 1
                            ? "Produtos selecionados"
                            : "Produto selecionado"
                        }`
            : ""}
        </Space>
        <Space>
          <Search
            placeholder="Pesquisa"
            allowClear
            onSearch={onSearch}
            loading={searchLoading}
            size="large"
          />
          <Button
            type="primary"
            onClick={editProduct}
            disabled={!hasSelected}
            loading={loading}
            size="large"
          >
            Editar
          </Button>
        </Space>
      </Space>
      <Table
        key={reloadQuery}
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={items}
        sortDirections={["ascend", "descend"]}
        onChange={handleTableChange}
        pagination={{
          current: page,
          total: total,
          pageSize: perPage,
          onChange: handlePageChange,
          showSizeChanger: true,
          onShowSizeChange: handleSizePageChange,
        }}
      />
      {open && (
        <SidebarProducts
          open={open}
          onClose={onCloseDrawer}
          ids={selected}
          itemSelected={itemSelected}
        />
      )}
    </div>
  );
}
