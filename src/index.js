'use strict'
const {DataBlocks, RecordsStream} = require('edf-parser')
const utils = require('./utils.js')
const {ParseEdfPlusHeader} = require('./headers.js')
const {RecordProcessor} = require('./processor.js')
const annotations = require('./annotations')
const tal = require('./tal')

exports = module.exports = createPipeChain

function createPipeChain (reader) {
  const blocks = new DataBlocks({
    headerParser: ParseEdfPlusHeader
  })
  const records = new RecordsStream(
        utils.StandardRecordProcessor
    )

  blocks.on('header', (header) => {
    records.setHeader(header)
  })

  blocks.on('signals', (signals) => {
    records.setSignals(signals)
  })

    // todo chain errors and close events

  return reader.pipe(blocks)
                 .pipe(records)
}

exports.DataBlocks = DataBlocks
exports.RecordsStream = RecordsStream
// utility functions
exports.utils = utils
exports.utils.ParseEdfPlusHeader = ParseEdfPlusHeader
exports.RecordProcessor = RecordProcessor

// all annotations related code
exports.annotations = annotations
// all tal related code
exports.tal = tal
