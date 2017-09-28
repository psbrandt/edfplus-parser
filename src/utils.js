'use strict'
const {RecordProcessor} = require('./processor.js')
const annotations = require('./annotations.js')
const {StandardSignalProcessors} = require('edf-parser').utils


function StandardAnnotationProcessors (headers){
  return headers.map((h) => {
    return new annotations.AnnotationProcessor(
      h
    )
  })
}

function StandardRecordProcessor (header, signals) {

  const regularSignals = signals.filter((sheader) => {
    return annotations.ANNOTATION_LABEL !== sheader.Label
  })

  //base on the fact that we can not have a regular signal after
  //the first annotation signal
  const annSignals = signals.slice(
    regularSignals.length
  )

  var list = StandardSignalProcessors(regularSignals)

  list.push(
    ...StandardAnnotationProcessors(annSignals)
  )

  return new RecordProcessor(
    header.Start, header.Duration, list
  )
}

module.exports = {
  StandardAnnotationProcessors,
  StandardRecordProcessor
}