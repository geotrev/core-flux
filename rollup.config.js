import fs from "fs"
import path from "path"
import babel from "@rollup/plugin-babel"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import terser from "@rollup/plugin-terser"

const loadJSON = (path) =>
  JSON.parse(fs.readFileSync(new URL(path, import.meta.url)))

const dirname = path.resolve()
const year = new Date().getFullYear()
const banner = async () => {
  const pkg = loadJSON("./package.json")

  return `/*!
  * @license MIT (https://github.com/geotrev/core-flux/blob/master/LICENSE)
  * Core Flux v${pkg.version} (${pkg.homepage})
  * Copyright ${year} ${pkg.author}
  */`
}

const Formats = {
  CJS: "cjs",
  ES: "es",
  UMD: "umd",
}
const input = path.resolve(dirname, "core-flux.js")
const basePlugins = [
  nodeResolve(),
  commonjs(),
  babel({ babelHelpers: "bundled", comments: false }),
]

const terserPlugin = terser()

const baseOutput = (format) => ({
  banner,
  format,
  name: "CoreFlux",
  sourcemap: true,
})

let moduleOutputs = [Formats.ES, Formats.CJS].map((format) => ({
  ...baseOutput(format),
  file: path.resolve(dirname, `lib/core-flux.${format}.js`),
}))

const umdOutputs = [
  {
    ...baseOutput(Formats.UMD),
    file: path.resolve(dirname, `dist/core-flux.js`),
  },
]

if (process.env.BABEL_ENV === "publish") {
  moduleOutputs = [
    ...moduleOutputs,
    ...[Formats.ES, Formats.CJS].map((format) => ({
      ...baseOutput(format),
      plugins: [terserPlugin],
      file: path.resolve(dirname, `lib/core-flux.${format}.min.js`),
    })),
  ]

  umdOutputs.push({
    ...baseOutput(Formats.UMD),
    plugins: [terserPlugin],
    file: path.resolve(dirname, `dist/core-flux.min.js`),
  })
}

export default {
  input,
  plugins: basePlugins,
  output: [...moduleOutputs, ...umdOutputs],
}
