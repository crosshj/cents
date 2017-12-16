import React from 'react';

import History from './History';
import {formatMoney} from '../utilities';
import {
    popupCancel,
    groupRemove,
    accountSave,
    popupHistory,
    popupHistoryBack,
    popupUpdate
  } from '../../redux/actions';

function Popup({error, account, history}){
    //console.log({error, account, history});
    // debugger;
    const popupClass = error ? 'hidden' : 'show';
    const isNewItem = (account||{}).isNew;
    const isGroup = (account||{}).type === 'group';
    const statusItems = [];
    const originalStatus = 'pending';
    const originalDateString  = '';
    const totalHistory = () => {
        popupHistory('total_owed');
    };
    const amountHistory = () => {
        popupHistory('amount');
    };

    function update(field, event){
        var update = {};
        update[field] = event.target.value;
        if (field === 'auto'){
            update[field] = event.target.checked;
        }
        popupUpdate(update);
    }

    function statusRow(status){
        return (
            <div className="row status">
                <button className={"due" + (status==='due'?' selected':'')}
                    onClick={() => popupUpdate({ status: 'due'})}
                >due</button>
                <button className={"pending" + (status==='pending' ? ' selected':'')}
                    onClick={() => popupUpdate({ status: 'pending'})}
                >pending</button>
                <button className={"paid" + (status==='paid' ? ' selected':'')}
                    onClick={() => popupUpdate({ status: 'paid'})}
                >paid</button>
            </div>
        );
    }

    function groupItems(items){
        return items.map((item, key) => 
            <tr  key={'group_item'+key}>
                <td className="">{item.title}</td>
                <td className="">{formatMoney(item.amount)}</td>
            </tr>
        );
    }
    

    return (
        <div id="popup-modal" className={popupClass} ref={ref => ref && ref.scrollTo(0,0)}>
            { history &&
                <div className="container content history">
                    <div>
                        <h4>
                            <a>{history.title} {history.field} History</a>
                        </h4>
                        <div id="history-graph">
                            { history.error &&
                                <div className="loading-spinner">
                                    <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                                </div>
                            }
                            { history.data &&
                                <History data={history.data}></History>
                            }
                        </div>
                        <div className="row actions">
                            <button className="button-primary close" onClick={popupCancel}>Close</button>
                            { account && 
                                <button className="button-primary cancel" onClick={popupHistoryBack}>Back</button>
                            }
                        </div>
                    </div>
                </div>
            }

            { !history && account &&
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
                        <input className="u-full-width form-control" id="title" type="text"
                            onChange={(event) => update('title', event)}
                        />
                    </div>
                    }  
                    { !isGroup &&
                    statusRow(account.status && account.status.toLowerCase())
                    }
                    {isNewItem && !isGroup &&
                    <div className="form-group">
                        <label htmlFor="website">Website</label>
                        <input className="u-full-width form-control" type="text" id="website"
                            value={account.website} onChange={(event) => update('website', event)}
                        />
                    </div>
                    }
                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea className="u-max-full-width u-full-width form-control"
                            rows="5" id="notes" value={account.note||''}
                            onChange={(event) => update('note', event)}
                        />
                    </div>
                    {!isGroup &&
                    <div className="form-group checkbox-group">
                        <label htmlFor="auto-checkbox">AUTO</label>
                        <input type="checkbox" id="auto-checkbox" checked={!!account.auto}
                            onChange={(event) => update('auto', event)}
                        />
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
                        <input className={`total ${isGroup?' group':''}`} type="number"
                            value={account.total_owed||'0.00'} id="total" disabled={isGroup}
                            onChange={(event) => update('total_owed', event)}
                        />
                        {!isNewItem && !isGroup &&
                            <button className="graph" data-title="Total Owed" onClick={totalHistory}>
                                <i className="fa fa-bar-chart"></i>
                            </button>
                        }
                    </div>
                    <div className="form-group">
                        <label>Payment Amount</label>
                        <input className={`amount ${isGroup?' group':''}`} type="number"
                            step="0.01" value={account.amount||''} disabled={isGroup}
                            onChange={(event) => update('amount', event)}
                        />
                        {!isNewItem && !isGroup &&
                        <button className="graph" data-title="Amount" onClick={amountHistory}>
                            <i className="fa fa-bar-chart"></i>
                        </button>
                        }
                    </div>
                    <div className="form-group">
                        <label>Date Due</label>
                        <input type="date" value={account.date||''}
                            onChange={(event) => update('date', event)}
                        />
                    </div>
                    {isNewItem &&
                    <div className="form-group">
                        <label>Occurence</label>
                        <select className="u-full-width" id="occurence" value={ account.occurence || "month"}
                            onChange={(event) => update('occurence', event)}
                        >
                            <option value="once">Once</option>
                            <option value="week">Weekly</option>
                            <option value="bi-week">Bi-weekly</option>
                            <option value="month">Monthly</option>
                        </select>
                    </div>
                    }
                    <div className="row actions">
                        <button className="button-primary cancel" onClick={popupCancel}>Cancel</button>
                        {isGroup && !isNewItem &&
                        <button className="button-primary remove" onClick={groupRemove}>Remove</button>
                        }
                        <button className="button-primary save" onClick={accountSave}>{isNewItem ? 'Add' : 'Save'}</button>
                    </div>
                </div>
            }
        </div>
    );
}

Popup.propTypes = {};

export default Popup;
