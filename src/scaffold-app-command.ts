'use strict'

import Str from '@supercharge/strings'
import { Command } from '@supercharge/cedar'

export class ScaffoldCommand extends Command {
  /**
   * Configure the command.
   */
  configure (): void {
    this
      .name('scaffold')
      .description('Scaffold a new Supercharge application')
      .addArgument('app-name', builder => {
        builder
          .required()
          .description('The directory name of your new Supercharge project ')
      })
  }

  /**
   * Run the scaffold command.
   */
  async run (): Promise<any> {
    this.io().info('TODO :)')
  }

  /**
   * Returns the slugified application name.
   *
   * @returns {String}
   */
  appName (): string {
    return Str(
      this.argument('app-name')
    ).slug().get()
  }
}
