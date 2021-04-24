<h1 align="center">Core Flux</h1>
<p align="center">1KB unopinionated flux utility. Use it to create stores, manage the data, and direct updates to subscribers.</p>
<br>
<p align="center">
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://img.shields.io/npm/v/core-flux.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://img.shields.io/npm/l/core-flux.svg?sanitize=true" alt="License"></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/circleci/github/geotrev/core-flux/main" alt="Circle CI status (main)" /></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/bundlephobia/minzip/core-flux" alt="bundle size" /></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/david/dev/geotrev/core-flux" alt="devDependencies" /></a>
</p>

Core Flux enables data to be used in a flux pattern. The best way to understand Core Flux is to understand what it does _not_ do.

Core Flux does not...

- care about the structure of your data
- care where your data goes
- update the store or change your data unless you do it yourself

In other words, Core Flux lets you bake the cake and own the bakery. :)

---

- [Install](#install)
- [API](#api)
  - [`createStore()`](#createstore)
  - [`subscribe()`](#subscribe)
  - [`dispatch()`](#dispatch)
- [Handling store updates](#data-flow)
  - [`reducer()`](#reducer)
  - [`subscriptionAdded()`](#subscriptionadded)
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

Import and call `createStore` to initialize a new store instance (you can have multiple if you want). You need to pass in your initial state, a [reducer](#write-a-state-reducer), and two store updater callbacks.

```js
// foo-store.js

import { createStore } from "core-flux"
import { reducer } from "./my-reducer"
import { subscriptionAdded, stateUpdated } from "./updaters"

const initialState = {
  foo: [],
  bar: { baz: 0, beep: "hello" },
}

const { subscribe, dispatch } = createStore(
  initialState,
  reducer,
  subscriptionAdded,
  stateUpdated
)

export { subscribe, dispatch }
```

Once a store is created, you'll be able to add subscriptions with `subscribe` and update its state with `dispatch`.

### subscribe

This function adds a subscription to the store.

Here's an example of adding a class subscriber with paths to the data in the state object.

```js
import { subscribe } from "./foo-store"

class FooBar {
  constructor() {
    subscribe(this, ["foo", "bar.baz", "bar.beep"])
  }
}
```

`subscribe` then triggers your first updater function, [`subscriptionAdded`](#subscriptionadded).

A subscription will be an array tuple containing both pieces of information given in the `subscribe` call. So, based on the above example, the subscription will be `[FooBarInstance, ["foo", "bar.baz", "bar.beep"]]`.

### dispatch

Trigger a state update by calling `dispatch` with an action (string) and payload (object/array/whatever).

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

## Data flow

### reducer

A reducer for Core Flux should be like what you'd expect in other Flux tooling.

Simply put: it's a pure function that receives state, manipulates it in some way, and returns new state.

```js
import actions from "./my-actions"

const reducer = (type, state, payload) => {
  switch (type) {
    // 'ADD_ONE'
    case actions.ADD_ONE: {
      state.bar.baz += 1
      return state
    }

    // 'ADD_FOO_ITEM'
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

### subscriptionAdded

Any time a new subscription is added to the store, your `subscriptionAdded` function runs.

An example of how you can use this is to pass default state values to a subscriber.

```js
function subscriptionAdded(subscription, state) {
  const [subscriber, data] = subscription

  data.forEach((path) => {
    const pathParts = path.split(".")
    const propName = pathParts[pathParts.length - 1]
    subscriber[propName] = get(nextState, path)
  })
}
```

Again, you define what `data` is and how it relates to your subscribers!

### stateUpdated

When a `dispatch` occurs and your reducer has returned a new state value, the `stateUpdated` function then runs.

Examples of how you can use this function include:

- setting updated state values back to the store using `setState`
- updating all your subscribers with any new state values they might be expecting

To once again extend our previous examples:

```js
import get from "lodash/get"

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
