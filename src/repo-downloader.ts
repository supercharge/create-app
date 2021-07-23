'use strict'

import Path from 'path'
import Https from 'https'
import Fs, { WriteStream } from '@supercharge/fs'

export class RepoDownloader {
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
   * Downloads the given `branch` of the Supercharge application
   * boilerplate and returns the file path on the local disk
   * where the scaffolded repository files are stored.
   *
   * @returns {String}
   */
  static async download (branch: string): Promise<string> {
    return await new this(branch).fetch()
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
   * Returns the local path for the downloaded file.
   *
   * @returns {String}
   */
  private localFile (): string {
    return Path.resolve(process.cwd(), `supercharge-${this.branch}.tar.gz`)
  }

  /**
   * Downloads the given `repository` and returns the file path
   * on the local disk where the repository is stored.
   *
   * @returns {String}
   */
  async fetch (): Promise<string> {
    let done = false
    let url = this.remoteFile()

    do {
      const { finished, url: newUrl } = await this.download(url, this.localFile())
      url = newUrl ?? ''
      done = finished
    } while (!done)

    return this.localFile()
  }

  private async download (url: string, targetFile: string): Promise<{ finished: boolean, url?: string}> {
    return await new Promise((resolve, reject) => {
      Https.get(url, response => {
        const code = response.statusCode ?? 0

        if (code >= 400) {
          return reject(new Error(response.statusMessage))
        }

        const fileWriter = this
          .createWriterFor(targetFile)
          .on('finish', () => {
            resolve({ finished: true })
          })

        if (code > 300 && code < 400 && !!response.headers.location) {
          return resolve({ finished: false, url: response.headers.location })
        }

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
