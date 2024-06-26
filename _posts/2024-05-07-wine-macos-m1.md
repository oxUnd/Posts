---
layout: post
title: "在 macOS 上使用 wine 9.0"
date: 2024-05-07 08:26:30 +0800
categories: 2024/05
---


首先，建议购买 CrossOver，能省下很多折腾的时间。但如果还是希望折腾一下的话，那就继续折腾 wine。

本来打算直接购买 CrossOver，但奈何 CrossOver 24 版本的 CPU 占用一直有点异常且不少应用程序关掉不退出（可能我观察时间太短）。所以就考虑直接使用 wine。

安装比较简单，直接用 Homebrew 搜索安装即可，建议安装 stable 版本，devel 版本 log 太多且可能有不明所以的 bug。

安装软件以及运行软件的方式比较简单，简单说一下，就不赘述了。

```bash
wine ./app.exe
```

也可以执行以下命令获取更多帮助
```bash
winehelp
```

但我安装完成后有几个问题比较明显，这也是我要写下来的原因。
- 4k显示器或者 Macbook 屏幕下字体现实比较虚，且界面不清晰，而且字体显示非平滑。
- 每次执行应用都是需要去命令行下调用起来，感觉有点麻烦。

主要就这两个问题，这两个问题解决后，大概率运行个软件应该没啥问题。我想运行的软件是 Source Insight。其他软件现在基本都有替代品。

关于字体的问题，找了一圈（找答案的过程中发现大模型能解决不少效率问题，可以用豆包或者 Copilot），基本都能找到答案。主要是修改注册表。但其中稍有点波折。在论坛里面大家给的例子跟现实环境有点不太一样。

- 运行以下代码，使字体平滑。

fonts.reg

```
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Control Panel\Desktop]
"FontSmoothing"="2"
"FontSmoothingType"=dword:00000002
"FontSmoothingGamma"=dword:00000578
"FontSmoothingOrientation"=dword:00000001
```

执行

```bash
wine regedit ./fonts.reg
```

- Mac 和 Wine 中都安装常用的 Windows 字体（主要是宋体、楷体、微软雅黑等等），方法比较简单不赘述。

- 设置以下注册表变量使能够支持 Retina 显示效果

```
[HKEY_CURRENT_USER\Software\Wine\Mac Driver]
"RetinaMode" = "Y"
```

<font color="red">注意</font>，可能你的注册表中 `HKEY_CURRENT_USER` 下没有 `Mac Driver`，请运行 `wine regedit` 启动注册表编辑器右键添加。

- 运行 `winecfg` 更改 PPI 为一个大一些的值，具体可以根据自己的分辨率计算一下，我设置的是 196.
- 设置完成后执行 `wineboot` 重启

另外一个比较难搞的问题是，如何有个快捷方式直接启动应用即可。我折腾了一圈，发现可以用 `wineskin`，可以 Homebrew 安装。但实现的方式是直接打包一个 Wine 到 xxx.app 目录下，来达成。感觉不是特别好。最终我直接选择使用命令行指令的方式。写一个脚本来快速启动某个应用。以 `Source Insight` 举例。

```bash
# filename = si
# wine64 "$HOME/.wine/drive_c/Program Files (x86)/Source Insight 4.0/sourceinsight4.exe" 2>/dev/null &
wine "$HOME/.wine/drive_c/Program Files (x86)/Source Insight 4.0/sourceinsight4.exe" 2>/dev/null &
```

启动的时候只需要终端 `si` 即可。

我以前较抵触这种跨平台的项目，因为前面黑莓手机就用类似的方案，来安装 Android 应用，实现效果非常一般。但感受了大量 linux 下的 wine 应用后，发现靠谱程度已经非常高了。现在越来越能接受了。

可想，很多时候得多尝试，才能真的了解一个东西。
