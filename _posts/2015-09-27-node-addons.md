---
layout: post
title: "如何方便快捷的进行 node-addons 开发"
date: 2015-09-27 10:21:42
categories: my
---

开始前的说明及准备
- Addons node 原生插件，以下用 addons 代指。
- node-gyp 辅助开发 addon 的工具
- build-essential 如 gcc、make、cmake、python、gdb 等
- 文档
    - https://developers.google.com/v8/embed
    - https://nodejs.org/api/addons.html

关键词：node原生插件开发、使用IDE开发node-addon、node-gyp、gyp、ninja

### 简单介绍
node addons （node原生插件）用来扩展 node 能力，有一些对性能敏感的功能需要实现为原生插件，也为了对接原有 C、CPP 等开发的库。从表象上是一个动态链接库，是 v8 提供的插件接口，这就意味着每次 v8 的升级就会导致接口的不兼容，需要重新在新版本下编译或者修改接口。

> node 升级导致 addons 不好使的情况很常见，几乎一个大版本都会出现类似的问题，这让维护一个 addons 项目变得复杂。

addons 可以用 cpp、c 等语言进行开发，接入 node 的 wrap 层需要使用 cpp 编写。开发一个 cpp 程序，特别是大型项目中有个好的 IDE 支持无疑能让开发快很多（特别是修改已有项目），本篇文章就围绕这个话题展开。

如何开发直接看文档即可，主要介绍周边开发工具，先从 node-gyp 开发。

### 让 node-gyp 生成不同 IDE 项目文件
node-gyp 实则包装了 gyp，其位 Google V8 项目中使用的构建工具，它非常好用，可以说是对各大构建工具再包装提供简易的配置文件 - JSON，最终编译的时候可以生成各种编译工具项目文件，如 cmake、ninja、vs、make等。

> gyp 的项目地址 https://chromium.googlesource.com/external/gyp/

node-gyp 提供了很多功能，但用户文档根本就没写出来。这会让开发变得很局促。我开发的时候由于网络被非可抗因素导致很慢，当第一次启动 node-gyp 进行编译的时候，其会下载当前使用 node 版本的源码，获取头文件及其必要的 library。这个过程很漫长，我忍无可忍就开始寻求办法，看源码中是否留了直接指定源码包的接口，过不其然其中包含这样的接口。

```
node-gyp rebuild --tarball=<path to node soruce tar.gz>
```

`--tarball` 参数就是干这个事情了，用提前下载好的源码包路径设置参数。

由于刚才说到的 v8 升级会导致预编译的二进制包无法使用，这时候就需要提前编译好多个版本的二进制插件包。如何编译出特定 node 版本下的插件使用如下命令。

```
node-gyp rebuild --target=0.10.0
```

`--target` 设置为 node 的版本号。

有时候还需要在同一台机器上编译不同体系（x86，x64）下的插件

```
node-gyp rebuild --arch=ia32
node-gyp rebuild --arch=x64
```

对于个人是不需要考虑这些事情的，因为自己编译自己用。但当你开发的插件打算分享给别人的时候，就得考虑对方的操作系统、arch、node版本等问题，提供给别人完整体验就得花费更多的心思。

最近 node 又升级到 4.x 时代了，无一例外，我的插件都跪了。面对这样的事实我也比较无奈。

以前开发的时候为了兼容跨大版本引起的接口变动，使用了 [nan](https://github.com/nodejs/nan) 这个兼容方案，后来也陆续了解过像 [swig]() 这样的兼容层模板。感觉这类东西能解决问题，就使用了 nan，谁曾想 4.x 时代还需要升级 nan，而 nan 的接口变动甚至能用看不懂来形容（其使用了各种 cpp template 技术），后再去看原生接口情切了很多。虽花了点时间又改回原生接口，在改的过程中发现太多问题，几乎都是 v8 接口使用问题。遂想用 IDE 来帮助修改，因为 IDE 有良好的接口提示功能。

node-gyp 在 Windows 上会生成 visual studio 项目文件可直接用 VS 来做调整。但在 Mac 下其产出的是 Makefile，就有点难办。

以前研究 gyp 的时候发现，gyp 是可以支持生成 CMakeLists.txt （cmake 配置文件），而 [CLION](https://www.jetbrains.com/clion/) 是比较不错的一个 C、CPP IDE，支持用 CMakeLists.txt 来初始化一个项目。

这样只需要让 node-gyp 也同样生成 CMakeLists.txt 即可

使用 gyp 的做法

```
gyp build.gyp --depth=. --generator-output=./output -f cmake
gyp build.gyp --depth=. --generator-output=./output -f ninja
```

使用 node-gyp 的做法

```
很遗憾，其没有留接口，代码写死
win => msbuild
mac, linux, ... => make
```

但其封装的是 gyp，只是没有提供现成的接口而已，自己造。。

当我们用 node-gyp 进行编译的时候，会输入如下内容

```
➜  images git:(node-v4.0.0) ✗ node-gyp rebuild
gyp info it worked if it ends with ok
gyp info using node-gyp@3.0.1
gyp info using node@4.1.1 | darwin | x64
gyp http GET https://nodejs.org/download/release/v4.1.1/node-v4.1.1-headers.tar.gz
gyp http 200 https://nodejs.org/download/release/v4.1.1/node-v4.1.1-headers.tar.gz
gyp http GET https://nodejs.org/download/release/v4.1.1/SHASUMS256.txt
gyp http 200 https://nodejs.org/download/release/v4.1.1/SHASUMS256.txt
gyp info spawn python
gyp info spawn args [ '/Users/shouding/Bin/lib/node_modules/node-gyp/gyp/gyp_main.py',
gyp info spawn args   'binding.gyp',
gyp info spawn args   '-f',
gyp info spawn args   'make',
gyp info spawn args   '-I',
gyp info spawn args   '/Users/shouding/Dev/fis2/dev/images/build/config.gypi',
gyp info spawn args   '-I',
gyp info spawn args   '/Users/shouding/Bin/lib/node_modules/node-gyp/addon.gypi',
gyp info spawn args   '-I',
gyp info spawn args   '/Users/shouding/.node-gyp/4.1.1/include/node/common.gypi',
gyp info spawn args   '-Dlibrary=shared_library',
gyp info spawn args   '-Dvisibility=default',
gyp info spawn args   '-Dnode_root_dir=/Users/shouding/.node-gyp/4.1.1',
gyp info spawn args   '-Dnode_gyp_dir=/Users/shouding/Bin/lib/node_modules/node-gyp',
gyp info spawn args   '-Dnode_lib_file=node.lib',
gyp info spawn args   '-Dmodule_root_dir=/Users/shouding/Dev/fis2/dev/images',
gyp info spawn args   '--depth=.',
gyp info spawn args   '--no-parallel',
gyp info spawn args   '--generator-output',
gyp info spawn args   'build',
gyp info spawn args   '-Goutput_dir=.' ]
```

![](http://store.orrafy.com/get/uuid=ecdcc9be82674109036d8266eca3f74c)

上图红框框住的地方不正是 gyp 的调用，抠出来

```
/Users/shouding/Bin/lib/node_modules/node-gyp/gyp/gyp_main.py binding.gyp -f make -I /Users/shouding/Dev/fis2/dev/images/build/config.gypi -I /Users/shouding/Bin/lib/node_modules/node-gyp/addon.gypi -I /Users/shouding/.node-gyp/4.1.1/include/node/common.gypi -Dlibrary=shared_library -Dvisibility=default -Dnode_root_dir=/Users/shouding/.node-gyp/4.1.1 -Dnode_gyp_dir=/Users/shouding/Bin/lib/node_modules/node-gyp -Dnode_lib_file=node.lib -Dmodule_root_dir=/Users/shouding/Dev/fis2/dev/images --depth=.  --no-parallel --generator-output build -Goutput_dir=.
```

其中有 `-f` 参数，修改为 `cmake`，执行这个命令即可得到 `./build/Release/CMakeLists.txt`，再用 CION 打开 `Release` 目录就是一个完整的项目了，可以在 IDE 编译，修改错误以及编码（代码自动补全很 nice）

很快我的项目就改好接口了，假设我用 make 一个一个去排除错误，修改到猴年马月都不能完成。

同样，把这个思路推广一下，就会发现开发的时候也可以便捷的用 IDE 了，可能有人会说难道直接用 IDE 开发不就得了，当然开发是 OK 的，但是 IDE 的各项环境设置几乎会让人死去活来好几次。

### 用 gdb 调试 node 扩展

有时候必不可少的需要单步编译，做到这一点有个要求就是得用 debug 版的 node，俗称 node_g；这个需要自己编译 node 才能得到，编译 node 时添加 `--debug` 参数即可。

```
./configure --debug
```

有了 node_g 就可以用 gdb 单步调试 node 了，包括你的扩展程序，gdb 调试是个复杂的话题，就不展开讨论了，Google 之。

### 小结

开发程序主要需要调试方便，无黑盒，这样才能开发的开心。之所以大家喜欢开发脚本语言，是因为脚本语言调试简单。而静态语言开发调试就得看内存，所以合理的借助工具是很好的实践方法。