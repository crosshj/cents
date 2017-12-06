import React from 'react';

function Menu({items, selected, onSelect}){
    const menuItems = items.map((item, key) => {
        const menuClass = "button menu button-primary" + (key === Number(selected) ? ' selected' : '');
        return (
            <a className={menuClass} key={key} onClick={() => onSelect(key)}>{item}</a>
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
