import React from 'react';

import {
    accountClick
} from '../../redux/actions';

import Row from './Row';

function Assets({assets = []}){
    const assetRows = assets.map((data, key) => {
        const isGroup = false;
        const props = {
            data, key,
            rowClassName: `button ${data.status.toLowerCase()} primary${isGroup ? " group" : ""}`,
            rowClick: () => accountClick(data.title)
        };
        return <Row {...props}></Row>
    });

    return (
        <div className="carousel-cell">
            <div className="container">
                <div className="column assets">
                    {assetRows}
                </div>
            </div>
        </div>
    );
}

Assets.propTypes = {};

export default Assets;
