class Store {
  private _state :any
  private _subscriberIdx :number = 0
  private _subscriberCbks :(() => any)[] = []
  private _globalReducer :(state? :any, action? :any) => any
  private _middlewares :((store :Store) => any)[] = []
  public getState() :any { return this._state }
  public subscribe(subscriberCbk :() => any) :() => any {
    this._subscriberCbks[this._subscriberIdx] = subscriberCbk
    let closSubscriberIdx = this._subscriberIdx
    let ret = () => this._unsubscribe(closSubscriberIdx)
    this._subscriberIdx++
    return ret
  }
  public dispatch(action :any) {
    let state = this._globalReducer(this._state, action)
    console.log('state', state)
    let next = (action) => state
    this._middlewares.forEach((middleware) => { return middleware(this)(next) })
    this._state = state
    this._subscriberCbks.forEach((cbk) => { if (cbk) { cbk() } })
    return action
  }
  set middlewares(middlewares :((store) => any)[]) { this._middlewares = middlewares }
  public replaceReducer(reducer :(state? :any, action? :any) => any) { this._globalReducer = reducer }
  private _unsubscribe(subscriberIdx) { this._subscriberCbks[subscriberIdx] = null }
}
export function createStore(reducer :(state? :any, action? :any) => any, preloadedState :any, enhancer :(createStore) => any) {
  if (typeof preloadedState === "function") {
    enhancer = preloadedState
    preloadedState = undefined;
  }
  if (enhancer) {
    let truc = enhancer(createStore);
    return truc(reducer, preloadedState)
  }
  let store = new Store()
  store.replaceReducer(reducer)
  console.log('preload',  reducer)
  store.dispatch({ type :"@@redux/INIT"});
  return store
}
export function combineReducers(reducersObj :{[name :string]:() => any}) :(state? :any, action? :any) => any {
  return function(state? :any, action? :any) {
    let initialState :any = {}
    for (let i in reducersObj) { initialState[i] = reducersObj[i]() }
    return initialState
  }
}
export function applyMiddleware(...middlewares :((store :Store) => any)[]) {
  console.warn('APPly Middleware', middlewares);
  return (createStore) => {
    (reducer, preloadedState, enhancer) => {
      let store :Store = createStore(reducer, preloadedState, enhancer)
      store.middlewares = middlewares
      return store
    }
  }
}
