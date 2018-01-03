import React from 'react';

import Menu from './Menu';
import Liabilities from './Liabilities';
import Assets from './Assets';
import Totals from './Totals';
import Popup from './Popup';
import Login from './Login';

import { menuSelect } from '../../redux/actions';

//import Flickity from 'react-flickity-component';
//import GlobalFlickity from 'flickity';
//window.Flickity = GlobalFlickity;

import { Carousel } from 'react-responsive-carousel';
//import styles from 'react-responsive-carousel/lib/styles/carousel.min.css';

class AppContainer extends React.Component {
  constructor(props, context){
    super(props, context);
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
          <Carousel
            selectedItem={this.props.selectedMenuIndex || 0}
            showArrows={false}
            useKeyboardArrows
            infiniteLoop
            emulateTouch
            dynamicHeight
            showStatus={false}
            showIndicators={false}
            showThumbs={false}
            onChange={menuSelect}
            className='carousel-main'
          >
              <Liabilities liabilities={this.props.liabilities}/>
              <Totals totals={this.props.totals}/>
              <Assets assets={this.props.assets}/>
          </Carousel>
        }
        { this.props.error &&
          <div className="center-all">
            <i className="fa fa-spinner fa-pulse fa-5x fa-fw white  "></i>
          </div>
        }
        { this.props.error &&
          <Login />
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
