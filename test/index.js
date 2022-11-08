'use strict'

const Path = require('path')
const Sinon = require('sinon')
const { test } = require('uvu')
const { expect } = require('expect')
const Fs = require('@supercharge/fs')
const Str = require('@supercharge/strings')
const { timeout } = require('./helpers/timeout')
const { app, scaffoldApp, ScaffoldCommand } = require('../dist/src')

function generateAppName () {
  return `test-supercharge-app-${Str.random(use => {
    use.characters().length(4)
  })}`.toLowerCase()
}

test('exports scaffoldApp is a function', async () => {
  expect(typeof scaffoldApp === 'function').toBe(true)
})

test('Create Supercharge App', timeout('60s', async () => {
  const appName = generateAppName()
  const appRoot = Path.resolve(process.cwd(), appName)
  const terminateStub = Sinon.stub(app, 'terminate').returns()

  await scaffoldApp([appName])

  expect(await Fs.exists(appRoot)).toBe(true)
  expect(terminateStub.calledWith()).toBe(true)

  await Fs.removeDir(appRoot)
  terminateStub.restore()
}))

test.only('throws when the app directory already exists', async () => {
  const appName = generateAppName()
  const appRoot = Path.resolve(process.cwd(), appName)

  expect(await Fs.notExists(appRoot)).toBe(true)
  await Fs.ensureDir(appRoot)

  const command = new ScaffoldCommand()
  const appNameStub = Sinon.stub(command, 'appName').returns(appName)
  const appDirectoryStub = Sinon.stub(command, 'appDirectory').returns(appRoot)

  await expect(
    command.run()
  ).rejects.toEqual(new Error(`A directory "${appName}" already exists.`))

  await Fs.removeDir(appRoot)
  appDirectoryStub.restore()
  appNameStub.restore()
})

test.run()
