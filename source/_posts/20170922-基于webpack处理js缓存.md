---
layout: layout
title: 基于webpack处理js缓存
date: 2017-09-22 10:22:52
tags: javascript
categories: 编程
---


前端开发经常会遇到一个问题，我们把前端代码发布完之后，用户反馈页面出现异常，实际上强制刷新下异常就可以正常使用！
原因是发布修改了js文件中的js代码，发布代码到线上后。用户的浏览器使用的还是原来js缓存。所以并不会马上生效。

如何才能让浏览器使用最新的js文件呢？

### 解决方案
1.可以给js添加时间戳!
	弊端：但是添加完时间戳后，用户每次请求都需要加载新的js，这样如果你的用户量比较大, 占用带宽，会造成大量的流量损失！
	
2.给js添加hash串！
	很多软件自动更新是就是比较文件的二进制hash值才判断是否更新软件的！


经过了我慎重的思考，和多次夜里辗转反侧的对比，最后选择了方案2（其实是因为很多大公司都是用这种方案，所以毫无疑问拉）

项目上是用了webpack去打包编译js的，相信这个已经是行业的风向标了，webpack在打包编译js文件的时候有提供生成hash js文件的方法


下面的内容需要你对webpack的使用有一定的理解，如果没有，请出门右转 <a href="http://webpack.github.io/">webpack官网</a>!!


```
entry: { //入口js文件
	app: './webpack/app/main.jsx',
	start: './webpack/start/main.jsx',
	exchange: './webpack/exchange/main.jsx',
	report: './webpack/report/main.jsx',
	manage: './webpack/manage/main.jsx',
  vipcharge: './webpack/vipcharge/main.jsx'
},
output: { //输出js文件
	filename: 'entry/[name]-[chunkhash].js',
	chunkFilename: 'chunk/[name]-[chunkhash].js',
	publicPath: '/static/'
}, 
```

在output上配置[chunkhash]的话，webpack生成的js会带上hash串

{% asset_img 1.png %}  

哈哈哈，是不是很简单，但是不要以为这样就完事了！！！！！
因为我们的js文件名称是不断的发生变化的，你在html那里引入不能是写死 src="xxx-{hash}.js"，这里必须是要动态生成的！！！

也就是说，你webpack打包的时候需要动态的去修改html里面js的src；

{% asset_img 2.png %}  

不过webpack已经为我们提供了动态修改html的插件（<a href="https://github.com/jantimon/html-webpack-plugin">html-webpack-plugin</a>）

根据教程使用这个插件就可以实现webpack打包的时候动态修改html里面js的src！！！
如果你觉得已经够了的话,就可以去官网学习html-webpack-plugin的使用方法了！！！

### 但是有的人可能很任性，我不喜欢不明就里的使用别人的插件，我要完全使用于自己的插件，我就要自己动手去尝试实践，不撞南墙不回头！
(其实一部分原因是使用html-webpack-plugin会有一些不适合我项目的东西，会导致我项目显得很重)
比如html-webpack-plugin需要一个demo的html，然后它基于demo.html去生成新的html，所以就需要2个html！一个index-demo.html，一个index.html,因为后端是go而不是node，go启动项目要先生成index.html才能启动（后端同事很可能会吐槽我），而且项目本身是多入口（6个），html-webpack-plugin需要new6个配置，显得很长！！！所以我感觉可以自己动手写个webpack插件，简单处理一下，！！！


直接上写完的小插件

```
var fs = require("fs");
var path = require('path');
function HtmlPlugin(options) {
  this.options = options;
}
HtmlPlugin.prototype.apply = function(compiler) {
  var me = this;
  compiler.plugin('emit', function(compilation, callback) {
  	var obj = {};
    for (var filename in compilation.assets) {
    	var jsFileName = filename.match(/[^\/|^\\]+?\.js/)
    	if(jsFileName != null){
    		var nameStr = jsFileName[0].replace(".js", "");
    		var nameArr = nameStr.split("-");
    		obj[nameArr[0]] = nameArr[1]?nameArr[1]:"";
    	}
    } 
    for(var i in me.options){
    	var jsKey = me.options[i];
    	var templatePath = path.resolve(__dirname, '../src/template');
    	var htmlSrc = `${templatePath}/${i}.html`
    	var html = fs.readFileSync(htmlSrc,"utf-8");
    	var res = html.replace(/<!--build-->[\s\S]+?<!---->/, function(a,b,c){
    		var scriptLabel = obj[jsKey] === ""?`<script src="/static/entry/${jsKey}.js"></script>`:`<script src="/static/entry/${jsKey}-${obj[jsKey]}.js"></script>`
    		var label = `<!--build-->
    			${scriptLabel}
    		<!---->`
    		return label
    	})
    	fs.writeFileSync(htmlSrc, res)
    }
    callback();
  });
};
module.exports = HtmlPlugin;
```

html的js引入需要一定的格式
```
<!--build-->
<!---->
```
在webpack.config中是使用姿势
```
plugins: [
	new HtmlPlugin({
		index: "app",
		start: "start",
		exchange: "exchange",
		report: "report",
		manage: "manage",
		vipcharge: "vipcharge"
	})
]
```

那个小插件很简单，就是在webpack打包emit的时候，获取到入口js有哪些，然后获取入口js的hash，然后根据配置文件去修改html里面的build标签里面的内容，动态添加js标签引入，我写的挺简单，听粗糙的，大部分都是用了正则去处理，这个文章和小插件只是给大家一些思路和对前端的感悟，其实自身很多代码比不上人家封装的好，思考的全面，但是人家的东西毕竟是人家的，不一定完全适合于自己！你自己去发掘的话，可能会粗糙，但会更贴近自身！


突然发现我很啰嗦，喋喋不休的。。。/尴尬



