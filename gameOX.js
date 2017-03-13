//canvas来实现(用dom来实现，会简单很多)
//可以选择颜色（两种）
//1.创建正方形对象
//1.1创建线条
//2.是否已经有图形(false,true)
//3.坐标(边长)（不用，计算得出）
//4.点击之后变色
//5.根绝鼠标的位置，判断点击的是在哪个小方块里面
//6.结束时重新开始
//7.边框颜色
//8.AI系统
//9.一开始电脑生成第一步
//注意：stroke 方形时，lineWidth的中心，会以起点均分，然后方形的宽高会包含线宽的一半.总之，线宽会以起点对半分
;(function(){//立即执行
	var	gameOX=function(a){//new的时候，这个函数就会执行
		//console.log("jjee");
		that=this;
		var cuteArr=[];//方块数组
		var winArr=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];//所有的3点一线集合
		this.settings={
			borderB:"gold",
			borderS:"pink",
			X:"#ff0000",//你
			O:"#00ff00",//AI
			width:600,
			borderBW:30,
			borderSW:6
			
		};
		//颜色处理
		var colorOne=document.getElementById("color_1");
		var colorTwo=document.getElementById("color_2");
		var promptDom=document.getElementById("prompt");
		colorOne.value=this.settings.X;
		colorTwo.value=this.settings.O;
		colorOne.addEventListener("change",function(){
			//console.log(this.value);选择颜色的时候重绘
			that.settings.X=this.value;
			for(var i=0;i<cuteArr.length;i++){
				if(cuteArr[i].logo=="X"){
					cuteArr[i].color=that.settings.X;
				}
			}
			ctx.clearRect(0,0,canvas.width,canvas.height);
			that.createCute([0,0,that.settings.width],that.settings.borderB,"stroke",that.settings.borderBW);
			lineH();
			lineV();
			cuteArr.forEach(function(e){
			//console.log(e);
				e.draw();
			})
		})
		
		colorTwo.addEventListener("change",function(){
			//console.log(this.value);选择颜色的时候重绘
			that.settings.O=this.value;
			for(var i=0;i<cuteArr.length;i++){
				if(cuteArr[i].logo=="O"){
					cuteArr[i].color=that.settings.O;
				}
			}
			ctx.clearRect(0,0,canvas.width,canvas.height);
			that.createCute([0,0,that.settings.width],that.settings.borderB,"stroke",that.settings.borderBW);
			lineH();
			lineV();
			cuteArr.forEach(function(e){
			//console.log(e);
				e.draw();
			})
		})
		
		this.extend(a,that.settings);
		canvas=document.createElement("canvas");
		document.body.appendChild(canvas);
		canvas.width=this.settings.width;
		canvas.height=this.settings.width;
		canvas.setAttribute("style","display: block;margin: 0 auto;background: black;");
		canvas.id="container";
		ctx=canvas.getContext("2d");
		cute={//方形对象
			logo:undefined,//表示，X，O。根据点击的con生成
			startX:undefined,//根据点击的鼠标位置
			startY:undefined,
			length:(that.settings.width-that.settings.borderBW-3*that.settings.borderSW)/3,
			row:undefined,
			col:undefined,
			color:"#000",
			draw:function(){//根据logo来确认背景色，空的话，则背景色也为空
				//console.log(this.startX+"||"+this.length);
				ctx.beginPath();
				ctx.rect(this.startX,this.startY,this.length,this.length);
				ctx.fillStyle=this.color;
				ctx.fill();
			}
		};
		for(var i=0;i<3;i++){//方块集合
			for(var j=0;j<3;j++){
				var cuteObj=that.cloneObj(cute);
				cuteObj.startX=(this.settings.borderBW+this.settings.borderSW)/2+(this.settings.width-this.settings.borderBW)/3*i;
				cuteObj.startY=(this.settings.borderBW+this.settings.borderSW)/2+(this.settings.width-this.settings.borderBW)/3*j;
				cuteObj.row=j;
				cuteObj.col=i;
				cuteArr.push(cuteObj);//对象，栈内存，引用类型，会互相影响
			}
		}
		cuteArr[4].logo="O";//默认AI第一步占中间
		cuteArr[4].color=that.settings.O;
		
		//console.log(cuteArr);
		canvas.addEventListener("click",function(e){//点击canvas
			ctx.clearRect(0,0,canvas.width,canvas.height);
			that.createCute([0,0,that.settings.width],that.settings.borderB,"stroke",that.settings.borderBW);
			lineH();
			lineV();
			cuteArr.forEach(function(e){//AI绘制
				e.draw();
			})
			var inRect=false;//点击的地方是否在logo为undefined的方形内部，默认否
			var clickX=e.offsetX;
			var clickY=e.offsetY;
			//console.log(clickX+"||"+clickY);
			for(var i=0;i<cuteArr.length;i++){//根据鼠标位置，判断点击的是哪一个，有可能一个都没有点击
				//console.log(that.inRect(clickX,clickY,cuteArr[i].startX,cuteArr[i].startY,cuteArr[i].length))
				if(that.inRect(clickX,clickY,cuteArr[i].startX,cuteArr[i].startY,cuteArr[i].length)&&cuteArr[i].logo==undefined){//点击在某个方块内，并且这个方块还没有被赋予颜色
					//console.log(cuteArr[i]);
					cuteArr[i].logo="X";
					cuteArr[i].color=that.settings.X;
					inRect=true;
					break;
				}
			}
			//AI选择一个位置，填充颜色，AI逻辑
			//1.优先选择角落，比较容易赢。2.能连成一线的时候，选择能连成一线的点。3.X要连成一线时，优先堵住
			//（1.选择能赢的点，2.选择阻止对手赢的点，3.选择角落4个点，4.选择其他点）
			if(inRect){
				var winResult=that.willWin(winArr,cuteArr);
				//console.log(winResult)
				if(winResult=="WIN"){//你不可能赢
					cuteArr.forEach(function(e){//你点击之后绘制
						e.draw();
					})
					alert("you win!!!");
					return;//代码停止执行
				}else if(winResult!==undefined&&(winResult[0]=="aiWillWin"||winResult[0]=="youWillWin")){//AI选择位置1
					var selectNum=Math.random()*(winResult[1].length)|0;
					winResult[1][selectNum].logo="O";
					winResult[1][selectNum].color=that.settings.O;
				}else{//选择下一步棋的位置
					var cuteUndefinedArrAll=[];
					var cuteUndefinedArr=[];
					var cuteSelectArr=[];
					//console.log("jj");
					for(var i=0;i<cuteArr.length;i++){
						if(cuteArr[i].logo==undefined){//所有未被填充的点的集合
							cuteUndefinedArrAll.push(cuteArr[i]);
						}
						if(cuteArr[i].logo==undefined&&(i==0||i==6||i==2||i==8)){//优先选择角落4个点,并且边上不为X的某一个角落的点
							cuteUndefinedArr.push(cuteArr[i]);
						}
					}
					//console.log(cuteUndefinedArr);
					for(var i=0;i<cuteUndefinedArr.length;i++){//遍历角落的点，把边上不为X的点重新组合
						if(cuteArr[cuteUndefinedArr[i].row+3].logo!=="X"){
							cuteSelectArr.push(cuteUndefinedArr[i]);
						}
					}
					if(cuteSelectArr.length>0){//如果还有符合规则的点的话
						var selectNum=Math.random()*(cuteSelectArr.length)|0;
						cuteSelectArr[selectNum].logo="O";//随机选取其中一个，而不是按顺序来，感觉更好
						cuteSelectArr[selectNum].color=that.settings.O;//这个必须和O对应，不然不对
					}else if(cuteUndefinedArr.length>0){//优先选择角落的点
						var selectNum=Math.random()*(cuteUndefinedArr.length)|0;
						cuteUndefinedArr[selectNum].logo="O";//随机选取其中一个，而不是按顺序来，感觉更好
						cuteUndefinedArr[selectNum].color=that.settings.O;//这个必须和O对应，不然不对
					}else{//选择其他点
						var selectNum=Math.random()*(cuteUndefinedArrAll.length)|0;
						cuteUndefinedArrAll[selectNum].logo="O";//随机选取其中一个，而不是按顺序来，感觉更好
						cuteUndefinedArrAll[selectNum].color=that.settings.O;//这个必须和O对应，不然不对
					}
					
				}
				//console.log(cuteArr);
				cuteArr.forEach(function(e){//AI绘制
					e.draw();
				})
				//判断你是否输了或者和棋
				var winResult=that.willWin(winArr,cuteArr);
				for(var i=0;i<cuteArr.length;i++){
					var aDraw=true;//是否和棋
					if(cuteArr[i].logo==undefined){
						aDraw=false;
						break;
					}
				}
				if(winResult!==undefined&&winResult[0]=="LOSE"){
					ctx.clearRect(0,0,canvas.width,canvas.height);
					that.createCute([0,0,that.settings.width],that.settings.borderB,"stroke",that.settings.borderBW);
					lineH();
					lineV();
					cuteArr.forEach(function(e){//AI绘制
						e.draw();
					})
					for(var i=0;i<winResult[1].length;i++){
						ctx.beginPath();
						console.log(winResult);
						ctx.arc(winResult[1][i].startX+winResult[1][i].length/2,winResult[1][i].startY+winResult[1][i].length/2,(that.settings.width-that.settings.borderBW-3*that.settings.borderSW)/(3*2)-30,0,Math.PI*2,false);
						ctx.strokeStyle="antiquewhite";//有可能和方形底色相同
						ctx.lineWidth="5";
						ctx.stroke();
						promptDom.innerHTML="YOU LOSE";
						setTimeout(function(){//重新加载页面
							window.location.reload();
						},1000)
					}
					return;//代码停止执行
				}else if(aDraw){
					promptDom.innerHTML="和棋了......";
					setTimeout(function(){////重新加载页面
						window.location.reload();	
					},1000)
					return;
				}
			}
		});
		//画边框
		this.createCute([0,0,this.settings.width],this.settings.borderB,"stroke",this.settings.borderBW);//正方形的宽度和高度就是this.settings.width，包括了边框的宽度
		lineH();
		lineV();
		cuteArr.forEach(function(e){
			//console.log(e);
			e.draw();
		})
		function lineH(){
			for(var i=0;i<5;i++){//横线
				var startX=that.settings.borderBW/2;
				var startY=that.settings.borderBW/2+(that.settings.width-that.settings.borderBW)/3*i;
				var endX=that.settings.width-that.settings.borderBW/2;
				var endY=startY;
				that.createLine(startX,startY,endX,endY,that.settings.borderS,that.settings.borderSW);
			}
		}
		
		function lineV(){
			for(var i=0;i<5;i++){//竖线
				var startY=that.settings.borderBW/2;
				var startX=that.settings.borderBW/2+(that.settings.width-that.settings.borderBW)/3*i;
				var endY=that.settings.width-that.settings.borderBW/2;
				var endX=startX;
				that.createLine(startX,startY,endX,endY,that.settings.borderS,that.settings.borderSW);
			}
		}
	};
	gameOX.prototype={
		extend:function(a,b){
			for(var key in a){
				if(b.hasOwnProperty(key)){
					b[key]=a[key];
				}
			}
			return b;
		},
		createCute:function(a,b,c,d){//a数组[x,y,r]，包括边长和起点x，y坐标，b颜色，c是stroke还是fill，如果是stroke的话，宽度设定为d
			//ctx.clearRect(0,0,canvas.width,canvas.height);
			ctx.beginPath();
			ctx.rect(a[0],a[1],a[2],a[2]);
			if(c=="fill"){
				ctx.fillStyle=b;
				ctx.fill();
			}else if(c=="stroke"){
				ctx.strokeStyle=b;
				ctx.lineWidth=d;
				ctx.stroke();
			}
		},
		createLine:function(a,b,c,d,e,f){
			ctx.beginPath();
			ctx.moveTo(a,b);
			ctx.lineTo(c,d);
			ctx.strokeStyle=e;
			ctx.lineWidth=f;
			ctx.stroke();
		},
		cloneObj:function(myObj){//克隆对象
		  	if(typeof(myObj) != 'object') return myObj; 
		  	if(myObj == null) return myObj;  
		    
		    if(myObj instanceof Array){//如果是数组的话，则创建新数组
		    	var myNewObj=new Array();
		    	for(var i=0;i<myObj.length;i++){
		    		myNewObj[i]=arguments.callee(myObj[i]);
		    	}
		    }else{
		    	var myNewObj = new Object(); 
		    	for(var i in myObj)  
		   	 	myNewObj[i] = arguments.callee(myObj[i]);//递归。把所有的子对象都clone
		    }
		  	return myNewObj;  
		},
		inRect:function(a,b,c,d,e){//是否在方形内部,a:点的X坐标，b：点的Y坐标，c:方形的X，d：方形的Y，e：方形的边长
			return (a>c)&&(a<c+e)&&(b>d)&&(b<d+e);
		},
		willWin:function(a,b){//下一步就能赢的条件（某行或某列或对角线有两个都是X或者O，另外一个是undefined）
			var cuteUndefined=[];
			for(var i=0;i<a.length;i++){
				var loseArr=[];
				var numO=0;//O的个数
				var numX=0;//X的个数
				for(var j=0;j<a[i].length;j++){
					if(b[a[i][j]].logo=="O"){
						numO+=1;
						loseArr.push(b[a[i][j]]);//构成AI赢的图形ID
					}else if(b[a[i][j]].logo=="X"){
						numX+=1;
					}
				}
				//console.log(numO);
				if(numO==3){
					return  ["LOSE",loseArr];
				}else if(numO==2&&numX==0){//AI下一步就能赢
					for(var j=0;j<a[i].length;j++){
						if(b[a[i][j]].logo==undefined){
							cuteUndefined.push(b[a[i][j]]);
						}
					}
					//return ["aiWillWin",cuteUndefined];//AI能赢，则不返回你能赢的条件,但是这里不能返回，返回则打断执行，后面的不进行遍历，出错
				}
			}
			//console.log(cuteUndefined);
			if(cuteUndefined.length>0){
				return ["aiWillWin",cuteUndefined];//在这里返回
			}
			for(var i=0;i<a.length;i++){//你下一步能赢，你不可能赢
				var numO=0;//O的个数
				var numX=0;//X的个数
				for(var j=0;j<a[i].length;j++){
					if(b[a[i][j]].logo=="O"){
						numO+=1;
					}else if(b[a[i][j]].logo=="X"){
						numX+=1;
					}
				}
				if(numX==3){
					return  "WIN";
				}else if(numX==2&&numO==0){//
					for(var j=0;j<a[i].length;j++){
						if(b[a[i][j]].logo==undefined){
							cuteUndefined.push(b[a[i][j]]);
						}
					}
					//return ["youWillWin",cuteUndefined];
				}
			}
			//console.log(cuteUndefined)
			if(cuteUndefined.length>0){
				return ["youWillWin",cuteUndefined];
			}
			//返回undefined，则都不能赢
		}
	};
	
	window.gameOX=gameOX;
})();
