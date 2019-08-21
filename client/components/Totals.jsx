import React from 'react';
import {formatMoney} from '../helpers/utilities';
import {
    popupHistory
  } from '../redux/actions';
import {
    fetchAccounts
} from '../redux/services';

function makeTotalsRow(props){
    var {balance=0, pendingTotal=0, dueTotal=0, assetsTotal=0, debts=0, debtsTotal=0, updating} = props;
    //console.log(props);
    const currentBalance = localStorage.getItem('currentBalance');
    if(currentBalance){
      balance = currentBalance;
    }
    const onClickBalance = (e) => {
        e.preventDefault();
        var cb = prompt("Current Balance", currentBalance || balance);
        if(!cb){
            return;
        }
        cb = cb.replace(/\$|,/g, '');
        localStorage.setItem('currentBalance', cb);
        document.location.reload();
      };
    return (
        <div className="column totals">
            <a className="button totals">
                <table className="u-full-width">
                <tbody>
                    <tr className="header">
                        <td colSpan="2" className="title center">Current</td>
                    </tr>
                    <tr className="header"
                        onClick={onClickBalance}
                        onContextMenu={onClickBalance}
                    >
                        <td className="title">Balance</td>
                        <td className="status">{formatMoney(balance)}</td>
                    </tr>
                    { Boolean(Number(pendingTotal)) &&
                    <tr className="header">
                        <td className="title">Pending</td>
                        <td className="status">{formatMoney(pendingTotal)}</td>
                    </tr>
                    }
                    { Boolean(Number(dueTotal)) &&
                    <tr className="header">
                        <td className="title">Due</td>
                        <td className="status">{formatMoney(dueTotal)}</td>
                    </tr>
                    }
                    <tr className="header">
                        <td className="title"></td>
                        <td className="status">{formatMoney(balance - pendingTotal - dueTotal)}</td>
                    </tr>
                    <tr className="header">
                        <td colSpan="2" className="title center">
                            <button
                                className='balance-update-button'
                                onClick={onClickBalance}
                                // onClick={updating ? ()=>{} : fetchAccounts}
                            >{
                                updating
                                    ? <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                                    : 'Update'
                            }</button>
                        </td>
                    </tr>
                </tbody>
                </table>
            </a>
            <a className="button totals">
                <table className="u-full-width">
                <tbody>
                    <tr className="header">
                        <td colSpan="2" className="title center">Monthly</td>
                    </tr>
                    <tr className="header">
                        <td className="title">Assets</td>
                        <td className="status">{formatMoney(assetsTotal)}</td>
                    </tr>
                    <tr className="header">
                        <td className="title">Debt</td>
                        <td className="status">{formatMoney(debts)}</td>
                    </tr>
                    <tr className="header">
                        <td className="title"></td>
                        <td className="status">{formatMoney(assetsTotal - debts)}</td>
                    </tr>
                </tbody>
                </table>
            </a>
            <a className="button totals" id="totals_history">
                <table className="u-full-width">
                <tbody>
                    <tr className="header">
                        <td className="title">Debt Total</td>
                        <td className="status">{formatMoney(debtsTotal)}</td>
                    </tr>
                    <tr className="header history">
                        <td colSpan="2" className="title center">
                            <button onClick={updating ? ()=>{} : () => popupHistory('amount')}>History</button>
                        </td>
                    </tr>
                </tbody>
                </table>
            </a>
      </div>
    );
  }

function Totals({totals = {}}){
    const totalsRows = makeTotalsRow(totals);

    function killCache(){
        document.querySelector('.cache-kill').innerHTML = 'WAIT...';
        fetch('./killCache')
          .then(res => res.json)
          .then(json => {
            //TODO: this is a lame way of doing this,
            //should listen to event for cache update to reload
            setTimeout(()=>{
                // because 1st /json req returns error: offline
                // but 2nd does not
                var config = {
                    credentials: 'include',
                    method: 'GET',
                    headers: new Headers({
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    })
                };
                fetch('./json', config)
                    .then(res => {
                        document.location.reload();
                    })
            }, 10000);
          });
        return false;
    }

    const commitDateString = (new Date(process.env.COMMIT_DATE))
        .toLocaleString();

    return (
        <div className="carousel-cell">
            <div className="container">
                {totalsRows}
            </div>
            <div className="container" style={{ textAlign: 'center' }}>
                <button
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#555',
                        marginTop: '10px',
                        minWidth: '165px'
                    }}
                    className='button totals cache-kill'
                    onClick={() => killCache()}
                >Update App Cache</button>
            </div>
            <div className="container" style={{
                textAlign: 'center',
                fontFamily: 'monospace',
                whiteSpace: 'pre',
                marginBottom: '25px',
                marginTop: '10px'
            }}>
                <span>Commit Hash: </span>
                <a target="_blank" href={
                    'https://github.com/crosshj/cents/commits' || process.env.COMMIT_URI
                }>
                    {process.env.COMMIT_HASH.slice(0, 7)+'\n'}
                </a>
                <span>Commit Date: {commitDateString}</span>
            </div>
        </div>
    );
}

Totals.propTypes = {};

export default Totals;
