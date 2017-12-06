import React from 'react';

function makeTotalsRow(props){
    const {balance=0, pendingTotal=0, dueTotal=0, assetsTotal=0, debts=0, debtsTotal=0} = props;
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
                    <td className="status">{balance}</td>
                    </tr>
                    <tr className="header">
                    <td className="title">Pending</td>
                    <td className="status">{pendingTotal}</td>
                    </tr>
                    <tr className="header">
                    <td className="title">Due</td>
                    <td className="status">{dueTotal}</td>
                    </tr>
                    <tr className="header">
                    <td className="title"></td>
                    <td className="status">{balance - pendingTotal - dueTotal}</td>
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
                    <td className="status">{assetsTotal}</td>
                    </tr>
                    <tr className="header">
                    <td className="title">Debt</td>
                    <td className="status">{debts}</td>
                    </tr>
                    <tr className="header">
                    <td className="title"></td>
                    <td className="status">{assetsTotal - debts}</td>
                    </tr>
                </tbody>
                </table>
            </a>
            <a className="button totals" id="totals_history">
                <table className="u-full-width">
                <tbody>
                    <tr className="header">
                    <td className="title">Debt Total</td>
                    <td className="status">{debtsTotal}</td>
                    </tr>
                    <tr className="header history">
                    <td colSpan="2" className="title center">
                        <button>History</button>
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

    return (
        <div className="carousel-cell">
            <div className="container">
                {totalsRows}
            </div>
        </div>
    );
}

Totals.propTypes = {};

export default Totals;
