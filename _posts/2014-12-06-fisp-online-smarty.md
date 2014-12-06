---
layout: post
title: "fis-plus上线篇之搞定smarty环境"
date: 2014-12-06 10:48:36
categories: fisbook
---

{% raw %}

在使用fisp（fis-plus简称）的时候，有些文件看着就是碍眼，有些文件想release到看上去比较顺眼的地方，或者是其他一些看似合乎逻辑的理由想改路径。反正就一个事儿，想更改发布路径。

把想更改发布路径深深的埋藏在心里，苦苦不知道从何下手。翻翻文档吧，都能丢失在文档的海洋里面，心里暗骂“艹，上午的需求还没有完成呢！！！”，无奈心里还是痒痒，想改路径。

我真实的描述了一个拿到fisp想改改路径却没改成功的心情。本篇就是彻底把这坨事情描述明白而生的，另外只此一次过时不候。

### Smarty使用介绍

ok，首先我们从使用Smarty说起。Smarty有个响亮的名字叫模板引擎，其实没来度厂之前我对这个很不屑，而且我也知道一些模板引擎是怎么做的，整个正则定义一些指令函数，就能做一个模板引擎；就像，很多前端模板就是这么干的一样。另外一个原因是其实说白了，我直接拿php做模板就好了，何必。。再引入一层Smarty？

后来来到这边以后发现Smarty在各个使用PHP后端的产品线都在使用，然后我就震惊了。想了一万个为什么，最后发现主要原因是使用简单，哦，还有比较棒的`block`坑可以填，优点暂且就不说了，先来看一下如何用Smarty；

先到Smarty官网上去下载一份smarty，大概下载下来是这个样子的；

```bash
$ tree -L 1
.
├── Smarty.class.php
├── SmartyBC.class.php
├── debug.tpl
├── plugins
└── sysplugins
```
我们暂时只需要关心`Smarty.class.php`，这个文件里面定义了`class Smarty`，来一个简短的例子。

```php
<?php
//file: index.php

if (!defined("ROOT")) define("ROOT", __DIR__); //[1]
include (ROOT . '/smarty/Smarty.class.php'); //[2]

$smarty = new Smarty(); //[3]

$smarty->setTemplateDir(ROOT . '/template');//[4]
$smarty->left_delimiter = "{%";//[5]
$smarty->right_delimiter = "%}";//[6]
$smarty->display('a.tpl');//[7]
```
解释这段代码之前呢，我们先贴上本地的目录；

```bash
$ tree -L 1
.
├── index.php
├── smarty
└── template
```
[4] 设置了一个模板目录，这个非常重要，因为`$smarty->display`（渲染）的模板都是从这个目录开始找的；比如如上面的`a.tpl`就是渲染的是`template/a.tpl`。当然这块需要注意的是假设你`display`的是一个绝对路径，设置的`template_dir`就不起效咯。。。

写完了一个简单的渲染的例子，我们再介绍一下Smarty的插件。Smarty的插件的方方面面可以在Smarty官网看到详细的介绍，而我这块只关心插件目录。

```php
//file: index.php

if (!defined("ROOT")) define("ROOT", __DIR__); //[1]
include (ROOT . '/smarty/Smarty.class.php'); //[2]

$smarty = new Smarty(); //[3]

$smarty->setTemplateDir(ROOT . '/template');//[4]
$smarty->left_delimiter = "{%";//[5]
$smarty->right_delimiter = "%}";//[6]
$smarty->setPluginsDir(ROOT .'/plugin');//[7]
$smarty->display('a.tpl');//[8]
```

[7]这行设置了一个插件目录，意思是说，如果这个目录下有有效的Smarty插件，就会加载起来，然后在模板里面就可以直接使用，Smarty有很多类型的插件，我们这块使用`function`插件来举例子。

我们迅速搞一个`function`插件，就叫`function.xdate.php`吧。在模板里面这么调用。
```smarty
{%*file: template/a.tpl*%}
{%xdate%}
```
这个插件的作用是打出时间；代码如下

```php
<?php
//file: plugin/function.xdate.php
function smarty_function_xdate($params, $template) {
    return date('Y-m-d H:i:s');
}
```

当渲染`a.tpl`时，会调用插件`xdate`得到一个当前的时间。。。

Smarty的例子呢就举到这里；在上面的例子里面我们关注了两个目录

- template_dir 模板在这个目录下进行查找
- plugins_dir 插件在这个目录下进行查找

当然，我们也可以`var_dump($smarty)`来看更多的一些目录配置，不过暂且我们只关心这俩目录。

fisp里面定制了一些插件，所以需要把这些插件上线的时候放到Smaty的插件目录（`plugins_dir`）下；fisp编译产出后有一些模板，显然也需要把这些模板放到Smarty的模板目录（`template_dir`）下。

有的时候可能会发现都不知道后端框架把Smarty隐藏到什么地方了，更别说设置了（一般都是已经设置好了的），一般得问下后端开发的同学，再要不，到`display`模板的地方`var_dump`模板对象就能看得到上面说的两个目录的位置了。

其次来看看fisp的产出目录是怎么样的;

```bash
$ fisp install pc-demo #下载一个demo
$ cd pc-demo/common
$ fisp release -d output
$ cd output
$ tree -L 1
.
├── config
├── plugin
├── static
└── template
```

看明白了吗，意思是plugin下的资源放到`plugins_dir`；template下的内容放到`template_dir`。

当然还出现了两个目录，一个`config`、一个`static`。OH，其实`config`目录对应于`$smarty->config_dir`目录。`static`目录呢，直接copy到`www`目录下即可（静态服务器的DOCUMENT_ROOT下）。

OK，标准上线目录已经说完了，我们现在进入正题；关于**想修改目录的时候肿么办的问题**。

### 利用fis的`roadmap.path`更改产出路径、URL

用了fisp大概知道`fis-conf.js`，一个牛逼而且有点晦涩的配置文件，后缀是`js`，告诉我们它是个JavaScript文件，可以任意写JavaScript代码。

在改目录之前，我们先来调教一下这个配置文件；

在整个FIS的配置中，提供了很多为了符合个性化开发需要配置的属性值，不是特别多，大概有`project`、`modules`、`roadmap`、`pack`、`settings`、`server`这几类，其他如果再出现一些稀奇古怪的，那就是*解决方案*自定义的了。

所有的配置项目可以在[https://github.com/fex-team/fis/wiki](https://github.com/fex-team/fis/wiki)上找到。不过我们可以在这块稍微了解一下。

- project 就是对项目全局做一些配置，什么编码、md5戳的长度等
- modules 配置FIS的几个插件流程上面那些文件该用什么插件处理
- roadmap 配置某一类文件有哪些属性，并且产出到什么地方去，包括添加什么CDN等等，也是最复杂的一块
- pack 备份静态资源时需要配置这个，你可以把备份认为是合并静态资源
- settings 相对应与`modules`填写的一些插件进行某些配置
- server 本地server的一些相关配置，比如执行`fis server clean`的时候保留哪些文件等

> 为了实现上面移动目录的那个目标，我们只关心`roadmap`的配置情况。

一般，fisp这样的解决方案，里面已经配置了一个牛逼哄哄的配置，特别是fisp经过多年对度厂前端项目的积累，所以是万众挑一的。我们可以很方便的查看这些配置的信息。

```javascript 
// file: fis-conf.js
console.log(fis.config.get('roadmap'));
```
可以哗啦打出一大串的配置信息；负责文件产出、url更改的配置项是`roadmap.path`
```javascript
// file: fis-conf.js
console.log(fis.config.get('roadmap.path'));
```
不出意外的打出了

```javascript
[ { reg: '/fis_translate.tpl',
    release: '${templates}/${namespace}/widget/fis_translate.tpl' },
  { reg: /\/lang\/([^\/]+)\.po/i,
    release: '/config/lang/${namespace}.$1.po' },
  { reg: /^\/widget\/(.*\.tpl)$/i,
    isMod: true,
    url: '${namespace}/widget/$1',
    release: '${templates}/${namespace}/widget/$1' },
  { reg: /^\/widget\/(.*\.(js|css))$/i,
    isMod: true,
    release: '${statics}/${namespace}/widget/$1' },
  { reg: /^\/page\/(.+\.tpl)$/i,
    isMod: true,
    release: '${templates}/${namespace}/page/$1',
    extras: { isPage: true } },
  { reg: /\.tmpl$/i, release: false, useOptimizer: false },
  { reg: /^\/(static)\/(.*)/i,
    release: '${statics}/${namespace}/$2' },
  { reg: /^\/(config|test)\/(.*)/i,
    isMod: false,
    release: '/$1/${namespace}/$2' },
  { reg: /^\/(plugin|smarty\.conf$)|\.php$/i },
  { reg: 'server.conf',
    release: '/server-conf/${namespace}.conf' },
  { reg: 'domain.conf', release: '/config/$&' },
  { reg: 'build.sh', release: false },
  { reg: '${namespace}-map.json',
    release: '/config/${namespace}-map.json' },
  { reg: /^.+$/, release: '${statics}/${namespace}$&' } ]
```

这样一个结果；

其实就一个数组，里面是一个个的对象；**在FIS处理的时候是从上到下进行匹配的**，假设某一个文件被上面的匹配到了，那么就没有下面规则什么事情了。

```javascript
var path = [
    {
        reg: /.*\.js$/,
        release: '/static/js/$&'
    },
    {
        reg: /.*\.css$/,
        release: '/static/css/$&'
    }
];
```
其中对象的

- reg 是说要匹配某些文件
- release 是说要产出到什么地方去

当然每个对象中都会由很多其他的一些属性，我们可以把这段配置理解为，给某些文件添加一些属性，这个属性包括FIS已经占用的，可以在[roadmap.path](https://github.com/fis-dev/fis/wiki/%E9%85%8D%E7%BD%AEAPI#roadmappath)这个地方看到，还有一部分可以为了某些插件实现起来方便定义一些私有属性。

> 当设置了某些属性，这些属性会伴随这个文件在整个编译期内。

OK，先不关心那些其他的属性了。我们来看看`reg`、`release`的奇妙使用方式。

由于在整个fisp当中，**已经配置**了`roadmap.path`，而且获取出来以后是一个数组。所以就不能用`fis.config.merge`来处理**自定义**的一些**规则**了。这是为什么呢，因为其实`fis.config.merge`就是一个深度`merge`的函数。俩数组里面都是对象再合并，其效果可想而知，会合并的乱糟糟的，如果你用了`merge`来合并一条自定义的属性，可能你已经多次怀疑自己的人生了吧。

那肿么设置呢，它不是一个数组嘛，在JavaScript里面数组有很多的方法可以添加一些项。当然添加的时候要放在最前面，**用户优先**嘛。
- 方法一，arr.unshift

    ```javascript
    //file: fis-conf.js
    var path = fis.config.get('roadmap.path');

    path.unshift({
        reg: /\/widget\/some\/.*\.tpl/$,
        release: '/template/$&'
    });

    ```
- 方法二，arr.concat

    ```javascript
    var path = fis.config.get('roadmap.path');

    var userPath = [{
        reg: /\/widget\/some\/.*\.tpl/$,
        release: '/template/$&'
    }];

    userPath = userPath.concat(path); //userPath在默认path前
    fis.config.set('roadmap.path', userPath);
    ```
- 方法三，自己想

所以，配置文件是一个Js文件，可以有很多想象。说道这里，把在fisp里面配置的方法教给大家了，至于你要不要怎么用怎么灵活的用，还得看你想不想了。

有了配置的方法，那就看配置几种含义吧。其实吧，每一个`path`都对应与一次URL、产出路径的改变。所以稍微拿捏不准，可能就开始骂娘了，如果是我的话基本是怀疑人生。

- release 不写
    
    ```javascript
    {
        reg: '**.js'
    }
    ```

    假设不写release，则产出路径就是源码路径；比如我们有个静态资源叫`/static/a.js`，使用的时候是这么使用的`<script src="/static/a.js"></script>`，则产出的时候产出目录以及URL都不会被修改（相对路径引用除外）。
- release 写了
    
    ```javascript
    {
        reg: /\/static\/(.*\.js)/,
        release: '/static/js/$1'
    }
    ```

    那按照上面的例子，产出后`/static/a.js`产出到`output/static/js/a.js`，而使用的地方会从`<script src="/static/a.js"></script>`变为`<script src="/static/js/a.js"></script>`。

- release 写了，但是不想改URI [**注意**]
    
    ```javascript
    {
        reg: /\/static\/(.*\.js)/,
        url: '$&',
        release: '/www/static/$1'
    }
    ```
    我设置产出到了`www`目录下，但是我不想修改引入时的URI，还想保持原来的使用方法，该如何办呢，咦，恰巧上面给了一个例子，可以设置`url`来特定化引用的url。

- release false

    ```javascript
    {
        reg: '**.js',
        release: false
    }
    ```
    所有的js不产出鸟。。。


如果细心的同学看到了，我在上面打上了[**注意**]字眼，这个地方确实需要注意，因为这个关乎上线，关乎运行得起来还是跑不起来的问题。

假设把这条弄懂了，整个FIS的目录操作者可就没有什么不能解决的了。

为了表述更清楚，我们细化例子（其实就是把所有的东西都说出来）。

- 源码

    ```
    src
    .
    ├── index.html
    └── static
        └── a.js
    ```
- roadmap.path

    ```javascript
    fis.config.set('roadmap.path', [{
        reg: /\/static\/(.*\.js)/,
        url: '$&',
        release: '/www/static/$1'
    }]);
    ```
- 产出

    ```
    output
    .
    ├── index.html
    └── www
        └── static
            └── a.js
    ```
- index.html
    
    |源码|产出|
    |:---|:----|
    |`<script src="/static/a.js"></script>`|`<script src="/static/a.js"></script>`|

    当然是相同的，因为虽然有了不同的release但是url保持不变（当然你也可以设置其他的一些URL，可以用url属性）。

    > 注意，假设编译后的url是`/static/a.js`这个样子，那么你就得把www这个目录作为静态资源请求的根目录。或者是做个路由，把`/static`开头的URL全都定位到`www`目录下，才能请求到想要的结果。

ok，其实上面这个例子已经把静态文件换个产出路径的方方面面说完了，你学会了吗？

那么进入Smarty的世界，我们要解决修改fisp的模板路径，在Smarty里面怎么运行。

### fis-plus里面涉及到Smarty的路径，以及如何修改并能正确运行

在fisp里面，涉及路径的Smarty函数（指令）常用的有

- extends
    
    ```smarty
    {%extends file="<filepath>"%}
    ```

- include

    ```smarty
    {%include file="<filepath>"%}
    ```

- config_load
    
    ```smarty
    {%load_config file="<filepath>"%}
    ```

- require
    
    ```smarty
    {%require name="<id>"%}
    ```

- widget
    
    ```smarty
    {%widget name="<id>"%}
    ```
- html
    
    ```smarty
    {%html framework="<id>"%}
    {%/html%}
    ```

其中require、widget、html是fisp独有的定制的一些函数（其实就是插件）。它们位fisp服务，并支撑fisp的正常运行（怎么做到的，可以看源码）。

其中`<filepath>`就是相对于`$smarty->template_dir`的相对路径或者是相对于系统根目录的绝对路径。

SO，假设你要这么用；

```smarty
{%include file="widget/a/a.tpl"%}
```
那么渲染的文件是`SMARTY_TEMPLATE_DIR/widget/a/a.tol`，假设你写错了，写成了。

```smarty
{%include file="/widget/a/a.tpl"%}
```
这种情况下，会去系统根目录下查找`/widget/a/a.tpl`，咦，一般都会挂掉。

说完`<filepath>`，再来说一下`<id>`；fisp里面要使用一些资源，至少是在Smarty里面用fisp自定义的一些函数，必须指定资源的`<id>`，这个`<id>`是fisp自定义的一种标识符。规则很简单`<namespace>:<subpath>`，当然这块的`<subpath>`指的是源码的subpath。

举个小例子，假设在common下有个资源`/static/a.js`的ID就是`common:static/a.js`，*注意subpath第一个字符没有斜杠`/`*

搞清楚了`<id>`的规则，还得弄懂它是如何工作的，才能解开我们心中的谜团。

在模板渲染的时候，使用`<id>`加载的资源，有一个特殊的操作，那就是拿这个`<id>`去`map.json`里面找一把，找到对应ID的`uri`并加载渲染之。

那么问题就来了，**其实对于`widget`渲染的模板，其实它的路径在`map.json`里面，而不像`<filepath>`一样，在源码里面就已经指定了**。

`map.json`里面的`uri`就是通过`roadmap.path`的`url`调整的，OK，这块uri和url不太一样是吧，其实也算是个设计缺陷吧，不过无伤大雅。

那么这时候，假设我更改了一个tpl的产出路径，那么就意味着`uri`发生了变化。只有`uri`能和上线时上传的文件路径保持一致才能被正确的渲染。所有的文件路径、url都遵循这个规则（可想而知）。

所以，修改产出路径的时候，千万要注意修改的目录跟引用的路径是否一致，是否匹配。

> `<id>`引用路径在`map.json`里面`<id>`对应的uri，而`<filepath>`呢，直接就是相对或者绝对路径。上线代码时一定一定要保持引用路径能找到磁盘上的文件，不然不报错才怪。

嗯，我想我应该画个图来表征这个关系，但暂时先不画了，等看不懂文字的时候再画。不过我想我已经几近大白话说的，应该不会出现对不上号的情况。

最后，写了很长一个篇幅介绍上线这回事儿，其实主要是smarty这块，因为出问题比较多的也是这块。

总结一下，fisp需要把产出的Smarty相关资源放到`config_dir`、`plugins_dir`、`template_dir`这三个目录，渲染就没问题了，当然需要**保持引用路径跟磁盘文件路径对上号**。

{% endraw %}