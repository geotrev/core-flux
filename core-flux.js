import { get } from "./utilities/get"
import { clone } from "./utilities/clone"

/**
 * Types
 */
const ASYNC_FN_NAME = "AsyncFunction"

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
 * Append a new state object to a Store.
 * @param {string} id
 * @param {{}} initialState
 */
function createState(id, initialState = {}) {
  Stores[id].state = initialState
}

/**
 * Append a new subscriber array to a Store.
 * @param {string} id
 */
function createSubscribers(id) {
  Stores[id].subscribers = []
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
 * Derives a new name for a subscriber's property by
 * the inner-most property name of a path.
 * @param {string} path
 * @returns {string}
 */
function getPropName(path) {
  const parts = path.split(".")
  return parts[parts.length - 1]
}

/**
 * Updates subscribed properties on a given subscriber.
 * @param {string} id
 * @param {constructor} subscriber
 * @param {string[]} properties
 */
function updateSubscriber(id, subscriber, properties) {
  properties.forEach((path) => {
    subscriber[getPropName(path)] = get(getState(id), path)
  })
}

/**
 * Updates a given Store's state, then forwards the values
 * to all subscribers of that Store. If the state is falsy,
 * nothing happens.
 * @param {string} id
 * @param {Object} nextState
 */
function updateSubscribers(id, nextState) {
  if (!nextState) return

  setState(id, nextState)

  Stores[id].subscribers.forEach(([subscriber, properties]) => {
    updateSubscriber(id, subscriber, properties)
  })
}

/**
 * Creates a new Store instance for a subscriber, then
 * returns helper functions for that Store.
 *
 * If a custom updater is given, subscriber logic doesn't run
 * and it defers to the updater.
 * @param {Object} initialState
 * @param {Function} reducer
 * @param {Function=null} updater
 * @returns {{dispatch: Function, subscribe: Function}}
 */
export function createStore(initialState, reducer, updater = null) {
  const id = createId()

  Stores[id] = {}

  createState(id, initialState)
  createSubscribers(id)

  return {
    async dispatch(type, payload) {
      const state = getState(id)
      const nextState =
        reducer.constructor.name === ASYNC_FN_NAME
          ? await reducer(type, state, payload)
          : reducer(type, state, payload)

      return updater
        ? updater(Stores[id].subscribers, nextState, (rawNextState) =>
            setState(id, rawNextState)
          )
        : updateSubscribers(id, nextState)
    },
    subscribe(subscriber, subscribedProperties = []) {
      if (
        !subscriber ||
        !Array.isArray(subscribedProperties) ||
        !subscribedProperties.length
      ) {
        return
      }

      if (!updater) {
        updateSubscriber(id, subscriber, subscribedProperties)
      }

      Stores[id].subscribers.push([subscriber, subscribedProperties])
    },
  }
}
