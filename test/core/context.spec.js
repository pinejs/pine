'use strict';

import test from 'ava';
import { Context, Binding } from '../../src/core'

let ctx;

test.before(t => {
  ctx = new Context();
})

test('bind', t => {
  let key = 'foo';
  let binding = ctx.bind(key);
  t.true(ctx.contains(key));
  t.true(binding instanceof Binding, 'binding should be instance of Binding');
})

test('contains', t => {
  let key = 'foo';
  ctx.bind(key);
  const result = ctx.contains(key);
  t.true(result);
  t.false(ctx.contains('bar'));
})

test('getBinding', t => {
  const expected = ctx.bind('foo');
  const actual = ctx.getBinding('foo');
  t.is(actual, expected, 'getBinding should equal to bind return');
  let errFn = () => ctx.getBinding('unknown-key');
  t.throws(errFn, /unknown-key/, 'getBinding should throws Error');
})

test('getSync', t => {
  ctx.bind('foo').to('bar');
  const result = ctx.getSync('foo');
  t.is(result, 'bar');
  ctx.bind('foo').toDynamicValue(() => Promise.resolve('bar'));
  t.throws(() => ctx.getSync('foo'), /foo.*async/);
});
