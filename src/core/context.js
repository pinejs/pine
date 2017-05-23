"use strict";

const Binding = require("./binding").Binding;
const util = require("../utils");

class Context {
    constructor(_parent) {
        this._parent = _parent;
        this.registry = new Map();
    }

    bind(key) {
        const keyExists = this.registry.has(key);
        if (keyExists) {
            const existingBinding = this.registry.get(key);
            const bindingIsLocked = existingBinding && existingBinding.isLocked;
            if (bindingIsLocked)
                throw new Error(`Cannot rebind key "${key}", associated binding is locked`);
        }
        const binding = new Binding(key);
        this.registry.set(key, binding);
        return binding;
    }

    contains(key) {
        return this.registry.has(key);
    }

    find(pattern) {
        let bindings = [];
        if (pattern) {
            const glob = new RegExp('^' + pattern.split('*').join('.*') + '$');
            this.registry.forEach(binding => {
                const isMatch = glob.test(binding.key);
                if (isMatch)
                    bindings.push(binding);
            });
        }
        else {
            bindings = Array.from(this.registry.values());
        }
        const parentBindings = this._parent && this._parent.find(pattern);
        return this._mergeWithParent(bindings, parentBindings);
    }

    findByTag(pattern) {
        const bindings = [];
        const glob = new RegExp('^' + pattern.split('*').join('.*') + '$');
        this.registry.forEach(binding => {
            const isMatch = glob.test(binding.tagName);
            if (isMatch)
                bindings.push(binding);
        });
        const parentBindings = this._parent && this._parent.findByTag(pattern);
        return this._mergeWithParent(bindings, parentBindings);
    }

    _mergeWithParent(childList, parentList) {
        if (!parentList)
            return childList;
        const additions = parentList.filter(parentBinding => {
            // children bindings take precedence
            return !childList.some(childBinding => childBinding.key === parentBinding.key);
        });
        return childList.concat(additions);
    }

    get(key) {
        try {
            const binding = this.getBinding(key);
            return Promise.resolve(binding.getValue(this));
        }
        catch (err) {
            return Promise.reject(err);
        }
    }

    getSync(key) {
        const binding = this.getBinding(key);
        const valueOrPromise = binding.getValue(this);
        if (util.isPromise(valueOrPromise)) {
            throw new Error(`Cannot get ${key} synchronously: ` +
                `the value requires async computation`);
        }
        return valueOrPromise;
    }

    getBinding(key) {
        const binding = this.registry.get(key);
        if (binding) {
            return binding;
        }
        if (this._parent) {
            return this._parent.getBinding(key);
        }
        throw new Error(`The key ${key} was not bound to any value.`);
    }
}

exports.Context = Context;
