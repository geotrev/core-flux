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
    newObj = isArray ? [] : {}

  if (isArray) {
    let length = obj.length,
      idx = -1
    while (++idx < length) {
      newObj[idx] = obj[idx]
    }
  } else {
    for (const key in obj) {
      value = obj[key]
      newObj[key] = newObj[key] =
        value === null ? null : typeof value === "object" ? clone(value) : value
    }
  }

  return newObj
}

/**
 * Append a new state object to a Store.
 * @param {string} id
 * @param {{}} initialState
 */
function initState(id, initialState = {}) {
  Stores[id].state = initialState
}

/**
 * Append a new subscriber array to a Store.
 * @param {string} id
 */
function initSubscriptions(id) {
  Stores[id].subscriptions = []
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
  initialState,
  reducer,
  subscriptionAdded,
  stateUpdated
) {
  const id = createId()

  Stores[id] = {}
  initState(id, initialState)
  initSubscriptions(id)

  return {
    dispatch(type, payload) {
      const state = getState(id)
      const nextState = reducer(type, state, payload || {})

      return stateUpdated(
        Stores[id].subscriptions,
        nextState,
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
      subscriptionAdded(subscriptions[length - 1], state)
    },
  }
}
