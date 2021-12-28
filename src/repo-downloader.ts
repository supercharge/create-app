'use strict'

import Https from 'https'
import Fs, { WriteStream } from '@supercharge/fs'

export class RepositoryDownloader {
  /**
   * Stores the repository name.
   */
  private readonly repository: string = 'supercharge/supercharge'

  /**
   * Stores the branch name.
   */
  private readonly branch: string

  /**
   * Create a new instance.
   *
   * @param {String} branch
   */
  constructor (branch: string) {
    this.branch = branch
  }

  /**
   * Creates a pending repository download that needs to be
   * started using the fluent `.into(target)` method.
   *
   * @param {String} branch
   *
   * @returns {RepositoryDownloader}
   */
  static download (branch: string): RepositoryDownloader {
    return new this(branch)
  }

  /**
   * Start downloading the repository as a .tar.gz file into the local `targetFile`.
   *
   * @param targetFile
   */
  async into (targetFile: string): Promise<void> {
    await this.fetch(targetFile)
  }

  /**
   * Returns the remote URL for the file that should be downloaded.
   *
   * @returns {String}
   */
  private remoteFile (): string {
    return `https://github.com/${this.repository}/archive/${this.branch}.tar.gz`
  }

  /**
   * Downloads the given `repository` and returns the file path
   * on the local disk where the repository is stored.
   *
   * @returns {String}
   */
  async fetch (targetFile: string): Promise<string> {
    let url = this.remoteFile()

    do {
      const { redirectTo } = await this.download(url, targetFile)
      url = redirectTo ?? ''
    } while (url)

    return targetFile
  }

  /**
   * Downloads the repository from the remote server to a local file.
   *
   * @param {String} url
   * @param {String} targetFile
   *
   * @returns {Object}
   */
  private async download (url: string, targetFile: string): Promise<{ redirectTo?: string}> {
    return await new Promise((resolve, reject) => {
      Https.get(url, response => {
        const code = response.statusCode ?? 0

        if (code >= 400) {
          return reject(new Error(response.statusMessage))
        }

        if (code > 300 && code < 400 && !!response.headers.location) {
          return resolve({ redirectTo: response.headers.location })
        }

        const fileWriter = this
          .createWriterFor(targetFile)
          .on('finish', () => {
            resolve({})
          })

        response.pipe(fileWriter)
      }).on('error', error => {
        reject(error)
      })
    })
  }

  /**
   * Creates a write stream for the given `file`.
   *
   * @param {String} file
   *
   * @returns {WriteStream}
   */
  private createWriterFor (file: string): WriteStream {
    return Fs.createWriteStream(file)
  }
}
