import React from 'react';

import Menu from './Menu';
import Liabilities from './Liabilities';
import Assets from './Assets';
import Totals from './Totals';

import Flickity from 'react-flickity-component';

class AppContainer extends React.Component {
  constructor(props, context){
    const p = JSON.parse(JSON.stringify(props));
    p.selectedMenuIndex = localStorage && localStorage.getItem('selectedTab') || 0;
    super(props, context);
    this.state = p;
    this.onMenuSelect = this.onMenuSelect.bind(this);
  }

  componentWillReceiveProps(nextProps){
    //console.log('--- got new props');
    //const props = JSON.parse(JSON.stringify(nextProps));
    //props.selectedMenuIndex = localStorage && localStorage.getItem('selectedTab') || 0;
    this.setState(nextProps);
  }

  onMenuSelect(index){
    localStorage.setItem('selectedTab', index);
    this.setState({selectedMenuIndex: index});
  }

  render () {
    //console.log('--- render');
    const props = this.state;
    
    const flickityOptions = {
      // options
      initialIndex: this.state.selectedMenuIndex || 0,
      setGallerySize: false,
      dragThreshold: 50,
      prevNextButtons: false,
      pageDots: false,
      wrapAround: true,
      draggable: true,
      percentPosition: true
    }
    
    return (
      <React.Fragment>
        <Menu
          items={['Debts', 'Totals', 'Assets']}
          selected={this.state.selectedMenuIndex}
          onSelect={this.onMenuSelect}
        />
        <Flickity
          className={ 'main-carousel' } 
          elementType={ 'div' } // default 'div' 
          options={ flickityOptions } // takes flickity options {} 
          disableImagesLoaded={ true } // default false
          reloadOnUpdate={false}
          onSwipe={this.onMenuSelect}
        >
            <Liabilities liabilities={this.state.liabilities}/>
            <Totals totals={this.state.totals}/>
            <Assets assets={this.state.assets}/>
        </Flickity>
        <div id="login" className="hidden">
          <iframe width="100%" height="100%" frameBorder="0" src="./login/" />
        </div>
        <div id="popup-modal"></div>
        <div id="corner-circle">0</div>
        {/* This fake div hidden preloads our web font! */}
        <div className="div-fake-hidden">
          <i className="fa fa-square-o fa-3x"></i>
        </div>
      </React.Fragment>
    );
  }
}

AppContainer.propTypes = {};

export default AppContainer;