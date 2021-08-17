'use strict'

const Path = require('path')
const Sinon = require('sinon')
const { test } = require('tap')
const Fs = require('@supercharge/fs')
const Str = require('@supercharge/strings')
const { app, scaffoldApp, ScaffoldCommand } = require('../dist/src')

function generateAppName () {
  return `test-supercharge-app-${Str.random(4)}`
}

test('Create Supercharge App', async t => {
  t.ok(typeof scaffoldApp === 'function')
})

test('Create Supercharge App', async t => {
  t.setTimeout(30000)

  const appName = generateAppName()
  const appRoot = Path.resolve(process.cwd(), appName)
  const terminateStub = Sinon.stub(app, 'terminate').returns()

  await scaffoldApp([appName])

  t.ok(await Fs.exists(appRoot))
  t.ok(terminateStub.calledWith())

  await Fs.removeDir(appRoot)
  terminateStub.restore()
})

test('throws when the app directory already exists', async t => {
  const appName = generateAppName()
  const appRoot = Path.resolve(process.cwd(), appName)

  t.ok(await Fs.notExists(appRoot))
  await Fs.ensureDir(appRoot)

  const command = new ScaffoldCommand()
  const appNameStub = Sinon.stub(command, 'appName').returns(appName)
  const appDirectoryStub = Sinon.stub(command, 'directory').returns(appRoot)

  await t.rejects(async () => {
    await command.run()
  }, new Error(`A directory "${appName}" already exists.`))

  await Fs.removeDir(appRoot)
  appDirectoryStub.restore()
  appNameStub.restore()
})
