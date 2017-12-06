import React from 'react';

//TODO: click handlers, selected, flickity?

function Menu({selectedMenuIndex}){
    const menuItems = ['debts', 'totals', 'assets'].map((item, key) => {
        const menuClass = "button menu button-primary" + (key === selectedMenuIndex ? ' selected' : '');
        return (
            <a className={menuClass} key={key}>{item}</a>
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
