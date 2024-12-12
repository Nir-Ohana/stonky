import React, { useEffect, useState } from 'react';
import { Table, Spin, Tooltip, Checkbox, Dropdown, Button, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const POLLING_INTERVAL = 30000;

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState([]);

  // Initialize visible columns
  useEffect(() => {
    setVisibleColumns(columns.map(col => col.key || col.dataIndex));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          'https://api.github.com/repos/Nir-Ohana/stonky/contents/src/stock_analysis_report.json',
          {
            headers: { Accept: 'application/vnd.github.v3+json' },
          }
        );

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        const decodedData = JSON.parse(atob(data.content));
        setData(decodedData);
      } catch (error) {
        console.error('Error fetching the JSON data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const extractFirstParagraph = summary => {
    if (!summary) return '';
    const match = summary.includes(' Inc.')
      ? summary.match(/^(.*?\.\s)/)
      : summary.match(/^(.*?\.\s)/);
    return match ? match[0].trim() : summary;
  };

  const createFilters = key =>
    [...new Set(data.map(item => item[key]))].map(value => ({
      text: value,
      value,
    }));

  const parseNumber = value => parseFloat(value.replace(/%|,/g, '')) || 0;

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'Company Name',
      key: 'Company Name',
      sorter: (a, b) => a['Company Name'].localeCompare(b['Company Name']),
      filters: createFilters('Company Name'),
      onFilter: (value, record) => record['Company Name'].includes(value),
      render: (text, record) => (
        <Tooltip title={extractFirstParagraph(record['Company Summary'])}>
          <a
            href={`https://finance.yahoo.com/quote/${record.Symbol}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        </Tooltip>
      ),
    },
    {
      title: 'Symbol',
      dataIndex: 'Symbol',
      key: 'Symbol',
      sorter: (a, b) => a.Symbol.localeCompare(b.Symbol),
      filters: createFilters('Symbol'),
      onFilter: (value, record) => record.Symbol.includes(value),
    },
    {
      title: 'Current Price',
      dataIndex: 'Current Price',
      key: 'Current Price',
      sorter: (a, b) => a['Current Price'] - b['Current Price'],
    },
    {
      title: 'Latest MA',
      dataIndex: 'Latest MA',
      key: 'Latest MA',
      sorter: (a, b) => a['Latest MA'] - b['Latest MA'],
    },
    {
      title: 'Price Target',
      dataIndex: 'Price Target',
      key: 'Price Target',
      sorter: (a, b) => a['Price Target'] - b['Price Target'],
    },
    {
      title: 'Difference from MA',
      dataIndex: 'Difference from MA',
      key: 'Difference from MA',
      sorter: (a, b) => parseNumber(a['Difference from MA']) - parseNumber(b['Difference from MA']),
    },
    {
      title: 'Difference from Open',
      dataIndex: 'Difference from Open',
      key: 'Difference from Open',
      sorter: (a, b) => parseNumber(a['Difference from Open']) - parseNumber(b['Difference from Open']),
    },
    {
      title: 'Change from Yesterday',
      dataIndex: 'Change from Yesterday',
      key: 'Change from Yesterday',
      sorter: (a, b) => parseNumber(a['Change from Yesterday']) - parseNumber(b['Change from Yesterday']),
    },
    {
      title: 'Change from Last Report',
      dataIndex: 'Change from Last Report',
      key: 'Change from Last Report',
      sorter: (a, b) => a['Change from Last Report'] - b['Change from Last Report'],
      render: value => `${parseFloat(value).toFixed(2)}%`,
    },
    {
      title: 'Latest Volume',
      dataIndex: 'Latest Volume',
      key: 'Latest Volume',
      sorter: (a, b) => parseNumber(a['Latest Volume']) - parseNumber(b['Latest Volume']),
    },
    {
      title: 'Market Cap',
      dataIndex: 'Market Cap',
      key: 'Market Cap',
      sorter: (a, b) => parseNumber(a['Market Cap']) - parseNumber(b['Market Cap']),
    },
    {
      title: 'Earning Date',
      dataIndex: 'Earning Date',
      key: 'Earning Date',
      sorter: (a, b) => new Date(a['Earning Date']) - new Date(b['Earning Date']),
      filters: createFilters('Earning Date'),
      onFilter: (value, record) => record['Earning Date'] === value,
    },
  ];

  const rowClassName = record =>
    record['Row Color'] === 'positive-row'
      ? 'positive-row'
      : record['Row Color'] === 'negative-row'
      ? 'negative-row'
      : '';

  const filteredColumns = columns.filter(col =>
    visibleColumns.includes(col.key || col.dataIndex)
  );

  const handleColumnChange = checkedValues => {
    setVisibleColumns(checkedValues);
  };

  const columnMenu = (
    <Menu>
      <Checkbox.Group
        value={visibleColumns}
        onChange={handleColumnChange}
        style={{ padding: '10px' }}
      >
        {columns.map(col => (
          <Checkbox key={col.key || col.dataIndex} value={col.key || col.dataIndex}>
            {col.title}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </Menu>
  );

  return (
    <Spin spinning={loading} tip="Loading data...">
      <div style={{ padding: 20 }}>
        {data.length > 0 && (
          <div style={{ marginTop: 20, textAlign: 'left', fontStyle: 'italic' }}>
            Last Updated: {data[0]['Last Updated']}
          </div>
        )}
        <div style={{ marginBottom: 10, textAlign: 'right' }}>
          <Dropdown overlay={columnMenu} trigger={['click']}>
            <Button>
              Toggle Columns <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <Table
          dataSource={data}
          columns={filteredColumns}
          rowKey="Symbol"
          rowClassName={rowClassName}
          pagination={false}
          showSorterTooltip={false}
        />
      </div>
    </Spin>
  );
};

export default App;
