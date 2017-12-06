import React from 'react';

//TODO: click handlers, selected, flickity?

function Menu(){
    const menuItems = ['debts', 'totals', 'assets'].map((item, key) => {
        return (
            <a className="button menu button-primary" key={key}>{item}</a>
        );
    });

    return (
    <div className="container">
        <div className="row">
            <div className="column menu">
                { menuItems }
            </div>
        </div>
    </div>
 );
}

Menu.propTypes = {};

export default Menu;
