'use strict'

const tals = require('./tals.js')
const InvalidHeader = new Error('Invalid Annotation signal header')
const IncompleteSignalData = new Error('Signal data incomplete')
const ANNOTATION_LABEL = 'EDF Annotations'
const DEFAULT_DMAX = 32767
const DEFAULT_DMIN = -32768

var AnnotationProcessor = class {

    construct(header){

        if(!IsValidHeader(header)){
            throw InvalidHeader
        }

        this.header = header
        this.container = null
    }


    Process(chunk){

        const toProcess = this.Samples() * 2
        var container = new tals.MultiTalContainer()

        if (chunk.length < toProcess) {
          throw IncompleteSignalData
        }

        this.container = container
        var total  = 0

        while(total < toProcess){

            let decoded = tals.TalDecode(
                chunk.slice(total), container
            )

            total += decoded
        }

        return total
    }

    Tals(){
        if(null === this.container){
            return []
        }

        return this.container.Tals()
    }


}

function IsProcessor(){
    return (
        obj.OnSet && (obj.Process instanceof Function) &&
        obj.Duration && (obj.Tals instanceof Function)
  )
}


function IsValidHeader(header){

    return (
        ANNOTATION_LABEL == header.Label &&
        header.Samples > 0 &&
        header.DigitalMax == DEFAULT_DMAX &&
        header.DigitalMin == DEFAULT_DMIN &&
        header.PhysicalMax != header.PhysicalMin
    )
}

module.exports = {
    AnnotationProcessor,
    IsProcessor,
    IsValidHeader
}


