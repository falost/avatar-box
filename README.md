### 圣诞头像小程序


### 效果演示

请微信扫码访问

![Falost](https://falost.gitee.io/static/falost/falost_mp.jpg)

#### 能做什么？

该项目由 uni-app 云开发完成，能够生成当前流行的头像小程序, 包含国庆节、万圣节、圣诞节、春节等节假日头像的生成，并能自定义挂件生成个性头像！

### 食用方式
 
1、clone 项目到本地 `git clone https://github.com/falost/avatar-box.git`

2、使用 HbuilderX 导入项目 `文件 - 导入 - 从Git导入`

3、运行安装相关 node 模块 `npm run install`

4、修改 setting.js 中的 STATIC_DEV 的路径为你的静态资源路径（可不修改）

5、点击工具的运行到微信小程序中 `运行 - 运行到小程序模拟器 - 微信开发工具`

### 注意问题

1、因为使用了 uni-app 云开发，所以需要先关联云空间，个人使用的是阿里云空间

2、在项目目录中找到 database 目录下的 db_init.json 文件 右键进行初始化导入数据

3、再导入数据的时候，需要填写 wz_config 表中对应的 wxSecret 和 wxAppId，否则无法登陆

4、如果你的小程序没有绑定微信开放平台，请在 云函数 user_auth 中设置 ISOPEN 常量为 false 默认为 true 

### 使用帮助

如果在运行中遇到什么问题，可以加我个人微信号 falost_cc 寻求帮助

![](https://falost.gitee.io/static/falost/qrcode_for_falost_cc.jpg)


### 订阅号

![](https://falost.gitee.io/static/falost/qrcode_for_falost.jpg)

### 小程序开发交流群

如果群过期了, 可以添加微信并备注：小程序 拉你进群

#### 如果觉得有用，不妨给点个 star 吧！

### 相关文章

[uniapp云开发头像边框小程序和红包封面小程序](https://juejin.cn/post/7049037420670484511)


