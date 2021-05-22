import { createStore } from "../core-flux"

const testBindState = jest.fn()
const testBindSubscriber = jest.fn()
const testReducer = jest.fn()

describe("createStore", () => {
  let store,
    data = "data",
    subscriber = {},
    type = "TEST_TYPE",
    payload = {}

  beforeAll(() => {
    store = createStore({}, testReducer, testBindSubscriber, testBindState)
  })

  it("creates dispatch and subscribe helper functions", () => {
    expect(store).toEqual(expect.any(Object))
    expect(store.dispatch).toEqual(expect.any(Function))
    expect(store.subscribe).toEqual(expect.any(Function))
  })

  it("calls subscriber binding when subscription is added", () => {
    store.subscribe(subscriber, data)

    expect(testBindSubscriber).toBeCalledWith(
      expect.arrayContaining([subscriber, data]),
      expect.any(Object)
    )
  })

  it("calls reducer when dispatch is made", () => {
    store.dispatch(type, payload)

    expect(testReducer).toBeCalledWith(
      expect.any(Object),
      expect.objectContaining({ type, payload })
    )
  })

  it("calls state binding when dispatch is made", () => {
    store.dispatch(type, payload)

    expect(testBindState).toBeCalledWith(
      expect.arrayContaining([expect.arrayContaining([subscriber, data])]),
      undefined,
      expect.any(Function)
    )
  })
})
