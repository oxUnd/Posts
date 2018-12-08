---
layout: post
title: "fis-plus篇，fisp 项目如何在线上跑起来"
date: 2015-05-08 11:39:18
categories: fisbook
---

<!-- {% raw %} -->

最近遇到很多同学（非度厂）当在本地开发完的 fisp（指代fis-plus，以下同） 项目不知道如何跟后端连在一起工作；这可能是整个站在前端的角度上去考虑问题，而不清楚后端是如何去渲染一个页面导致的。当然也有可能是对 Smarty 本身了解的匮乏，前面我写过一篇关于 Smarty 的文章：[fis-plus上线篇之搞定smarty环境](http://www.orrafy.com/posts/fisbook/fisp-online-smarty/)，可能这篇更偏向于对 fisp 编译工具的一些产出设置。那么这篇将揭露假设我用了个 PHP 的什么什么框架该如何去渲染 fisp 的项目呢？

### 讲述重点

- Smarty 的应用？
- 后端如何去渲染 fisp 的项目？

### Smarty 的应用？

为了讲述能清晰一些，我们一并说一下 Smarty 在我们的网站开发中是个什么角色，[Smarty][] 所谓后端模板语言，模板一般都是 View 层的承载介质（如MVC中），就很清晰知道是 View 层的东西；

PHP 本身就是一门优秀的模板语言，那么为了更简易的开发，[Smarty][] 在其基础上实现了类似继承填坑的机制来提升模板语言的灵活性，方便搞页面拆分，而且做了不少容错处理；所以在不需要了解整个 PHP 语言特性的情况下选择 [Smarty][] 作为模板来让前端开发人员去使用是一种不错的选择。

fisp 就选用了 Smarty 作为模板语言。

- 假设我不用 Smarty PHP网站开发是如何？

    不管是什么后端框架，一般都是 MVC 的，都会提供如下三个目录；

    ```
    .
    ├── controller
    ├── model
    └── view
    ```

    - controller 是一些入口文件，控制器，来协调 model 和 view 去完成一次页面的请求
    - model 一些访问数据库或者是篡数据的逻辑
    - view 这下面一般放的是模板

    假设我访问的 url 是 `http://my-host/index/show`，一般都会路由到 `show` 函数的执行上

    ```php
    <?php
    //controller/index.php
    class Index extends Controller {
        public function show() {
            // 获取 $data 的逻辑，一般是调用 model 下某逻辑
            $this->assign('data', $data); // <1>
            $this->display('show.php'); // <2>
        } 
    }
    ```

    如以上代码，我们不去关心数据是如何来的，反正这个一般都是由后端工程师搞定，我们只需要关注 <1> 、 <2> 两个步骤。`assign` 一般意思就是给模板塞数据，`display` 一般就是去渲染这个模板，在上面逻辑里面渲染的是 `view/index/show.php` 这个模板。

    `show.php` 是一个普通的 php 模板，我们可以假定它的内容如下

    ```php
    <html>
        <head>
            <title><?=$data['title']?></title>
        </head>
        <body>
            <p><?=$data['message']?></p>
        </body>
    </html>
    ```

    只是显示 `$data` 塞过来的数据。

    通过上面的逻辑，一个完整的 php 模板的渲染过程已经说完了。

- 用 Smarty 改造上面这个流程，该是怎么样的？

    跟上面一样，后端目录依然是如下这个形式

    ```
    .
    ├── controller
    ├── model
    └── view
    ```

    可能为了放置 Smarty 的类库，需要添加一个新目录叫 `lib`，下载 [Smarty][] 放到 `lib/smarty` 目录下；

    ```
    .
    ├── controller
    ├── lib
    ├── model
    └── view
    ```

    这时候依然访问 url `http://my-host/index/show`， controller 需要引入 smarty 去做渲染；

    ```php
    <?php
    //controller/index.php
    require(dirname(dirname(__FILE__)) . '/lib/smarty/Smarty.class.php'); //引入 smarty
    class Index extends Controller {
        private $_smarty = null;

        //假象 init 方法
        public function init() {
            $this->_smarty = new Smarty();
            // 模板目录设置，非 `/` 或者 `.` 开头的文件到这个目录下查找
            $this->_smarty->setTemplateDir(dirname(__DIR__) . '/view/template');
            // 设置插件目录，一般 fisp 会提供很多 smarty 的插件
            $this->_smarty->setPluginsDir(array(
                dirname(__DIR__) . '/view/plugin'
            ));
            // config_dir 设置
            $this->_smarty->setConfigDir(dirname(__DIR__) . '/view/config');
        }

        public function show() {
            // 获取 $data 的逻辑，一般是调用 model 下某逻辑
            $this->_smarty->assign('data', $data); // <1>
            $this->_smarty->display('index/show.tpl'); // <2>
        } 
    }
    ```

    同样的方式，给模板塞数据 `$this->_smarty->assign` 以及去渲染模板 `$this->_smarty->display` 。那么这时候模板就应该是 smarty 的模板了；

    `index/show.tpl`

    ```smarty
    <html>
        <head>
            <title>{%$data.title%}</title>
        </head>
        <body>
            <p>{%$data.message%}</p>
        </body>
    </html>
    ```

有了这个对照，是否清晰了一些，Smarty 就是干渲染模板这个事情的，其实就是 View 模板这块的事情。


### 后端如何去渲染 fisp 的项目？

如上面的对照，其实整个对 Smarty 在项目中的引入，**不限于什么什么框架**，虽然有些框架也会提供一些自己的模板语言，但是你要用 fisp 那么就应该忽视它们，直接换用 Smarty。

信息的朋友可能会发现，有个**塞模板数据**的过程，这个过程就是前后端的分界点，对于一个 fisp 的项目，编译完成后，只需要后端实例化 Smarty 并且去渲染特定模板即可。而这些数据就调用 Smarty 的 `assign` 方法塞数据即可。

说到这块，我们畅想一下整个用 fisp 开发时的流程是怎么样的？

- 据对对于某一个功能需要的数据都定下来，写数据结构文档（为了方便维护）
- 后端过去查数据库调用服务来获取并给这些数据
- 并行的前端开始开发页面，并且用 fisp 提供的本地服务套件，模拟这些数据，开发页面
- 联调的时候，把前端开发的模板、静态资源、Smarty 插件、Smarty config文件等上传到测试机器初始化 Smarty 时设置的那些目录下面
- 后端写清楚某个逻辑需要渲染（`display`）哪个模板，并且把准备好的数据塞给模板
- 然后这个事情就搞定了

这样真正实现了前后端并行开发。

[Smarty]: http://www.smarty.net

<!-- {% endraw %} -->