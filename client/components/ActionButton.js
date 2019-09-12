import React from 'react';
import { Menu, ChildButton, MainButton } from 'react-mfb';

const menuProps = {
    effect: 'slidein',
    position: 'br',
    method: 'click'
};


function ActionButton({ onChoose }) {
    const childMenuClick = (which) => {
        onChoose && onChoose(which)
        const mainIcon = document && document.querySelector('.mfb-component__main-icon--active');
        /* istanbul ignore next */
        mainIcon && mainIcon.click();
        // ^^^ hard to test this due to how react-mfb is written
    };

    return (
        <div className='floating-action-button'>
            <Menu {...menuProps}>
                <MainButton
                    iconResting="a-icon fa fa-plus"
                    iconActive="a-icon fa fa-times"
                />
                <ChildButton
                    onClick={() => childMenuClick('dollar')}
                    icon="a-icon fa fa-dollar"
                    label="Add a new expense"
                />
                <ChildButton
                    onClick={() => childMenuClick('group')}
                    icon="a-icon fa fa-align-justify"
                    label="Create a group"
                />
                <ChildButton
                    onClick={() => childMenuClick('refresh')}
                    icon="a-icon fa fa-refresh"
                    label="Update application"
                />
            </Menu>
        </div>
    );
}

export default ActionButton;