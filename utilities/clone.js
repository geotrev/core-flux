/**
 * Creates a 1:1 clone of an object. Assumes all values are
 * simple primitives: numbers, strings, objects, arrays.
 * @param {Object|Array} obj
 * @returns {Object|Array}
 */
export function clone(obj) {
  if (!obj) {
    return obj
  }

  const isArray = Array.isArray(obj)

  let value,
    newObj = isArray ? [] : {}

  if (isArray) {
    let length = obj.length,
      idx = -1
    while (++idx < length) {
      newObj[idx] = obj[idx]
    }
  } else {
    for (const key in obj) {
      value = obj[key]
      newObj[key] = newObj[key] =
        value === null ? null : typeof value === "object" ? clone(value) : value
    }
  }

  return newObj
}
