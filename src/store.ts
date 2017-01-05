class Store {
  private _state :any
  private _subscriberIdx :number = 0
  private _subscriberCbks :(() => any)[] = []
  private _globalReducer :(state? :any, action? :any) => any
  public getState() :any { return this._state }

  private _unsubscribe(subscriberIdx) { this._subscriberCbks[subscriberIdx] = null }

  public subscribe(subscriberCbk :() => any) :() => any {
    this._subscriberCbks[this._subscriberIdx] = subscriberCbk
    let closSubscriberIdx = this._subscriberIdx
    let ret = () => this._unsubscribe(closSubscriberIdx)
    this._subscriberIdx++
    return ret
  }

  public dispatch(action :any) {
    this._state = this._globalReducer(this._state, action)
    this._subscriberCbks.forEach((cbk) => { if (cbk) { cbk(); } })
  }

  public _setState(state :any) { this._state = state }
  public _setGlobalReducer(globalReducer :(state? :any, action? :any) => any) {
    this._globalReducer = globalReducer
  }
}

export let store = new Store(); // singleton

export function createStore(globalReducer :(state? :any, action? :any) => any) {
  store._setGlobalReducer(globalReducer)
  store._setState(globalReducer())
}

export function combineReducers(reducersObj :{[name :string]:() => any}) :(state? :any, action? :any) => any {
  return function(state? :any, action? :any) {
    let initialState :any = {}
    for (let i in reducersObj) { initialState[i] = reducersObj[i]() }
    return initialState
  }
}
