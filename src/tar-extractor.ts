'use strict'

import Tar from 'tar'

export class TarExtractor {
  /**
   * Extract the given tar.gz `file`.
   *
   * @param {String} file
   */
  static async extract (file: string): Promise<void> {
    await Tar.extract({ file })
  }
}
