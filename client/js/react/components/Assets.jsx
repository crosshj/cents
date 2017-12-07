import React from 'react';
import {formatMoney} from '../utilities';

function makeRow(data, key){
    const isGroup = false;
    const rowClassName = `button ${data.status.toLowerCase()} primary${isGroup ? " group" : ""}`;
    return (
        <a className={rowClassName} key={key + '-' + data.title}>
            <table className="u-full-width">
            <tbody>
                <tr className="header">
                    <td colSpan="2" className="title">{data.title}</td>
                    <td className="status">{data.status.toUpperCase()}</td>
                </tr>
                <tr className="info">
                    <td className="amount">{formatMoney(data.amount)}</td>
                    <td className="total">
                        {Boolean(Number(data.total_owed)) ? formatMoney(data.total_owed) : ''}
                    </td>
                    <td className="date">{data.date}</td>
                </tr>
            </tbody>
            </table>
        </a>
    );
}

function Assets({assets = []}){
    const assetRows = assets.map(makeRow);

    return (
    <div className="carousel-cell">
        <div className="container">
            <div className="column assets">
            {assetRows}
            </div>
        </div>
    </div>
    );
}

Assets.propTypes = {};

export default Assets;
