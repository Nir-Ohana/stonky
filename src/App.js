import React, { useEffect, useState } from 'react';
import { Table, Spin, Tooltip } from 'antd';

const POLLING_INTERVAL = 30000;

const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let intervalId;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    'https://api.github.com/repos/Nir-Ohana/stonky/contents/src/stock_analysis_report.json',
                    {
                        headers: {
                            Accept: 'application/vnd.github.v3+json',
                        },
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

        intervalId = setInterval(() => {
            fetchData();
        }, POLLING_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const columns = [
        {
            title: (
                <Tooltip title="The name of the company">
                    <div style={{ width: '100%' }}>Company Name</div>
                </Tooltip>
            ),
            dataIndex: 'Company Name',
            key: 'Company Name',
            sorter: (a, b) => a['Company Name'].localeCompare(b['Company Name']),
            filters: [...new Set(data.map(item => item['Company Name']))].map(name => ({ text: name, value: name })),
            onFilter: (value, record) => record['Company Name'].includes(value),
            render: (text, record) => (
                <Tooltip title={`Information about ${record['Company Name']}`}>
                    <a href={`https://finance.yahoo.com/quote/${record.Symbol}/`} target="_blank" rel="noopener noreferrer">
                        {text}
                    </a>
                </Tooltip>
            )
        },
        {
            title: (
                <Tooltip title="The stock symbol">
                    <div style={{ width: '100%' }}>Symbol</div>
                </Tooltip>
            ),
            dataIndex: 'Symbol',
            key: 'Symbol',
            sorter: (a, b) => a.Symbol.localeCompare(b.Symbol),
            filters: [...new Set(data.map(item => item.Symbol))].map(symbol => ({ text: symbol, value: symbol })),
            onFilter: (value, record) => record.Symbol.includes(value)
        },
        {
            title: (
                <Tooltip title="The current stock price">
                    <div style={{ width: '100%' }}>Current Price</div>
                </Tooltip>
            ),
            dataIndex: 'Current Price',
            key: 'Current Price',
            sorter: (a, b) => a['Current Price'] - b['Current Price']
        },
        {
            title: (
                <Tooltip title="The latest moving average">
                    <div style={{ width: '100%' }}>Latest MA</div>
                </Tooltip>
            ),
            dataIndex: 'Latest MA',
            key: 'Latest MA',
            sorter: (a, b) => a['Latest MA'] - b['Latest MA']
        },
        {
            title: (
                <Tooltip title="The target price">
                    <div style={{ width: '100%' }}>Price Target</div>
                </Tooltip>
            ),
            dataIndex: 'Price Target',
            key: 'Price Target',
            sorter: (a, b) => a['Price Target'] - b['Price Target']
        },
        {
            title: (
                <Tooltip title="Difference from moving average">
                    <div style={{ width: '100%' }}>Difference from MA</div>
                </Tooltip>
            ),
            dataIndex: 'Difference from MA',
            key: 'Difference from MA',
            sorter: (a, b) => parseFloat(a['Difference from MA'].replace('%', '')) - parseFloat(b['Difference from MA'].replace('%', ''))
        },
        {
            title: (
                <Tooltip title="Difference from opening price">
                    <div style={{ width: '100%' }}>Difference from Open</div>
                </Tooltip>
            ),
            dataIndex: 'Difference from Open',
            key: 'Difference from Open',
            defaultSortOrder: 'descend',
            sorter: (a, b) => parseFloat(a['Difference from Open'].replace('%', '')) - parseFloat(b['Difference from Open'].replace('%', ''))
        },
        {
            title: (
                <Tooltip title="Change from the previous day">
                    <div style={{ width: '100%' }}>Change from Yesterday</div>
                </Tooltip>
            ),
            dataIndex: 'Change from Yesterday',
            key: 'Change from Yesterday',
            sorter: (a, b) => parseFloat(a['Change from Yesterday'].replace('%', '')) - parseFloat(b['Change from Yesterday'].replace('%', ''))
        },
        {
            title: (
                <Tooltip title="Change from the last report">
                    <div style={{ width: '100%' }}>Change from Last Report</div>
                </Tooltip>
            ),
            dataIndex: 'Change from Last Report',
            key: 'Change from Last Report',
            sorter: (a, b) => a['Change from Last Report'] - b['Change from Last Report'],
            render: (value) => `${parseFloat(value).toFixed(2)}%`
        },
        {
            title: (
                <Tooltip title="Latest trading volume">
                    <div style={{ width: '100%' }}>Latest Volume</div>
                </Tooltip>
            ),
            dataIndex: 'Latest Volume',
            key: 'Latest Volume',
            sorter: (a, b) => parseInt(a['Latest Volume'].replace(/,/g, '')) - parseInt(b['Latest Volume'].replace(/,/g, ''))
        },
        {
            title: (
                <Tooltip title="Market capitalization">
                    <div style={{ width: '100%' }}>Market Cap</div>
                </Tooltip>
            ),
            dataIndex: 'Market Cap',
            key: 'Market Cap',
            sorter: (a, b) => parseInt(a['Market Cap'].replace(/,/g, '')) - parseInt(b['Market Cap'].replace(/,/g, ''))
        },
        {
            title: (
                <Tooltip title="Date of the next earnings report">
                    <div style={{ width: '100%' }}>Earning Date</div>
                </Tooltip>
            ),
            dataIndex: 'Earning Date',
            key: 'Earning Date',
            sorter: (a, b) => new Date(a['Earning Date']) - new Date(b['Earning Date']),
            filters: [...new Set(data.map(item => item['Earning Date']))].map(date => ({ text: date, value: date })),
            onFilter: (value, record) => record['Earning Date'] === value
        },
        {
            title: (
                <Tooltip title="Time of the next earnings report">
                    <div style={{ width: '100%' }}>Earning Time</div>
                </Tooltip>
            ),
            dataIndex: 'Earning Time',
            key: 'Earning Time',
            sorter: (a, b) => a['Earning Time'].localeCompare(b['Earning Time']),
            filters: [...new Set(data.map(item => item['Earning Time']))].map(time => ({ text: time, value: time })),
            onFilter: (value, record) => record['Earning Time'] === value
        },
        {
            title: (
                <Tooltip title="Day of the week for the earnings report">
                    <div style={{ width: '100%' }}>Earning Day of Week</div>
                </Tooltip>
            ),
            dataIndex: 'Earning Day of Week',
            key: 'Earning Day of Week',
            sorter: (a, b) => a['Earning Day of Week'].localeCompare(b['Earning Day of Week']),
            filters: [...new Set(data.map(item => item['Earning Day of Week']))].map(day => ({ text: day, value: day })),
            onFilter: (value, record) => record['Earning Day of Week'] === value
        },
        {
            title: (
                <Tooltip title="Price-to-earnings ratio">
                    <div style={{ width: '100%' }}>PE Ratio</div>
                </Tooltip>
            ),
            dataIndex: 'PE Ratio',
            key: 'PE Ratio',
            sorter: (a, b) => a['PE Ratio'] - b['PE Ratio'],
            render: (value) => value.toFixed(2)
        },
        {
            title: (
                <Tooltip title="Return on equity">
                    <div style={{ width: '100%' }}>ROE</div>
                </Tooltip>
            ),
            dataIndex: 'ROE',
            key: 'ROE',
            sorter: (a, b) => {
                const valA = typeof a['ROE'] === 'number' ? a['ROE'] : -Infinity;
                const valB = typeof b['ROE'] === 'number' ? b['ROE'] : -Infinity;
                return valA - valB;
            },
            render: (value) => {
                if (typeof value === 'number') {
                    return `${(value * 100).toFixed(2)}%`;
                }
                return value;
            }
        },
        {
            title: (
                <Tooltip title="Debt-to-equity ratio">
                    <div style={{ width: '100%' }}>DTE</div>
                </Tooltip>
            ),
            dataIndex: 'DTE',
            key: 'DTE',
            sorter: (a, b) => {
                const valA = typeof a['DTE'] === 'number' ? a['DTE'] : -Infinity;
                const valB = typeof b['DTE'] === 'number' ? b['DTE'] : -Infinity;
                return valA - valB;
            },
            render: (value) => {
                if (typeof value === 'number') {
                    return value.toFixed(2);
                }
                return value;
            }
        },
        {
            title: (
                <Tooltip title="Overall sentiment towards the stock">
                    <div style={{ width: '100%' }}>Stock Sentiment</div>
                </Tooltip>
            ),
            dataIndex: 'Stock Sentiment',
            key: 'Stock Sentiment',
            sorter: (a, b) => a['Stock Sentiment'].localeCompare(b['Stock Sentiment']),
            filters: [...new Set(data.map(item => item['Stock Sentiment']))].map(sentiment => ({ text: sentiment, value: sentiment })),
            onFilter: (value, record) => record['Stock Sentiment'].includes(value)
        },
        {
            title: (
                <Tooltip title="Row highlight color">
                    <div style={{ width: '100%' }}>Row Color</div>
                </Tooltip>
            ),
            dataIndex: 'Row Color',
            key: 'Row Color',
            sorter: (a, b) => a['Row Color'].localeCompare(b['Row Color']),
            filters: [...new Set(data.map(item => item['Row Color']))].map(color => ({ text: color, value: color })),
            onFilter: (value, record) => record['Row Color'].includes(value)
        },
    ];

    const rowClassName = (record) => {
        return record['Row Color'] === 'positive-row' ? 'positive-row' : record['Row Color'] === 'negative-row' ? 'negative-row' : '';
    };

    const lastUpdated = data.length > 0 ? data[0]['Last Updated'] : null;

    return (
        <Spin spinning={loading} tip="Loading data...">
            <div style={{ padding: 20 }}>
                {lastUpdated && (
                    <div style={{ marginTop: 20, textAlign: 'left', fontStyle: 'italic' }}>
                        Last Updated: {lastUpdated}
                    </div>
                )}
                <Table dataSource={data} columns={columns} loading={loading} rowKey="Symbol" rowClassName={rowClassName} pagination={false} showSorterTooltip={false} />
            </div>
        </Spin>
    );
};

export default App;
