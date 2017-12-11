import React from 'react';

import {formatMoney} from '../utilities';
import {
    popupCancel
  } from '../../redux/actions';

function statusRow(){
    return <div></div>;
}

function groupItems(items){
    return items.map((item, key) => 
        <tr  key={'group_item'+key}>
            <td className="">{item.title}</td>
            <td className="">{formatMoney(item.amount)}</td>
        </tr>
    );
}

function Popup({error, account={}}){
    //console.log({error, account, group});
    // debugger;
    const popupClass = error ? 'hidden' : 'show';
    const isNewItem = false;
    const isGroup = account.type === 'group';
    const statusItems = [];
    const originalStatus = 'pending';
    const originalDateString  = '';

    return (
        <div id="popup-modal" className={popupClass}>
            <div className="container content history"></div>
            <div className="container content account">
                <h2>
                { isNewItem
                    ? <a className='popup-heading'>New { isGroup ? 'Group' : 'Item'}</a>
                    : <a target="_blank" href={account.website}>{account.title}</a>
                }
                </h2>
                { isNewItem &&
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input className="u-full-width form-control" id="title" type="text"/>
                </div>
                }  
                { !isGroup &&
                statusRow(statusItems, originalStatus, isNewItem)
                }
                {isNewItem &&
                <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input className="u-full-width form-control" type="text" id="website"/>
                </div>
                }
                <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea className="u-max-full-width u-full-width form-control" rows="5" id="notes" value={account.note||''} />
                </div>
                {!isGroup &&
                <div className="form-group checkbox-group">
                    <label htmlFor="auto-checkbox">AUTO</label>
                    <input type="checkbox" id="auto-checkbox" checked={!!account.auto} />
                </div>
                }
                {isGroup &&
                <div className="form-group">
                    <label>Items</label>
                    <table className="u-full-width">
                        <tbody>
                            {groupItems(account.items)}
                        </tbody>
                    </table>
                    <br/>
                </div>
                }
                <div className="form-group">
                    <label>Total Owed</label>
                    <input className={`total ${isGroup?' group':''}`} type="number" value={account.total_owed||''} id="total" disabled={isGroup} />
                    {!isNewItem && !isGroup &&
                        <button className="graph" data-title="Total Owed">
                            <i className="fa fa-bar-chart"></i>
                        </button>
                    }
                </div>
                <div className="form-group">
                    <label>Payment Amount</label>
                    <input className={`amount ${isGroup?' group':''}`} type="number" step="0.01" value={account.amount||''} disabled={isGroup} />
                    {!isNewItem && !isGroup &&
                    <button className="graph" data-title="Amount">
                        <i className="fa fa-bar-chart"></i>
                    </button>
                    }
                </div>
                <div className="form-group">
                    <label>Date Due</label>
                    <input type="date" value={account.date||''}/>
                </div>
                {isNewItem &&
                <div className="form-group">
                    <label>Occurence</label>
                    <select className="u-full-width" id="occurence">
                        <option defaultValue="once">Once</option>
                        <option defaultValue="week">Weekly</option>
                        <option defaultValue="bi-week">Bi-weekly</option>
                        <option defaultValue="month" selected="selected">Monthly</option>
                    </select>
                </div>
                }
                <div className="row actions">
                    <button className="button-primary cancel" onClick={popupCancel}>Cancel</button>
                    {isGroup && !isNewItem &&
                    <button className="button-primary remove">Remove</button>
                    }
                    <button className="button-primary save">{isNewItem ? 'Add' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
}

Popup.propTypes = {};

export default Popup;
