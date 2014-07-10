---
layout: post
title: "MacVim noantialias"
date: 2013-12-22 15:59:00
categories: vim
---

看到`Sublime Text`里面可以关闭`反锯齿(anti-aliasing)`。
Google一下如何设置MacVim的`no-anti-aliasing`。

```vim
set noantialias
```
这样就可以关闭反锯齿了。眼睛看着不累，非常适合coding时使用

#### 效果

##### before

![anti-aliasing](/images/vim/antialiasing_before.png)

##### after

![noanti-aliasing](/images/vim/antialiasing_after.png)