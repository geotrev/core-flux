<h1 align="center">Core Flux</h1>
<br>
<p align="center">
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://img.shields.io/npm/v/core-flux.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://img.shields.io/npm/l/core-flux.svg?sanitize=true" alt="License"></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/circleci/github/geotrev/core-flux/master" alt="Circle CI status (master)" /></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/bundlephobia/minzip/core-flux" alt="bundle size" /></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/david/dep/geotrev/core-flux" alt="dependencies" /></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/david/dev/geotrev/core-flux" alt="devDependencies" /></a>
</p>

A 1KB flux-like state manager. Use its out of the box behavior or create your own bindings with ease.

- [Install](#install)
- [API](#api)
- [Create a reducer](#create-a-reducer)
- [Create a store](#create-a-store)
- [Subscribe to a store](#subscribe-to-a-store)
- [Dispatch an action](#dispatch-an-action)
- [Add a custom updater](#add-a-custom-updater)

By default, Core Flux should be used with constructor functions or ES6 classes, but you can use it in any context if you write your own [custom updater](#use-a-custom-updater). All updates are (and should be) synchronous for speed.

## Install

Grab it any which way you prefer.

### NPM / Yarn

```sh
$ npm i core-flux
```

```sh
$ yarn i core-flux
```

### CDN

```html
<!-- The unminified bundle for development -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/core-flux@0.0.1/dist/core-flux.js"
  integrity="sha256-h/UcvK+BwuWbktSHGBv0kb4uyS6lbFqYBpcMTAbvBng="
  crossorigin="anonymous"
></script>

<!-- Minified/uglified bundle for production -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/core-flux@0.0.1/dist/core-flux.min.js"
  integrity="sha256-Va36r3ZcVt94ybDJ0nCOLl6va381IWzk6jI4JoH3hzg="
  crossorigin="anonymous"
></script>
```

## API

If you've used flux architecture before, then you'll be right at home. If not, it's easy to learn.

### Create a reducer

To get started, you'll need to write a reducer containing your own custom state logic.

A reducer is just a pure function that receives state and returns the _next_ state. When state is given to a reducer, it's a copy and therefore manipulating it won't break your whole store.

Additionally, you'll receive a payload which should contain any new data your actions expect.

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
    case actionTypes.MORE_FOO: {
      state.foo.concat(payload.foo)
      return state
    }

    default: {
      return state
    }
  }
}
```

### Create a store

Import and call `createStore` to initialize a new store instance (you can have multiple if you want). All that's required is the default **initial state object** and a **[reducer function](#create-a-reducer)**.

```js
import { createStore } from "core-flux"
import { reducer } from "./my-reducer"

const initialState = {
  foo: [],
  bar: {
    baz: 0,
    beep: "hello",
  },
}

const { subscribe, dispatch } = createStore(initialState, reducer)

export { subscribe, dispatch }
```

The result of `createStore` will be helpers used to interact with the store.

- `dispatch`: Update your store's state with an accompanying action/payload.
- `subscribe`: Subscribe a class or constructor function to your store.

### Subscribe to a store

Last but not least, to subscribe to a store, provide the class or function instance (`this` for either a class or constructor function) and an **array of paths** to properties in the store.

```js
import { subscribe } from "./my-store"

// Class
class FooBar {
  constructor() {
    subscribe(this, ["foo", "some.bar.beep"])
  }

  get myBeep() {
    return this.beep
  }
}

// Constructor function
const FooBar() {
  subscribe(this, ["foo", "some.bar.beep"])
}
```

**Whenever these state properties change, the values are automatically forwarded to your class as matching properties.** To use the above example, `foo` and `beep` would be the properties updated on your class.

### Dispatch an action

Provide an **action type** and the **payload object** which reflects a piece of state to be handled in your reducer.

```js
import { dispatch } from "./my-store"
import actionTypes from "./my-action-types"

dispatch(actionTypes.ADD_MORE_FOO, {
  foo: [{ id: "baz", value: "beep" }],
})

dispatch(actionTypes.ADD_ONE)
```

### Add a custom updater

**NOTE: This is an advanced configuration option; proceed with caution!**

By default, Core Flux run its own set of instructions after your reducer has returned the next state object, resulting in subscribers automatically getting updated. But what if you don't want to do that? What if you want to hand off the new state to some middleware or alternate state updating mechanism?

Well, you can!

You can pass in a custom updater function as the third argument to `createStore`:

```js
const myUpdater = (subscribers, state, setState) => {
  // do your own thing
}

const { subscribe, dispatch } = createStore(initialState, reducer, myUpdater)
```

Your updater receives three arguments:

- `subscribers`: An array of tuples containing 1) a given subscriber and 2) the list of property subscriptions for that subscriber. **This is a live store reference.** Mutating it may break your subscriber's expectations.
- `state`: An immutable copy of the current store state.
- `setState`: A function to, well, set your new state object.
