---
layout: post
title: "Markdown Helper，一次 Mac App 开发之旅"
date: 2015-09-22 15:59:39
categories: my
---


## Markdown Helper，一次 Mac App 开发之旅

> 以下内容适用于 XCode 7 开发的 App，使用操作系统 OSX 10.11

最近由于经常写文档，想找个顺手的工具，但很多 Markdown 工具都没有处理图片的问题。大概有这么三类

0. 图片只能用远端的
0. 图片可以引入本地路径
0. 图片可以上传

第 1 种是那些不支持本地图片的，这类工具很多，DayOne 就是其中一个，当然你可能会说它能传**一张**图片。

第 2 种像 write 或者用编辑器都可以做到，可惜的是传到远端的时候还得考虑图片路径映射的问题

第 3 种一般都是远端应用或者 chrome 的插件，唯一的缺点是写文字时颤抖，容易引起不适。

而能做到把图片处理的得当的即好用的工具没能发现（至少我没有发现）；

从上面描述来看论实用性还是得选择图片传到远端，引入时引入图片的 URL，这样所有的编辑器下都可以很方便的使用。

其实，我们有自己喜欢的编辑文档（Markdown）的方法，比如用 sublime text 或者 vim。只要有个工具能搞定图片这个事情就皆大欢喜了。

从这点出发，我只需要一个开速上传图片并且返回图片 URL 的小工具就能满足需求。当然你也许会说直接传到图床（这是放毛片用的好吧）或者网盘不就行了。但这个路径还是太长，太麻烦。

我给这个工具取名叫 感叹号（Exclamation Mark），因为 Markdown 语法加一个图片的第一个字符是 `!`。

在开始的时候可能我需要做一些技术选型，由于自己使用的是 OS X，毫无疑问直接开发原生程序可以给我带来很大的便利性，比如可以方便的访问剪切板，实现剪切复制黏贴很方便。不过，我没有开发过 Mac 应用，也让我纠结了一番，想着要不要用 [electron](https://github.com/atom/electron) 来实现，后来还是选择了使用原生开发。

由于我需要这样一个工具而且我没有开发过 Mac 下的应用，一下子就激起了我的兴趣，我用周末时间，边看别人写的代码边实现整个应用程序的基本功能搞定了。

这个工具有两部分，服务端和客户端部分，服务端就相对于比较简单的，期初直接用 PHP 自己写了个 router 相对于优雅的搞定了功能，接受文件后保存返回文件的访问 url。

最折腾的地方在客户端，由于以前也没学过，好在对 C 语言比较熟，再加上强大的 Google，很快我的客户端慢慢的堆砌完成了。

在这个过程中也有一些需要记录下来的东西。

我的客户端设计有两个窗口，主窗口、设置窗口。主窗口包含触发上传文件的按钮和显示区域，设置窗口设置服务器接收端信息（想着后续可能会有人感兴趣自己搭建服务使用）；

其中几个需要攻克的技术点

- 打开一个文件浏览器窗口，选择文件，并获取选到文件的信息
- 模拟上传（一般用 POST 请求上传）
- 新建另一个窗口，主窗口可以控制它
- 设置的接收端数据进行永久保存
- 设置 App 的图标

### 打开一个文件浏览窗口，选择文件

接口 [NSOpenPanel](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NSOpenPanel_Class/) 实现这个操作

```objc
NSOpenPanel *panel = [NSOpenPanel openPanel];
[panel setCanChooseFiles: YES]; //是否能选择文件
[panel setCanCreateDirectories: NO]; // 是否创建文件夹
[panel setCanChooseDirectories: NO]; // 是否能选择文件夹
[panel setAllowedFileTypes:@[@"jpg", @"jpeg", @"png", @"gif"]]; // 能访问的文件后缀
```

初始化好了对象，就执行以下接口打开文件浏览窗口进行选择文件。

```objc
[panel beginSheetModalForWindow: [[self view] window] completionHandler: ^(NSInteger result) {
        if (result == NSFileHandlingPanelOKButton) {
                onComplete([panel URLs][0]);
        }
}]; 
```
这个接口算是异步接口，当成功后会调用给定的回调函数 `onComplete`。
当然你也可以调用同步接口；

```objc
NSInteger result = [panel runModal];
if (result == NSFileHandlingPanelOKButton) {
    return [panel URLs][0];
}
```
当然建议使用异步接口，不然会卡顿一下。上面代码中有这样的语句

```objc
[panel URLs][0];
```

这个应该是高版本才开始支持的，对于 `NSArray` 使用这种方式访问，也算是 Objc 的一种进步，当然后续可能全都使用 swift 了，不过还是建议学习一下 Objc，可以使用积攒已久的开源财富。

```objc
^() {
  //balabala
}
```
[blocks](https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/Blocks/Articles/bxGettingStarted.html) 在 C 语言里可以使用函数指针来实现传参一个函数，这是 Objc 里面另一种类似实现。

### 模拟上传

模拟上传也就是模拟一次表单提交，这个就很简单的，一搜一大把，包括各种语言版本的都有。网络请求使用的类是 [NSURLSession](https://developer.apple.com/library/ios/documentation/Foundation/Reference/NSURLSession_class/)，[NSMutableURLRequest](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSMutableURLRequest_Class/)；

打开一个 HTTP 请求，并发送数据，数据完成后执行回调（当然得用异步，不然拖死主进程）。

```objc
NSURLSession *session = [NSURLSession sharedSession];
NSURLSessionDataTask *reqTask = [session dataTaskWithRequest:req completionHandler:onReady];
[reqTask resume];
```

接口 `dataTaskWithRequest` 接口接受一个 Request 对象，以及一个网络请求成功后的回调 `completionHandler`。

那么实例化 `NSMutableURLRequest` 得到一个 Request 对象。

[代码](https://gist.github.com/xiangshouding/34cb19f177a7a998b5f6)

调用的回调函数 `onReady` 函数结构是

```objc
void (^onReady) (NSData *data, NSURLResponse *res, NSError *err) {}
```
很自然，第一个参数是访问服务端得到的数据，第二个是 Response 对象，第三个是错误；当我们想拿到服务器返回的状态码时需要实例化 `NSHTTPURLResponse`，可能看 API 文档的时候会无从下手，其实作为 C 语言高级版本，数据类型是可以通过强转来实现的变更的，因为最终都是一块连续的内存。

```objc
NSHTTPURLResponse *response = (NSHTTPURLResponse *) res;
long statusCode = [response statusCode]; // 获取到服务器返回状态码
```

### 新建另一个窗口

这个可能比较简单，新建一个 `xib` 文件（View），然后实现一个 Controller 类关联即可，具体方法可以参考网络，一大把一大把的文档。

需要给大家推荐一个新建 Perferences 窗口的类库 https://github.com/shpakovski/MASPreferences 实现得特别赞，直接拿来用。

还有包管理工具 https://cocoapods.org

### 设置数据永久保存

用户提交的配置信息，可以用 [NSUserDefaults](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSUserDefaults_Class/) 实现。

```objc
NSUserDefaults * userDefaults = [NSUserDefaults standardUserDefaults];
[userDefaults setObject: @"xxx" forKey: @"username"];
NSString *username = [userDefaults stringForKey: @"username"];
// xxx
```
还有其他若干类型接口，可逐一参考文档。

### 设置 App 的图标

这个其实蛮折腾的，需要制作 icon 图片，并且生成 `.icns` 文件。好在有现成的工具制作，无需那么麻烦去保存多个分辨率的图片然后调用命令生成。推荐一个免费的在线制作工具 https://iconverticons.com/online 。

把生成的 `.icns` 放到项目中，并修改 `info.plist` 中 `Icon File` 为 `.icns` 文件的名字即可。

举例；

```
appicon.icns
```
![](http://store.orrafy.com/get/uuid=81c2b68ffe8b1d6f7f7cf8aafdfbe9be)

顺便展示一下我弄的 icon

![](http://store.orrafy.com/get/uuid=737280894969a0139d65ee82d400ff9a)


回过头来，发现 Mac 应用的开发还是蛮有意思的，后续可能会花更多来开发一些有意思的应用程序。


我选择的语言是 Objective-c，后续转投 swift。