import React from 'react';
import ReactSidebar from "react-sidebar";

const SideBarContent = ({ children, closer }) => {
    const filteredChildren = children.filter(x => !!x);

    return (
      <div className="sidebar-menu">
        <ul>
        { React.Children.map(filteredChildren, child => (
          <li
            className={'sidebar-link'}
            onClick={child.props.to ? undefined : closer}
          >{
            child.props.to
              ? React.cloneElement(child, { before: closer })
              : child
          }</li>
        ))}
        </ul>
      </div>
    );
  };

const Sidebar = ({
    open, onSetOpen, children
}) => {
    return (
        <ReactSidebar
            sidebar={
              <SideBarContent
                closer={() => {
                  onSetOpen(false);
                }}
              >
                { children }
              </SideBarContent>
            }
            open={open}
            onSetOpen={onSetOpen}
            styles={{ sidebar: { zIndex: 32 }, overlay: { zIndex: 31 } }}
        ></ReactSidebar>
    );
};

export default Sidebar;
