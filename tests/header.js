const assert = require('assert')
const {ParseEdfPlusHeader,ParseFromEdfHeader} = require('../src/index.js').utils

describe('ParseEdfPlusHeader', function () {
  it('Throw exception on invalid buffer', function () {
    const raw = '0       X X X X'
    var header = {}

    assert.throws(
            () => {
              const result = ParseEdfPlusHeader(
                Buffer.from(raw, 'ascii'),
                header
              )
            },
            Error, 'Edf header encoded can no be less than 256'
        )
  })

  it('Parsing', function () {
    const expected_header = {
      Version: 0,
      Patient: 'X X X X',
      Id: 'Startdate 12-AUG-2009 X X BCI2000',
      PatientId: {
        birthdate: null,
        code: null,
        name: null,
        sex: null
      },
      Recording: {
        Equipment: 'BCI2000',
        Hospital: null,
        Resposible: null,
        Startdate: new Date('2009-08-12T04:00:00.000Z')
      },
      Start: new Date('2009-08-12T20:15:00.000Z'),
      HeaderLength: 16896,
      Reserved: 'EDF+C',
      DataRecords: 61,
      Duration: '1',
      Signals: 65
    }

    const raw = '0       X X X X                                                                         Startdate 12-AUG-2009 X X BCI2000                                               12.08.0916.15.0016896   EDF+C                                       61      1       65  '

    var header = {}
    const result = ParseEdfPlusHeader(
            Buffer.from(raw, 'ascii'),
            header
        )

    assert.equal(true, result, 'Parsed')
    assert.deepStrictEqual(expected_header, header, 'Successfully parsed')
  })

  it('Extra Subfields', function () {
    const expected_header = {
      Version: 0,
      Patient: 'X X X X first_extra_subfield second_extra_subfield',
      Id: 'Startdate 12-AUG-2009 X X BCI2000 subfield_extra another_extra',
      PatientId: {
        birthdate: null,
        code: null,
        name: null,
        sex: null,
        others: [
          'first extra subfield',
          'second extra subfield'
        ]

      },
      Recording: {
        Equipment: 'BCI2000',
        Hospital: null,
        Resposible: null,
        Startdate: new Date('2009-08-12T04:00:00.000Z'),
        others: [
          'subfield extra',
          'another extra'
        ]
      },
      Start: new Date('2009-08-12T20:15:00.000Z'),
      HeaderLength: 16896,
      Reserved: 'EDF+C',
      DataRecords: 61,
      Duration: '1',
      Signals: 65
    }

    const raw = '0       X X X X first_extra_subfield second_extra_subfield                              Startdate 12-AUG-2009 X X BCI2000 subfield_extra another_extra                  12.08.0916.15.0016896   EDF+C                                       61      1       65  '

    var header = {}
    const result = ParseEdfPlusHeader(
            Buffer.from(raw, 'ascii'),
            header
        )

    assert.equal(true, result, 'Parsed')
    assert.deepStrictEqual(expected_header, header, 'Successfully parsed')
  })
})

describe('ParseFromEdfHeader', function(){
  it("Regular header",function(){

    const edf_header = {
      Version: 0,
      Patient: 'X X X X',
      Id: 'Startdate 12-AUG-2009 X X BCI2000',
      Start: new Date('2009-08-12T20:15:00.000Z'),
      HeaderLength: 16896,
      Reserved: 'EDF+C',
      DataRecords: 61,
      Duration: '1',
      Signals: 65
    }

    const expected_header = {
      Version: 0,
      Patient: 'X X X X',
      Id: 'Startdate 12-AUG-2009 X X BCI2000',
      PatientId: {
        birthdate: null,
        code: null,
        name: null,
        sex: null
      },
      Recording: {
        Equipment: 'BCI2000',
        Hospital: null,
        Resposible: null,
        Startdate: new Date('2009-08-12T04:00:00.000Z')
      },
      Start: new Date('2009-08-12T20:15:00.000Z'),
      HeaderLength: 16896,
      Reserved: 'EDF+C',
      DataRecords: 61,
      Duration: '1',
      Signals: 65
    }

    ParseFromEdfHeader(edf_header)
    assert.deepStrictEqual(expected_header,edf_header,"Successfully edf header upgrade")

  })
})



