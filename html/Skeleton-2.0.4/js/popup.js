function popUpModal(target, content){
 if(content){
  $('div#popup-modal').html(content);
 }
 if ($('div#popup-modal.show').length){
   $('div#popup-modal').css({top:'100%', bottom: '100%'});
   $('div#popup-modal').removeClass('show');
   $('body').removeClass('lock-screen');
 } else {
   var scrollTop = $('body').scrollTop();
   $('div#popup-modal').css({top:scrollTop, bottom: -1*scrollTop});
   $('body').addClass('lock-screen');
   $('div#popup-modal').addClass('show');
 }
}

var statusRow = function(statusItems, status){
  status = status || '';
  return '<div class="row status">' +
    statusItems.reduce(function(target, item){
      var className = ' class="' +
        (item === status.trim().toLowerCase() ? 'selected ' : '') +
        item + '"';
      return target + '<button'+className+'>' + item + '</button>';
    }, '') +
  '</div>';
}

function makeAccountContent($clickedRow){
  var statusItems = ['due', 'pending', 'paid'];
  var originalDateString = $clickedRow.find('.date').text();
  var originalStatus = $clickedRow.find('.status').text();
  var notes = $clickedRow.find('.notes').text();

  var content = $('<div class="container content">'
    + '<h2>'
      + '<a target="_blank" href="'+$clickedRow.find('.website').text()+'">'
      + $clickedRow.find('.title').text()
      + '</a>'
    +'</h2>'
      + statusRow(statusItems, originalStatus)
      + '<label>Notes</label>'
      + '<textarea class="notes">' + notes + '</textarea>'
      + '<label>Amount</label>'
      + '<input class="amount" type="number" step="0.01" value="'+$clickedRow.find('.amount').text().replace(/[$,]+/g,"")+'"/>'
      + '<button class="graph"><i class="fa fa-bar-chart"></i></button>'
      + '<label>Total</label>'
      + '<div class="row"><input  class="total" type="number" value="'+$clickedRow.find('.total').text().replace(/[$,]+/g,"")+'"/>'
      + '<button class="graph"><i class="fa fa-bar-chart"></i></button></div>'
      + '<label>Date</label>'
      + '<input type="date" value="'+ originalDateString +'"/>'
      + '<div class="row actions">'
        +'<button class="button-primary cancel" onClick="">Cancel</button>'
        +'<button class="button-primary save" onClick="">Save</button>'
      +'</div>'
    + '</div>');
  var getStatus = function($item){
    var status = $item.attr('class').replace(/selected/g, '').trim();
    status = status.substring( 0, 1 ).toUpperCase() + status.substring(1).trim();
    return status;
  };

  content.find('.status.row button').on('click', function (e){
    var currentSelectedStatus = getStatus(content.find('.selected'));
    var clickedStatus = getStatus($(this));

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
    $(this).addClass('selected');
  });

  var getCurrentItem = function(item){
    var status = getStatus(item.find('.selected'));
    return {
      name: item.find('h2').text().trim(),
      status: status,
      amount: item.find('.amount').val(),
      total: item.find('.total').val(),
      date: item.find('input[type="date"]').val(),
      notes: item.find('textarea.notes').val()
    };
  }
  content.find('button.cancel').on('click', function (e){
    $('#popup-modal').click();
  });
  content.find('button.save').on('click', function (e){

    var currentItem = getCurrentItem($(this).parent().parent());
    var previousVersion = MAIN_DATA.liabilities.getByName(currentItem.name.toLowerCase())
      || MAIN_DATA.assets.getByName(currentItem.name.toLowerCase());
    previousVersion.title = currentItem.name;
    previousVersion.status = currentItem.status;
    previousVersion.amount = currentItem.amount;
    previousVersion.total_owed = currentItem.total || '0.00';
    previousVersion.date = currentItem.date;
    previousVersion.note = currentItem.notes.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    $.post( "/", JSON.stringify(MAIN_DATA), function( data ) {
      console.log( "SERVER RESPONSE", data );
      location.reload();
    });
  });
  return content;
}
