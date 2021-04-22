/**
 * Returns the stringified data type as given from the object tag.
 * @param {*} value
 * @returns {string}
 */
function getTypeTag(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}
/**
 * Checks if the value is an object literal.
 * @param {*} value
 * @returns {boolean}
 */
function isPlainObject(value) {
  return getTypeTag(value) === "object"
}

/**
 * Retrieve a value in obj from the given path. If a value
 * can't be found, undefined is returned.
 * @param {Object|Array} obj
 * @param {string} path
 * @returns {*}
 */
export function get(obj, path) {
  path = path.replace(/\[/g, ".").replace(/]/g, "").split(".")
  const length = path.length
  let idx = -1

  while (++idx < length) {
    const key = path[idx]
    const isEarlyDeadEnd =
      path.indexOf(key) < length - 1 &&
      !isPlainObject(obj[key]) &&
      !Array.isArray(obj[key])

    if (isEarlyDeadEnd) {
      return undefined
    }

    obj = obj[key]
  }

  return obj
}
