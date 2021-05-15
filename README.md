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
  - [`createStore()`](#createstore)
  - [`subscribe()`](#subscribe)
  - [`dispatch()`](#dispatch)
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

### `createStore(initialSate, reducer, bindSubscriber, bindState)`

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

Once a store is created, you'll be able to add subscriptions with `subscribe` and request state updates with `dispatch`.

Here's a breakdown of each binding needed when initializing a new store:

#### `reducer(type, state, payload = {})`

> `type (string)`: The action dispatched.<br/>`state (object)`: A copy of the current state object.<br/>`payload (object={})`: The payload given during dispatch.

Creates a new version of state and returns it, based on the `type` and `payload`. If the return value is falsy, nothing happens.

#### `bindSubscriber(subscription, state)`

> `subscription (array)`: A tuple containing the subscribed object and its relational data.<br/>`state (object)`: A copy of the current state object.

Called after a new `subscribe` call is made and a subscription has been added to the store. Use it to set initial state on the new subscriber.

#### `bindState(subscriptions, nextState, setState)`

> `subscriptions (subscription[])`: An array containing all subscriptions.<br/>`nextState (object)`: The state object as returned by the reducer.<br/>`setState (function)`:

Called after the reducer has processed the next state value. Use it to set the new state back to subscribers **and** back to the store.

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

  addItem(item) {
    dispatch("ADD_ITEM", { item })
  }
}

const fooBar = new FooItems()
fooBar.addItem("bop")
```

Now when the `addItem` method is called, `dispatch` will tell your store to begin the state update process. Your reducer receives the action type and payload.

The next step being that your reducer could have a logic branch on the action type called `ADD_ITEM` which adds the given item to state, then returns the resulting new state (containing the full items list).

Finally, the result would then be handed over to `bindState`.

> Any data type can be used as the payload, however, much like in `subscribe`, it's best to keep your data consistent so your reducer can have reliable expectations.

## Data model

Core Flux has a relatively simple data model that you should understand when creating your bindings.

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

NOTE: You define `data` in the above model, be it an object, array, string; it can be anything you want. Ultimately, you're responsible for communicating state relationships to subscribers.

## Data flow

Here is the general lifecycle of subscribing to the store & dispatching a state update.

- `subscribe` > `bindSubscriber`
- `dispatch` > `reducer` > `bindState`
