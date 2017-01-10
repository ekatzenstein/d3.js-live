import React from 'react';
import {Link} from 'react-router';

function ExampleLink(props){
  const d = props.file;
  const characterLength=22;
  const route = d.name.split(' ').join('_').split('/').join('');
  return(
    <div style={{float:'left',marginTop:'15px', marginBottom:'15px', marginLeft:'15px',paddingTop:'15px', paddingBottom:'15px', border:'1px solid lightgrey',width:'43%', textAlign:'center'}}>
    <Link to={route} className='link' key={d.name} style={{fontSize:'14px', whiteSpace:'nowrap',textOverflow:'ellipsis'}}><img alt={d.name} src={d.thumbnail.raw_url} width='100%'/><br/>{d.name.substring(0,characterLength)}{d.name.length>characterLength?'...':null}</Link>
    </div>
  )
}

export default ExampleLink;
