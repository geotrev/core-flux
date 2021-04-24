<h1 align="center">Core Flux</h1>
<p align="center">0.5KB unopinionated flux utility. Use it to create stores, manage state data, and direct updates to subscribers.</p>
<br>
<p align="center">
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://img.shields.io/npm/v/core-flux.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://img.shields.io/npm/l/core-flux.svg?sanitize=true" alt="License"></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/circleci/github/geotrev/core-flux/main" alt="Circle CI status (main)" /></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/bundlephobia/minzip/core-flux" alt="bundle size" /></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/david/dev/geotrev/core-flux" alt="devDependencies" /></a>
</p>

Core Flux enables state data to be used in a flux pattern. You bring the logic and the library brings the flux.

This library specifically does not prescribe much of anything. It leaves the door open for you to create your own bindings.

As a result of this non-prescription, you'll need to do a bit more setup. However, you'll find the result is fitting nearly any custom use-case.

---

- [Install](#install)
- [API](#api)
  - [`createStore()`](#createstore)
  - [Add subscription](#add-subscription)
    - [`subscribe()`](#subscribe)
    - [`subscriptionsUpdated()`](#subscriptionsupdated)
  - [Update state](#update-state)
    - [`dispatch()`](#dispatch)
    - [`reducer()`](#reducer)
    - [`stateUpdated()`](#stateupdated)

## Install

### NPM / Yarn

```sh
$ npm i core-flux
```

```sh
$ yarn i core-flux
```

### CDN

The CDN puts the library in `window.CoreFlux`.

```html
<!-- The unminified bundle for development -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/core-flux@1.0.5/dist/core-flux.js"
  integrity="sha256-Rah28ygWlEa0D4WQA4Ojz55G5KX8TC0BPl8xMnlBe+A="
  crossorigin="anonymous"
></script>

<!-- Minified/uglified bundle for production -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/core-flux@1.0.5/dist/core-flux.min.js"
  integrity="sha256-sQthJqf8Ftv8jPE91NoRNQjkoxFPgwHXyYvQfB4gebs="
  crossorigin="anonymous"
></script>
```

## API

### createStore

Use `createStore` to initialize a new store instance. You can have multiple if you want.

Each store contains its state object and a list of subscriptions. To initialize a store, pass in:

- your initial state
- a [state reducer](#write-a-state-reducer)
- [`subscriptionsUpdated`](#subscriptionsupdated), a function you write to handle new subscriptions
- [`stateUpdated`](#stateupdated), a function you write to handle state updates

```js
// foo-store.js

import { createStore } from "core-flux"

function reducer(type, state, payload) {
  // create next state
}

function subscriptionsadded(newSubscription, state) {
  // handle new subscription added to the store
  // e.g., hydrate subscriber with default state
}

function stateUpdated(subscriptions, nextState, setState) {
  // handle newly constructed state by your reducer
}

const initialState = {
  foo: [],
  bar: { baz: 0, beep: "hello" },
}

const { subscribe, dispatch } = createStore(
  initialState,
  reducer,
  subscriptionsUpdated,
  stateUpdated
)

export { subscribe, dispatch }
```

Once a store is created, you'll be able to add subscriptions with `subscribe` and request state updates with `dispatch`.

### Add to a Store

#### subscribe

Add a subscription to the store.

Let's try adding a class subscriber with paths to some data in the state object. In this example, our class instance will expect values from state to be sent to the instance any time there is a state update.

```js
import { subscribe } from "./foo-store"

class FooBar {
  constructor() {
    subscribe(this, ["foo", "bar.baz", "bar.beep"])
  }
}
```

You can pass **any kind** of data as the second argument. Core Flux doesn't care what your data requirements are!

`subscribe` then triggers your first updater function, [`subscriptionsUpdated`](#subscriptionsupdated).

A subscription will be an array tuple containing both pieces of information given in the `subscribe` call. So, based on the above example, the subscription will be `[FooBarInstance, ["foo", "bar.baz", "bar.beep"]]`.

#### subscriptionsUpdated

Any time a new subscription is added to the store, your `subscriptionsUpdated` function runs.

An example of how you can use this is to pass default state values to a subscriber.

```js
/**
 * Handle new subscription being added
 * @param {[object, object]} subscription
 * @param {object} state
 */
function subscriptionsUpdated(subscription, state) {
  const [subscriber, data] = subscription

  data.forEach((path) => {
    const pathParts = path.split(".")
    const propName = pathParts[pathParts.length - 1]
    subscriber[propName] = get(nextState, path)
  })
}
```

Again, you define what `data` is and how it relates to your subscribers!

### Update state

#### dispatch

Request a state update by calling `dispatch` with an action (string) and payload (object/array/whatever).

We can expand the above example:

```js
import { subscribe, dispatch } from "./foo-store"
import actions from "./my-actions"

class FooBar {
  constructor() {
    subscribe(this, ["foo", "bar.baz", "bar.beep"])
  }

  addFooItem(fooValue) {
    dispatch(actions.ADD_FOO_ITEM, { id: "123", value: fooValue })
  }
}
```

The dispatch then hands off to your [reducer](#reducer).

#### reducer

A reducer for Core Flux should be like what you'd expect in other Flux tooling.

Simply put: it's a pure function that receives state, manipulates it in some way, and returns new state.

```js
import actions from "./my-actions"

/**
 * Returns the next version of state.
 * @param {string} type
 * @param {object} state
 * @param {*} payload
 */
const reducer = (type, state, payload) => {
  switch (type) {
    case actions.ADD_ONE: {
      state.bar.baz += 1
      return state
    }

    case actions.ADD_FOO_ITEM: {
      state.foo.concat(payload.foo)
      return state
    }

    default: {
      return state
    }
  }
}
```

Additionally, the state object received in your reducer will be a copy, so mutate it to your heart's content.

Once your reducer finishes, the second updater function gets triggered: [`stateUpdated`](#stateupdated)

#### stateUpdated

When a `dispatch` occurs and your reducer has returned a new state value, the `stateUpdated` function then runs.

Examples of how you can use this function include:

- setting updated state values back to the store using `setState`
- updating all your subscribers with any new state values they might be expecting

To once again extend our previous examples:

```js
import get from "lodash/get"

/**
 * Handle the result of a new state change.
 * @param {Array.<[object, object]>} subscription
 * @param {object} nextState
 * @param {Function} setState
 */
function stateUpdated(subscribers, nextState, setState) {
  // Update the store
  setState(nextState)

  // Update subscribers
  subscribers.forEach(([subscriber, data]) => {
    data.forEach((path) => {
      const pathParts = path.split(".")
      const propName = pathParts[pathParts.length - 1]
      subscriber[propName] = get(nextState, path)
    })
  })
}
```
