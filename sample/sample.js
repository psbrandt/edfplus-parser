const fs = require('fs')
const edfplus = require('../src/index.js')
const Transform = require('stream').Transform

const file = 'S001R01.edf'

// pipe a DataRecord (edfplus.DataBlock) stream to the read stream representing the edf file
// pipe a RecordStream (edfplus.RecordStream) to the above datarecord
// to process/translate each data record
// the function returns the final stream to be able to continue chaining.
var reader = fs.createReadStream(file)
var records = edfplus(reader)

// error handling
reader.on('error', (error) => {
  console.log(`Error: ${error}.`)
})

// error handling
records.on('error', (error) => {
  console.log(`Records Error: ${error}.`)
})

reader.on('end', () => {
  console.log(`Ending this`)
})

const objectToString = new Transform({
  writableObjectMode: true,
  transform (chunk, encoding, callback) {
    // send start time and annotations only
    this.push(JSON.stringify([chunk.start, chunk.annotations]) + '\n')
    callback()
  }
})

records.pipe(objectToString).pipe(process.stdout)
