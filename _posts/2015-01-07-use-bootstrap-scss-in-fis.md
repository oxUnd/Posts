---
layout: post
title: "在fis中使用bootstrap-sass，熟悉fis-parser-sass的使用"
date: 2015-01-07 10:43:00
categories: fisbook 
---

从题目不难看出，我最近要开始写点关于fis使用的博文了。fis固然好，但一些使用上的细节，不是靠看文档就能看得明白使用得顺心的；

好吧，本来应该把文档写得风趣一点，奈何大家写文档都是一板一眼，不好扭过来。

闲话少扯......

最近在整理官网，官网由于时间的推移，用户认知的改变需要做一些调整。展示给用户的内容呢要突出重点，所以呢我就放下手头乌七八糟的事情，开始了设计页面的事情；选来选去还是决定选择bootstrap干净利落；

bootstrap提供了less、sass等异构语言（变种语言）的版本，如今如果搞前端不用点这些都觉着丢人。那么问题来了，在fis里面如何使用上bootstrap的less或者sass版本呢？

由于我要使用的是`sass`，就来写写bootstrap的sass版本在fis的使用吧。

### 准备工作

- 安装fis `npm install -g fis`
- 安装fis-parser-sass插件 `npm install -g fis-parser-sass`
- 下载[bootstrap-sass](https://github.com/twbs/bootstrap-sass/archive/v3.3.1.tar.gz)

### 开始调教

#### 准备bootstrap源码

不出意外的话，下来下来的bootstrap-sass解压后目录下有一大坨的东西，如这样

```bash
$ tree -L 2
.
├── CHANGELOG.md
├── CONTRIBUTING.md
├── Gemfile
├── LICENSE
├── README.md
├── Rakefile
├── assets
│   ├── fonts
│   ├── images
│   ├── javascripts
│   └── stylesheets
├── bootstrap-sass.gemspec
├── bower.json
├── composer.json
├── lib
│   ├── bootstrap-sass
│   └── bootstrap-sass.rb
├── package.json
├── sache.json
├── tasks
│   ├── bower.rake
│   ├── converter
│   └── converter.rb
├── templates
│   └── project
└── test
    ├── compass_test.rb
    ├── compilation_test.rb
    ├── dummy_node_mincer
    ├── dummy_rails
    ├── dummy_sass_only
    ├── gemfiles
    ├── node_mincer_test.rb
    ├── node_sass_compile_test.sh
    ├── pages_test.rb
    ├── sass_test.rb
    ├── sprockets_rails_test.rb
    ├── support
    ├── test_helper.rb
    └── test_helper_rails.rb
```

看到很多东西，特别是`.json`结尾的，都是提供给包管理用的，现在提供库的这些开发者也是蛮拼的，不过在他们的行列里面以后也会有`fis的包管理配置文件`的，😄i

这么多东西，其实有用的就`assets`下的;那么其他东西是什么呢，由于sass是用ruby写的其他的东西都是一些编译出css的程序，忽略它们就好。

不用的东西那么多，果断copy出有用的东西（`assets`目录下的内容）。

```bash
➜  bootstrap  tree -L 1
.
├── fonts
├── images
├── javascripts
└── stylesheets
```

`sass`文件都在`stylesheets`下面；

#### 在fis中使用

创建一个文件夹，作为fis的项目目录，并新建`fis-conf.js`

```bash
$ mkdir fis-ui
$ touch fis-conf.js
```
> windows用户可右键创建

然后把准备好的源码`bootstrap`目录放到`fis-ui/static/`下面；

配置配置文件

```javascript
// file: fis-conf.js
fis.config.set('project.exclude', '**/_*.scss'); // [1]
fis.config.set('modules.parser.scss', 'sass'); //启用fis-parser-sass插件当处理文件后缀是`.scss`。
fis.config.set('roadmap.ext.scss', 'css'); //`.scss`的文件最后编译产出成`.css`文件。

//给插件fis-parser-sass配置信息
fis.config.set('settings.parser.sass', {
    'include_paths': [__dirname, path.join(__dirname, 'static', 'bootstrap', 'stylesheets')] //[2]
});
```

*解释：*

- [1]，`_`开头的这些文件，可以认为是定义的sass组件，会被sass最终编译内嵌到其他文件中
- [2]，这句告诉sass这个插件，遇到`@import`时，去什么目录查找文件。
- fis-parser-sass是一个编译sass编译工具

#### 使用bootstrap

假设页面的样式文件是`/static/index.scss`，那么使用就很简单了；

```css
@import '_bootstrap.scss'; /*从某一个include_path找到文件*/
```

然后在页面引入这个index.scss即可；

```html
<link href="/static/index.scss" rel="stylesheet" type="text/css">
```

当然在`index.scss`里面可以使用任意的`bootstrap`定义的`var`、`mixin`、`...`了。

fis编译查看

```bash
$ fis release
or
$ fis release -wL
$ fis server start
```

-----

DONE.
