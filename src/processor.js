'use strict'

const {RecordProcessor:EdfRecordProcessor} = require('edf-parser')
const {IsProcessor: IsAnnProcessor} = require('./annotations.js')

const InvalidSignalAfterAnnotation = new Error("")
const MissingAnnotation = new Error("")

var RecordProcessor = class{

    constructor(startTime, duration, processors){

        //regular signal processors
        var rsignals = []
        //annotation processors
        var annotations = []
        var first = false

        for (let p of processors){

            if (IsAnnProcessor(p)){
                annotations.push(p)
                first = true
                continue
            }

            if(first){
                throw InvalidSignalAfterAnnotation
            }

            rsignals.push(p)
        }

        if (!annotations.length){
            throw MissingAnnotation
        }

        this.edf = new EdfRecordProcessor(
            startTime,duration, rsignals
        )

        this.annotations = annotations
        this.rsignals    = rsignals
        this.start = startTime
    }

    Process(chunk){

        var current = this.edf.Process(chunk)
        var ann = this.annotations
        var length = ann.length

        for(let i = 0; i < length; i++){

            current += annotations[i].Process(
                chunk.slice(current)
            )

            if(current > length)
        }
    }
}