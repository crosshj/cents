import React from 'react';
import ReactSidebar from "react-sidebar";

const SideBarContent = () => {
    return (
      <div className="sidebar-menu">
        [ Insert Sidebar Content Here ]
      </div>
    );
  };

const Sidebar = ({
    open, onSetOpen
}) => {
    return (
        <ReactSidebar
            sidebar={SideBarContent()}
            open={open}
            onSetOpen={onSetOpen}
            styles={{ sidebar: { zIndex: 32 }, overlay: { zIndex: 31 } }}
        ></ReactSidebar>
    );
};

export default Sidebar;
