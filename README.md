<h1 align="center">Core Flux</h1>
<p align="center">½kb functional flux utility. Control the flow of state data between subscribers.</p>
<br>
<p align="center">
  <a href="https://www.npmjs.com/package/core-flux"><img src="https://img.shields.io/npm/v/core-flux.svg?sanitize=true&style=flat-square" alt="Version"></a>
  <a href="https://github.com/geotrev/core-flux/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/core-flux.svg?sanitize=true&style=flat-square" alt="License"></a>
  <a href="https://github.com/geotrev/core-flux/actions/workflows/test.yml?query=branch%3Amain"><img src="https://badgen.net/github/checks/geotrev/core-flux/main?style=flat-square" alt="CI status" /></a>
  <a href="https://bundlephobia.com/package/core-flux"><img src="https://badgen.net/bundlephobia/minzip/core-flux?style=flat-square" alt="bundle size" /></a>
  <a href="https://www.libraries.io/npm/core-flux"><img src="https://img.shields.io/librariesio/release/npm/core-flux" alt="dependency status" /></a>
</p>

[See a demo of Core Flux in action!](https://todo-rotom.netlify.app/)

- [Install](#install)
- [API](#api)
  - [`createStore()`](#createstore)
  - [`subscribe()`](#subscribe)
  - [`dispatch()`](#dispatch)
- [Exposing the store](#exposing-the-store)
- [Data model](#data-model)
- [Data flow](#data-flow)

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
  src="https://cdn.jsdelivr.net/npm/core-flux@1.1.4/dist/core-flux.js"
  integrity="sha256-eJp4q+zYq5mxYX0a6rU6DAkxV2ruKef/4LjUUdKGPEk="
  crossorigin="anonymous"
></script>

<!-- Minified/uglified bundle for production -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/core-flux@1.1.4/dist/core-flux.min.js"
  integrity="sha256-aCiq42S/DpsDCnj4rolrKZ3beAh6TDJCnOjc9JIOFa0="
  crossorigin="anonymous"
></script>
```

## API

<h3 id="createstore"><code>createStore(initialSate, reducer, bindSubscriber, bindState)</code></h3>

The one and only export of Core Flux. Use it to create a store instance. You can create as few or as many stores as your heart desires! They will all be independent from one another.

_**NOTE**: The base state type must be a plain object. Invalid types will throw an error._

The function **requires** all four of its arguments, including [bindings](#bindings):

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

Once a store is created, you'll be able to add subscriptions with `subscribe` and request state updates with `dispatch`.

<h3 id="subscribe"><code>subscribe(subscriber, data)</code></h3>

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

In the above example, we've designed the subscriber, the `FooItems` class, to declare an array of strings correlating to properties in the store's state. If you're from the Redux world, this is akin to "connecting" a consumer to a provider via higher-order function/component.

After the subscribe call is made, your `bindSubscriber` function will be called where you can pass along the default values as you see fit.

_**NOTE:** In general, you should try to use a simple data structure as the second argument to `subscribe`; this ensures your bindings have generic and consistent expectations._

<h3 id="dispatch"><code>dispatch(type, payload)</code></h3>

Requests a state change in your store.

We can extend the previous example with a setter to call `dispatch`:

```js
import { subscribe, dispatch } from "./foo-store"

class FooItems {
  constructor() {
    subscribe(this, ["foo"])
  }

  get items() {
    return this.foo
  }

  addItem(item) {
    dispatch("ADD_ITEM", { item })
  }
}

const fooBar = new FooItems()
fooBar.addItem("bop")
```

Now when the `addItem` method is called, Core Flux will pass along the action type and payload to your reducer.

The reducer could have a logic branch on the action type called `ADD_ITEM` which adds the given item to state, then returns the resulting new state (containing the full items list).

Finally, the result would then be handed over to your `bindState` binding.

_**NOTE:** Much like in `subscribe`, it's best to maintain data types in the payload so your reducer can have consistent expectations._

#### Bindings

Here's a breakdown of each binding needed when initializing a new store:

##### **`bindSubscriber(subscription, state)`**

> `subscription ([subscriber, data])`: A tuple containing the subscribed object and its state-relational data.<br/>`state (object)`: The current state object.

Called after a new `subscribe` is made and a subscription has been added to the store. Use it to _set initial state_ on the new subscriber. Use the `data` provided to infer a new operation, e.g., setting a stateful property to the subscriber.

##### **`reducer(state, action)`**

> `state (object)`: Snapshot of the current state object.<br/>`action ({ type: string, payload: object })`: The dispatched action type and its payload.

Called during a new `dispatch`. Create a new version of state and return it.

##### **`bindState(subscriptions, reducedState, setState)`**

> `subscriptions (subscription[])`: An array containing all subscriptions.<br/>`reducedState (object)`: The state object as returned by the reducer.<br/>`setState (function)`:

Called at the end of a `dispatch` call, after your reducer callback has processed the next state value. Set your new state back to subscribers **and** back to the store. It's possible and expected for you to call `bindSubscriber` again to DRYly apply these updates. You can return from this function safely to noop.

## Exposing the store

For utility or debugging reasons, you may want to look at the store you're working with. To do so, you can use the `__data` property when creating a store:

```js
const fooStore = createStore(initialState, reducer, bindSubscriber, bindState)

window.fooStoreData = fooStore.__data

console.log(window.fooStoreData) // { state: {...}, subscriptions: [...] }
```

_**NOTE:** Avoid including `__data` in production environments; the data is mutable and therefore exposes a security risk if accessible._

## Data model

Core Flux has a relatively simple data model that you should understand when creating [bindings](#bindings).

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

Each item in `subscriptions` contains a `subscriber` and some form of `data` that informs a relationship between `state` and `subscriber`.

_**NOTE:** \_You_ define `data` in the above model. This ensures that ultimately you control communicating state relationships to subscribers.\_

## Data flow

Here is the general lifecycle of subscribing to the store & dispatching a state update.

- `subscribe` > `bindSubscriber`
- `dispatch` > `reducer` > `bindState`
