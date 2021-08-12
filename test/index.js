'use strict'

const Path = require('path')
const Sinon = require('sinon')
const { test } = require('tap')
const Fs = require('@supercharge/fs')
const { scaffoldApp, app } = require('../dist/src')

test('scaffoldApp exists', async t => {
  t.ok(typeof scaffoldApp === 'function')
})

test('Create Supercharge App', async t => {
  t.setTimeout(60000)

  const appName = 'test-supercharge-app'
  const appRoot = Path.resolve(process.cwd(), appName)
  const terminateStub = Sinon.stub(app, 'terminate').returns()

  await app.run(['scaffold', appName])

  t.ok(await Fs.pathExists(appRoot))
  t.ok(terminateStub.calledWith())

  await Fs.removeDir(appRoot)
  terminateStub.restore()
})
