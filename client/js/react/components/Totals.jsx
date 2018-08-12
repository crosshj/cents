import React from 'react';
import {formatMoney} from '../utilities';
import {
    popupHistory
  } from '../../redux/actions';
import {
    fetchAccounts
} from '../../redux/services';

function makeTotalsRow(props){
    const {balance=0, pendingTotal=0, dueTotal=0, assetsTotal=0, debts=0, debtsTotal=0, updating} = props;
    //console.log(props);
    return (
        <div className="column totals">
            <a className="button totals">
                <table className="u-full-width">
                <tbody>
                    <tr className="header">
                        <td colSpan="2" className="title center">Current</td>
                    </tr>
                    <tr className="header">
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
                            <button onClick={updating ? ()=>{} : fetchAccounts}>{
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
        fetch('./killCache')
          .then(res => res.json)
          .then(json => {
            document.location.reload();
          });
        return false;
    }

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
                        marginTop: '10px'
                    }}
                    className='button totals'
                    onClick={() => killCache()}
                >Update Cache</button>
            </div>
        </div>
    );
}

Totals.propTypes = {};

export default Totals;
