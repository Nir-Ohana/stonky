import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import rawData from './stock_analysis_report.json';

const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setData(rawData);
            } catch (error) {
                console.error('Error fetching the CSV data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = [
        {
            title: 'Company Name',
            dataIndex: 'Company Name',
            key: 'Company Name',
            sorter: (a, b) => a['Company Name'].localeCompare(b['Company Name']),
            filters: [...new Set(rawData.map(item => item['Company Name']))].map(name => ({ text: name, value: name })),
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
            filters: [...new Set(rawData.map(item => item.Symbol))].map(symbol => ({ text: symbol, value: symbol })),
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
            sorter: (a, b) => a['Change from Last Report'] - b['Change from Last Report']
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
            sorter: (a, b) => new Date(a['Earning Date']) - new Date(b['Earning Date'])
        },
        {
            title: 'Stock Sentiment',
            dataIndex: 'Stock Sentiment',
            key: 'Stock Sentiment',
            sorter: (a, b) => a['Stock Sentiment'].localeCompare(b['Stock Sentiment']),
            filters: [...new Set(rawData.map(item => item['Stock Sentiment']))].map(sentiment => ({ text: sentiment, value: sentiment })),
            onFilter: (value, record) => record['Stock Sentiment'].includes(value)
        },
        {
            title: 'Row Color',
            dataIndex: 'Row Color',
            key: 'Row Color',
            sorter: (a, b) => a['Row Color'].localeCompare(b['Row Color']),
            filters: [...new Set(rawData.map(item => item['Row Color']))].map(color => ({ text: color, value: color })),
            onFilter: (value, record) => record['Row Color'].includes(value)
        },
    ];

    const rowClassName = (record) => {
        return record['Row Color'] === 'positive-row' ? 'positive-row' : record['Row Color'] === 'negative-row' ? 'negative-row' : '';
    };

    return (
        <div style={{ padding: 20 }}>
            <Table
                dataSource={data}
                columns={columns}
                loading={loading}
                rowKey="Symbol"
                rowClassName={rowClassName}
                scroll={{ x: 'max-content' }} // Enable horizontal scroll for better responsiveness
            />
        </div>
    );
};

export default App;
