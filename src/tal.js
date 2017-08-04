'use strict'

const NotContainerImplementation = new Error('Invalid container implementation class')
const InvalidOnSetPrefix         = new Error('Missing onset sign prefix')
const InvalidTal                 = new Error('Invalid Tal')

/*Time and duration separator ASCII 21*/
const TIME_SEP = '\x15'
/*Annotation separator ASCII 20*/
const ANN_SEP = '\x14'
/*Annotation en*/
const ANN_ENCODING = 'utf8'
/*End of tal mark ASCII 0*/
const EOT     = '\x00'

/*Internal TAL parsing states*/
const STATE_START = 0
const STATE_ONSET = 1



var TalContainer = class {

    constructor(){
        this.offset = 0.0
        this.duration = 0.0
        this.ann = []
    }

    OnSet(offset){
        this.offset = offset
        return this
    }

    Duration(duration){
        this.duration = duration
        return this
    }

    AddAnnotation(msg){
        this.ann.push(msg)
        return this
    }
}

var MultiTalContainer = class{

    constructor(container){


        if(!IsTalContainer(container.prototype)){
            throw NotContainerImplementation
        }

        this.container = container
        this.list    = []
        this.current = null
    }

    OnSet(offset){

        this.current = new this.container

        this.list.push(
            this.current
        )

        this.current.OnSet(offset)
        return this;
    }

    Duration(duration){
        this.current.Duration(duration)
        return this
    }

    AddAnnotation(text){
        this.current.AddAnnotation(text)
        return this
    }

    Tals(){
        return this.list
    }
}


function IsTalContainer(obj){
    return (
        obj.OnSet && (obj.OnSet instanceof Function) &&
        obj.Duration && (obj.Duration instanceof Function) &&
        obj.AddAnnotation && (obj.AddAnnotation instanceof Function)
    )
}


/*
    Given a source array and a container implementation
    decode the first TAL and return
*/
function TalDecoder(source, container){

    var current = 0
    const length = source.length

    while( current == EOT && current < length){
        current++
    }

    if(length == current){
        return current
    }

    //onset
    const sign = source[ current++ ]
    if(sign != '-' && sign != '+'){
        throw InvalidOnSetPrefix
    }

    var next = nextToken(source, current)
    if(false == next || source[next] == EOT){
        throw InvalidTal
    }

    var offset = parseFloat(
        source.toString('ascii',current, next)
    )

    if(isNaN(offset)){
        throw InvalidTal
    }

    if(sign == '-'){
        offset *= -1
    }
    current = next

    //duration
    var duration = null
    if(source[current++] == TIME_SEP){
        next = nextToken(source, current)
        if(false == next || source[next] == ANN_SEP){
            throw InvalidTal
        }

        duration = parseFloat(
            source.toString('ascii',current, next)
        )

        if(isNaN(offset)){
            throw InvalidTal
        }

        current = next + 1
    }

    container.OnSet(offset)
    container.Duration(duration)

    //annotations
    while( ANN_SEP == (next = nextToken(source, current)) ){

        container.AddAnnotation(
            source.slice(current, next)
        )

        current = next+1
    }

    if(next == false || source[next] != EOT){
        throw InvalidTal
    }

    return next + 1

}


function nextToken(source, start){

    var pos = start
    const len = source.length
    while(pos < start.length){

        const at = source[pos]
        if(
            TIME_SEP == at ||
            ANN_SEP  == at ||
            EOT      == at
        ){
            return pos
        }

        pos++
    }

    return false
}

module.exports = {
    IsTalContainer,
    TalDecoder,
    MultiTalContainer,
    TalContainer
}
