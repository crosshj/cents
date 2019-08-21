import React from 'react';
import { Menu, ChildButton, MainButton } from 'react-mfb';

const menuProps = {
    effect: 'slidein',
    position: 'br',
    method: 'click'
};

const childMenuClick = () => {
    console.log('Action Button child click: handler should be passed by parent!');
    document.querySelector('.mfb-component__main-icon--active').click();
};

function ActionButton() {
    return (
        <div className='floating-action-button'>
            <Menu {...menuProps}>
                <MainButton
                    iconResting="a-icon fa fa-plus"
                    iconActive="a-icon fa fa-times"
                />
                <ChildButton
                    onClick={childMenuClick}
                    icon="a-icon fa fa-dollar"
                    label="Add a new expense"
                />
                <ChildButton
                    onClick={childMenuClick}
                    icon="a-icon fa fa-align-justify"
                    label="Create a group"
                />
                <ChildButton
                    onClick={childMenuClick}
                    icon="a-icon fa fa-refresh"
                    label="Update application"
                />
            </Menu>
        </div>
    );
}

export default ActionButton;