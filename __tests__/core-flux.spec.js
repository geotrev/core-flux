import { createStore } from "../core-flux"

const mockBindState = jest.fn()
const mockBindSubscriber = jest.fn()
const mockReducer = jest.fn()

const dataObj = "variable test data"
const subscriberObj = {}

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
      const store = getMockStore()

      // Then
      expect(store).toEqual(expect.any(Object))
      expect(store.dispatch).toEqual(expect.any(Function))
      expect(store.subscribe).toEqual(expect.any(Function))
    })

    it("returns live data pointer", () => {
      // Given
      const store = getMockStore()

      // Then
      expect(store.__data).toEqual(
        expect.objectContaining({ state: {}, subscriptions: [] })
      )
    })
  })

  describe("state bindings", () => {
    const TEST_TYPE = "TEST_TYPE"
    const payload = { foo: "bar" }

    it("calls reducer on dispatch", () => {
      //  Given
      const store = getMockStore()

      // When
      store.dispatch(TEST_TYPE, payload)

      // Then
      expect(mockReducer).toBeCalledWith(
        expect.any(Object),
        expect.objectContaining({ payload, type: TEST_TYPE })
      )
    })

    it("calls state binding on dispatch", () => {
      //  Given
      const store = createStore(
        {},
        testReducer,
        mockBindSubscriber,
        mockBindState
      )

      // When
      store.subscribe(subscriberObj, dataObj)
      store.dispatch(TEST_TYPE, payload)

      // Then
      expect(mockBindState).toBeCalledWith(
        expect.arrayContaining([
          expect.arrayContaining([subscriberObj, dataObj]),
        ]),
        { foo: "bar" },
        expect.any(Function)
      )
    })

    it("sets reduced state back to store using setState helper", () => {
      // Given
      const store = createStore(
        {},
        testReducer,
        mockBindSubscriber,
        testBindState
      )

      // When
      store.dispatch(TEST_TYPE, payload)

      // Then
      expect(store.__data.state).toEqual(
        expect.objectContaining({ foo: "bar" })
      )
    })
  })

  describe("subscriber bindings", () => {
    it("calls subscriber binding when subscribe is called", () => {
      // Given
      const store = getMockStore()

      // When
      store.subscribe(subscriberObj, dataObj)

      // Then
      expect(mockBindSubscriber).toBeCalledWith(
        expect.arrayContaining([subscriberObj, dataObj]),
        expect.any(Object)
      )
    })
  })
})
