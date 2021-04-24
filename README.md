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
  - [`createStore`](#createstore)
  - [`subscribe`](#subscribe)
  - [`dispatch`](#dispatch)
- [Data flow](#data-flow)
  - [Write a state reducer](#write-a-state-reducer)
  - [Write an updater](#write-an-updater)

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
  src="https://cdn.jsdelivr.net/npm/core-flux@1.0.3/dist/core-flux.js"
  integrity="sha256-okaIC9g9KLupHUhpbtMq/5+SwmIUDnHCu/qhGtyz10o="
  crossorigin="anonymous"
></script>

<!-- Minified/uglified bundle for production -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/core-flux@1.0.3/dist/core-flux.min.js"
  integrity="sha256-PaK68Tvaos+vf3AXFxejfHeBNwAHkzlCLYdLVjQdrgQ="
  crossorigin="anonymous"
></script>
```

## API

### createStore(state, reducer, updater)

Import and call `createStore` to initialize a new store instance (you can have multiple if you want). You need to pass in your initial state, a [reducer](#write-a-state-reducer), and an [updater](#write-an-updater).

```js
// foo-store.js

import { createStore } from "core-flux"
import { reducer } from "./my-reducer"
import { updater } from "./my-updater"

const initialState = {
  foo: [],
  bar: { baz: 0, beep: "hello" },
}

const { subscribe, dispatch } = createStore(initialState, reducer, updater)

export { subscribe, dispatch }
```

Once a store is created, you'll be able to add subscriptions with `subscribe` and update state with `dispatch`.

**Subscription data**

### subscribe(subscriber, data)

This function adds a subscription and to the store.

Here's an example of subscribing a class to your store:

```js
import { subscribe } from "./foo-store"

class FooBar {
  constructor() {
    subscribe(this, ["foo", "bar.baz", "bar.beep"])
  }
}
```

A subscription will be an array tuple containing both pieces of information given in the `subscribe` call. So, based on the above example, the subscription will be `[FooBarInstance, ["foo", "bar.baz", "bar.beep"]]`.

You can then use this subscription information in your [updater function](#write-an-updater).

### dispatch(action, payload)

Call with an action (string) and payload (object/array/whatever).

We can expand the above example by adding a method which dispatches to your store's reducer.

```js
import { subscribe } from "./foo-store"

class FooBar {
  constructor() {
    subscribe(this, ["foo", "bar.baz", "bar.beep"])
  }

  addFooItem(fooValue) {
    dispatch("ADD_FOO_ITEM", { id: "123", value: fooValue })
  }
}
```

## Data flow

### Write a state reducer

The reducer for Core Flux should be like what you'd expect in other Flux tooling. It receives an action, the current store state, and a payload to be added/mixed with the current state.

```js
import actionTypes from "./my-action-types"

export const reducer = (type, state, payload) => {
  switch (type) {
    // 'ADD_ONE'
    case actionTypes.ADD_ONE: {
      state.bar.baz += 1
      return state
    }

    // 'MORE_FOO'
    case actionTypes.ADD_FOO_ITEM: {
      state.foo.concat(payload.foo)
      return state
    }

    default: {
      return state
    }
  }
}
```

### Write an updater

The updater is the callback triggered after the reducer. Use it to pass along requested state to each subscriber, conditionally update the store based on the resolved state, pass the state through some additional middleware... really anything at all!

To show an example, let's continue on from the previous examples in this README. Let's update the store with the new state, then update each subscriber with the properties they've subscribed to from state (previously denoted as obj paths).

```js
// my-updater.js
import get from "lodash/get"

function updater(subscribers, nextState, setState) {
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
