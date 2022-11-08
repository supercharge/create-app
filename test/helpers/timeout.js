'use strict'

const ms = require('ms')

exports.timeout = function (duration, handler) {
  const milliseconds = typeof duration === 'string'
    ? ms(duration)
    : duration

  return (context) => {
    let timer

    return Promise.race([
      handler(context),
      new Promise((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Test timeout of "${milliseconds}" ms exceeded`))
        }, milliseconds)
      })
    ]).finally(() => {
      clearTimeout(timer)
    })
  }
}
