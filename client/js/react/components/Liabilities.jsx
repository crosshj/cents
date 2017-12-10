import React from 'react';
import {formatMoney} from '../utilities';
import actions from '../../redux/actions';

function rowClick(title){
    actions({
        type: 'POPUP_ACCOUNT',
        payload: {title}
    });
}

function makeRow(data, key){
    const isGroup = data.type === 'group';
    const rowClassName = `button ${data.status.toLowerCase()} primary${isGroup ? " group" : ""}`;
    return (
        <a className={rowClassName} key={key + '-' + data.title} onClick={() => rowClick(data.title)}>
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

function Liabilities({liabilities = []}){
    let liabRows = liabilities
        .filter(x => !x.hidden && x.type !== 'grouped')
        .map(makeRow);

    const selectedLiabs = liabilities
        .reduce((total, item) => item.selected
            ? total+1
            : total, 0
        );

    if(selectedLiabs === 0){
        liabRows = liabRows.concat(
            <a id="add-new" className="button" key="liab-add-new">Add New</a>
        );
    }

    if(selectedLiabs > 0){
        liabRows = liabRows.concat(
            <a id="add-group" class="button" key="liab-agg-group">Group Accounts</a>
        );
    }

    return (
    <div className="carousel-cell">
        <div className="container">
            <div className="column liabilities">
            {liabRows}
            </div>
        </div>
    </div>
    );
}

Liabilities.propTypes = {};

export default Liabilities;
