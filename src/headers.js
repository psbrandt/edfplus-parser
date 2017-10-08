'use strict'

const ENCODING = 'ascii'
const DATE_SEP = '.'
const SUBFIELD_DATE_SEP = '-'
const MIN_CHAR = 32
const MAX_CHAR = 126
const HEADER_LENGTH = 256
const YEAR_EXTRA = 'yy'
const SUBFIELD_SEP = ' '
const SUBFIELD_UNKNOWN = 'X'
const SUBFIELD_SPACE_ENC = '_'
const MIN_PATIENT_SUBFIELDS = 4
const MIN_RECORDING_SUBFIELDS = 5
const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
]
const EDF_CONTINUOUS = 'EDF+C'
const EDF_DISCRETE = 'EDF+D'

const InvalidHeaderLength = new Error('Edf header encoded can no be less than 256')
const InvalidHeaderEncoding = new Error('Only printable US-ASCII characters can be use in header')
const MissingPatientSubfields = new Error('Missing patient identification subfields')
const MissingRecordSubfields = new Error('Missing record identification subfields')
const InvalidSufieldDate = new Error('Invalid Subfield date')
const InvalidStart = new Error('Invalid start date/time field')
const InvalidReservedField = new Error(`Invalid Reserved field must start with: ${EDF_CONTINUOUS} or ${EDF_DISCRETE}`)

function ParseFromEdfHeader (header, subFieldEnc = SUBFIELD_SPACE_ENC) {
  header.PatientId = parse_patient_subfields(
    header.Patient, subFieldEnc
  )

  header.Recording = parse_recording_subfields(
    header.Id, subFieldEnc
  )

  const reserved = header.Reserved
  if (
    !reserved.startsWith(EDF_CONTINUOUS) &&
    !reserved.startsWith(EDF_DISCRETE)
  ) {
    throw InvalidReservedField
  }
}

function ParseEdfPlusHeader (buffer, header, subFieldEnc = SUBFIELD_SPACE_ENC) {
  if (buffer.length < HEADER_LENGTH) {
    throw InvalidHeaderLength
  }

  for (let i = 0; i < HEADER_LENGTH; i++) {
    const v = buffer[i]
    if (v < MIN_CHAR || v > MAX_CHAR) {
      throw InvalidHeaderEncoding
    }
  }

  header.Version = parseInt(
    buffer.toString(ENCODING, 0, 8).trimRight()
  )

  const patient = buffer.toString(ENCODING, 8, 88).trimRight()
  header.PatientId = parse_patient_subfields(
    patient, subFieldEnc
  )
  header.Patient = patient

  const recording = buffer.toString(ENCODING, 88, 168).trimRight()
  header.Recording = parse_recording_subfields(
    recording, subFieldEnc
  )

  header.Id = recording

  header.Start = parse_edfplusstart(
        buffer.toString(ENCODING, 168, 176).trimRight(),
        buffer.toString(ENCODING, 176, 184).trimRight()
    )


  //this possible false here is what voids using already
  //implemented logic ond edf-parser.utils.ParseEdfHeader
  if (header.Start === false) {
    header.Start = header.Id.Startdate
  }

  header.HeaderLength = parseInt(
    buffer.toString(ENCODING, 184, 192).trimRight()
  )

  const reserved = buffer.toString(ENCODING, 192, 236).trimRight()
  if (
    !reserved.startsWith(EDF_CONTINUOUS) &&
    !reserved.startsWith(EDF_DISCRETE)
  ) {
    throw InvalidReservedField
  }

  header.Reserved = reserved

  header.DataRecords = parseInt(
    buffer.toString(ENCODING, 236, 244).trimRight()
  )
    // convert to duration
  header.Duration = buffer.toString(ENCODING, 244, 252).trimRight()
  header.Signals = parseInt(
    buffer.toString(ENCODING, 252).trimRight()
  )

  return true
}

function parse_edfplusstart (sdate, stime) {
  const date_parts = sdate.split(DATE_SEP)
  const time_parts = stime.split(DATE_SEP)

  if (date_parts.length !== 3 || time_parts.length !== 3) {
    throw InvalidStart
  }

  //After 2084, yy must be 'yy'
  if (YEAR_EXTRA === date_parts[2]) {
    return false
  }

  var year = parseInt(date_parts[2])
  const clipping = (year >= 85 && year <= 99) ? 1900 : 2000

  return new Date(
        year + clipping, date_parts[1] - 1, date_parts[0],
        time_parts[0], time_parts[1], time_parts[2]
    )
}

function parse_patient_subfields (raw, spaceEnc) {
  var subfields = parse_subfield(
        raw, spaceEnc
    )

  const len = subfields.length
  if (len < MIN_PATIENT_SUBFIELDS) {
    throw MissingPatientSubfields
  }

  var birthdate = subfields[2]
  if (birthdate !== null) {
    birthdate = subfield_date(subfields[2])
  }

  var out = {
    code: subfields[0],
    sex: subfields[1],
    birthdate: birthdate,
    name: subfields[3]
  }

  if (len > MIN_PATIENT_SUBFIELDS) {
    out.others = subfields.slice(MIN_PATIENT_SUBFIELDS)
  }

  return out
}

function parse_recording_subfields (raw, spaceEnc) {
  var subfields = parse_subfield(
        raw, spaceEnc
    )

  const len = subfields.length
  if (len < MIN_RECORDING_SUBFIELDS) {
    throw MissingRecordSubfields
  }

  var date = subfields[1]
  if (date !== null) {
    date = subfield_date(date)
  }

  var out = {
    Startdate: date,
    Hospital: subfields[2],
    Resposible: subfields[3],
    Equipment: subfields[4]
  }

  if (len > MIN_RECORDING_SUBFIELDS) {
    out.others = subfields.slice(MIN_RECORDING_SUBFIELDS)
  }

  return out
}

function parse_subfield (raw, spaceEnc) {
  return raw.split(SUBFIELD_SEP).map(field => {
    if (field === SUBFIELD_UNKNOWN) {
      return null
    }

    return field.split(spaceEnc).join(SUBFIELD_SEP)
  })
}

function subfield_date (str) {
  var parts = str.split(SUBFIELD_DATE_SEP)
  if (
        parts.length !== 3 ||
        parts[0].length !== 2 ||
        parts[1].length !== 3 ||
        parts[2].length !== 4
    ) {
    return InvalidSufieldDate
  }

  const day = parseInt(parts[0])
  const year = parseInt(parts[2])
  const month = MONTHS.indexOf(
        parts[1]
    )

  if (
    month === -1 ||
    Number.isNaN(day) ||
    Number.isNaN(year)
  ) {
    return InvalidSufieldDate
  }

  return new Date(
        year, month, day
    )
}

module.exports = {
  ParseEdfPlusHeader,
  ParseFromEdfHeader
}
