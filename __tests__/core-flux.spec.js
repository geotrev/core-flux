import { createStore } from "../core-flux"

const mockBindState = jest.fn()
const mockBindSubscriber = jest.fn()
const mockReducer = jest.fn()

const testSubscriberData = "variable test data"
const testSubscriber = {}

function testReducer(state, action) {
  if (action.type === "TEST_TYPE") {
    state.foo = action.payload.foo
    return state
  }
}

function testBindState(_, reducedState, setState) {
  setState(reducedState)
}

function getMockStore() {
  return createStore({}, mockReducer, mockBindSubscriber, mockBindState)
}

describe("createStore", () => {
  describe("artifacts", () => {
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
  })

  describe("state bindings", () => {
    const TEST_TYPE = "TEST_TYPE"
    const testPayload = { foo: "bar" }

    it("calls reducer on dispatch", () => {
      //  Given
      const Store = getMockStore()

      // When
      Store.dispatch(TEST_TYPE, testPayload)

      // Then
      expect(mockReducer).toBeCalledWith(
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
      expect(mockBindState).toBeCalledWith(
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
  })

  describe("subscriber bindings", () => {
    it("calls subscriber binding when subscribe is called", () => {
      // Given
      const Store = getMockStore()

      // When
      Store.subscribe(testSubscriber, testSubscriberData)

      // Then
      expect(mockBindSubscriber).toBeCalledWith(
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
  })
})
