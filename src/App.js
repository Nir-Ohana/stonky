import React, { useEffect, useState } from 'react';
import { Table, Spin, Tooltip, Checkbox, Dropdown, Button, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const POLLING_INTERVAL = 30000;

const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleColumns, setVisibleColumns] = useState([]);

    // Initialize visible columns from localStorage or default to all columns
    useEffect(() => {
        const savedColumns = localStorage.getItem('visibleColumns');
        if (savedColumns) {
            setVisibleColumns(JSON.parse(savedColumns));
        } else {
            setVisibleColumns(columns.map(col => col.key || col.dataIndex));
        }
    }, []);

    // Update localStorage whenever visibleColumns changes
    useEffect(() => {
        localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

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

    const extractFirstParagraph = (summary) => {
        if (!summary) return '';
        if (summary.includes(' Inc.')) {
            const match = summary.match(/^(.*?\..*?\.\s)/);
            return match ? match[0].trim() : summary;
        } else {
            const match = summary.match(/^(.*?\.\s)/);
            return match ? match[0].trim() : summary;
        }
    };

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
                <Tooltip title={extractFirstParagraph(record['Company Summary'])}>
                    <a
                        href={`https://finance.yahoo.com/quote/${record.Symbol}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
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
                <Tooltip title="The Sector">
                    <div style={{ width: '100%' }}>Sector</div>
                </Tooltip>
            ),
            dataIndex: 'Sector',
            key: 'Sector',
            sorter: (a, b) => a.Sector.localeCompare(b.Sector),
            filters: [...new Set(data.map(item => item.Sector))].map(sector => ({ text: sector, value: sector })),
            onFilter: (value, record) => record.Sector.includes(value)
        },
        {
            title: (
                <Tooltip title="The Industry">
                    <div style={{ width: '100%' }}>Industry</div>
                </Tooltip>
            ),
            dataIndex: 'Industry',
            key: 'Industry',
            sorter: (a, b) => a.Industry.localeCompare(b.Industry),
            filters: [...new Set(data.map(item => item.Industry))].map(industry => ({ text: industry, value: industry })),
            onFilter: (value, record) => record.Industry.includes(value)
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
                <Tooltip title="Difference between the current price and the day's low as a percentage">
                    <div style={{ width: '100%' }}>Difference from Day Low (%)</div>
                </Tooltip>
            ),
            key: 'Difference from Day Low (%)',
            render: (record) => {
                const currentPrice = parseFloat(record['Current Price']);
                const dayLow = parseFloat(record['Day Low']);
                if (!isNaN(currentPrice) && !isNaN(dayLow) && dayLow !== 0) {
                    const percentage = ((currentPrice - dayLow) / dayLow) * 100;
                    return `${percentage.toFixed(2)}%`;
                }
                return 'N/A';
            },
            sorter: (a, b) => {
                const diffA = ((parseFloat(a['Current Price']) - parseFloat(a['Day Low'])) / parseFloat(a['Day Low'])) * 100;
                const diffB = ((parseFloat(b['Current Price']) - parseFloat(b['Day Low'])) / parseFloat(b['Day Low'])) * 100;
                return isNaN(diffA) ? 1 : isNaN(diffB) ? -1 : diffA - diffB;
            }
        },
        {
            title: (
                <Tooltip title="Difference between the current price and the day's high as a percentage">
                    <div style={{ width: '100%' }}>Difference from Day High (%)</div>
                </Tooltip>
            ),
            key: 'Difference from Day High (%)',
            render: (record) => {
                const currentPrice = parseFloat(record['Current Price']);
                const dayHigh = parseFloat(record['Day High']);
                if (!isNaN(currentPrice) && !isNaN(dayHigh) && dayHigh !== 0) {
                    const percentage = ((currentPrice - dayHigh) / dayHigh) * 100;
                    return `${percentage.toFixed(2)}%`;
                }
                return 'N/A';
            },
            sorter: (a, b) => {
                const diffA = ((parseFloat(a['Current Price']) - parseFloat(a['Day High'])) / parseFloat(a['Day High'])) * 100;
                const diffB = ((parseFloat(b['Current Price']) - parseFloat(b['Day High'])) / parseFloat(b['Day High'])) * 100;
                return isNaN(diffA) ? 1 : isNaN(diffB) ? -1 : diffA - diffB;
            }
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
                <Tooltip title="Ratio between current volume and average volume">
                    <div style={{ width: '100%' }}>VS Average Volume</div>
                </Tooltip>
            ),
            dataIndex: 'VS Average Volume',
            key: 'VS Average Volume',
            sorter: (a, b) => a['VS Average Volume'] - b['VS Average Volume'],
            defaultSortOrder: 'descend',
            render: (value) => `${parseFloat(value * 100).toFixed(2)}%`
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
                <Tooltip title="Price-to-earnings ratio">
                    <div style={{ width: '100%' }}>PE Ratio</div>
                </Tooltip>
            ),
            dataIndex: 'PE Ratio',
            key: 'PE Ratio',
            sorter: (a, b) => {
                const valA = typeof a['PE Ratio'] === 'number' ? a['PE Ratio'] : -Infinity;
                const valB = typeof b['PE Ratio'] === 'number' ? b['PE Ratio'] : -Infinity;
                return valA - valB;
            },
            render: (value) => {
                if (typeof value === 'number') {
                    return value.toFixed(2);
                }
                else {
                    return 'N/A';
                }
            }
        },
        {
            title: (
                <Tooltip title="Trailing PE">
                    <div style={{ width: '100%' }}>Trailing PE</div>
                </Tooltip>
            ),
            dataIndex: 'Quick Ratio',
            key: 'Quick Ratio',
            sorter: (a, b) => {
                const valA = typeof a['Trailing PE'] === 'number' ? a['Trailing PE'] : -Infinity;
                const valB = typeof b['Trailing PE'] === 'number' ? b['Trailing PE'] : -Infinity;
                return valA - valB;
            },
            render: (value) => {
                if (typeof value === 'number') {
                    return value.toFixed(2);
                }
                else {
                    return 'N/A';
                }
            }
        },
        {
            title: (
                <Tooltip title="Trailing PEG 12 months">
                    <div style={{ width: '100%' }}>Trailing PEG</div>
                </Tooltip>
            ),
            dataIndex: 'Trailing PEG',
            key: 'Trailing PEG',
            sorter: (a, b) => {
                const valA = typeof a['Trailing PEG'] === 'number' ? a['Trailing PEG'] : -Infinity;
                const valB = typeof b['Trailing PEG'] === 'number' ? b['Trailing PEG'] : -Infinity;
                return valA - valB;
            },
            render: (value) => {
                if (typeof value === 'number') {
                    return value.toFixed(2);
                }
                else {
                    return 'N/A';
                }
            }
        },
        {
            title: (
                <Tooltip title="Trailing PS 12 months">
                    <div style={{ width: '100%' }}>Trailing PS</div>
                </Tooltip>
            ),
            dataIndex: 'Trailing PS',
            key: 'Trailing PS',
            sorter: (a, b) => a['Trailing PS'] - b['Trailing PS'],
            render: (value) => {
                if (typeof value === 'number') {
                    return value.toFixed(2);
                }
                else {
                    return 'N/A';
                }
            }
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
                <Tooltip title="a measure of volatility of a security compared to a market as a whole">
                    <div style={{ width: '100%' }}>Beta</div>
                </Tooltip>
            ),
            dataIndex: 'Beta',
            key: 'Beta',
            sorter: (a, b) => {
                const valA = typeof a['Beta'] === 'number' ? a['Beta'] : -Infinity;
                const valB = typeof b['Beta'] === 'number' ? b['Beta'] : -Infinity;
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
                <Tooltip title="Quick Ratio">
                    <div style={{ width: '100%' }}>Quick Ratio</div>
                </Tooltip>
            ),
            dataIndex: 'Quick Ratio',
            key: 'Quick Ratio',
            sorter: (a, b) => {
                const valA = typeof a['Quick Ratio'] === 'number' ? a['Quick Ratio'] : -Infinity;
                const valB = typeof b['Quick Ratio'] === 'number' ? b['Quick Ratio'] : -Infinity;
                return valA - valB;
            },
            render: (value) => {
                if (typeof value === 'number') {
                    return value.toFixed(2);
                }
                else {
                    return 'N/A';
                }
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
        return record['Row Color'] === 'positive-row'
            ? 'positive-row'
            : record['Row Color'] === 'negative-row'
            ? 'negative-row'
            : '';
    };

    const lastUpdated = data.length > 0 ? data[0]['Last Updated'] : null;

    const filteredColumns = columns.filter(col => {
        const columnKey = col.key || col.dataIndex;
        return visibleColumns.includes(columnKey);
    });

    const handleColumnChange = (checkedValues) => {
        setVisibleColumns(checkedValues);
    };

    const menu = (
        <Menu>
            <Checkbox.Group
                value={visibleColumns}
                onChange={handleColumnChange}
                style={{ padding: '10px' }}
            >
                {columns.map(col => (
                    <Checkbox key={col.key || col.dataIndex} value={col.key || col.dataIndex}>
                        {col.title.props.children}
                    </Checkbox>
                ))}
            </Checkbox.Group>
        </Menu>
    );

    return (
        <Spin spinning={loading} tip="Loading data...">
            <div style={{ padding: 20 }}>
                {lastUpdated && (
                    <div style={{ marginTop: 20, textAlign: 'left', fontStyle: 'italic' }}>
                        Last Updated: {lastUpdated}
                    </div>
                )}
                <div style={{ marginBottom: 10, textAlign: 'right' }}>
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button>
                            Toggle Columns <DownOutlined />
                        </Button>
                    </Dropdown>
                </div>
                <Table
                    dataSource={data}
                    columns={filteredColumns}
                    loading={loading}
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
