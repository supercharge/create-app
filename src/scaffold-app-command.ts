'use strict'

import Path from 'path'
import Fs from '@supercharge/fs'
import Str from '@supercharge/strings'
import { Command } from '@supercharge/cedar'
import { RepoDownloader } from './repo-downloader'
import { TarExtractor } from './tar-extractor'

export class ScaffoldCommand extends Command {
  /**
   * Configure the command.
   */
  configure (): void {
    this
      .name('scaffold')
      .description('Scaffold a new Supercharge application')
      .addArgument('app-name', argument => {
        argument
          .required()
          .description('The directory name of your new Supercharge project ')
      })
      .addOption('dev', option => {
        option
          .optional()
          .defaultValue(false)
          .description('Installs the latest development release')
      })
  }

  /**
   * Run the scaffold command.
   */
  async run (): Promise<any> {
    await this.ensureApplicationDoesntExist()
    await this.scaffoldApplication()

    // await this.installDependencies()
    // await this.copyDotEnvFile()
    // await this.generateAppKey()

    this.io().success('SUCCESS', `${this.appName()} scaffolding successful. Enjoy!`)
  }

  /**
   * Throws an error if an application already exists for the same directory name.
   *
   * @throws
   */
  private async ensureApplicationDoesntExist (): Promise<void> {
    if (await Fs.exists(this.directory())) {
      throw new Error(`A directory "${this.appName()}" already exists.`)
    }
  }

  /**
   * Returns the directory name which will be created when scaffolding the application.
   *
   * @returns {String}
   */
  private directory (): string {
    return Path.resolve(process.cwd(), this.appName())
  }

  /**
   * Returns the slugified application name.
   *
   * @returns {String}
   */
  private appName (): string {
    return Str(
      this.argument('app-name')
    ).slug().get()
  }

  /**
   * Downloads the Supercharge application boilerplate as a .tar.gz file
   * and extracts the downloaded archive into the defined directory.
   */
  private async scaffoldApplication (): Promise<void> {
    this.io().info('local file -> ' + this.localFile())

    await RepoDownloader.download(this.branch()).into(this.localFile())
    await Fs.ensureDir(this.directory())
    await TarExtractor.extract(this.localFile()).into(this.directory())
    await Fs.remove(this.localFile())
  }

  /**
   * Returns the branch name which should be downloaded.
   *
   * @returns {String}
   */
  private branch (): string {
    // TODO currently hardcoded to 'develop'
    // change this when tagging the Supercharge 2.0 release
    return 'develop'

    // return this.option('dev')
    //   ? 'develop'
    //   : 'main'
  }

  /**
   * Returns the local path for the downloaded file.
   *
   * @returns {String}
   */
  private localFile (): string {
    return `${this.directory()}.tar.gz`
  }
}
