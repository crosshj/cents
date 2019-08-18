import React from 'react';
import { dispatch } from '../redux/actions';

const Router = ({ page, children }) => {
    return (
        <React.Fragment>
            { children.filter(child => {
                //console.log({page, childPage: child.props.path, child});
                return page.includes(child.props.path);
            })}
        </React.Fragment>
    );
};
Router.propTypes = {};


const Route = ({ children }) => {
    return (
        <React.Fragment>
            { children }
        </React.Fragment>
    );
};
Route.propTypes = {};


const Link = (props) => {
    const onClick = ({ action, body, to, href, event }) => {
        const payload = body || to || href;
        const type = action;
        if(action){
            window.location.hash = payload;
            dispatch({ type, payload });
        }
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    return (
        <a href="javascript:void(0)"
            style={props.style}
            className={props.className}
            onClick={(event) => onClick(Object.assign({}, props, { event }))}
        >
            {props.text || props.children}
        </a>
    );
};
Link.propTypes = {};


export default Router;
export { Route, Link };