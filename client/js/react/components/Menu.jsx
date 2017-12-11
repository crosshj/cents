import React from 'react';
import {
    menuSelect
  } from '../../redux/actions';

function Menu({items, selected}){
    const menuItems = items.map((item, key) => {
        const menuClass = "button menu button-primary" + (key === Number(selected) ? ' selected' : '');
        return (
            <a className={menuClass} key={key} onClick={() => menuSelect(key)}>{item}</a>
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
