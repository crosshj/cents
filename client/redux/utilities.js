function clone(item) {
    var result = undefined;
    try {
        result = JSON.parse(JSON.stringify(item));
    } catch (e) {
        // nothing
    }
    return result;
}

const statToNumber = {
    due: 1,
    pending: 2,
    paid: 3
};

const numberToStat = {
    1: 'due',
    2: 'pending',
    3: 'paid'
};

function updateGroupFromChildren(accounts, root) {
    var newAccounts = clone(accounts);
    var newLiabs = root.accounts.liabilities || [];
    var groups = newLiabs.filter(x => x.type === 'group') || [];

    groups.forEach(g => {
        // rehydrate grouped items
        const groupedItems = g.items
            .map(item => newLiabs
                .find(x =>
                    typeof item === 'string'
                        ? (x.title||'').toLowerCase() === item.toLowerCase()
                        : (x.title||'').toLowerCase() === (item.title||'').toLowerCase()
                )
            );
        if (!groupedItems[0]) {
            return;
        }
        g.total_owed = groupedItems
            .map(x => x.total_owed)
            .reduce((total, z) => Number(total) + Number(z), 0);
        g.status = groupedItems
            .map(x => x.status)
            .reduce((status, z) => statToNumber[status.toLowerCase()] < statToNumber[(z||'').toLowerCase()]
                ? status.toLowerCase()
                : (z||'').toLowerCase()
                , 'paid');
        g.amount = groupedItems
            .map(x => x.amount)
            .reduce((total, z) => Number(total) + Number(z), 0);
        g.date = groupedItems
            .map(x => x.date)
            .sort(function (a, b) {
                return new Date(a) - new Date(b);
            })[0];
    });
    newAccounts.accounts.liabilities = newLiabs;

    return newAccounts;
}

// function fixTotals(accounts) {
//     var u = clone(accounts);
//     (u.liabilities || []).forEach(x => {
//         if (x.hidden === 'false') {
//             x.hidden = false;
//         }
//     });

//     u.totals = u.totals || {};

//     var pending = (u.liabilities || [])
//         .filter(function (a) {
//             return a.status && a.status.toLowerCase() === 'pending';
//         }).sort(function (a, b) {
//             return new Date(a.date) - new Date(b.date);
//         });
//     // var paid = (u.liabilities||[])
//     //     .filter(function (a) {
//     //         return a.status && a.status.toLowerCase() === 'paid';
//     //     }).sort(function (a, b) {
//     //         return new Date(a.date) - new Date(b.date);
//     //     });
//     var due = (u.liabilities || [])
//         .filter(function (a) {
//             return a.status && a.status.toLowerCase() === 'due';
//         }).sort(function (a, b) {
//             return new Date(a.date) - new Date(b.date);
//         });

//     u.totals.pendingTotal = pending
//         .filter(item => !(item.hidden || item.type === 'group'))
//         .reduce((all, one) => all + Number(one.amount), 0)
//         .toFixed(2);

//     u.totals.dueTotal = due
//         .filter(item => !(item.hidden || item.type === 'group'))
//         .reduce((all, one) => all + Number(one.amount), 0)
//         .toFixed(2);

//     u.totals.assetsTotal = (u.assets || [])
//         .filter(item => !JSON.parse(item.hidden))
//         .reduce((all, one) => all + Number(one.amount), 0)
//         .toFixed(2);

//     u.totals.debts = (u.liabilities || [])
//         .filter(item => !(item.hidden || item.type === 'group'))
//         .reduce((all, one) => all + Number(one.amount), 0)
//         .toFixed(2);

//     u.totals.debtsTotal = (u.liabilities || [])
//         .filter(item => !(item.hidden || item.type === 'group'))
//         .reduce((all, one) => all + Number(one.total_owed), 0)
//         .toFixed(2);

//     return u;
// }

// function markGroupedItems(accounts) {
//     const newAccounts = clone(accounts);
//     const groupedItems = Object.keys(newAccounts.liabilities
//         .reduce((all, x) => {
//             if (x.items) {
//                 x.items.forEach(y => {
//                     if (!all[y.title.toLowerCase()]) {
//                         all[y.title.toLowerCase()] = y;
//                     }
//                 });
//             }
//             return all;
//         }, {}));
//     newAccounts.liabilities.forEach(x => x.type !== 'group' ? delete x.type : undefined);
//     newAccounts.liabilities.forEach(x =>
//         x.type !== 'group' && groupedItems.includes(x.title.toLowerCase())
//             ? x.type = 'grouped'
//             : undefined
//     );
//     return newAccounts;
// }

function markGroupedItems(accounts) {
  const newAccounts = clone(accounts);
  const groupedItems = Object.keys(
    newAccounts.liabilities
      .reduce((all, x) => {
        if (x.type !== 'group' || !x.items) {
          return all;
        }

        x.items.forEach(y => {
          const yTitle = typeof y === 'string'
            ? y
            : y.title;
          if (!all[yTitle.toLowerCase()]) {
            all[yTitle.toLowerCase()] = y;
          }
        });

        return all;
      }, {})
  );
  newAccounts.liabilities.forEach(x => {
    if (x.type === 'group') return;
  });

  newAccounts.liabilities.forEach(x => {
    if ((x.type||'').includes('group') || (x.type||'').includes('seperator')) return;
    delete x.type;

    const itemIsGrouped = groupedItems
      .includes((x.title||'').toLowerCase());

    if (itemIsGrouped) {
      x.type = 'grouped';
    }
  });

  return newAccounts;
}

function openGroupedAccounts(initialState, viewState) {
    const outputState = clone(viewState);

    // stupid "false"
    outputState.liabilities.forEach(
        x => x.hidden === "false" ? x.hidden = false : undefined
    );

    // remove grouped items
    outputState.liabilities = outputState.liabilities.filter(x => x.type !== 'grouped');

    // remove hidden items
    outputState.liabilities = outputState.liabilities.filter(x => !x.hidden);

    // add grouped items back if group open
    var newLiabs = [];
    outputState.liabilities.forEach(group => {
        newLiabs.push(group);
        if (!group.open || group.type !== 'group') return;

        const groupedItems = group.items
            .map(item => (initialState.liabilities.filter(x => {
                return typeof i === 'string'
                    ? x.title === item
                    : x.title === item.title;
            }) || [])[0])
            .sort(function (a, b) {
                var statCompare = 0;
                if (statToNumber[a.status.toLowerCase()] > statToNumber[b.status.toLowerCase()]) statCompare = 1;
                if (statToNumber[a.status.toLowerCase()] < statToNumber[b.status.toLowerCase()]) statCompare = -1;

                return statCompare || new Date(a.date) - new Date(b.date);
            });

        newLiabs = newLiabs.concat(groupedItems);
    });

    outputState.liabilities = newLiabs;
    return outputState;
}

function bumpDateOneMonth(date) {
    var day = Number(date.replace(/.*-/g, ''));
    var month = Number(date.replace(/-..$/g, '').replace(/.*-/g, ''));
    var year = Number(date.replace(/-.*/g, ''));
    if (month === 12) {
        year += 1;
        month = 1;
    } else {
        month += 1;
    }
    day = (day < 10) ? '0' + day : day;
    month = (month < 10) ? '0' + month : month;
    return year + '-' + month + '-' + day;
}

function bumpDateOneMonthBack(date) {
    var day = Number(date.replace(/.*-/g, ''));
    var month = Number(date.replace(/-..$/g, '').replace(/.*-/g, ''));
    var year = Number(date.replace(/-.*/g, ''));
    if (month === 1) {
        year -= 1;
        month = 12;
    } else {
        month -= 1;
    }
    day = (day < 10) ? '0' + day : day;
    month = (month < 10) ? '0' + month : month;
    return year + '-' + month + '-' + day;
}

export {
    clone, statToNumber, numberToStat, updateGroupFromChildren, markGroupedItems,
    openGroupedAccounts, bumpDateOneMonth, bumpDateOneMonthBack
};
