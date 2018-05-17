供应链金融平台前端开发规范
======================

目录
---
### 项目开发规范
* 分支介绍
* 分支使用流程

### 开发环境搭建
* 代码获取
* 环境准备
* 开发&调试
* 打包发布

### 代码开放规范
* 文件/文件夹命名规范
* 变量命名规范
* 函数命名规范

### 公共样式使用

### Router 设置
* 介绍
* 命名规范
* 使用规范

### API 设置规范
* API 介绍
* 命名规范
* 使用规范

### 页面开发规范

### Component开发规范

--------------------------------------

规范正文
-------

### 项目开发规范
项目开发使用**分支开发**模式，禁止直接在主干（master）上开发提交代码。

##### 分支介绍
代码分支主要分为如下几类：
- master
    + 介绍：主干分支，保存最新线上代码。当新代码上线后出现问题时，主干代码可用于回滚
- release
    + 介绍：用于上线的分支。待上线的代码必须使用该模块进行打包发布
- dev
    + 介绍：开发分支。该分支代码只可用于开发、调试、提测，不能用于上线
    + 命名规范：**预计上线时间-负责人-项目名称**，例如：20180412-syy-demo
- bugfix
    + 介绍：用于修复小型bug，避免因 bug 修复建立过多分支

##### 分支使用流程
1. *开发前*，从**master**创建dev分支
2. 在**dev**开发相关功能
3. *提测前*，从**master**同步最新代码，并解决冲突
4. *测试中*，若**master**有更新，须及时同步
5. *待上线*，**release**合并对应的**dev**代码
6. *上线*，打包并发布**release**
7. *上线完成*，**master**合并**release**代码

--------------------------------------

### 开发环境搭建

#### 代码获取
供应链金融平台代码由如下几部分构成：
- scf-common-ui
    + 介绍：公共UI模块，包含公共样式，控件等
    + Git：[scf-common-ui git地址](http://gitlab.91steel.com/suply-chain-finance/scf-common-ui.git)
- scf-common-service
    + 介绍：公共服务模块，与样式无关的服务，JS库等
    + Git：[scf-common-service git地址](http://gitlab.91steel.com/suply-chain-finance/scf-common-service.git)
- scf-site
    + 介绍：官网门户
    + Git：[scf-site git地址](http://gitlab.91steel.com/suply-chain-finance/scf-site.git)
- scf-auth
    + 介绍：用户权限，包含：登录、注册、认证
    + Git：[scf-auth git地址](http://gitlab.91steel.com/suply-chain-finance/scf-auth.git)
- scf-order-financing
    + 介绍：订单融资业务模块
    + Git：[scf-order-financing git地址](http://gitlab.91steel.com/suply-chain-finance/scf-order-financing.git)


#### 环境准备
1. 从代码库分别拉取对应代码，并将他们放置于同一目录下，结构如下所示：
    - project
        + scf-common-ui
        + scf-common-service
        + scf-site
        + scf-auth
        + scf-order-financing
        + node_module (见步骤3)
2. 进入任一模块，运行 **cnpm install**
3. 将该模块下的**node_module**目录*剪切*至与代码模块平级的目录
4. 分别进入各个模块，运行**npm run hooks**，安装 git 钩子，该钩子会在 commit 前对代码进行 eslint 检查

至此，开发环境准备完毕。

--------------------------------------

#### 开发&调试

##### 目录结构介绍
代码模块使用如下目录结构：
- build
    + 介绍：代码构建工具目录
- eslint
    + 介绍：eslint 标准目录
- hooks
    + 介绍：git 钩子目录
- mock
    + 介绍：假数据目录，用于前端调试，模拟后端返回数据
- src
    + 介绍：源代码目录
- index.html
    + 介绍：模块包含页面展示列表，*npm run dev*后呈现的页面

##### 调试工具
使用**Charles**作为调试工具，用以转发localhost 请求，解决跨域问题

下载地址：[Charles](http://xclient.info/s/charles.html?t=32d61a0bac4308d1fe34cf2c3f3aeb5bf8f232f9)

下载后，使用其 map_remote 功能转发本地请求

##### 调试指令
控制台运行
**npm run dev**
进行本地调试。
指令运行后，会在 chrome 浏览器打开需要调试模块的 index.html 页面

本地源代码更新后页面会*自动刷新*。

#### 打包发布
发布环境分为**测试（QA）**和**线上（PRO）**两个，分别对应2个打包指令：
- 测试：
    + **npm run build:qa
    + 产出目录：/output/qa/
- 线上：
    + **npm run build:pro**
    + 产出目录：/output/pro/

*注：每次运行打包指令，会清空当前产出目录下的所有文件，并生成新的产出文件*

--------------------------------------

### 代码开发规范
#### 通用规范
1. 命名需要尽可能语义化，方便阅读

####  文件/文件夹命名规范
1. 单词之间以中划线**-**作为分割，例如：order-financing
2. 所有字母均使用小写

####  变量命名规范
1. 命名采用**驼峰命名**，首字母小写。（常量const除外）
2. 常量或者const 变量使用**全大写**，单词之间以**下划线**分割
3. 变量命名以该变量所存储数据类型作为开头：
    - 整数：iVarName
    - 小数：fVarName
    - 字符串：strVarName
    - 布尔：bVarName
    - 数组：arrVarName
    - 对象：objVarName
    - 日期：datVarName
    - 正则：regVarName

####  函数命名规范
1. 命名采用**驼峰命名**，首字母小写
2. 无需特殊前缀
3. 如需使用**new**调用方式，首字母大写

--------------------------------------

### 公共样式
公共样式相关内容存放于：
**/scf-common-ui/style/**

公共样式由如下几部分组成：
- 间距，例如：margin，padding 等。参看**/scf-common-ui/style/global/common.scss**
- UI样式：
    1. 进入**/scf-common-ui**
    2. 运行**npm run dev**
- sass var & mixin
    - 存放于：**/scf-common-ui/style/sass/**
    - 所有scss文件和vue文件中的样式，可**直接使用**定义 var 或 mixin，**无需**额外import

--------------------------------------

### Router设置

#### 介绍
Router设置放置在
**/src/page/routes/**
文件夹下

Router由两部分构成：
- 一级业务模块
    + 介绍：用于设置一级导航栏或菜单栏直接指向的页面路由
- 二级业务模块
    + 介绍：一级业务模块从属的页面路由

以*订单融资*业务为例：
一级业务模块为：
- 融资企业入口页：/src/page/co-financing/co-financing.vue
- 核心企业入口页：/src/page/co-core/co-core.vue
- 资金方入口页：/src/page/co-capital/co-capital.vue

二级业务模块部分示例：
- 融资企业->申请融资页
- 融资企业->融资审核页

#### 代码存放位置
一级业务模块路由存放于：
**/src/page/routes/routes.js**
该文件是模块是模块代码的最终使用的唯一路由

二级业务模块路由存放于：
**/src/page/routes/一级模块名称/一级模块名称.js**
该类文件存储一级模块下用到的所有页面路由，并将以*children*形式加入到一级路由中

#### 命名规范
命名规范在遵循*代码开发规范*的基础上，还需遵循如下规范：
1. 二级路由导出变量名需要以：**rt** 开头，例如：rtCoFinancing
2. 二级路由导出类型为**Array**
3. 每个路由需要有对应的名字，即**name**属性
4. *name*属性命名规范：**rt** + **一级业务模块名称** + **页面名称**，例如：*rtCoCoreList*

#### 使用规范
1. 使用**name**进行跳转，即 router.push({ name: 'rtRouterName', params: { params }})

--------------------------------------

### API设置
#### 介绍
API 文件用于存放所有代码模块所需请求的url。

API设置放置在
**/scf-common-service/src/api/**
文件夹下

API由两部分构成：
- API 汇总文件，即 *api.js*
- 各个代码模块所需 api,即 *api/代码模块/代码模块.js*

#### API 代码存放位置
API设置放置在
**/scf-common-service/src/api/**
文件夹下

API入口文件存放位置为：
**/scf-common-service/src/api/api.js**

各代码模块所需 API 存放位置为：
**/scf-common-service/src/api/代码模块名/代码模块名.js**
以*订单融资*业务为例，api 文件为
**/scf-common-service/src/api/order-financing/order-financing.js**

#### 命名规范
命名规范在遵循*代码开发规范*的基础上，还需遵循如下规范：
1. API 遵循常量命名规范，即**变量名全大写**，单词之间以**下划线**分割，例如：API_ORDER_FINANCING
2. 代码模块 api 导出的变量须以**API**开头，以订单融资代码模块为例：
    `
        export {
            API_ORDER_FINANCING
        }
    `
3. 模块内各个详细 api 需要以**METHOD**开头，表明该请求是**GET**还是**POST**，例如：**GET_APPLY_LIST**

#### 使用规范
1. 代码模块内部只能使用对应模块的 api，不允许夸模块使用
2. 使用方式如下：
    `
        import { API_ORDER_FINANCING } from 'path/to/api';
        const apiName = API_ORDER_FINANCING.GET_APPLY_LIST;
    `

