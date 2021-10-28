'use strict'

module.exports = (seconds, handler) => {
  return (context) => {
    let timer

    return Promise.race([
      handler(context),
      new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), seconds * 1000)
      })
    ]).finally(() => {
      clearTimeout(timer)
    })
  }
}
