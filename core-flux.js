/**
 * Store dictionary
 */
const Stores = {}

/**
 * Store ID value
 */
let idValue = 0

/**
 * Generate a new ID by incrementing the Store ID.
 */
function createId() {
  return idValue + 1
}

/**
 * Creates a 1:1 clone of an object. Assumes all values are
 * simple primitives: numbers, strings, objects, arrays.
 * @param {Object|Array} obj
 * @returns {Object|Array}
 */
function clone(obj) {
  if (!obj) {
    return obj
  }

  const isArray = Array.isArray(obj)

  let value,
    copyObj = isArray ? [] : {}

  if (isArray) {
    let length = obj.length,
      idx = -1
    while (++idx < length) {
      copyObj[idx] = obj[idx]
    }
  } else {
    for (const key in obj) {
      value = obj[key]
      copyObj[key] = copyObj[key] =
        value === null ? null : typeof value === "object" ? clone(value) : value
    }
  }

  return copyObj
}

function setInitialStore(id, initialState) {
  Stores[id] = {
    state: initialState,
    subscriptions: [],
  }
}

/**
 * Get a new deep clone of state from a Store.
 * @returns {Object}
 */
function getState(id) {
  return clone(Stores[id].state)
}

/**
 * Set a new state value to a Store.
 */
function setState(id, nextState = {}) {
  Object.assign(Stores[id].state, nextState)
}

/**
 * Creates a new Store.
 *
 * @param {Object} initialState
 * @param {Function} reducer
 * @param {Function} updater
 * @returns {{dispatch: Function, subscribe: Function}}
 */
export function createStore(
  initialState = {},
  reducer,
  bindSubscriber,
  bindState
) {
  const id = createId()
  setInitialStore(id, initialState)

  return {
    dispatch(type, payload) {
      const state = getState(id)
      const reducedState = reducer(state, {
        type,
        payload: payload || {},
      })

      return bindState(
        Stores[id].subscriptions,
        reducedState,
        function (rawNextState) {
          return setState(id, rawNextState)
        }
      )
    },
    subscribe(subscriber, request) {
      if (!subscriber || !request) {
        return
      }

      const { subscriptions, state } = Stores[id]

      subscriptions.push([subscriber, request])
      const length = subscriptions.length
      bindSubscriber(subscriptions[length - 1], state)
    },
    // data: Stores[id],
  }
}
