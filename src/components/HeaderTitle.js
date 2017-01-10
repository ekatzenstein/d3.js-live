import React from 'react';
// import {Link} from 'react-router';

const HeaderTitle = (props) => (
  <span className='sidebarTitle'>
    <a href="https://d3js.org/" target="_blank">d3.js</a>
    <span style={{color:'black'}}> /
      <a href='http://d3js.live' target='_self' style={{color:'black'}}> live</a>
    </span>
  </span>
)

export default HeaderTitle;
