'use strict'

const tals = require('./tal.js')
const InvalidHeader = new Error('Invalid Annotation signal header')
const IncompleteSignalData = new Error('Signal data incomplete')
const ANNOTATION_LABEL = 'EDF Annotations'
const DEFAULT_DMAX = 32767
const DEFAULT_DMIN = -32768

var AnnotationProcessor = class {
  constructor (header) {

    if (!IsValidHeader(header)) {
      throw InvalidHeader
    }

    this.header = header
    this.container = null
  }

  Process (chunk) {

    const toProcess = this.header.Samples * 2
    var container = new tals.MultiTalContainer(
      tals.TalContainer
    )

    if (chunk.length < toProcess) {
      throw IncompleteSignalData
    }

    this.container = container
    var total = 0

    while (total < toProcess) {
      let decoded = tals.TalDecoder(
                chunk.slice(total), container
            )

      total += decoded
    }

    return total
  }

  Tals () {
    if (this.container === null) {
      return []
    }

    return this.container.Tals()
  }
}

function IsProcessor (obj) {
  return (
        obj.Process && (obj.Process instanceof Function) &&
        obj.Tals && (obj.Tals instanceof Function)
  )
}

function IsValidHeader (header) {
  return (
        ANNOTATION_LABEL === header.Label &&
        header.Samples > 0 &&
        header.DigitalMax === DEFAULT_DMAX &&
        header.DigitalMin === DEFAULT_DMIN &&
        header.PhysicalMax !== header.PhysicalMin
  )
}

module.exports = {
  AnnotationProcessor,
  IsProcessor,
  IsValidHeader,
  ANNOTATION_LABEL
}
