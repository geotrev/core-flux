/**
 * Returns the stringified data type as given from the object tag.
 * @param {*} value
 * @returns {string}
 */
const getTypeTag = (value) =>
  Object.prototype.toString.call(value).slice(8, -1).toLowerCase()

/**
 * Checks if the value is an object literal.
 * @param {*} value
 * @returns {boolean}
 */
const isPlainObject = (value) => getTypeTag(value) === "object"

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

  for (const part of path) {
    const isEarlyDeadEnd =
      path.indexOf(part) < length - 1 &&
      !isPlainObject(obj[part]) &&
      !Array.isArray(obj[part])

    if (isEarlyDeadEnd) {
      return undefined
    }

    obj = obj[part]
  }

  return obj
}
