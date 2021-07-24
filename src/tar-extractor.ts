'use strict'

import Tar from 'tar'

export class TarExtractor {
  private readonly file: string

  constructor (file: string) {
    this.file = file
  }

  /**
   * Returns a pending TarExtractor instance. Start extracting the
   * given `file` into a directory using the `.into()` method.
   *
   * @param {String} file
   *
   * @returns {TarExtractor}
   */
  static extract (file: string): TarExtractor {
    return new this(file)
  }

  /**
   * Extract the tar.gz into the given `directory`.
   *
   * @param directory
   */
  async into (directory: string): Promise<void> {
    await Tar.extract({ file: this.file, strip: 1, cwd: directory })
  }
}
