import { createStore } from "../core-flux"

const mockBindState = jest.fn()
const mockBindSubscriber = jest.fn()
const mockReducer = jest.fn()

const testSubscriberData = "variable test data"
const testSubscriber = {}
const TEST_TYPE = "test"
const FAIL_TYPE = "fail"

function testReducer(state, action) {
  switch (action.type) {
    case TEST_TYPE: {
      state.foo = action.payload.foo
      return state
    }
    case FAIL_TYPE: {
      return action.payload
    }
  }
}

function testBindState(_, reducedState, setState) {
  setState(reducedState)
}

function getMockStore() {
  return createStore({}, mockReducer, mockBindSubscriber, mockBindState)
}

describe("createStore", () => {
  describe("initialize", () => {
    it("returns dispatch and subscribe helper functions", () => {
      // Given
      const Store = getMockStore()

      // Then
      expect(Store).toEqual(expect.any(Object))
      expect(Store.dispatch).toEqual(expect.any(Function))
      expect(Store.subscribe).toEqual(expect.any(Function))
    })

    it("returns live data pointer", () => {
      // Given
      const Store = getMockStore()

      // Then
      expect(Store.__data).toEqual(
        expect.objectContaining({ state: {}, subscriptions: [] })
      )
    })

    it("throws error if invalid initialState", () => {
      // Given
      const badStates = [false, null, undefined, [], 123, "foo"]

      badStates.forEach((badState) => {
        // When
        const createBadStore = () => createStore(badState, mockReducer)

        // Then
        expect(createBadStore).toThrow(
          "[core-flux] createStore(): The initial state value must be a plain object."
        )
      })
    })
  })

  describe("state bindings", () => {
    const testPayload = { foo: "bar" }

    it("calls reducer on dispatch", () => {
      //  Given
      const Store = getMockStore()

      // When
      Store.dispatch(TEST_TYPE, testPayload)

      // Then
      expect(mockReducer).toHaveBeenCalledWith(
        Store.__data.state,
        expect.objectContaining({ payload: testPayload, type: TEST_TYPE })
      )
    })

    it("calls state binding on dispatch", () => {
      //  Given
      const Store = createStore(
        {},
        testReducer,
        mockBindSubscriber,
        mockBindState
      )

      // When
      Store.subscribe(testSubscriber, testSubscriberData)
      Store.dispatch(TEST_TYPE, testPayload)

      // Then
      expect(mockBindState).toHaveBeenCalledWith(
        Store.__data.subscriptions,
        expect.objectContaining({ foo: "bar" }),
        expect.any(Function)
      )
    })

    it("sets reduced state back to store.state using setState helper", () => {
      // Given
      const Store = createStore(
        {},
        testReducer,
        mockBindSubscriber,
        testBindState
      )

      // When
      Store.dispatch(TEST_TYPE, testPayload)

      // Then
      expect(Store.__data.state).toEqual(
        expect.objectContaining({ foo: "bar" })
      )
    })

    it("throws error if next state value is not a plain object", () => {
      // Given
      const Store = createStore(
        {},
        testReducer,
        mockBindSubscriber,
        testBindState
      )
      const badStates = [false, null, undefined, [], 123, "foo"]

      badStates.forEach((badState) => {
        // When
        const dispatchBadState = () => Store.dispatch(FAIL_TYPE, badState)

        // Then
        expect(dispatchBadState).toThrow(
          "[core-flux] bindState callback: The reduced state value must be a plain object. If there is no change in state, simply return it."
        )
      })
    })
  })

  describe("subscriber bindings", () => {
    it("calls subscriber binding when subscribe is called", () => {
      // Given
      const Store = getMockStore()

      // When
      Store.subscribe(testSubscriber, testSubscriberData)

      // Then
      expect(mockBindSubscriber).toHaveBeenCalledWith(
        Store.__data.subscriptions[0],
        Store.__data.state
      )
    })

    it("adds subscription to store.subscriptions", () => {
      // Given
      const Store = getMockStore()

      // When
      Store.subscribe(testSubscriber, testSubscriberData)

      // Then
      expect(Store.__data.subscriptions).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([testSubscriber, testSubscriberData]),
        ])
      )
    })

    it("throws error if invalid subscriber", () => {
      // Given
      const Store = getMockStore()
      const subscribe = () => Store.subscribe(null, testSubscriberData)

      // Then
      expect(subscribe).toThrow(
        "[core-flux] subscribe(): `subscriber` and `data` arguments are required."
      )
    })

    it("throws error if invalid subscriber data", () => {
      // Given
      const Store = getMockStore()
      const subscribe = () => Store.subscribe(testSubscriber, null)

      // Then
      expect(subscribe).toThrow(
        "[core-flux] subscribe(): `subscriber` and `data` arguments are required."
      )
    })
  })
})
