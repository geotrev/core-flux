<h1 align="center">Core Flux</h1>
<p align="center">0.5kb unopinionated flux utility. Control the flow of state data between subscribers.</p>
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
  src="https://cdn.jsdelivr.net/npm/core-flux@1.0.7/dist/core-flux.js"
  integrity="sha256-dLB29xsPTHfeIag/xAGHE003gzIJXKMHAdAr7vghHVI="
  crossorigin="anonymous"
></script>

<!-- Minified/uglified bundle for production -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/core-flux@1.0.7/dist/core-flux.min.js"
  integrity="sha256-yxelU39ZPLOF4qZwwdhHCOhoazFQPv5Z70FcHI89x2g="
  crossorigin="anonymous"
></script>
```

## API

### Data model

Core Flux has a relatively simple data model that you should understand when writing state bindings.

Here is how state looks in all cases:

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

Each item in `subscriptions` contains a `subscriber` and some form of `data` that informs a relationship between `state` and `subscriber`. See [`createStore`](#createstore) on how to add subscriptions.

`state` is the object you define as your store's initial state value.

### createStore

The one and only export of Core Flux. Use it to create a store instance. You can create as few or as many stores as your heart desires! They will all be independent from one another.

The function **requires** all four of its arguments, as shown here:

```js
// foo-store.js

import { createStore } from "core-flux"
import { reducer, bindSubscriber, bindState } from "./foo-bindings"

const initialState = {
  foo: [],
  bar: { baz: 0, beep: "hello" },
}

const { subscribe, dispatch } = createStore(
  initialState,
  reducer,
  bindSubscriber,
  bindState
)

export { subscribe, dispatch }
```

here's a breakdown of each binding needed when initializing a new store:

```js
/**
  * Receives a `payload` and returns a new version
  * of `state` based on the given `type`. Similar to
  * the likes of redux and other tools.
  *
  * @param {string} type
  * @param {object} state
  * @param {object={}} payload
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
  * @param {[object, *]} subscription - a tuple containing the new subscriber and its data
  * @param {object} state - immutable copy of state
  */
function bindSubscriber(subscription, state) {
  // ...
}

/**
  * Bind the new state value to your subscribers.
  * 
  * Receives the next version of state. Unlike `bindSubscriber`, 
  * this function does not automatically update the store
  * beforehand, and requires you to manually do so
  * via the `setState` helper.
  *
  * @param {Array.<[object, *]>} subscriptions - array of subscriptions to your store
  * @param {object} nextState - the version of state given by your reducer.
  * @param {Function} setState - function that takes your state object and assigns it back to the store.
  */
function bindState(subscriptions, nextState, setState) {
  // ...
}
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

In the above example, we've designed our subscriber, the `FooItems` class, to declare an array of strings correlating to properties in the store's state. If you're from the Redux world, this is akin to "connecting" a consumer to a provider.

Additionally, when this `subscribe` call is made, the `bindSubscriber` function will be called where the result of a subscription can be defined. E.g., assigning a default value from state into the subscriber.

> In general, you should try to use a simple data structure as the second argument to `subscribe`; this ensures your bindings have generic and consistent expectations.

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

  set addItem(item) {
    dispatch("ADD_FOO_ITEM", { item })
  }
}

const fooBar = new FooItems()
fooBar.addToFoo("bop")
```

Now when the `addItem` method is clicked, `dispatch` will tell your store to begin the state update process. Your reducer receives the action type and payload.

The next step being that your reducer could have a logic branch on the action type called `ADD_FOO_ITEM` which adds the given item to state, then returns the resulting new state. 

Finally, the result would then be handed over to `bindState`.

> Any data type can be used as the payload, however, much like in `subscribe`, it's best to keep your data consistent so your reducer can have reliable expectations.
