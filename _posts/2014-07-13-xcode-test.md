---
layout: post
title: "初用xcode 5"
date: 2014-07-13 19:00:58 
categories: osx
---

今天闲来无事，想起了周五学芝提到的异步IO问题，以前看过这方面的内容，但已经很模糊了，打算找出来看看。

当我调用`mvim`进行尝试的时候，以前没有配置过，在不知道API是啥的时候，没有提示。这个实在难容，就打开了装了很久但没怎么用过的`xcode 5`。

在使用它的时候多多少少有些不太自在，特别是以前管用的一些用法不怎么灵光了。

- 当我要注释一段代码的时候，我用`<Command-/>`，当我想取消注释的时候，不好使了，又添加了一遍注释。
- 当我代码乱了后，没办法方便`format`
- 当我提示选错的时候，残留的代码还要删除，我又得提起鼠标开始删了（貌似鼠标被放在公司了，没带。。。）。

此时我已经凌乱了。再看向代码的显示主题，就有打开vim的冲动了。

不过新知识实在需要xcode这样的IDE。索性查了查看有没有好用的插件。

网络总是发展很快，而沉淀很多。google第一二条就是想要的。

- [http://nshipster.com/xcode-plugins/](http://nshipster.com/xcode-plugins/)
- [http://iosdevtips.co/post/82232620790/best-xcode-plugins](http://iosdevtips.co/post/82232620790/best-xcode-plugins
)

上面两篇文章介绍了一些常用的插件。其中有`xvim`，秉着尝试一把的念头试了试，发现这东西确实很好用，给了`xcode`另一条生命，随用之。

后装上了最爱的代码颜色主题 `base16-ocean`，看着整个开发环境顺眼多了。

- [https://github.com/chriskempson/base16](https://github.com/chriskempson/base16)

-----

周末完了，多学多看，周末拿起《Unix 环境高级编程》开始看了看`socket`方面的只是和`异步io`方面的知识，翻译真不咋地，很多错误。

虽然很多人都给socket例子，我这块也贴一个。

{%gist xiangshouding/d5e53c83b83c71954675 %}

随口唠叨一篇，下周工作快乐。
