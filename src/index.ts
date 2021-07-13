'use strict'

import { Application } from '@supercharge/cedar'
import { ScaffoldCommand } from './scaffold-app-command'

export const app = new Application().add(new ScaffoldCommand())
