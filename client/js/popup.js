function popUpModal(target, content){
 if(content){
  jq('div#popup-modal').html(content);
 }
 if (jq('div#popup-modal.show').length){
   jq('div#popup-modal').css({top:'100%', bottom: '100%'});
   jq('div#popup-modal').removeClass('show');
   jq('body').removeClass('lock-screen');
 } else {
   var scrollTop = jq('body').scrollTop();
   jq('div#popup-modal').css({top:scrollTop, bottom: -1*scrollTop});
   jq('body').addClass('lock-screen');
   jq('div#popup-modal').addClass('show');
 }
}

var statusRow = function(statusItems, status, showLabel){
  status = status || '';
  return `
    <div class="row status">
      ${showLabel ?  `
        <label>Status</label>
      ` : ''}
      ${statusItems.reduce(function(target, item){
        var className = ' class="' +
          (item === status.trim().toLowerCase() ? 'selected ' : '') +
          item + '"';
        return target + '<button'+className+'>' + item + '</button>';
      }, '')}
    </div>
  `;
}

function makeHistoryContent({type, title, field, hijack}){
  var historyContent = jq(`
    <div>
      <h4>
        <a>${title} ${field} History</a>
      </h4>
      <div id="history-graph">
        <div class="loading-spinner">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
        </div>
        <div class="graph-container"></div>
      </div>
      <div class="row actions">
        <button class="button-primary close">Close</button>
        ${hijack ? `<button class="button-primary cancel">Back</button>` : ''}
      </div>
    </div>
  `);

  historyContent.find('button.cancel').on('click', function(e){
    jq('div#popup-modal .history').hide();
    jq('div#popup-modal .account').show();
  });

  historyContent.find('button.close').on('click', function(e){
    jq('div#popup-modal .history').hide();
    jq('div#popup-modal').removeClass('show');
    jq('body').removeClass('lock-screen');
  });

  return historyContent;
}

function formatGraphData(json){
  var formattedData = json.map(x => [
    moment(x.date.replace('_', ' ')).valueOf(),
    Number(x.value)
  ]);
  return formattedData;
}

function makeGraph($container, data){
  var chartConfig = {
      chart: {
          renderTo: $container,
          marginTop: 30,
          height: 300
      },
      title:{
          text:''
      },
      legend: {
          enabled: false
      },
      credits: {
          enabled: false
      },
      tooltip: {
        formatter: function() {
          return `
            <b>$${this.y}</b>
            <br/>
            <p>${moment(this.x).format('MMM DD YYYY, HH:mm a')}</p>
            
          `;
        }
      },
      xAxis: {
          type: 'datetime'
      },
      yAxis: {
        title: ''
      },
      series: [{
        name: '',
        data: data
      }]
  };
  var graph = new Highcharts.Chart(chartConfig);
  return graph;
}

function showHistoryPopup(target, h){
  var historyContent = makeHistoryContent(h);
  jq('div#popup-modal .history').html(historyContent);
  if(h.hijack){
    jq('div#popup-modal .account').hide();
  }

  if (!h.hijack){
    var historyPopupContainer = jq(`
      <div>
        <div class="container content history"></div>
      </div>
    `);
    historyPopupContainer.find('.content.history').html(historyContent);
    popUpModal(target, historyPopupContainer);
  }
  jq('div#popup-modal .history').show();

  var fetchField = h.field.toLowerCase().replace(' ', '_');
  function updateDiffs(){
    const thisFunction = this;
    GLOBAL_FUNCTION_QUEUE.push(thisFunction.bind(thisFunction));

    fetch(`diffs?type=${h.type}&account=${h.title}&field=${fetchField}`, {
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'  
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        if(json.mustLogin || json.error === 'not logged in'){
          return login();
        }

        GLOBAL_FUNCTION_QUEUE.pop();
        historyContent.find('.loading-spinner').hide();
        var graphContainer = historyContent.find('.graph-container')[0];

        if(json.error === "offline"){
          graphContainer.innerHTML = 'offline';
          graphContainer.className = "offline";
          return;
        }


        var graphData = formatGraphData(json);
        var chart = makeGraph(graphContainer, graphData);
      })
      .catch(function(error) { 
        console.log("Error making graph", error); 
      });
  }
  updateDiffs.bind(updateDiffs)();
}

function statusHandler(content, originalStatus, originalDateString, getStatus){
  content.find('.status.row button').on('click', function (e){
    var currentSelectedStatus = getStatus(content.find('.selected'));
    var clickedStatus = getStatus(jq(this));

    if(clickedStatus.toLowerCase() === 'paid' && originalStatus.toLowerCase() !== 'paid'){
      var day = Number(originalDateString.replace(/.*-/g,''));
      var month = Number(originalDateString.replace(/-..$/g,'').replace(/.*-/g,''));
      var year = Number(originalDateString.replace(/-.*/g,''));
      if (month === 12) {
        year += 1;
        month = 1;
      } else {
        month += 1;
      }
      day = (day < 10) ? '0'+day : day;
      month = (month < 10) ? '0'+month : month;
      content.find('input[type="date"]').val(year + '-' + month + '-' + day)
    } else {
      content.find('input[type="date"]').val(originalDateString);
    }
    content.find('.status.row button').removeClass('selected');
    jq(this).addClass('selected');
  });
  return content;
}

function saveHandler(content, getStatus){
  var getCurrentItem = function(item){
    var status = getStatus(item.find('.selected'));
    var currentItem = {
      name: (item.find('#title').val() || item.find('h2').text() || '').trim(),
      status,
      website: (item.find('#website').val() || '').trim(),
      amount: item.find('.amount').val(),
      occurence: item.find('#occurence').val(),
      total: item.find('#total').val(),
      date: item.find('input[type="date"]').val(),
      notes: item.find('textarea#notes').val(),
      auto: item.find('#auto-checkbox').is(":checked")
    };
    var popupHeadingText = item.find('.popup-heading').text();
    if(popupHeadingText.toLowerCase().includes('group')){
      currentItem.type='group';
      currentItem.items=jq('.form-group:contains(Items) tr').get().map(tr => {
        var item = {
       title: tr.children[0].innerText,
         amount: Number(tr.children[1].innerText.replace('$','').replace(',',''))
        };
        return item;
     });
    }
    return currentItem;
  };

  content.find('button.save').on('click', function (e){
    var currentItem = getCurrentItem(jq(this).parent().parent());
    //TODO: are we writing to liab or assets?
    var previousVersion = MAIN_DATA.liabilities.getByName(currentItem.name.toLowerCase())
      || MAIN_DATA.assets.getByName(currentItem.name.toLowerCase());
    if (!previousVersion){
      previousVersion = {};
      MAIN_DATA.liabilities.push(previousVersion);
      previousVersion.occurence = currentItem.occurence;
      previousVersion.website = currentItem.website;
      previousVersion.hidden = false;
    }
    previousVersion.title = currentItem.name;
    previousVersion.status = currentItem.status;
    previousVersion.amount = currentItem.amount;
    previousVersion.total_owed = currentItem.total || '0.00';
    previousVersion.date = currentItem.date;
    previousVersion.note = currentItem.notes.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    previousVersion.auto = currentItem.auto;
    if(currentItem.type){
      previousVersion.type = currentItem.type;
    }
    if(currentItem.items){
      previousVersion.items = currentItem.items;
    }
    jq.ajax({
      url: "./accounts",
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(MAIN_DATA),
      success: function( data ) {
        console.log( "SERVER RESPONSE", data );
        location.reload();
      }
    });
  });
  return content;
}

function accountUI({
  isNewItem, isGroup, items, statusItems, 
  originalDateString, website, title, originalStatus, notes, autoIsChecked, amount, total
}){
  var content = jq(`
    <div>
      <div class="container content history">
      </div>
      <div class="container content account">
        ${ isNewItem
          ? `
            <h2><a class='popup-heading'>New ${ isGroup ? 'Group' : 'Item'}</a></h2>
            <div class="form-group">
              <label for="title">Title</label>
              <input class="u-full-width form-control" id="title" type="text"/>
            </div>
            `
          : `
            <h2>
              <a target="_blank" href="${website}">${title}</a>
            </h2>
            `
          }
        ${statusRow(statusItems, originalStatus, isNewItem)}
        ${isNewItem ? `
          <div class="form-group">
            <label for="website">Website</label>
            <input class="u-full-width form-control" type="text" id="website"/>
          </div>
        ` : ''}
        <div class="form-group">
        <label for="notes">Notes</label>
        <textarea class="u-max-full-width u-full-width form-control" rows="5" id="notes">${notes}</textarea>
      </div>
        <div class="form-group checkbox-group">
          <label for="auto-checkbox">AUTO</label>
          <input type="checkbox" id="auto-checkbox" ${autoIsChecked ? 'checked' : ''}>
        </div>
        ${isGroup ? `
          <div class="form-group">
            <label>Items</label>
            <table class="u-full-width">${items}</table>
            <br/>
          </div>`
        : ''}
        <div class="form-group">
          <label>Payment Amount</label>
          <input class="amount${isGroup? ` group`:''}" type="number" step="0.01" value="${amount}" ${isGroup ? 'disabled' : ''}/>
          ${!isNewItem && !isGroup ? `
            <button class="graph" data-title="Amount"><i class="fa fa-bar-chart"></i></button>
          ` : ''}
        </div>
        <div class="form-group">
          <label>Total Owed</label>
          <input  class="total${isGroup? ` group`:''}" type="number" value="${total}" id="total" ${isGroup ? 'disabled' : ''}/>
          ${!isNewItem && !isGroup  ? `
            <button class="graph" data-title="Total Owed"><i class="fa fa-bar-chart"></i></button>
          ` : ''}
        </div>
        <div class="form-group">
          <label>Date Due</label>
          <input type="date" value="${originalDateString}"/>
        </div>
        ${isNewItem ?  `
          <div class="form-group">
            <label>Occurence</label>
            <select class="u-full-width" id="occurence">
              <option value="once">Once</option>
              <option value="week">Weekly</option>
              <option value="bi-week">Bi-weekly</option>
              <option value="month" selected="selected">Monthly</option>
            </select>
          </div>
        ` : ''}
        <div class="row actions">
          <button class="button-primary cancel" onClick="">Cancel</button>
          ${isGroup && !isNewItem ?
            '<button class="button-primary remove" onClick="">Remove</button>'
            : ''}
          <button class="button-primary save" onClick="">${isNewItem ? 'Add' : 'Save'}</button>
        </div>
      </div>
    </div>
  `);

  var getStatus = function($item){
    var status = ($item.attr('class') || '').replace(/selected/g, '').trim();
    status = status.substring( 0, 1 ).toUpperCase() + status.substring(1).trim();
    return status;
  };

  content = statusHandler(content, originalStatus, originalDateString, getStatus);
  content = saveHandler(content, getStatus);

  content.find('button.cancel').on('click', function (e){
    jq('#popup-modal').click();
  });

  content.find('button.remove').on('click', function (e){
    var groupTitle = jq(this).parent().parent().find('h2 a').text().trim().toLowerCase();
    var backupGet = MAIN_DATA.liabilities.getByName;
    MAIN_DATA.liabilities = MAIN_DATA.liabilities.filter(x => x.title !== groupTitle);
    MAIN_DATA.liabilities.getByName = backupGet;
    //debugger;
    //removeGroup(group);
  });

  //graph click handler
  content.find('button.graph').on('click', function(e){
    var h = {
      type: 'liabilities',
      title: title.trim(),
      field: jq(this).data('title'),
      hijack: true
    };
    showHistoryPopup(null, h);
  });

  return content;
}

function makeAccountContent($clickedRow){
  var statusItems = ['due', 'pending', 'paid'];
  var dueDate = new Date(Date.now());
  dueDate.setMonth(dueDate.getMonth()+1);
  var defaultDateString = dueDate.toISOString().substring(0, 10);
  var originalDateString = $clickedRow.find('.date').text() || defaultDateString;
  var originalStatus = $clickedRow.find('.status').text();
  var notes = $clickedRow.find('.notes').text();
  var website = $clickedRow.find('.website').text();
  var title = $clickedRow.find('.title').text();
  var amount = $clickedRow.find('.amount').text().replace(/[$,]+/g,"");
  var total = $clickedRow.find('.total').text().replace(/[$,]+/g,"");
  var isNewItem = !title; //TODO: better condition
  var autoIsChecked = JSON.parse($clickedRow.find('.auto').text() || 'false');

  // potential bug when title of asset and liability the same
  var account = MAIN_DATA.liabilities.getByName(title.trim().toLowerCase())
    || MAIN_DATA.assets.getByName(title.trim().toLowerCase());
  var isGroup = account.type === "group";
  var items = (account.items || []).reduce((all, item) => {
    all += `<tr>
      <td class="">${item.title}</td>
      <td class="">${formatMoney(item.amount)}</td>
    </tr>`;
    return all;
  }, '')

  var content = accountUI({
    isNewItem, isGroup, items, statusItems, 
    originalDateString, website, title, originalStatus, notes, autoIsChecked, amount, total
  });

  return content;
}

function makeNewGroup(selected){
  var group = {
    type: "group",
    hidden: false,
    title: "New Group",
    note: "",
    items: selected.map(g => {
      var { title, amount, date, status } = g;
      return { title, amount, date, status };
     }),
    status: "paid",
    date: "2017-10-18",
    amount: selected.reduce((all, g) => { return all+Number(g.amount); }, 0),
    total_owed: selected.reduce((all, g) => { return all+Number(g.total_owed||0); }, 0),
    auto: false
  };
  return group;
}

function makeGroupContent($selected){
  const selectedTitles = $selected.toArray().map(
    x => jq(x).find('.title').text().trim()
  );
  const selectedAccounts = selectedTitles.map(
    x =>  MAIN_DATA.liabilities.getByName(x.toLowerCase())
  ).filter(x => !!x);


  //TODO: add to group here
  var newGroup = makeNewGroup(selectedAccounts);

  var isNewItem = true;
  var isGroup = true;
  var autoIsChecked = false;
  var items = (newGroup.items || []).reduce((all, item) => {
    all += `<tr>
      <td class="">${item.title}</td>
      <td class="">${formatMoney(item.amount)}</td>
    </tr>`;
    return all;
  }, '');
  var statusItems = ['due', 'pending', 'paid'];
  var originalDateString = newGroup.date;
  var website = '';
  var { title, note, total_owed, amount } = newGroup;

  var content = accountUI({
    isNewItem, isGroup, items, statusItems, 
    originalDateString, website, title, originalStatus:status, notes: note, autoIsChecked, amount, total: total_owed
  });

  content.find('.form-group:contains(AUTO)').hide();
  content.find('.form-group:contains(Website)').hide();
  content.find('.container.content.account h2').hide();

  return content;
}

