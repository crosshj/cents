import React from 'react';
import Sidebar from "./Sidebar";

import ActionButton from './ActionButton';
import Menu from './Menu';
import Liabilities from './Liabilities';
import Assets from './Assets';
import Totals from './Totals';
import Popup from './Popup';
import Login from './Login';
import Router, { Link, Route } from './Router';
import APR from './APR';

import { menuSelect } from '../redux/actions';

import Flickity from 'react-flickity-component';
import GlobalFlickity from 'flickity/dist/flickity.pkgd.min';
//import GlobalFlickity from 'flickity';
window.Flickity = GlobalFlickity;

var safeAccess = (fn) => {
  var response = undefined;
  try {
    response = fn();
  } catch (error) {
    // nothing
  }
  return response;
};

class AppContainer extends React.Component {
  constructor(props, context){
    super(props, context);
    this.state = {
      sidebarOpen: false
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
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
    };

    //console.log({ props: this.props });

    const { liabilities, assets, totals } = safeAccess(() => this.props.accounts) || {};
    const headerText = 'Accounts';
    return (
      <React.Fragment>
        <Sidebar
          open={this.state.sidebarOpen}
          onSetOpen={this.onSetSidebarOpen}
        ></Sidebar>
        <Router page={this.props.page}>
          <Route path='/accounts'>
            <header>
              <div className="hamburger-menu">
                <a onClick={() => this.onSetSidebarOpen(true)}>
                  <i className="fa fa-bars"></i>
                </a>
              </div>
              <span>{headerText}</span>
            </header>
            <nav>
              { !this.props.error &&
                <Menu
                  items={['Debts', 'Totals', 'Assets']}
                  selected={this.props.selectedMenuIndex}
                />
              }
            </nav>
            <main>
              { !this.props.error &&
                <Flickity
                  className={ 'main-carousel' }
                  elementType={ 'div' } // default 'div'
                  options={ flickityOptions } // takes flickity options {}
                  disableImagesLoaded={ true } // default false
                  reloadOnUpdate={false}
                  onSwipe={menuSelect}
                >
                    <Liabilities liabilities={liabilities}/>
                    <Totals totals={totals}/>
                    <Assets assets={assets}/>
                </Flickity>
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
            </main>
            <footer>
              <div id="corner-circle">0</div>
              <ActionButton />
              <Link
                action="PAGE_CHANGE"
                to='/debt-pay-calc'
                className="test-link"
                text="Debt Pay Calc"
              />
            </footer>
          </Route>

          <Route path='/debt-pay-calc'>
            <APR/>
            <Link
              action="PAGE_CHANGE"
              to='/accounts'
              className="test-link"
              text="Accounts Page"
            />
          </Route>

        </Router>

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
