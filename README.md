<h1 align="center">Core Flux</h1>
<p align="center">0.5kb unopinionated flux utility. Use it to create stores, manage state data, and direct updates to subscribers.</p>
<br>
<p align="center">
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://img.shields.io/npm/v/core-flux.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://img.shields.io/npm/l/core-flux.svg?sanitize=true" alt="License"></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/circleci/github/geotrev/core-flux/main" alt="Circle CI status (main)" /></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/bundlephobia/minzip/core-flux" alt="bundle size" /></a>
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://badgen.net/david/dev/geotrev/core-flux" alt="devDependencies" /></a>
</p>

[See a demo of Core Flux in action!](https://upgraded-todo.netlify.com)

- [Install](#install)
- [API](#api)
  - [Data model](#data-model)
  - [`createStore()`](#createstore)
  - [`subscribe()`](#subscribe)
  - [`dispatch()`](#dispatch)

## Install

### NPM / Yarn

```sh
$ npm i core-flux
```

```sh
$ yarn i core-flux
```

### CDN

The CDN puts the library on `window.CoreFlux`.

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

### Data model

Core Flux has a relatively simple data model that will come into play when writing bindings.

Here is how a store would look in memory:

```js
Store {
  state: { ... },

  subscriptions: [
    [subscriber, data],
    [subscriber, data],
    [subscriber, data],
    // ...
  ]
}
```

Each subscription contains a `subscriber` and some form of `data` that informs a relationship between `state` and `subscriber`. See [`createStore`](#createstore) on how to add subscriptions.

Keep this data model in mind when adding new subscriptions and creating a binding

### createStore

The one and only export of Core Flux. Use it to create a store instance. You can create as few or as many stores as your heart desires! They will all be independent from one another.

The function **requires** all four of its arguments, as shown here:

```js
// foo-store.js

import { createStore } from "core-flux"

const initialState = {
  foo: [],
  bar: { baz: 0, beep: "hello" },
}

/**
 * Receives a `payload` and returns a new version
 * of `state` based on the given `type`.
 *
 * @param {string} type
 * @param {object} state
 * @param {*} payload
 * @returns {object} state
 */
function reducer(type, state, payload) {
  // ...
}

/**
 * Receives a new subscription as provided by the `subscribe`
 * function, along with the current state. The subscription
 * will have been automatically added to the store when this
 * function is called.
 *
 * @param {[object, *]} newSubscription - a tuple containing the new subscriber and its data
 * @param {object} state - immutable copy of state
 */
function bindSubscriber(newSubscription, state) {
  // ...
}

/**
 * Receives the next version of state for binding to the
 * store and/or subscribers. Unlike `bindSubscriber`, this
 * function does not automatically update the store's state
 * object beforehand, and requires you to manually do so
 * via the `setState` helper.
 *
 * @param {Array.<[object, *]>} subscriptions - array of subscriptions to your store
 * @param {object} nextState - the next version of state as defined in your reducer.
 * @param {Function} setState - function that takes your state object and assigns it back to the store.
 */
function bindState(subscriptions, nextState, setState) {
  // ...
}

const { subscribe, dispatch } = createStore(
  initialState,
  reducer,
  bindSubscriber,
  bindState
)

export { subscribe, dispatch }
```

Once a store is created, you'll be able to add subscriptions with `subscribe` and request state updates with `dispatch`.

### subscribe

Adds a subscription to your store. It will always be tied to a single store, and subsequently state object.

```js
import { subscribe } from "./foo-store"

class FooItems {
  constructor() {
    subscribe(this, ["foo"])
  }

  get items() {
    return this.foo
  }
}
```

In the above example, we've designed our subscriber, the `FooItems` class, to declare an array of strings correlating to properties in the store's state.

Additionally, when this `subscribe` call is made, the `bindSubscriber` function will be called where this logic can be customized. E.g., assigning a default state value from state into the subscriber.

> In general, you should try to use a simple data structure as the second argument to `subscribe`; this ensures your state binding has consistent expectations.

### dispatch

Let's say you have some subscriptions in your store. How do you kick off a state update for subscribers? That's where `dispatch` comes into play.

Let's extend the previous example:

```js
import { subscribe } from "./foo-store"

class FooItems {
  constructor() {
    subscribe(this, ["foo"])
  }

  get items() {
    return this.foo
  }

  set addToFoo(item) {
    dispatch("ADD_FOO_ITEM", { item })
  }
}

const fooBar = new FooItems()
fooBar.addToFoo("bop")
```

Now when the button is clicked, `dispatch` will tell your store to begin the state update process.

The next step being that your reducer might have logic branch on the action type called `ADD_FOO_ITEM` which adds the given item to the store.
