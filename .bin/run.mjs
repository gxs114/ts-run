#!/usr/bin/env node

import { build } from 'esbuild'
import path from 'path'
import { unlink } from 'fs/promises'
import sourceMapSupport from 'source-map-support'
import { URL } from 'url'

const root = process.cwd()
const resolve = p => path.resolve(root, p)

const argv = process.argv.slice(2)
const targetFilePath = resolve(argv[0])

const flag = new Date().getTime().toString()
const curPath = new URL(import.meta.url).pathname
const resolveBuildPath = () => path.resolve(curPath, `../../pkg/${flag}.js`)
process.argv.splice(2, 1)
process.argv[1] = targetFilePath

const run = async () => {
  await build({
    bundle: true,
    format: 'esm',
    entryPoints: [targetFilePath],
    outfile: resolveBuildPath(),
    sourcemap: 'inline',
    sourcesContent: true,
    platform: 'node'
  })
  sourceMapSupport.install()
  await import(resolveBuildPath())
}

const close = async () => {
  try {
    await unlink(resolveBuildPath())
  } catch (_) {}

  process.exit(1)
}
process.on('exit', close)
process.on('SIGINT', close)

run()
