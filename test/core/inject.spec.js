'use strict';

const assert = require("assert");
require("reflect-metadata");
const REFLECTION_KEY = 'inject';
// import test from 'ava';
// import {inject, describeInjectedArguments} from '../../src/core/inject';

// test(t => {
//   class TestClass {
//     constructor(foo) { }
//   }
//
//   const meta = describeInjectedArguments(TestClass);
//   t.deepEqual(meta, []);
// })





// test(t => {
  class TestClass {
    constructor(@inject('foo') foo) { }
  }

  const meta = describeInjectedArguments(TestClass);
  console.log(meta);
//   t.deepEqual(meta, ['foo']);
// })
