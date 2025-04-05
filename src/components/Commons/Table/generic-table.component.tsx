import { Button, Empty, Table } from "antd";
import { ColumnProps } from "antd/es/table";
import {
  FilterValue,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import { PaginationProps } from "antd/lib";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface TableParams {
  pagination?: PaginationProps;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue | null>;
}

interface DataSource {
  [key: string]: any;
}

interface IEmpty {
  createTheFirst: boolean,
  textOne: string,
  textTwo: string,
  link: string | any,
  createText?: string
}

interface ListParameters {
  columns: ColumnProps<any>[];
  dataSource: DataSource[];
  rowSelection?: any;
  loading: boolean;
  pagination?: PaginationProps;
  totalChildren?: ReactNode;
  empty?: IEmpty;
  expandable?: any;
  scroll?: object | undefined;
  c?: object | undefined;
  handleTableChange?: (pagination: PaginationProps, filters: Record<string, FilterValue | null>, sorter: any) => void;
}

export default function GenericTable({
  columns,
  dataSource,
  loading,
  pagination,
  totalChildren,
  empty,
  expandable,
  scroll,
  rowSelection,
  handleTableChange
}: ListParameters) {
  const [data, setData] = useState<DataSource[]>(dataSource);
  const [tableParams, setTableParams] = useState<TableParams>({});

  const navigate = useNavigate();

  useEffect(() => {
    setData(dataSource);

    if (pagination) {
      setTableParams({
        pagination
      })
    }

  }, [dataSource, pagination]);

  const handleTableChangeDefault = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: any,
    extra: TableCurrentDataSource<DataSource>
  ) => {
    setTableParams({
      filters,
      ...sorter,
    });

    let data: DataSource[] = [];

    if (extra.action === "sort") {
      const isAscending = sorter.order === "ascend";
      const sorterKey = sorter.columnKey;

      data = extra.currentDataSource.sort((a, b) => {
        const propertyA = a[sorterKey];
        const propertyB = b[sorterKey];

        if (isAscending) {
          if (propertyA < propertyB) return -1;
          if (propertyA > propertyB) return 1;
          return 0;
        } else {
          if (propertyA > propertyB) return -1;
          if (propertyA < propertyB) return 1;
          return 0;
        }
      });
    }

    setData(data);
  };

  const toPage = (page: string) => {
    navigate(page);
  };

  return (
    <>
      {totalChildren}
      <Table
        columns={columns}
        dataSource={data}
        pagination={pagination ? {...tableParams.pagination, position: ['bottomLeft']} : false}
        loading={loading}
        rowSelection={rowSelection || null}
        onChange={handleTableChange ?? handleTableChangeDefault}
        locale={{
          emptyText: !loading && empty?.createTheFirst === true
            ? (
              <Empty
                image="/empty-table.svg"
                imageStyle={{ height: 85 }}
                description={
                  <span style={{ color: 'rgba(0, 0, 0, 0.25)', fontSize: 14 }}>
                    {empty?.textOne}
                    <br />
                    {empty?.textTwo}
                  </span>
                }>
                {empty?.link &&
                  <Button type="primary" size="large" onClick={() => {
                    if (typeof empty?.link == 'function') {
                      empty?.link()
                    } else {
                      toPage(empty?.link);
                    }
                  }}>{empty?.createText || 'Criar novo'}</Button>
                }
              </Empty>
            ) : null,
          triggerDesc: 'Organizar por descendente',
          triggerAsc: 'Organizar por ascendente', 
          cancelSort: 'Cancelar organização'
        }}
        expandable={expandable}
        scroll={scroll}
      /> 
    </>
  );
}
