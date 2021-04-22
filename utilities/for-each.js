/**
 * lodash forEach, basically.
 * @param {[]} items
 * @param fn
 */
export const forEach = (items, fn) => {
  const length = items.length
  let idx = -1

  if (!length) return

  while (++idx < length) {
    if (fn(items[idx], idx) === false) break
  }
}
