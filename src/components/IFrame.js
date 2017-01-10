//arduinoLight
//ascetic
//colorBrewer
//github


import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/styles';
import MarkdownRenderer from 'react-markdown-renderer';

const style=(props)=>({

  transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
  transition: props.animateCode ? 'all 450ms' : 'all 0ms',
  width: `${ 100 *(1 - props.left)}%`,
  height: `${100-100*(props.headerHeight)/window.innerHeight}%`,
  position: 'absolute',
  left: `${ 100 *props.left}%`,
  zIndex: 0,
  marginTop: `${props.headerHeight+8}px`,
  overflowY:'auto'

})

class IFrame extends React.Component{
  constructor(props){
    super(props);

    this.iFrameLoaded=this.iFrameLoaded.bind(this);
  }
  shouldComponentUpdate(nextProps){
    return (this.props.data !== nextProps.data) || (this.props.left !== nextProps.left);
  }

  iFrameLoaded() {
       var iFrameID = document.getElementById('preview');
       var iFrameContent = iFrameID.contentDocument || iFrameID.contentWindow.document;

       if(iFrameID) {
         if(this.props.gist.ogist && window.location.hash!=='#/'){
             // here you can make the height, I delete it first, then I make it again
             iFrameID.height = "";
             iFrameID.width = "";
             iFrameID.height = iFrameContent.body.scrollHeight+20 + "px";
             iFrameID.width = iFrameContent.body.scrollWidth+20 + "px";
               var supportID = document.getElementById('support-files');
               supportID.style.width = iFrameContent.body.scrollWidth-20 + "px";
         }
         else{
           iFrameID.height='150%';
           iFrameID.width='100%';
         }

       }
   }

  render(){
      const gist = this.props.gist;
      const author = gist.author ==='ekatzenstein' ? 'mbostock' : gist.author;
      let url = '';

      if(this.props.gist.ogist){
        const codeArr = this.props.gist.ogist.url.split('/')
        const blockId = codeArr[codeArr.length-1]
        const blockUser = codeArr[codeArr.length-2]
         url = `https://gist.github.com/${blockUser}/${blockId}`;
      }

    return(
      <div style={style(this.props)}>

      {this.props.gist.ogist ?
        <div id='support-files' style={{padding:'15px', display:'block', margin:'auto', paddingTop:'40px'}}>
        <h4 className='fileTitle' style={{margin:'auto', textAlign:'center'}}><a href={`/${gist.author}/${gist.id}`}>{gist.ogist.name}</a> / <a style={{color:'black'}}  href={`https://github.com/${author}`}>{author}</a></h4>
        <iframe id="preview" onLoad={this.iFrameLoaded} width='4000px' height='4000px' style={{margin:'auto', display:'block', paddingTop:'40px'}}/>
        {gist.readme?<div>
          {
          <base href="https://gist.github.com" target="_blank"/>
          }
          <MarkdownRenderer markdown={gist.readme.content} className='fileTitle'/></div>:null}
      {gist.files.map(d=>{
        return <div key={d.filename}><br/><h3 className='fileTitle'><a target="_blank" href={`${url}#file-${d.filename.split('.').filter(el=>el).join('-')}`}>#</a>&nbsp;{d.filename==='.block'?'LICENSE':d.filename}</h3>
           <SyntaxHighlighter language='javascript' style={github}>{d.content}</SyntaxHighlighter>
         </div>;
      })}
      </div>


  :<iframe id="preview" onLoad={this.iFrameLoaded} style={{margin:'auto', display:'block', paddingTop:'40px'}}/>
}
        </div>
    )
  }
}

export default IFrame;
