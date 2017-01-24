  /*
    TODO:
      - DO NOT open popup if x scrolling
      - DO NOT x scroll if popup is opening
      - DO NOT x scroll if y is scrolling
      - DO NOT y scroll if x is scrolling
  */

  function makeRow (data){
    var primary = data.status.toLowerCase() !== "paid" ? " button-primary" : "";
    return $(' \
      <a class="button '+ data.status.toLowerCase() + primary + '"> \
          <table class="u-full-width"> \
            <tbody> \
              <tr class="header"> \
                <td colspan="2" class="title">' + data.title + ' <!-- i class="fa fa-info-circle"></i --></td> \
                <td class="status">'+ data.status.toUpperCase() +'</td> \
              </tr> \
              <tr class="info"> \
                <td class="amount">$'+ data.amount +'</td> \
                <td class="total">'+ data.totalOwed +'</td> \
                <td class="date">'+ data.date +'</td> \
                <td class="website hidden">'+ data.website +'</td> \
                <td class="notes hidden">'+ data.notes +'</td> \
              </tr> \
            </tbody> \
          </table> \
        </a> \
    ');
  }

  function makeTotalsRow(){
    return $(' \
      <a class="button totals"> \
        <table class="u-full-width"> \
          <tbody> \
            <tr class="header"> \
              <td colspan="2" class="title center">Current</td> \
            </tr> \
            <tr class="header"> \
              <td class="title">Balance</td> \
              <td class="status">TODO</td> \
            </tr> \
            <tr class="header"> \
              <td class="title">Pending</td> \
              <td class="status">TODO</td> \
            </tr> \
            <tr class="header"> \
              <td class="title">Due</td> \
              <td class="status">TODO</td> \
            </tr> \
            <tr class="header"> \
              <td class="title"></td> \
              <td class="status">TODO</td> \
            </tr> \
          </tbody> \
        </table> \
      </a> \
      <a class="button totals"> \
        <table class="u-full-width"> \
          <tbody> \
            <tr class="header"> \
              <td colspan="2" class="title center">Monthly</td> \
            </tr> \
            <tr class="header"> \
              <td class="title">Assets</td> \
              <td class="status">$6,442.00</td> \
            </tr> \
            <tr class="header"> \
              <td class="title">Debt</td> \
              <td class="status">$4,699.66</td> \
            </tr> \
            <tr class="header"> \
              <td class="title"></td> \
              <td class="status">$1742.34</td> \
            </tr> \
          </tbody> \
        </table> \
      </a> \
      <a class="button totals"> \
        <table class="u-full-width"> \
          <tbody> \
            <tr class="header"> \
              <td class="title">Debt Total</td> \
              <td class="status">$97,082.84</td> \
            </tr> \
          </tbody> \
        </table> \
      </a> \
    ');
  }

  function makeMenuButton (data){
    var initialIndex = localStorage && localStorage.getItem('selectedTab');
    var selected = data.count === Number(initialIndex)
      ? " selected "
      : "";
    return $(' \
      <a class="button menu button-primary '+ data.name.toLowerCase() + selected + '"> \
          ' + data.name.toLowerCase() + ' \
      </a> \
    ');
  }

  function makeMenu ($menuContainer){
    var menu = ["debts", "totals", "assets"];
    menu.forEach(function(item, i){
      var $button = makeMenuButton({ name: item, count: i});
      $button.click(function(){
        window.flkty && window.flkty.selectCell(i);
      });
      $menuContainer.append($button);
    });
  }

  function createUI(data){
    makeMenu($('div.menu'));
    var formattedData = formatAccountData(data);
    formattedData.liabilities.forEach(function(item){
      if (item.hidden === "true") return;
      $('div.liabilities').append(makeRow({
          status: item.status,
          title: item.title,
          amount: item.amount,
          totalOwed: item.total_owed > 0 ? '$'+item.total_owed : '',
          date: item.date,
          website: item.website,
          notes: item.note
      }));
    });

    $('div.totals .row').append(makeTotalsRow());

    $('a.button:not(.menu)').on("click", function(e){
      switch (true){
        case $(this).is('.paid, .pending, .due'):
          $('a.button.selected:not(".menu")').removeClass('selected')
          var content = typeof makeAccountContent === "function" && makeAccountContent($(this));
          typeof popUpModal === "function" && popUpModal($(this), content);
          break;
        default:
          console.log('--- some other case');
          break;
      }
    });

    $('#popup-modal').on('click', function(e){
      if(e.target !== e.currentTarget) return;
      typeof popUpModal === "function" && popUpModal();
      $('a.button.selected:not(".menu")').removeClass('selected')
    });

    $('#popup-modal .content').on('click', function(e){
      e.stopPropagation();
      return false;
    });

    setTimeout(function(){
      setupSwipe();
    }, 1000)
  }

  $.get("/json", createUI);

  function handleTouchMove(e){
    if($('div#popup-modal.show').length){
      e.preventDefault();
      return false;
    }
  }

  function setupSwipe(){
    if (!window.Flickity){
      console.log('No swipe library found');
      return;
    }
    var initialIndex = localStorage && localStorage.getItem('selectedTab');
    initialIndex = initialIndex || 0;

    // setup column swipe
    window.flkty = new Flickity('#main-carousel', {
      // options
      initialIndex,
      setGallerySize: false,
      dragThreshold: 50,
      prevNextButtons: false,
      pageDots: false,
      wrapAround: true,
      draggable: true,
      percentPosition: true
    });
    function selectListener(/* parameters */) {
      var selectedTab = document.querySelector('.menu .button.selected');
      if (selectedTab){
        selectedTab.className = selectedTab.className.replace(/selected/,'').trim();
      }
      var tabToSelect = document.querySelectorAll('.menu .button')[flkty.selectedIndex];
      if (tabToSelect){
        tabToSelect.className += ' selected';
        localStorage.setItem('selectedTab', flkty.selectedIndex);
      }
    }
    flkty.on( 'select', selectListener );

    // function scrollListener(progress) {
    //   var someProg = Math.max( 0, Math.min( 1, progress ))
    //   document.querySelector('.bar-container .bar').style.left = 100 * someProg * 0.6666 + "%";
    // }
    //flkty.on( 'scroll', scrollListener );

    // TODO: don't change tabs while scrolling
    // function tempDisableDrag() {
    //   flkty.unbindDrag();
    //   setTimeout(function(){
    //     flkty.bindDrag();
    //   }, 1000);
    // }
    // $(document).scroll(tempDisableDrag);
    // $(window).on("touchmove", tempDisableDrag);
  }

  $(document).ready(function(){
    var colorsList = [];
    var bgColor = "rgba(81, 84, 17, 0.46)";
    //backgroundGradient(colorsList, 3, 3, bgColor);
    var lockOrientation = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation || function(){};
    lockOrientation("portrait-primary");
    $(window).on("touchmove", handleTouchMove);
  });