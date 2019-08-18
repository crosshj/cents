import React from 'react';
import {formatMoney, formatDateShort} from '../helpers/utilities';

const Row = ({
    data, key, rowClick, title, contextClick = () => {}
}) => {
    const rowClassName = `button ${data.status.toLowerCase()} primary ${data.type || ''} ${data.selected ? " selected" : ""}`.trim();

    return (
        <a className={rowClassName}
            key={key + '-' + data.title}
            onClick={rowClick} onContextMenu={contextClick}
        >
            <div className="u-full-width account item">
                <div className='flex-row header'>
                    <div colSpan="2" className="title">{title || data.title}</div>
                    <div className="status">{data.status.toUpperCase()}</div>
                </div>
                <div className='flex-row info'>
                    <div className="amount">{formatMoney(data.amount)}</div>
                    
                    <div className="total">
                        { (Boolean(data.total_owed) && Number(data.total_owed) != 0) &&
                            <div>
                                {formatMoney(data.total_owed, ' ')}
                            </div>
                        }
                        { (Boolean(data.apr) && Number(data.apr)) &&
                            <div className='apr'>
                                {parseFloat(Number(data.apr).toFixed(2))} APR
                            </div>
                        }
                    </div>
                    <div className="date">{ formatDateShort(data.date)}</div>
                </div>
            </div>
        </a>
    );
};

export default Row;
