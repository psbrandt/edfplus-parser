'use strict'

const {RecordProcessor: EdfRecordProcessor} = require('edf-parser')
const {IsProcessor: IsAnnProcessor} = require('./annotations.js')

const InvalidSignalAfterAnnotation = new Error('Invalid signal after first annotation')
const MissingAnnotation = new Error('No edf annotation found')
const IncompleteRecord = new Error('Incomplete data record')
const NoRecord = new Error('No record has been read')
const OutofRange = new Error('Signal index out of range')

var RecordProcessor = class {
  constructor (startTime, duration, processors) {
        // regular signal processors
    var rsignals = []
        // annotation processors
    var annotations = []
    var first = false

    for (let p of processors) {
      if (IsAnnProcessor(p)) {
        annotations.push(p)
        first = true
        continue
      }

      if (first) {
        throw InvalidSignalAfterAnnotation
      }

      rsignals.push(p)
    }
        // edf+ must have at least one Edf Annotations signal
    if (!annotations.length) {
      throw MissingAnnotation
    }

    this.edf = new EdfRecordProcessor(
            startTime, duration, rsignals
        )

    this.annotations = annotations
    this.rsignals = rsignals
    this.start = startTime
    this.duration = duration
    this.count = 0
  }

  Process (chunk) {
    var used = this.edf.Process(chunk)
    var ann = this.annotations

    for (let i = 0; i < ann.length; i++) {

      used += ann[i].Process(
                chunk.slice(used)
      )

      if (used > chunk.length) {
        throw IncompleteRecord
      }
    }

    this.count++
    return used
  }

  StartTime () {
    if (this.count === 0) {
      throw NoRecord
    }

    const first = this.annotations[0]

        // to be change to interface
    const tals = first.Tals()
    const offset = tals[0].offset

    return new Date(
            this.start.getTime() + 1000 * offset
        )
  }

  Get (index) {
    if (this.count === 0) {
      throw NoRecord
    }

    const rcount = this.rsignals.length
    const acount = this.annotations.length

    if (index < 0 || index >= (rcount + acount)) {
      throw OutofRange
    }

    if (index < rcount) {
      return this.edf.Get(index)
    }

    return this.annotations[index - rcount].Tals()
  }

  GetAll () {
    var all = this.edf.GetAll()
        // override start time
    all.start = this.StartTime()

        // append annotations
    all.annotations = this.annotations.map(ann => ann.Tals())

    return all
  }
}

module.exports = {
  RecordProcessor
}
