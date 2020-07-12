/*

TIPSTER v3.1 RC (c) 2001-2004 Angus Turnbull, http://www.twinhelix.com
Altering this notice or redistributing this file is prohibited.

*/

var isDOM=document.getElementById?1:0
var isIE=document.all?1:0
var isNS4=navigator.appName=='Netscape'&&!isDOM?1:0
var isOp=self.opera?1:0
var isDyn=isDOM||isIE||isNS4;

function getRef(i,p){
	p=!p?document:p.navigator?p.document:p;return isIE?p.all[i]:isDOM?(p.getElementById?p:p.ownerDocument).getElementById(i):isNS4?p.layers[i]:null
};

function getSty(i,p){
	var r=getRef(i,p);
    return r?isNS4?r:r.style:null
};
if(!self.LayerObj)var LayerObj=new Function('i','p','this.ref=getRef(i,p);this.sty=getSty(i,p);return this');

function getLyr(i,p){
	return new LayerObj(i,p)
};

function LyrFn(n,f){
	LayerObj.prototype[n]=new Function('var a=arguments,p=a[0],px=isNS4||isOp?0:"px";with(this){'+f+'}')
};
LyrFn('x','if(!isNaN(p))sty.left=p+px;else return parseInt(sty.left)');
LyrFn('y','if(!isNaN(p))sty.top=p+px;else return parseInt(sty.top)');
LyrFn('w','if(p)(isNS4?sty.clip:sty).width=p+px;else return(isNS4?ref.document.width:ref.offsetWidth)');
LyrFn('h','if(p)(isNS4?sty.clip:sty).height=p+px;else return(isNS4?ref.document.height:ref.offsetHeight)');
LyrFn('vis','sty.visibility=p');
LyrFn('write','if(isNS4)with(ref.document){write(p);close()}else ref.innerHTML=p');
LyrFn('alpha','var f=ref.filters,d=(p==null),o=d?"inherit":p/100;if(f){if(!d&&sty.filter.indexOf("alpha")==-1)sty.filter+=" alpha(opacity="+p+")";else if(f.length&&f.alpha)with(f.alpha){if(d)enabled=false;else{opacity=p;enabled=true}}}else if(isDOM)sty.opacity=sty.MozOpacity=o');
if(!self.page)var page={win:self,minW:0,minH:0,MS:isIE&&!isOp};
page.db=function(p){with(this.win.document)return(isDOM?documentElement[p]:0)||body[p]||0};
page.winW=function(){with(this)return Math.max(minW,MS?db('clientWidth'):win.innerWidth)};
page.winH=function(){with(this)return Math.max(minH,MS?db('clientHeight'):win.innerHeight)};
page.scrollX=function(){with(this)return MS?db('scrollLeft'):win.pageXOffset};
page.scrollY=function(){with(this)return MS?db('scrollTop'):win.pageYOffset};

function TipObj(myName){
	this.myName=myName;
    this.template='';
    this.tips=new Array();
    this.parentObj=null;
    this.div=null;
    this.actTip='';
    this.showTip=false;
    this.xPos=this.yPos=this.sX=this.sY=this.mX=this.mY=0;
    this.trackTimer=this.fadeTimer=0;
    this.alpha=0;
    this.doFades=true;
    this.minAlpha=0;
    this.maxAlpha=100;
    this.fadeInSpeed=20;
    this.fadeOutSpeed=20;
    this.tipStick=1;
    this.showDelay=50;
    this.hideDelay=250;
    this.IESelectBoxFix=0;
    TipObj.list[myName]=this
};

TipObj.list=[];
var ToPt=TipObj.prototype;
ToPt.track=function(evt){
	with(this){
	   	if(!isIE||document.body){
    		evt=evt||window.event;
	    	sX=page.scrollX();
	    	sY=page.scrollY();
		    mX=evt.pageX||sX+evt.clientX||0;
	   		mY=evt.pageY||sY+evt.clientY||0;
	    	if(tipStick==1)position()
   		}
   	}
};

ToPt.position=function(forcePos){
   	with(this){
       	if(!actTip)return;
		var wW=page.winW(),wH=page.winH();
		if(!isIE||isOp){
			wW-=16;wH-=16
		}
		var t=tips[actTip],tipX=eval(t[0]),tipY=eval(t[1]),tipW=div.w(),tipH=div.h(),adjY=1;
		if(typeof(t[0])=='number')tipX+=mX;
		if(typeof(t[1])=='number')tipY+=mY;
		if(tipX+tipW+5>sX+wW)tipX=sX+wW-tipW-5;
		if(tipY+tipH+5>sY+wH)tipY=sY+wH-tipH-5;
		if(tipX<sX+5)tipX=sX+5;
		if(tipY<sY+5)tipY=sY+5;
		if((!showTip&&(doFades?!alpha:true))||forcePos){
			xPos=tipX;yPos=tipY
		}
		xPos+=(tipX-xPos)*tipStick;
		yPos+=(tipY-yPos)*tipStick;
		div.x(xPos);div.y(yPos);
		return
	}
};

ToPt.replaceContent=function(tipN){
   	with(this){
       	actTip=tipN;
		if(tipStick==parseInt(tipStick)){
			var rE='';if(isNS4){
				div.ref.captureEvents(Event.MOUSEOVER|Event.MOUSEOUT);rE=';return this.routeEvent(evt)'
			}
			div.ref.onmouseover=new Function('evt',myName+'.show("'+tipN+'"'+(parentObj?','+parentObj.myName:'')+')'+rE);
			div.ref.onmouseout=new Function('evt',myName+'.hide()'+rE)
		}
		var str=template;for(var i=0;i<tips[tipN].length;i++)str=str.replace(new RegExp('%'+i+'%','g'),tips[tipN][i]);
		if(window.createPopup&&IESelectBoxFix){
			var filt='filter:progid:DXImageTransform.Microsoft.Alpha(opacity=';
			str+='<iframe src="about:blank" style="position:absolute;left:0px;top:0px;height:expression('+myName+'.div.h());z-index:1;border:none;'+filt+'0)"></iframe><div style="position:absolute;left:0px;top:0px;z-index:2;'+filt+'100)">'+str+'</div>'
		}
		if(isDOM&&!isOp)div.sty.width='auto';
		div.write(str+(isIE&&!isOp&&!window.external?'<small><br/></small>':''));
		position(true)
	}
};

ToPt.show=function(tipN,par){
   	with(this){
       	if(!isDyn)return;clearTimeout(fadeTimer);
		parentObj=par;
		if(par)par.show(par.actTip,par.parentObj);
		if(!div)div=getLyr(myName+'Layer');
		if(!div)return;clearInterval(trackTimer);
		if(tipStick!=parseInt(tipStick))trackTimer=setInterval(myName+'.position()',50);
		var showStr='with('+myName+'){showTip=true;'+(actTip!=tipN?'replaceContent("'+tipN+'");':'')+'fade()}';
		if(showDelay&&!actTip)fadeTimer=setTimeout(showStr,showDelay);else eval(showStr)
	}
};

ToPt.newTip=function(tName){
    with(this){
       	if(!tips[tName])tips[tName]=[];
		for(var i=1;i<arguments.length;i++)tips[tName][i-1]=arguments[i];
		show(tName);
		return
	}
};

ToPt.hide=function(){
   	with(this){
       	clearTimeout(fadeTimer);
		if(!isDyn||!actTip||!div)return;
		if(isNS4&&tipStick==0&&xPos<=mX&&mX<=xPos+div.w()&&yPos<=mY&&mY<=yPos+div.h())return;
		with(tips[actTip])
		if(parentObj)parentObj.hide();
		fadeTimer=setTimeout('with('+myName+'){showTip=false;fade()}',hideDelay);
		return
	}
};

ToPt.fade=function(){
    with(this){
    	clearTimeout(fadeTimer);
   	    if(showTip){
       		div.vis('visible');
        	if(doFades){
   	    		alpha+=fadeInSpeed;if(alpha>maxAlpha)alpha=maxAlpha;div.alpha(alpha);if(alpha<maxAlpha)fadeTimer=setTimeout(myName+'.fade()',75)
        	}
   	    }else{
    	    if(doFades&&alpha>minAlpha){
           		alpha-=fadeOutSpeed;
               	if(alpha<minAlpha)alpha=minAlpha;
                div.alpha(alpha);
   	            fadeTimer=setTimeout(myName+'.fade()',75);
       	        return
       		}
            div.vis('hidden');actTip='';clearInterval(trackTimer)
   		}
   	}
};

var tipOR=window.onresize,nsWinW=window.innerWidth,nsWinH=window.innerHeight;
document.tipMM=document.onmousemove;
if(isNS4)document.captureEvents(Event.MOUSEMOVE);
document.onmousemove=function(evt){for(var t in TipObj.list)TipObj.list[t].track(evt);return document.tipMM?document.tipMM(evt):(isNS4?document.routeEvent(evt):true)};
window.onresize=function(){if(tipOR)tipOR();if(isNS4&&(nsWinW!=innerWidth||nsWinH!=innerHeight))location.reload()};