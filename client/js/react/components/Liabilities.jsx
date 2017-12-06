import React from 'react';

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
              <td className="amount">{data.amount}</td>
              <td className="total">{Boolean(data.totalOwed) ? data.totalOwed : ''}</td>
              <td className="date">{data.date}</td>
              <td className="website hidden">{data.website}</td>
              <td className="notes hidden">{data.note}</td>
              <td className="auto hidden">{data.auto||'false'}</td>
            </tr>
          </tbody>
        </table>
    </a>
    );
}

function Liabilities({liabilities = []}){
    const liabRows = liabilities.map(makeRow);

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
