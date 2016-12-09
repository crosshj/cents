  //var React = InfernoCompat;
  //var ReactDOM = InfernoCompat;

  var React = Inferno;
  React.createElement = InfernoCreateElement;
  var ReactDOM = InfernoDOM;

  var randomBetween = function(begin, end){
    return Math.floor(Math.random() * end) + begin;
  }
  var pages = new Array(3).fill().map((k, i) => ({
    name: 'Page ' + i,
    rows: new Array(randomBetween(5, 15)).fill()
  }));

  var Header = function(props){
    return (
      <div id="header" class="row">
        { pages.map((k, i) =>
          <div className="tab">
            <span>{k.name}</span>
          </div>
        )}
        <div className="bar-container">
          <div className="bar"></div>
        </div>
      </div>
    );
  };
  var Rows = function(props) {
    return (
      <div id="main-carousel">
        { pages.map((k, i) =>
          <div className="carousel-cell">
            <div className="container" id='main_contain'>
              { pages[i].rows.map((k, i) => 
                <div className="row">
                  <div className="column">
                    <h5>Row Number {i+1}</h5>
                    <p>Some row text which is purposely really long so I can see some wrap going on</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  var Main = function(props){
    return (
      <div>
        <Header />
        <Rows />
      </div>
    );
  };
  ReactDOM.render(<Main />, document.body);
  document.querySelectorAll('.tab')[0].className += ' selected';

  // setup column swipe
  var flkty = new Flickity('#main-carousel', {
    // options
    setGallerySize: false,
    dragThreshold: 50,
    prevNextButtons: false,
    pageDots: false,
    wrapAround: false,
    draggable: true
  });
  function selectListener(/* parameters */) {
    console.log('Flickity select ' + flkty.selectedIndex );
    var selectedTab = document.querySelector('.tab.selected');
    if (selectedTab){
      selectedTab.className = selectedTab.className.replace(/selected/,'').trim();
    }
    var tabToSelect = document.querySelectorAll('.tab')[flkty.selectedIndex];
    if (tabToSelect){
      tabToSelect.className += ' selected';
    }
  }
  function scrollListener(progress) {
    var someProg = Math.max( 0, Math.min( 1, progress ))
    document.querySelector('.bar-container .bar').style.left = 100 * someProg * 0.6666 + "%";
  }
  // bind event listener
  flkty.on( 'select', selectListener );
  flkty.on( 'scroll', scrollListener );