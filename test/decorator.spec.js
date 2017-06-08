'use strict';

/**
 * babel-node decorator.spec.js
 */
 const assert = require("assert");
 // require("reflect-metadata");

//定义一个函数，也就是定义一个Decorator，target参数就是传进来的Class。
//这里是为类添加了一个静态属性
function Test(opts = {}) {
  return function(target) {
    target.isTestable = !opts.ignore;
  }
}

//在Decorator后面跟着Class，Decorator是函数的话，怎么不是testable(MyTestableClass)这样写呢？
//我只能这样理解：因为语法就这样，只要Decorator后面是Class，默认就已经把Class当成参数隐形传进Decorator了。
@Test()
class MyTestableClass {}

console.log(`isTestable: ${MyTestableClass.isTestable}`);

//定义一个Class并在其add上使用了修饰器
class Math {
  @log
  add(a, b) {
    return a + b;
  }
}

//定义一个修饰器
function log(target, name, descriptor) {
  //这里是缓存旧的方法，也就是上面那个add()原始方法
  var oldValue = descriptor.value;

  //这里修改了方法，使其作用变成一个打印函数
  //最后依旧返回旧的方法，真是巧妙
  descriptor.value = function() {
    console.log(`Calling "${name}" with`, arguments);
    return oldValue.apply(null, arguments);
  };

  return descriptor;
}

const math = new Math();
math.add(2, 4);

/**
 * A decorator to annotate method arguments for automatic injection
 * by Pine IoC container.
 *
 * Usage - Javascript:
 *
 * ```js
 * class InfoController {
 *   constructor(@inject('application.name') public appName: string) {
 *   }
 *   // ...
 * }
 * ```
 *
 * Usage - JavaScript:
 *
 *
 * @param bindingKey What binding to use in order to resolve the value
 * of the annotated argument.
 */
function inject(bindingKey) {
  return function markArgumentAsInjected(target, propertyKey, parameterIndex) {
    assert(parameterIndex != undefined, '@inject decorator can be used on function arguments only!');
    const injectedArgs = Reflect.getOwnMetadata('inject', target, propertyKey) || [];
    injectedArgs[parameterIndex] = bindingKey;
    Reflect.defineMetadata('inject', injectedArgs, target, propertyKey);
  };
}

function describeInjectedArguments(target) {
  return Reflect.getOwnMetadata('inject', target) || [];
}

class TestClass {
  constructor(@inject('foo') foo) { }
}

const meta = describeInjectedArguments(TestClass);
console.log("injectedArgs: ", meta);

// Design-time type annotations
function Type(type) { return Reflect.metadata("design:type", type); }
function ParamTypes(...types) { return Reflect.metadata("design:paramtypes", types); }
function ReturnType(type) { return Reflect.metadata("design:returntype", type); }

// Decorator application
@ParamTypes(String, Number)
class C {
  constructor(text, i) {
  }

  @Type(String)
  get name() { return "text"; }

  @Type(Function)
  @ParamTypes(Number, Number)
  @ReturnType(Number)
  add(x, y) {
    return x + y;
  }
}

// Metadata introspection
let obj = new C("a", 1);
let paramTypes = Reflect.getMetadata("design:paramtypes", C);
console.log("class design:paramtypes => ", paramTypes);
paramTypes = Reflect.getMetadata("design:paramtypes", obj, "add"); // [Number, Number]
console.log("function design:paramtypes => ", paramTypes);
