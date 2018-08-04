import {
    receiveAccounts, receiveLogin, receiveHistory, receiveAccountsSave, receiveAccountsData
} from './actions';


function clone(item) {
    return JSON.parse(JSON.stringify(item));
}

var GLOBAL_FUNCTION_QUEUE = [];

function fetchAccounts() {
    const url = './json';
    const config = {
        credentials: 'include',
        method: 'GET',
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
    };
    fetch(url, config)
        .then(r => r.json())
        .then(body => {
            // console.log(`Response from ${url} : ${JSON.stringify(body)}`);
            if (body.error) {
                GLOBAL_FUNCTION_QUEUE.push(() => fetchAccounts());
            }
            const payload = body || {};
            payload.error = body.error || false;
            receiveAccounts(payload);
            if(!body.error) fetchAccountsData();
        })
        // .catch(error => {
        //     receiveAccounts({ error });
        // });
}

// TODO: steal this from misc.js later
function login({ username, password }) {
    const url = './login/';
    const config = {
        method: 'POST',
        body: `username=${username}&password=${password}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'same-origin'
    };
    fetch(url, config)
        .then(r => r.json())
        .then(function (data) {
            //console.log('login success -->', data);
            receiveLogin(undefined, data);
        }).catch(function (error) {
            //console.log('login error --> ', error);
            receiveLogin(error);
        });
}

function fetchAccountsData() {
    const url = './accounts';
    const config = {
        method: 'GET',
        credentials: 'include'
    };
    fetch(url, config)
        .then(r => r.json())
        .then(function (data) {
            //console.log('get accounts data success -->', data);
            receiveAccountsData(undefined, data);
        }).catch(function (error) {
            //console.log('get acccounts data error --> ', error);
            receiveAccountsData(error);
        });
}

function fetchHistory({ type, title, field }) {
    function updateDiffs() {
        // if login error, this call will be retried
        const thisFunction = this;
        GLOBAL_FUNCTION_QUEUE.push(thisFunction.bind(thisFunction));

        const fetchField = field.toLowerCase().replace(' ', '_');
        const url = `diffs?type=${type}&account=${title}&field=${fetchField}`;
        const config = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        };

        fetch(url, config)
            .then(r => r.json())
            .then(function (json) {
                if (json.mustLogin || json.error === 'not logged in') {
                    return login();
                }
                popFunctionQueue();
                receiveHistory(json);
            })
            .catch(function (error) {
                receiveHistory({error});
            });
    }
    updateDiffs.bind(updateDiffs)();
}

function saveAccounts(accounts) {
		//console.log(accounts);
    const accountsToSave = clone(accounts);
    accountsToSave.liabilities
        .filter(x => x.type === 'group')
        .forEach(group => {
            group.items = group.items.map(item => {
                return typeof item === 'string'
                ? { title: item }
                : { title: item.title }
            });
        });
    accountsToSave.liabilities.forEach(x => {
				delete x.selected;
				if(x.type === 'grouped'){
					delete x.type;
				}
		});
		// don't save groups with no items
		accountsToSave.liabilities = accountsToSave.liabilities.filter(x => {
			if(!x.type || x.type !== 'group'){
				return true;
			}
			if(x.items && x.items.length < 1){
				return false;
			}
			return true;
		});
    const url = './accounts';
    const config = {
        method: 'POST',
        body: JSON.stringify(accountsToSave),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    };
    fetch(url, config)
        .then(r => r.json())
        .then(function (data) {
            //console.log('accounts save success -->', data);
            receiveAccountsSave(undefined, data);
        }).catch(function (error) {
            //console.log('accounts save error --> ', error);
            receiveAccountsSave(error);
        });
}

function popFunctionQueue() {
    return GLOBAL_FUNCTION_QUEUE.pop();
}

export {
    fetchAccounts, login, fetchAccountsData, fetchHistory, saveAccounts,
    popFunctionQueue
}