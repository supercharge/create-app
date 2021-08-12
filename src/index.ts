'use strict'

import { Application } from '@supercharge/cedar'
import { ScaffoldCommand } from './scaffold-app-command'

/**
 * Run the CLI command to scaffold a new Supercharge application.
 */
export const app = new Application().add(
  new ScaffoldCommand()
)

/**
 * Run the CLI command to scaffold a new Supercharge application.
 */
export async function scaffoldApp (input?: string[]): Promise<void> {
  const args = [...(input ?? process.argv.slice(2))]

  await app.run(['scaffold', ...args])
}
