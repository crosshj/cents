import React from 'react';

import Menu from './Menu';
import Liabilities from './Liabilities';

import Flickity from 'react-flickity-component/src/index'

var initialIndex = localStorage && localStorage.getItem('selectedTab');
initialIndex = initialIndex || 0;

const flickityOptions = {
  // options
  initialIndex,
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
    super(props, context);
    this.state = props;
  }

  componentWillReceiveProps(nextProps){
    //console.log('--- got new props');
    this.setState(nextProps);
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
          reloadOnUpdate={true}
        >
            <Liabilities liabilities={this.state.liabilities}/>
            <div className="carousel-cell">
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
            </div>
        </Flickity>
      </div>
    );
  }
}

AppContainer.propTypes = {};

export default AppContainer;