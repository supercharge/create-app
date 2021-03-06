'use strict'

import Path from 'path'
import Fs from '@supercharge/fs'
import { promisify } from 'util'
import Str from '@supercharge/strings'
import ChildProcess from 'child_process'
import { Command } from '@supercharge/cedar'
import { TarExtractor } from './tar-extractor'
import { RepositoryDownloader } from './repo-downloader'

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
      throw error
    }
  }

  /**
   * Throws an error if an application already exists for the same directory name.
   *
   * @throws
   */
  async ensureApplicationDoesntExist (): Promise<void> {
    if (await Fs.exists(this.appDirectory())) {
      throw new Error(`A directory "${this.appName()}" already exists.`)
    }

    this.check(`Making sure the "${this.appName()}" directory does not exist`)
  }

  /**
   * Returns the directory name which will be created when scaffolding the application.
   *
   * @param {String|String[]} path
   *
   * @returns {String}
   */
  appDirectory (...path: string[]): string {
    return Path.resolve(process.cwd(), this.appName(), ...path)
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

  /**
   * Downloads the Supercharge application boilerplate as a .tar.gz file
   * and extracts the downloaded archive into the defined directory.
   */
  async scaffoldApplication (): Promise<void> {
    this.check(`Using branch "${this.branch()}" for the application`)

    this.start('Creating application')

    await this.downloadRepository()
    await this.extractRepository()
    await this.cleanBoilerplate()

    this
      .logMessage(`Application available in the "${this.appName()}" directory`)
      .check('App created')
  }

  /**
   * Download the application boilerplate as a .tar.gz file
   * for the selected source branch. Save the boilerplate
   * archive into the defined local file for extraction.
   */
  async downloadRepository (): Promise<void> {
    await this.task('Downloading boilerplate', async () => {
      await RepositoryDownloader.download(this.branch()).into(this.localFile())
    })
  }

  /**
   * Extract the downloaded repository archive (.tar.gz)
   * into the desired application target directory.
   */
  async extractRepository (): Promise<void> {
    await this.task('Extracting boilerplate archive', async () => {
      await Fs.ensureDir(this.appDirectory())
      await TarExtractor.extract(this.localFile()).into(this.appDirectory())
      await Fs.removeFile(this.localFile())
    })
  }

  /**
   * Personalize the Supercharge application boilerplate by resetting the Readme.md file.
   */
  async cleanBoilerplate (): Promise<void> {
    const readme = Path.resolve(this.appDirectory(), 'README.md')

    await this.task('Creating empty "README.md" file', async () => {
      await Fs.removeFile(readme)
      await Fs.ensureFile(readme)
      await Fs.append(readme, `# ${this.appName()}`)
      await Fs.appendLine(readme, 'Enjoy developing!')
    })
  }

  async setupApplication (): Promise<void> {
    this.start('Running app setup')

    await this.installDependencies()
    await this.copyDotEnvFile()
    await this.generateAppKey()
    // await this.setDatabaseName()

    this.check('Setup complete')
  }

  /**
   * Install the NPM dependencies for the created application.
   */
  async installDependencies (): Promise<void> {
    await this.task('Installing dependencies', async () => {
      await exec('npm install', { cwd: this.appDirectory() })
    })
  }

  /**
   * Copy the `.env.eample` file over to a `.env`.
   */
  async copyDotEnvFile (): Promise<void> {
    await this.task('Creating .env file', async () => {
      await Fs.copyFile(
        this.appDirectory('.env.example'),
        this.appDirectory('.env')
      )
    })
  }

  /**
   * Generate an application key.
   */
  async generateAppKey (): Promise<void> {
    // await this.task('Generating app key', async () => {
    //   await exec('ts-node craft.ts key:generate')
    // })
  }

  /**
   * Returns the branch name which should be downloaded.
   *
   * @returns {String}
   */
  branch (): string {
    return this.option('dev')
      ? 'develop'
      : 'main'
  }

  /**
   * Returns the local path for the downloaded file.
   *
   * @returns {String}
   */
  localFile (): string {
    return `${this.appDirectory()}.tar.gz`
  }

  /**
   * Print the success message and instructors after bootstrapping a new application.
   */
  printSuccessMessage (): void {
    this.io()
      .log('--------------------------------------------------------------------------------------------------')
      .blankLine()
      .success(`Your Supercharge application was installed successfully into the "${this.appName()}" directory`)
      .blankLine()
      .success(' RUN ', `${this.io().colors().magenta('npm run dev')} to start the local HTTP dev server`)
      .blankLine()
      .log('--------------------------------------------------------------------------------------------------')
  }

  /**
   * Log the given `message` as a task step to the terminal.
   *
   * @param {String} message
   *
   * @returns {ScaffoldCommand}
   */
  logMessage (message: string): this {
    this.io().log(
      this.createMessageFor(message)
    )

    return this
  }

  /**
   * Create and run a task for the given `title` and `action` function.
   *
   * @param {String} title
   * @param {Function} action
   */
  async task (title: string, action: Function): Promise<void> {
    await this.io().withSpinner(this.createMessageFor(title), async () => {
      await action()
    })
  }

  /**
   * Create a task message for the given `title`.
   *
   * @param {String} title
   *
   * @returns {String}
   */
  createMessageFor (title: string): string {
    return `    ${this.io().colors().magenta('==>')}  ${title}`
  }

  /**
   * Print a start message to the terminal using the 'START' tag.
   *
   * @param {String} message
   *
   * @returns {this}
   */
  start (message: string): this {
    this.io().hint(' START ', message)

    return this
  }

  /**
   * Print a success message to the terminal using the `CHECK` tag.
   *
   * @param {String} message
   *
   * @returns {this}
   */
  check (message: string): this {
    this.io().success(' CHECK ', message).blankLine()

    return this
  }
}
