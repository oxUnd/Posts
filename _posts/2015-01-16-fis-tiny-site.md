---
layout: post
title: "使用fis打造完美官网/个人blog"
date: 2015-01-16 17:28:09
categories: fisbook 
---

可能看到这个标题有人会各种疑惑或者是各种猜想以及鄙疑；不过不要着急，还是听听我如果打造的吧。

众所周知，FIS问世后被各种追捧当然了少不了那她比来比去的，每当这时候我就“面斥不雅”，绝不给面子；话说出来混江湖的那人钱财替人消灾；不管怎么样都得讨好老板降低支出成本不是？

那么别提那些有的没的，直接用FIS，构建起稳定高效的前端工程。

最近在做一件事情，这个事情呢也是萦绕心头已久，关于体面的活着的问题......

我看fis-plus的官网许多份，有时候经常被这些东西整得焦头烂额，很多同学会跳过来说你那个文档的某某地方是“死链”，我这时候非常紧张，赶快打开网站看看是否有问题，一看发现都是好的呀，心里暗骂你妹。后来才醒悟到用户看的是老版本的文档；

作为一个有情操的程序员，怎么能忍受这样的事情发生。然后趴下用钢笔做了个看似很帅气的方案。

> 直接走github的gh-pages分支吧，然后代理过去。

好，如此就这么搞起。但又整理思路，fis-plus的官网要是不用fis优化一下这不是自己打脸吗？那就干脆用FIS打造一个官网吧。

> 要用FIS做优化，压缩合并md5...

但是呢，我想只在github上写WIKI来生成官网文档的内容；

> 要用GITHUB WIKI来维护文档，只此一份！

wiki用的是markdown，markdown也足够优秀。那么打造的编译工具也应该需要支持markdown。

### 需求
- 文档在WIKI上维护
- 文档需要用fis编译到gh-pages分支，做各种优化
- 整个编译流程是自动化的（这个需求是必须当然的了）

### 开工
通过各种描述呢，画了一个架构图，来保证自动化编译，让整个编译过程不经过人为干扰。

![struct](/images/dev/o-site.png)

大概就是wiki编辑后发一个事件给监听事件的服务器；监听的服务再提交一个`changelog`给工程项目（FIS项目），后会触发`travis`编译；编译完成后会把编译结果提交给`gh-pages`，这样整个文档的编译就完成了。

做成这个工作我们需要做的任务
- 找一个看似好看的官网模板
- 实现从hook监听机器提交`changelog`的逻辑
- 打造FIS，使其能够支持编译markdown，生成结构适合的网页。也要保证其通用性；
- `travis`上的编译脚本

脚本嘛就比较简单，主要着重介绍一下*打造FIS*篇。

先奉上项目地址：https://github.com/fis-dev/fis-doc

展现一下目录结构

```bash
$ git:(master) ✗ tree -L 1
.
├── README.md
├── build.sh
├── changelog
├── doc
├── document.html
├── fis-conf.js
├── index.html
├── lib
├── package.json
├── static
├── trigger.js
└── widget
```

- `doc` 从GitHub WIKI上clone下来的文档就放在此处，有`build.sh`中进行`clone`
- `lib` 用的一些第三方库，当然也可以直接放到static目录下，这块暂且这样吧
- `static` 页面的静态资源
- `widget` 页面拆分成不同的组件
- `index.html` 首页
- `document.html` 文档页
- `fis-conf.js` FIS配置文件，定制编译逻辑都是放在这个页面里面的

几个分享的点
- 拆分组件后用`<!--inline[]-->`粘合在一起，这个是FIS**三种语言能力**里面的内嵌能力。
- markdown使用`marked`这个开源库搞定
- 高亮使用`highlight.js`，可以给`marked`设置属性来使用它。
    
    ```javascript
        marked.setOptions({
            renderer: renderer,
            highlight: function(code) {
                return require('highlight.js').highlightAuto(code).value;
            },
            langPrefix: 'hljs lang-',
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        });
   ```
- 如何让FIS把`markdown`编译为`html`就很简单了，直接使用`fis-parser-marked`即可，不过由于我的整个方案定制点比较多，所以选择自己实现一个`fis-parser`。

#### 把所有文档内嵌进文档页

主要的定制点在此块，WIKI里面的文档是多文件的，最终要内嵌到一个页面，需要考虑的是顺序问题；还好考虑多个文件中**锚点**被放置到一个文件里面进行的变化。

幸好，WIKI有个写`NAV`的文件，叫`doc/_Sidebar.md`；所以整个顺序等都是由这个文件决定的。

设置属性为`isNav`

```javascript
fis.config.set('roadmap.path', [
...
{
    reg: '**/_Sidebar.md',
    isNav: true
},
...
]);
```

定制`marked`的`renderer`，收集到所有`isNav`文件中的链接；

```javascript
        renderer.link = function(href, title, text) {
            if (file.isNav) {
                var info = url.parse(href);
                if (!~navs.indexOf(info.pathname)) {
                    //check file exist?
                    var refFile = fis.file(file.dirname + '/' + info.pathname + '.md');
                    gNavRef.push(refFile.toString());
                    navs.push(info.pathname);
                }
                return;
            }
            ...
        }
```

再把这些链接拼凑成`FIS`的`inline`能力，让`FIS`编译时进行处理

```javascript
        if (file.isNav) {
            return navs.map(function(path) {
                return '<div class="bs-docs-section"><!--inline[' + path + '.md]--></div>';
            }).join('\n');
        }
```

整体以上这块逻辑是是现在`fis-parser`阶段；

```javascript
fis.config.set('modules.parser.md', function (content, file, conf) {
    //刚才上面讲到的逻辑。
});
```

我只是贴一些关键代码，具体可参见源码仓库。

然后最终执行把内容内嵌到`document.html`中进行展示。

```html
    <div class="col-sm-9">
        <div id="document-main" class="document-main">
            <!--inline[./doc/_Sidebar.md]-->
        </div>
    </div>
```
#### WIKI提交代码触发travis编译
据我所知，wiki提交代码是无法触发travis的，那怎么办呢，我的做法是给`Git`仓库设置一个`hook`，然后当有代码变动更新时，触发事件给`hook`的监听服务发信息，然后再用这个服务给某个仓库提交代码，我选择的是`fis-doc`这个仓库，并且提交的是WIKI更新的主要信息包括时间，算是一个`changelog`了。`fis-doc`就是一个可编译的`fis`项目，内容就是上面定制的方案。

#### 编译产出后提交GitHub

当仓库被提交一个`changelog`后，会触发`travis`进行FIS编译，后会把产出的结果`output`发布到wiki所对应的代码仓库的`gh-pages`分支下，那这个工作如何搞定呢？

- `travis`提交`GitHub`的方法，请参见：https://evansosenko.com/posts/automatic-publishing-github-pages-travis-ci/
- 其他写个脚本搞定就好，可参见`build.sh`

### 总结
其实使用`FIS`建站非常的方便，从高大上的大型前端项目到小而美的官网项目，一应俱全一个不拉。如果你说你给某一个`lib库`做一些处理也是可以的。

总之，就是灵活、优美、简单。