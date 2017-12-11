import React from 'react';

import Menu from './Menu';
import Liabilities from './Liabilities';
import Assets from './Assets';
import Totals from './Totals';
import Popup from './Popup';

import Flickity from 'react-flickity-component';

class AppContainer extends React.Component {
  constructor(props, context){
    super(props, context);
    this.props = props;
  }

  componentWillReceiveProps(nextProps){
    //console.log('--- got new props');
    //const props = JSON.parse(JSON.stringify(nextProps));
    //props.selectedMenuIndex = localStorage && localStorage.getItem('selectedTab') || 0;
    //this.props = nextProps;
  }

  render () {
    //console.log('--- render');

    const flickityOptions = {
      // options
      initialIndex: this.props.selectedMenuIndex || 0,
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
        { !this.props.error &&
          <Menu
            items={['Debts', 'Totals', 'Assets']}
            selected={this.props.selectedMenuIndex}
          />
        }
        { !this.props.error &&
          <Flickity
            className={ 'main-carousel' } 
            elementType={ 'div' } // default 'div' 
            options={ flickityOptions } // takes flickity options {} 
            disableImagesLoaded={ true } // default false
            reloadOnUpdate={false}
            onSwipe={this.onMenuSelect}
          >
              <Liabilities liabilities={this.props.liabilities}/>
              <Totals totals={this.props.totals}/>
              <Assets assets={this.props.assets}/>
          </Flickity>
        }
        { this.props.error &&
          <div className="center-all">
            <i className="fa fa-spinner fa-pulse fa-5x fa-fw white  "></i>
          </div>
        }
        { this.props.error &&
          <div id="login">
            <iframe width="100%" height="100%" frameBorder="0" src="./login/" />
          </div>
        }
        <Popup {...this.props.popup}/>
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