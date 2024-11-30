import React, { useEffect, useState } from 'react';
import { Table, Spin } from 'antd';

const POLLING_INTERVAL = 30000;

const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let intervalId;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://raw.githubusercontent.com/Nir-Ohana/stonky/main/src/stock_analysis_report.json', {
                    cache: 'no-store',
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const rawData = await response.json();
                setData(rawData);
            } catch (error) {
                console.error('Error fetching the JSON data', error);
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
            title: 'Company Name',
            dataIndex: 'Company Name',
            key: 'Company Name',
            sorter: (a, b) => a['Company Name'].localeCompare(b['Company Name']),
            filters: [...new Set(data.map(item => item['Company Name']))].map(name => ({ text: name, value: name })),
            onFilter: (value, record) => record['Company Name'].includes(value),
            render: (text, record) => (
                <a href={`https://finance.yahoo.com/quote/${record.Symbol}/`} target="_blank" rel="noopener noreferrer">
                    {text}
                </a>
            )
        },
        {
            title: 'Symbol',
            dataIndex: 'Symbol',
            key: 'Symbol',
            sorter: (a, b) => a.Symbol.localeCompare(b.Symbol),
            filters: [...new Set(data.map(item => item.Symbol))].map(symbol => ({ text: symbol, value: symbol })),
            onFilter: (value, record) => record.Symbol.includes(value)
        },
        {
            title: 'Current Price',
            dataIndex: 'Current Price',
            key: 'Current Price',
            sorter: (a, b) => a['Current Price'] - b['Current Price']
        },
        {
            title: 'Latest MA',
            dataIndex: 'Latest MA',
            key: 'Latest MA',
            sorter: (a, b) => a['Latest MA'] - b['Latest MA']
        },
        {
            title: 'Price Target',
            dataIndex: 'Price Target',
            key: 'Price Target',
            sorter: (a, b) => a['Price Target'] - b['Price Target']
        },
        {
            title: 'Difference from MA',
            dataIndex: 'Difference from MA',
            key: 'Difference from MA',
            sorter: (a, b) => parseFloat(a['Difference from MA'].replace('%', '')) - parseFloat(b['Difference from MA'].replace('%', ''))
        },
        {
            title: 'Difference from Open',
            dataIndex: 'Difference from Open',
            key: 'Difference from Open',
            defaultSortOrder: 'descend',
            sorter: (a, b) => parseFloat(a['Difference from Open'].replace('%', '')) - parseFloat(b['Difference from Open'].replace('%', ''))
        },
        {
            title: 'Change from Yesterday',
            dataIndex: 'Change from Yesterday',
            key: 'Change from Yesterday',
            sorter: (a, b) => parseFloat(a['Change from Yesterday'].replace('%', '')) - parseFloat(b['Change from Yesterday'].replace('%', ''))
        },
        {
            title: 'Change from Last Report',
            dataIndex: 'Change from Last Report',
            key: 'Change from Last Report',
            sorter: (a, b) => a['Change from Last Report'] - b['Change from Last Report'],
            render: (value) => `${parseFloat(value).toFixed(2)}%`
        },
        {
            title: 'Latest Volume',
            dataIndex: 'Latest Volume',
            key: 'Latest Volume',
            sorter: (a, b) => parseInt(a['Latest Volume'].replace(/,/g, '')) - parseInt(b['Latest Volume'].replace(/,/g, ''))
        },
        {
            title: 'Market Cap',
            dataIndex: 'Market Cap',
            key: 'Market Cap',
            sorter: (a, b) => parseInt(a['Market Cap'].replace(/,/g, '')) - parseInt(b['Market Cap'].replace(/,/g, ''))
        },
        {
            title: 'Earning Date',
            dataIndex: 'Earning Date',
            key: 'Earning Date',
            sorter: (a, b) => new Date(a['Earning Date']) - new Date(b['Earning Date']),
            filters: [...new Set(data.map(item => item['Earning Date']))].map(date => ({ text: date, value: date })),
            onFilter: (value, record) => record['Earning Date'] === value
        },
        {
        title: 'Earning Time',
        dataIndex: 'Earning Time',
        key: 'Earning Time',
        sorter: (a, b) => a['Earning Time'].localeCompare(b['Earning Time']),
        filters: [...new Set(data.map(item => item['Earning Time']))].map(time => ({ text: time, value: time })),
        onFilter: (value, record) => record['Earning Time'] === value
        },
        {
        title: 'Earning Day of Week',
        dataIndex: 'Earning Day of Week',
        key: 'Earning Day of Week',
        sorter: (a, b) => a['Earning Day of Week'].localeCompare(b['Earning Day of Week']),
        filters: [...new Set(data.map(item => item['Earning Day of Week']))].map(day => ({ text: day, value: day })),
        onFilter: (value, record) => record['Earning Day of Week'] === value
        },
        {
        title: 'PE Ratio',
        dataIndex: 'PE Ratio',
        key: 'PE Ratio',
        sorter: (a, b) => a['PE Ratio'] - b['PE Ratio'],
        render: (value) => value.toFixed(2)
        },
        {
        title: 'ROE',
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
            return value; // For example: "N/A"
            }
        },
        {
        title: 'DTE',
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
            return value; // For example: "N/A"
            }
        },
        {
            title: 'Stock Sentiment',
            dataIndex: 'Stock Sentiment',
            key: 'Stock Sentiment',
            sorter: (a, b) => a['Stock Sentiment'].localeCompare(b['Stock Sentiment']),
            filters: [...new Set(data.map(item => item['Stock Sentiment']))].map(sentiment => ({ text: sentiment, value: sentiment })),
            onFilter: (value, record) => record['Stock Sentiment'].includes(value)
        },
        {
            title: 'Row Color',
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
                    <div style={{ marginTop: 20, textAlign: 'right', fontStyle: 'italic' }}>
                        Last Updated: {lastUpdated}
                    </div>
                )}
                <Table dataSource={data} columns={columns} loading={loading} rowKey="Symbol" rowClassName={rowClassName} pagination={false} />
            </div>
        </Spin>
    );
};

export default App;
