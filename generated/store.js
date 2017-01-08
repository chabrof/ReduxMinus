define(["require", "exports"], function (require, exports) {
    "use strict";
    var Store = (function () {
        function Store() {
            this._subscriberIdx = 0;
            this._subscriberCbks = [];
            this._middlewares = [];
        }
        Store.prototype.getState = function () { return this._state; };
        Store.prototype.subscribe = function (subscriberCbk) {
            var _this = this;
            this._subscriberCbks[this._subscriberIdx] = subscriberCbk;
            var closSubscriberIdx = this._subscriberIdx;
            var ret = function () { return _this._unsubscribe(closSubscriberIdx); };
            this._subscriberIdx++;
            return ret;
        };
        Store.prototype.dispatch = function (action) {
            var _this = this;
            var state = this._globalReducer(this._state, action);
            console.log('state', state);
            var next = function (action) { return state; };
            this._middlewares.forEach(function (middleware) { return middleware(_this)(next); });
            this._state = state;
            this._subscriberCbks.forEach(function (cbk) { if (cbk) {
                cbk();
            } });
            return action;
        };
        Object.defineProperty(Store.prototype, "middlewares", {
            set: function (middlewares) { this._middlewares = middlewares; },
            enumerable: true,
            configurable: true
        });
        Store.prototype.replaceReducer = function (reducer) { this._globalReducer = reducer; };
        Store.prototype._unsubscribe = function (subscriberIdx) { this._subscriberCbks[subscriberIdx] = null; };
        return Store;
    }());
    function createStore(reducer, preloadedState, enhancer) {
        if (typeof preloadedState === "function") {
            enhancer = preloadedState;
            preloadedState = undefined;
        }
        if (enhancer) {
            var truc = enhancer(createStore);
            return truc(reducer, preloadedState);
        }
        var store = new Store();
        store.replaceReducer(reducer);
        console.log('preload', reducer);
        store.dispatch({ type: "@@redux/INIT" });
        return store;
    }
    exports.createStore = createStore;
    function combineReducers(reducersObj) {
        return function (state, action) {
            var initialState = {};
            for (var i in reducersObj) {
                initialState[i] = reducersObj[i]();
            }
            return initialState;
        };
    }
    exports.combineReducers = combineReducers;
    function applyMiddleware() {
        var middlewares = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            middlewares[_i] = arguments[_i];
        }
        console.warn('APPly Middleware', middlewares);
        return function (createStore) {
            (function (reducer, preloadedState, enhancer) {
                var store = createStore(reducer, preloadedState, enhancer);
                store.middlewares = middlewares;
                return store;
            });
        };
    }
    exports.applyMiddleware = applyMiddleware;
});
//# sourceMappingURL=store.js.map