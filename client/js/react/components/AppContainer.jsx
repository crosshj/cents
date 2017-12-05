import React from 'react';

import Menu from './Menu';

class AppContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(){
    //console.log('--- got new props');
  }

  render () {
    //console.log('--- render');
    return (
      <div>
        <Menu />
        <div id="main-carousel">
            <div className="carousel-cell">
            <div className="container">
                <div className="column liabilities"></div>
            </div>
            </div>
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