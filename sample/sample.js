const fs = require('fs')
const edf = require('edf-parser')
const {ParseEdfPlusHeader} = require('../src/headers.js')
const {RecordProcessor: EdfPlusRecordProcessor} = require('../src/processor.js')
const {StandardRecordProcessor: StandardEdfPlusRecordProcessor} = require('../src/utils.js')
const Transform = require('stream').Transform

const file = 'S001R01.edf'

var reader = fs.createReadStream(file)

const blocks = new edf.DataBlocks({
    headerParser: ParseEdfPlusHeader
})

const records = new edf.RecordsStream(
    StandardEdfPlusRecordProcessor
)

blocks.on('header', (header) => {
    console.log("header",header)
    records.setHeader(header)
})

blocks.on('signals', (signals) => {
    records.setSignals(signals)
})

//error handling
reader.on('error', (error) => {
  console.log(`Error: ${error}.`)
})

//error handling
records.on('error', (error) => {
  console.log(`Records Error: ${error}.`)
})

reader.on('end', () => {
  console.log(`Ending this`)
})

const objectToString = new Transform({
  writableObjectMode: true,
  transform (chunk, encoding, callback) {
    this.push(JSON.stringify([chunk.start, chunk.annotations]) + '\n')
    callback()
  }
})


reader.pipe(blocks).pipe(records).pipe(objectToString).pipe(process.stdout)
