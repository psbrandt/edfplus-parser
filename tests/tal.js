'use strict'

const assert = require('assert')
const tal    = require('../src/tal.js')


describe("TalContainerDefinition", function(){

    it("IsTalContainer", function(){

        var mock = {
            OnSet: (onset) => {

            },
            Duration: (duration) => {

            },
            AddAnnotation: (msg) => {

            },
        }

        assert.equal(true, tal.IsTalContainer(mock),"TalContainer Interface")

    })
})


describe("TalContainer", function(){

    it("IsTalContainer", function(){
        const ctner = new tal.TalContainer()

        assert.equal(true, tal.IsTalContainer(ctner),"TalContainer implements the interface")
    })

    it("OnSet", function(){

        var ctner = new tal.TalContainer()
        const onset = 1.1

        assert.equal(ctner.offset,0.0, "Default tal onset")
        assert.equal(ctner.OnSet(onset),ctner,"Method Chain")
        assert.equal(ctner.offset,onset ,"Set onset")

    })


    it("Duration", function(){

        var ctner = new tal.TalContainer()
        const duration = 1.1

        assert.equal(ctner.duration,0.0,"Default tal duration")
        assert.equal(ctner.Duration(duration),ctner ,"Method Chain")
        assert.equal(ctner.duration,duration,"Set duration")

    })

    it("Annotations", function(){

        var ctner = new tal.TalContainer()
        const annotations = ["ann1","ann2"]

        assert.deepStrictEqual(ctner.ann,[],"Default Empty list")
        assert.equal(ctner.AddAnnotation(annotations[0]),ctner,"MethodChain")
        ctner.AddAnnotation(annotations[1])
        assert.deepStrictEqual(ctner.ann, annotations)
    })
})


describe("MultiTalContainer", function(){

    it("IsTalContainer", function(){
        const ctner = new tal.MultiTalContainer(
            tal.TalContainer
        )

        assert.equal(true, tal.IsTalContainer(ctner),"MultiTalContainer implements the interface")
    })


    it("Single Tal", function(){
        const ctner = new tal.MultiTalContainer(
            tal.TalContainer
        )

        const offset = 1.0
        const duration = 1.0
        const msg  = "First Tal"

        assert.equal(ctner.OnSet(offset),ctner, "Onset method chain")
        assert.equal(ctner.Duration(duration), ctner, "Duration method chain")
        assert.equal(ctner.AddAnnotation(msg), ctner, "Duration method chain")

        const list = ctner.Tals()

        assert.equal(list.length, 1,"Single tal")
        assert((list[0] instanceof tal.TalContainer), true,"Correnct instance")

        const t = list[0]

        assert.equal(t.offset, offset)
        assert.equal(t.duration, duration)
        assert.deepStrictEqual(t.ann, [msg])
    })
})
