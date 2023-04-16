/**
 * Store dictionary
 */
const Stores = new Map()

/**
 * Store ID value
 */
let idValue = 0

const getTypeTag = (value) =>
  Object.prototype.toString.call(value).slice(8, -1).toLowerCase()

const isPlainObject = (value) => getTypeTag(value) === "object"

/**
 * Generate a new ID by incrementing the Store ID.
 */
function createId() {
  return idValue + 1
}

function setInitialStore(id, initialState) {
  Stores.set(id, {
    state: initialState,
    subscriptions: [],
  })
}

/**
 * Get a new deep clone of state from a store.
 * @returns {Object}
 */
function getState(id) {
  return Stores.get(id).state
}

/**
 * Set a new state value to a store.
 */
function setState(id, rawNextStateValue) {
  if (!isPlainObject(rawNextStateValue)) {
    throw new Error(
      "[core-flux] bindState callback: The reduced state value must be a plain object. If there is no change in state, simply return it."
    )
  }

  const store = Stores.get(id)

  if (!store) return

  const { state, subscriptions } = store
  const newState = { ...state, ...rawNextStateValue }

  Stores.set(id, {
    state: newState,
    subscriptions,
  })
}

/**
 * Creates a new store, then returns dispatch, subscribe, and pointer references.
 *
 * @param {Object} initialState
 * @param {Function} reducer
 * @param {Function} bindSubscriber
 * @param {Function} bindState
 * @returns {{dispatch: Function, subscribe: Function}}
 */
export function createStore(initialState, reducer, bindSubscriber, bindState) {
  if (!initialState || !isPlainObject(initialState)) {
    throw new Error(
      "[core-flux] createStore(): The initial state value must be a plain object."
    )
  }

  const id = createId()
  setInitialStore(id, initialState)

  return {
    dispatch(type, payload) {
      const state = getState(id)
      const reducedState = reducer(state, { type, payload })

      return bindState(
        Stores.get(id).subscriptions,
        reducedState,
        function (rawNextState) {
          return setState(id, rawNextState)
        }
      )
    },
    subscribe(subscriber, data) {
      if (!subscriber || !data) {
        throw new Error(
          "[core-flux] subscribe(): `subscriber` and `data` arguments are required."
        )
      }

      const { subscriptions, state } = Stores.get(id)

      subscriptions.push([subscriber, data])
      bindSubscriber(subscriptions[subscriptions.length - 1], state)
    },
    __data: Stores.get(id),
  }
}
