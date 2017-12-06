import React from 'react';

import Menu from './Menu';
import Liabilities from './Liabilities';


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
        <div id="main-carousel">
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
        </div>
      </div>
    );
  }
}

AppContainer.propTypes = {};

export default AppContainer;