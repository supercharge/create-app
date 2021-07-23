'use strict'

import Tar from 'tar'

export class TarExtractor {
  /**
   * Stores the repository name
   */
  private readonly file: string

  /**
   * Create a new instance.
   *
   * @param {String} file
   */
  constructor (file: string) {
    this.file = file
  }

  /**
   * Returns a tar extractor instance.
   * @param file
   * @returns
   */
  static extract (file: string): TarExtractor {
    return new this(file)
  }

  /**
   * Extracts the
   *
   * @param repo
   */
  async to (destination: string): Promise<void> {
    await Tar.extract({ file: this.file, cwd: destination })
  }
}
