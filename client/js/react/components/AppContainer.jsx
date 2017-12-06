import React from 'react';

import Menu from './Menu';
import Liabilities from './Liabilities';

import Flickity from 'react-flickity-component/src/index';

const flickityOptions = {
  // options
  initialIndex: localStorage && localStorage.getItem('selectedTab') || 0,
  setGallerySize: false,
  dragThreshold: 50,
  prevNextButtons: false,
  pageDots: false,
  wrapAround: true,
  draggable: true,
  percentPosition: true
}

class AppContainer extends React.Component {
  constructor(props, context){
    const p = JSON.parse(JSON.stringify(props));
    p.selectedMenuIndex = localStorage && localStorage.getItem('selectedTab') || 0;
    super(props, context);
    this.state = p;
    this.onSwipe = this.onSwipe.bind(this);
  }

  componentWillReceiveProps(nextProps){
    //console.log('--- got new props');
    const props = JSON.parse(JSON.stringify(nextProps));
    props.selectedMenuIndex = localStorage && localStorage.getItem('selectedTab') || 0;
    this.setState(props);
  }

  onSwipe(index){
    localStorage.setItem('selectedTab', index);
    this.setState({selectedMenuIndex: index});
  }

  render () {
    //console.log('--- render');
    const props = this.state;
    return (
      <div>
        <Menu {...props}/>
        <Flickity
          className={ 'main-carousel' } 
          elementType={ 'div' } // default 'div' 
          options={ flickityOptions } // takes flickity options {} 
          disableImagesLoaded={ false } // default false
          reloadOnUpdate={false}
          onSwipe={this.onSwipe}
        >
            <Liabilities liabilities={this.state.liabilities}/>
            <Liabilities liabilities={this.state.liabilities}/>
            <Liabilities liabilities={this.state.liabilities}/>
            {/* <div className="carousel-cell">
              <div className="container">
                  <div className="column totals">
                    <div className="row"></div>
                  </div>
              </div>
            </div>
            <div className="carousel-cell">
              <div className="container">
                  <div className="column assets">
                    <div className="row"></div>
                  </div>
              </div>
            </div> */}
        </Flickity>
      </div>
    );
  }
}

AppContainer.propTypes = {};

export default AppContainer;