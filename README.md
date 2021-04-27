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
  src="https://cdn.jsdelivr.net/npm/core-flux@1.0.6/dist/core-flux.js"
  integrity="sha256-1STxSN8Dx49R8gsqOXmLLo7UqayB3O3CFAHjomDnOX8="
  crossorigin="anonymous"
></script>

<!-- Minified/uglified bundle for production -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/core-flux@1.0.6/dist/core-flux.min.js"
  integrity="sha256-kGBp8KGG/a+6gIJpAvmc1aZWegvhSKNQtIOiOYmXUcI="
  crossorigin="anonymous"
></script>
```

## API

### A word about data

As already stated at the top of this README, Core Flux doesn't really do a whole lot with your data. There is however a simple data model that you can expect from Core Flux's subscription implementation.

Subscriptions will always be an array of tuples, like so:

```js
[
  [subscriber, data],
  [subscriber, data],
  ...
]
```

When you are interacting with subscriptions as part of `subscriptionsUpdated` or `stateUpdated`, keep this in mind when defining your own state.

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

function subscriptionsUpdated(newSubscription, state) {
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

### Add subscription

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

#### subscriptionsUpdated

Any time a new subscription is added to the store, your `subscriptionsUpdated` function runs.

An example of how you can use this is to pass default state values to a subscriber.

```js
import get from "lodash/get"

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
    subscriber[propName] = get(state, path)
  })
}
```

In the above, `data` is an array of strings describing paths to state properties. E.g., `["foo.bar", "bar[0].baz"]`

But again, you define what `data` is and how it relates to your subscribers and/or state.

### Update state

#### dispatch

Request a state update by calling `dispatch` with an action (string) and payload of data.

We can expand the previous example:

```js
import { subscribe, dispatch } from "./foo-store"
import actions from "./foo-actions"

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

A reducer in Core Flux is simply a pure function that receives state, manipulates it in some way, and returns new state.

```js
import actions from "./foo-actions"

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

Additionally, the `state` argument received in your reducer will be a copy, so mutate it to your heart's content.

Once your reducer finishes, the second updater function gets triggered: [`stateUpdated`](#stateupdated)

#### stateUpdated

When a `dispatch` occurs and your reducer has returned a new state value, the `stateUpdated` function then runs.

As part of this step, **you as the consumer are responsible for setting state back to the Store.** This might seem counterintuitive, but as discussed at the beginning of this README, it gives you the flexibility to define when/how/why state makes it into and out of the store.

Examples of how you can use this function include, but aren't limited to:

- not updating the store based on the result of your reducer
- setting updated state values back to the store using `setState`
- updating all your subscribers with any new state values they might be expecting
- using the incoming state value as part of an extra middleware step

Below, let's do the typical flux behavior of updating subscribers with their requested state values and updating the store.

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

As mentioned, this is how one might expect to use a flux utility. But there's no reason why you can't create your own bindings for custom use-cases. :)
