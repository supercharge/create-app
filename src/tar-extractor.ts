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
    await Tar.extract({
      /**
       * This `strip` configuration removes one level from the archive path
       * removing a temporary directory path. Removing this path extracts
       * the `file` content directly into the given target `directory`.
       */
      strip: 1,
      cwd: directory,
      file: this.file
    })
  }
}
