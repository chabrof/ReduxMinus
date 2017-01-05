define(["require", "exports"], function (require, exports) {
    "use strict";
    var Store = (function () {
        function Store() {
            this._subscriberIdx = 0;
            this._subscriberCbks = [];
        }
        Store.prototype.getState = function () { return this._state; };
        Store.prototype._unsubscribe = function (subscriberIdx) { this._subscriberCbks[subscriberIdx] = null; };
        Store.prototype.subscribe = function (subscriberCbk) {
            var _this = this;
            this._subscriberCbks[this._subscriberIdx] = subscriberCbk;
            var closSubscriberIdx = this._subscriberIdx;
            var ret = function () { return _this._unsubscribe(closSubscriberIdx); };
            this._subscriberIdx++;
            return ret;
        };
        Store.prototype.dispatch = function (action) {
            this._state = this._globalReducer(this._state, action);
            this._subscriberCbks.forEach(function (cbk) { if (cbk) {
                cbk();
            } });
        };
        Store.prototype._setState = function (state) { this._state = state; };
        Store.prototype._setGlobalReducer = function (globalReducer) {
            this._globalReducer = globalReducer;
        };
        return Store;
    }());
    exports.store = new Store();
    function createStore(globalReducer) {
        exports.store._setGlobalReducer(globalReducer);
        exports.store._setState(globalReducer());
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
});
//# sourceMappingURL=store.js.map