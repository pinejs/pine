# Pine.js
pine.js is a tiny framework to help you load strcuture koa application.

## Overview
Application code structure:
- root
  * index.js
  * conf
    * config.default.js
    * config.prod.js
  * app
    * controller
    * service
    * model
    * router.js
  * package.json

Pine.js framework will load config,model,controller and service automatically based on the structure.
You don't need require the dependency by youself, framework will load it and inject dependency to your code.

More detail, please look at below example code, just have fun!

## Installation
pine.js requires node v7.6.0 or higher for ES2015 and async function support.

```
$ npm install pine.js
```

### Run example app
```bash
git clone https://github.com/frankliu/pinejs-examples.git
cd pinejs-examples
npm install
node index.js
```

### How to use it

##### 1. Create application structure
```bash
mkdir app conf logs
mkdir app/controller app/service app/model
touch package.json
npm install --save pine.js
```

##### 2. Initialize Application(app.js)
```javascript
const Application = require('pine.js');

const app = new Application({
  baseDir: process.cwd(),
  excludes: {
    controller: ['index.js'],
    service: ['index.js']
  }
})

app.start();
```

##### 3. add a router(app/router.js)
```javascript
'use strict';

module.exports = (app) => {
  app.get('/', 'home.index');
  app.get('/user/:loginname', 'user.show');

};
```

##### 4. add a controller(app/controller/user.js)
```javascript
const assert = require('assert');

class UserController {
  async show (ctx, next){
    let loginName = ctx.params.loginname;
    this.app.logger.info('getUserByLoginName: %s', loginName);
    let user = await this.app.service.User.getUserByLoginName(loginName);
    ctx.body = user || {};
  }
}

module.exports = UserController;
```

##### 5. add a service
```javascript
const assert = require('assert');

class UserService {
  /**
   * 根据登录名查找用户
   * Callback:
   * - err, 数据库异常
   * - user, 用户
   * @param {String} loginName 登录名
   */
  getUserByLoginName (loginName) {
    return this.app.model.User.findOne({'loginname': new RegExp('^'+loginName+'$', "i")});
  }
}

module.exports = UserService;
```

##### 6. add a model
```javascript
'use strict';

const BaseModel = require("./base_model");
const pine = require('pine.js');

class UserModel extends pine.Model {
  constructor(options){
    super(options);
    this.defineSchema({
      name: { type: String},
      loginname: { type: String},
      pass: { type: String },
      email: { type: String},
      url: { type: String }
    });
    this.index({loginname: 1}, {unique: true});
    this.index({email: 1}, {unique: true});
    this.pre('save', function(next){
      var now = new Date();
      this.update_at = now;
      next();
    });
  }
}

module.exports = UserModel;
```

##### 7. start app
node app.js

Framework will inject app to this when load controller, service and model.
