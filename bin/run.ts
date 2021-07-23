#!/usr/bin/env node

import { app } from '../src/index'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
app.run(['scaffold', ...process.argv.slice(2)])
