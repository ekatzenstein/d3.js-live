//third party libraries
import React, {Component} from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
// import GitHub from 'github-api';
import { bindActionCreators } from 'redux';

import * as Actions from '../actions';

//styles
import '../App.css';

//custom components and containers
import ExampleDrawer from './ExampleDrawer';
import CodeDrawer from './CodeDrawer';
import Header from '../components/Header';
import IFrame from '../components/IFrame';

//material-ui requirements
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

//constants
const headerHeight = 80;
const top = headerHeight / window.innerHeight;

class App extends Component {
    constructor() {
        super();
        this._updateCode = this._updateCode.bind(this);
        this._refreshCode = this._refreshCode.bind(this);
        this._updateCanvas = this._updateCanvas.bind(this);
        this._getFiles = this._getFiles.bind(this);
        this._resize = this._resize.bind(this);
        this._routeSet = this._routeSet.bind(this);
        this._getFiles();
    }
    componentWillReceiveProps(nextProps) {
        var routeChanged = nextProps.location.pathname !== this.props.location.pathname;

        if (routeChanged) {
          this._routeSet(nextProps.location.pathname);
        }
    }
    _routeSet(path){
      if(path==='/'){
        this._setCode(`${path}.html`);
      }
      else{
        Object.keys(this.props.exampleFiles).forEach(k=>{
            const d = this.props.exampleFiles[k];
            d.forEach(f=>{
                if(`/${f.name.split('/').join('')}`===path.split('_').join(' ')){
                    this._setCode(f);
                }
            })
        })
      }
    }
    componentDidUpdate() {
        if (this.props.reloadFrame) {
            if(this.props.iFrameRender){
                this.props.actions.iFrameDestroy();
            }
            else if(!document.getElementById('preview')){
                this.props.actions.iFrameReset();
                this.props.actions.disableIframeUpdate();
            }
        }
        else if (this.props.updateScene){
            this._updateCanvas();
            this.props.actions.pauseIframeUpdate();
        }
    }

    componentDidMount() {
        const _this = this;
        window.addEventListener('resize', () => {
            _this.props.actions.disableAnimate();
            _this.forceUpdate();
        });
    }

    getChildContext() { //required for material-ui
        const mainTheme = getMuiTheme(baseTheme);
        mainTheme.slider.selectionColor = '#2194CE'
        return {muiTheme: mainTheme};
    }
    _resize(value){
      this.props.actions.sbWidth(value);
    }

    _getFiles() {
        const _this = this;
        function getContent(f){
          axios.get(f.raw_url).then(res=>{
            let jsonTest = f.filename.split('.')
            jsonTest = jsonTest[jsonTest.length-1] === 'json';
            f.content = jsonTest ? JSON.stringify(res.data, null, 2):res.data;

          })
        }
        axios.get('data/gists_raw.json').then(gists=>{
          Object.keys(gists.data).forEach(k=>{
            const fileArr = gists.data[k];
            fileArr.forEach(f=>{
                f.readme && getContent(f.readme);
                f.index && getContent(f.index);
                f.files && f.files.forEach(file=>{
                  if(file.type.indexOf('image')===-1){
                    getContent(file)
                  }
                })
            })
          })
          // gists.data.
            // gists = gists.data;
            // const keys = Object.keys(gists);
            // let authArray=[];
            // let idArray=[];
            // const promArray = keys.map(d=>{
            //
            //     const gistArray = gists[d].map(f=>{
            //         const codeurl = f.url;
            //         const codeArr = codeurl.split('/')
            //         const blockId = codeArr[codeArr.length-1]
            //         const blockUser = codeArr[codeArr.length-2];
            //         authArray=[...authArray,blockUser];
            //         idArray=[...idArray,blockId];
            //         const gist = gh.getGist(`${blockId}`);
            //         return gist.read()
            //     })
            //     return Promise.all(gistArray);
            // })
            // Promise.all(promArray).then(response=>{
            //     const gistTree={};
            //     let flatCount=0;
            //     response.forEach((d,i)=>{
            //         const gistArr = d.map((e,j)=>{
            //             const files = e.data.files;
            //
            //             const fileInfo={"name":e.data.description};
            //             const fileArr=[];
            //             Object.keys(files).forEach(f=>{
            //                 const file = files[f];
            //                 delete file['content']
            //                 if(file.filename === 'index.html'){
            //                     fileInfo.index=file;
            //                 }
            //                 else if(file.filename==='thumbnail.png'){
            //
            //                   fileInfo.thumbnail=file;
            //                 }
            //                 else if(file.filename==='README.md'){
            //                   fileInfo.readme = file;
            //                 }
            //                 else if(file.type.indexOf('image')===-1){
            //                   fileArr.push(file)
            //                 }
            //             });
            //             fileInfo.author=authArray[flatCount];
            //             fileInfo.id=idArray[flatCount];
            //             fileInfo.files=(fileArr.reverse())
            //             fileInfo.ogist=gists[keys[i]][j];
            //             flatCount++;
            //             return fileInfo;
            //         })
            //
            //         gistTree[keys[i]]=gistArr;
            //     })
            //     document.write(JSON.stringify(gistTree))
            //     console.log(gistTree)
                // console.log(_this.props.location)
                // _this._setCode(`${_this.props.location.pathname}.html`);
                // _this.props.actions.loadExamples(gistTree);
                _this.props.actions.loadExamples(gists.data);
                _this._routeSet(`${_this.props.location.pathname}`);
            // })
        })
    }

    _updateCode(newCode) {
        this.props.actions.updateCode(newCode)
    }
    _refreshCode() {
        this.props.actions.enableIframeUpdate();
    }

    _updateCanvas() {
        var previewFrame = document.getElementById('preview');
        if(previewFrame){
          var preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
          preview.open();
          preview.write(this.props.code);
          preview.close();
        }

    }

    _setCode(f) {
        let url_path = typeof(f)==='object'?f.index.raw_url:f;
        const _this = this;
        url_path = url_path === '/.html' ? '/home.html' : url_path;
        if(url_path==='/home.html'){
          axios.get(url_path).then(function(response){
              _this.props.actions.updateCode(response.data,_this.props.location.pathname)
          })
        }
        else{
          let gistURL = url_path.split('raw')[0]+'raw/';
          gistURL = gistURL.replace('gist.githubusercontent.com','cdn.rawgit.com')
          axios.get(url_path).then(function(response) {
              let newcode = response.data.replace('</script>', `</script>
          <base href=${gistURL} target="_blank">`);
              _this.props.actions.updateCode(newcode,_this.props.location.pathname, f)
          }).catch(function(error) {
              console.log(error);
          });
        }

    }
    _cleanup(){
        this.props.actions.iFrameDestroy();
    }

    render(props) {
        return (
            <div>
                <div id='iContainer' style={{
                    zIndex: 2
                }}>
                    {this.props.iFrameRender? <div><IFrame id='comp' animateCode={this.props.animateCode} left={this.props.left} headerHeight={headerHeight} gist={this.props.gist}/>

              </div>
                :null}

            </div>
                <Header
                    transparency={this.props.codeBlockTransparency}
                    cbToggle={this.props.actions.cbToggle}
                    sbToggle={this.props.actions.sbToggle}
                    sb={this.props.sb}
                    cb={this.props.cb}
                    height={headerHeight}
                />
                <ExampleDrawer
                  resize={this._resize}
                    files={this.props.exampleFiles}
                    searchVal={this.props.search}
                    search={this.props.actions.search}
                    open={this.props.sb}
                    left={this.props.left}
                    hh={headerHeight}
                    animate={this.props.animateCode}
                />

                <CodeDrawer
                    animate={this.props.animateCode}
                    transparency={this.props.codeBlockTransparency}
                    cbTransparency={this.props.actions.codeBlockTransparency}
                    open={this.props.cb}
                    left={this.props.left}
                    pathname={this.props.example}
                    value={this.props.code}
                    updateCode={this._updateCode}
                    refresh={this._refreshCode}
                    top={top}
                />

            </div>
        );
    }
}

App.childContextTypes = { //required for material-ui
    muiTheme: React.PropTypes.object.isRequired
};


function mapStateToProps(state){
  return{
    sb:state.display.sb,
    animateCode:state.display.animateCode,
    cb:state.display.cb,
    left: state.display.left,
    codeBlockTransparency:state.code.codeBlockTransparency,
    search:state.search.searchQuery,
    code:state.code.code,
    updateScene:state.code.updateScene,
    reloadFrame:state.code.reloadFrame,
    example:state.code.example,
    exampleFiles:state.load.exampleFiles,
    iFrameRender:state.iframe.render,
    gist:state.code.gist,
    loaded:state.iframe.loaded
  }
}

function mapDispatchToProps(dispatch){
  return{
    actions: bindActionCreators(Actions,dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
