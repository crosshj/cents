import React from 'react';
import { formatMoney, formatDateShort, clone } from '../utilities';
import {
    accountClick, selectAccountClick, groupClick, newAccountClick, newGroupClick
} from '../../redux/actions';

function SeperatorRow({ data, key }){
  const sepData = clone(data);
  const currentBalance = localStorage.getItem('currentBalance');
  if(sepData.first && currentBalance){
    sepData.amount = currentBalance;
  }

  const duePendingTotal = Number(sepData.pending)+Number(sepData.due);
  const duePendingString = formatMoney(duePendingTotal);
  const total = formatMoney(sepData.total);
  const diff = sepData.amount
    ? formatMoney(sepData.amount - sepData.total)
    : '';
//   const totalString = duePendingString === total || duePendingTotal === 0
//     ? `${total}`
//     : `${duePendingString}   |   ${total}`;
  const totalString = `${total}`;
  const dateString = `${formatDateShort(sepData.displayDate)} → ${formatDateShort(sepData.date)}`;

  const onClick = (sepData) => {
    if(!sepData.first){
        return;
    }
    var cb = prompt("Current Balance", currentBalance || sepData.amount);
    if(!cb){
        return;
    }
    cb = cb.replace(/\$|,/g, '');
    localStorage.setItem('currentBalance', cb);
    document.location.reload();
  };
  return (
    <div className="row-seperator" onClick={() => onClick(sepData)}>
      <table class="u-full-width"><tbody>
        <tr class="info">
          <td class="amount">
            <span>{totalString}</span>
            <span className="diff">| {diff}</span>
          </td>
          <td class="date">{dateString}</td>
        </tr>
      </tbody></table>
    </div>
  );
}

function makeRow(data, key){
    if((data.type||'').includes('seperator')){
      return (
        <SeperatorRow {...{ data, key}} />
      );
    }
    const isGroup = data.type === 'group';
    const rowClassName = `button ${data.status.toLowerCase()} primary ${data.type} ${data.selected ? " selected" : ""}`;
    const rowClick = isGroup
        ? () => groupClick(data.title)
        : () => accountClick(data.title);
    const contextClick = isGroup
        ? e => {e.preventDefault(); accountClick(data.title); return false; }
        : e => {e.preventDefault(); selectAccountClick(data.title); return false; };
    const automark = data.auto
        ? ' Ⓐ'
        : '';

    return (
        <a className={rowClassName} key={key + '-' + data.title}
            onClick={rowClick} onContextMenu={contextClick}
        >
            <table className="u-full-width">
            <tbody>
                <tr className="header">
                    <td colSpan="2" className="title">{data.title}{automark}</td>
                    <td className="status">{data.status.toUpperCase()}</td>
                </tr>
                <tr className="info">
                    <td className="amount">{formatMoney(data.amount)}</td>
                    <td className="total">
                        {Boolean(Number(data.total_owed)) ? formatMoney(data.total_owed) : ''}
                    </td>
                    <td className="date">{formatDateShort(data.date)}</td>
                </tr>
            </tbody>
            </table>
        </a>
    );
}

function Liabilities({liabilities = []}){
    const thisLiabs = clone(liabilities);
    var foundFirstSep = false;
    const isSeperator = (liab) => liab.type && liab.type.includes('seperator');

    thisLiabs.forEach(liab => {
        if(foundFirstSep || !isSeperator(liab)){
            return;
        }
        liab.first = true;
        foundFirstSep = true;
    });
    let liabRows = thisLiabs
        .filter(x => x)
        .map(makeRow);

    const selectedLiabs = thisLiabs
        .filter(x => x)
        .reduce((total, item) => item.selected
            ? total+1
            : total, 0
        );

    if(selectedLiabs === 0){
        liabRows = liabRows.concat(
            <a id="add-new" className="button" key="liab-add-new" onClick={newAccountClick}>Add New</a>
        );
    }

    if(selectedLiabs > 0){
        liabRows = liabRows.concat(
            <a id="add-group" className="button" key="liab-agg-group" onClick={newGroupClick}>Group Accounts</a>
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
