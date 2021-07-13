'use strict'

import { Command } from '@supercharge/cedar'

export class ScaffoldCommand extends Command {
  /**
   * Configure the command.
   */
  configure (): void {
    this
      .name('scaffold')
      .description('Scaffold a new Supercharge application')
  }

  /**
   * Run the scaffold command.
   */
  async run (): Promise<any> {
    this.io().info('TODO :)')
  }
}
