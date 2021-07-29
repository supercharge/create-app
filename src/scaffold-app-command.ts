'use strict'

import Path from 'path'
import Fs from '@supercharge/fs'
import { promisify } from 'util'
import Str from '@supercharge/strings'
import ChildProcess from 'child_process'
import { Command } from '@supercharge/cedar'
import { RepoDownloader } from './repo-downloader'
import { TarExtractor } from './tar-extractor'

const exec = promisify(ChildProcess.exec)

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
    try {
      await this.ensureApplicationDoesntExist()
      await this.scaffoldApplication()
      await this.setupApplication()

      this.printSuccessMessage()
    } catch (error) {
      this.io().fail(' WOOPS ', 'Bootstrapping your Supercharge app failed')
      this.io().error(error)
    }
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

    this.check(`Directory "${this.appName()}" available`)
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
    this.start('Creating application')

    await this.downloadRepository()
    await this.extractRepository()
    await this.cleanBoilerplate()

    this
      .logMessage(`Application available in the "${this.appName()}" directory`)
      .check('App created')
  }

  /**
   *
   */
  private async downloadRepository (): Promise<void> {
    await this.task('Downloading boilerplate', async () => {
      await RepoDownloader.download(this.branch()).into(this.localFile())
    })
  }

  /**
   *
   */
  private async extractRepository (): Promise<void> {
    await this.task('Extracting boilerplate archive', async () => {
      await Fs.ensureDir(this.directory())
      await TarExtractor.extract(this.localFile()).into(this.directory())
      await Fs.removeFile(this.localFile())
    })
  }

  /**
   * Personalize the Supercharge application boilerplate by resetting the Readme.md file.
   */
  private async cleanBoilerplate (): Promise<void> {
    const readme = Path.resolve(this.directory(), 'README.md')

    await this.task('Creating empty "README.md', async () => {
      await Fs.removeFile(readme)
      await Fs.ensureFile(readme)
      await Fs.append(readme, `# ${this.appName()}`)
      await Fs.appendLine(readme, 'Enjoy developing!')
    })
  }

  private async setupApplication (): Promise<void> {
    this.start('Running app setup')

    await this.installDependencies()
    // await this.copyDotEnvFile()
    // await this.generateAppKey()

    this
      .check('Setup complete')
  }

  /**
   * Personalize the Supercharge application boilerplate by resetting the Readme.md file.
   */
  private async installDependencies (): Promise<void> {
    await this.task('Installing dependencies', async () => {
      await exec('npm install', { cwd: this.directory() })
    })
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

  /**
   * Print the success message and instructors after bootstrapping a new application.
   */
  private printSuccessMessage (): void {
    this.io()
      .log('--------------------------------------------------------------------------------------------------')
      .blankLine()
      .success(`Your Supercharge application was installed successfully into the "${this.appName()}" directory`)
      .blankLine()
      .success(' RUN ', '"npm run dev" to start the local HTTP dev server')
      .blankLine()
      .log('--------------------------------------------------------------------------------------------------')
  }

  private createTaskTitleFor (title: string): string {
    return `    ${this.io().colors().magenta('==>')}  ${title}`
  }

  private logMessage (message: string): this {
    this.io().log(
      this.createTaskTitleFor(message)
    )

    return this
  }

  private async task (title: string, action: Function): Promise<void> {
    await this.io().withSpinner(this.createTaskTitleFor(title), async () => {
      await action()
    })
  }

  /**
   *
   *
   * @param {String} message
   *
   * @returns {this}
   */
  private start (message: string): this {
    this.io().hint(' START ', message)

    return this
  }

  /**
   * Print a success message with the `CHECK` tag to the terminal.
   *
   * @param {String} message
   *
   * @returns {this}
   */
  private check (message: string): this {
    this.io().success(' CHECK ', message).blankLine()

    return this
  }
}
