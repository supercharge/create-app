#!/usr/bin/env node

import { app } from '../src/index'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
app.run(
  /**
   * Manually select the 'scaffold' command. The console application does
   * not yet allow to run a specific command. Please feel free to send
   * a pull request if you want this feature upstream in cedar.
   */
  ['scaffold', ...process.argv.slice(2)]
)
