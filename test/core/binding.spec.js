'use strict';

import test from 'ava';
import { Context, Binding } from '../../src/core'

let ctx, binding;
let KEY = 'foo';

test.beforeEach(t => {
  ctx = new Context();
  binding = new Binding(KEY);
});

test('key', t =>{
  const result = binding.key;
  t.is(result, KEY, `binding.key should equal to ${KEY}`);
  t.false(binding.isLocked, 'binding should be in unlock state');
});

test('lock', t => {
  binding.lock();
  t.true(binding.isLocked, 'binding should be in lock state');
});

test('getValue', t => {
  binding.to('bar');
  t.is(binding.getValue('foo'), 'bar', 'binding value should equal to "bar"');
})

test.afterEach(t => {
  ctx = null;
  binding = null;
});
