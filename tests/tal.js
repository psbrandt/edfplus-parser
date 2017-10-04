'use strict'

const assert = require('assert')
const {tal} = require('../src/index.js')

describe('TalContainerDefinition', function () {
  it('IsTalContainer', function () {
    var mock = {
      OnSet: (onset) => {

      },
      Duration: (duration) => {

      },
      AddAnnotation: (msg) => {

      }
    }

    assert.equal(true, tal.IsTalContainer(mock), 'TalContainer Interface')
  })
})

describe('TalContainer', function () {
  it('IsTalContainer', function () {
    const ctner = new tal.TalContainer()

    assert.equal(true, tal.IsTalContainer(ctner), 'TalContainer implements the interface')
  })

  it('OnSet', function () {
    var ctner = new tal.TalContainer()
    const onset = 1.1

    assert.equal(ctner.offset, 0.0, 'Default tal onset')
    assert.equal(ctner.OnSet(onset), ctner, 'Method Chain')
    assert.equal(ctner.offset, onset, 'Set onset')
  })

  it('Duration', function () {
    var ctner = new tal.TalContainer()
    const duration = 1.1

    assert.equal(ctner.duration, 0.0, 'Default tal duration')
    assert.equal(ctner.Duration(duration), ctner, 'Method Chain')
    assert.equal(ctner.duration, duration, 'Set duration')
  })

  it('Annotations', function () {
    var ctner = new tal.TalContainer()
    const annotations = ['ann1', 'ann2']

    assert.deepStrictEqual(ctner.ann, [], 'Default Empty list')
    assert.equal(ctner.AddAnnotation(annotations[0]), ctner, 'MethodChain')
    ctner.AddAnnotation(annotations[1])
    assert.deepStrictEqual(ctner.ann, annotations)
  })
})

describe('MultiTalContainer', function () {
  it('IsTalContainer', function () {
    const ctner = new tal.MultiTalContainer(
            tal.TalContainer
        )

    assert.equal(true, tal.IsTalContainer(ctner), 'MultiTalContainer implements the interface')
  })

  it('Not container provided', function () {
    assert.throws(() => {
      return new tal.MultiTalContainer({})
    }, Error, 'Invalid container implementation class')
  })

  it('Single Tal', function () {
    const ctner = new tal.MultiTalContainer(
            tal.TalContainer
        )

    const offset = 1.0
    const duration = 1.0
    const msg = 'First Tal'

    assert.equal(ctner.OnSet(offset), ctner, 'Onset method chain')
    assert.equal(ctner.Duration(duration), ctner, 'Duration method chain')
    assert.equal(ctner.AddAnnotation(msg), ctner, 'Duration method chain')

    const list = ctner.Tals()

    assert.equal(list.length, 1, 'Single tal')
    assert((list[0] instanceof tal.TalContainer), true, 'Correnct instance')
    var expected = new tal.TalContainer()

    assert.deepStrictEqual(
            expected.OnSet(offset).Duration(duration).AddAnnotation(msg),
            list[0],
            'Equal tal'
        )
  })
})

describe('Tal Decoder', function () {
  var tests = [
        {input: '+660\x15300\x14Sleep stage N1\x14\x00', length: 25, offset: 660.0, duration: 300.0, annotations: ['Sleep stage N1']},
        {input: '+0\x14\x14Recording starts\x14\x00', length: 22, offset: 0.0, duration: null, annotations: ['', 'Recording starts']},
        {input: '+1019.4\x150.8\x14Limb movement\x14R leg\x14\x00', length: 33, offset: 1019.4, duration: 0.8, annotations: ['Limb movement', 'R leg']},
        {input: '-302102\x14Recording ends\x14\x00\x00\x00\x00\x00', length: 24, offset: -302102, duration: null, annotations: ['Recording ends']}
  ]

  tests.forEach(function (test, index) {
    it('Tal decoder test ' + test.input, function () {
      var container = new tal.TalContainer()
      const used = tal.TalDecoder(Buffer.from(test.input), container)

      assert.equal(used, test.length, 'Parsed amount of bytes')
      assert.equal(container.offset, test.offset, 'Tal offset')
      assert.equal(container.duration, test.duration, 'Tal duration')
      assert.deepStrictEqual(container.ann, test.annotations, 'Tal annotations')
    })
  })

  it('Only 0s', function () {
    var container = new tal.MultiTalContainer(tal.TalContainer)
    const input = Buffer.from('\x00\x00\x00\x00\x00\x00')

    const used = tal.TalDecoder(input, container)
    assert.equal(used, 6)
    assert.equal(0, container.Tals().length)
  })

  var bad = [
        {input: '*660\x15300\x14Sleep stage N1\x14\x00', error: 'Missing onset sign prefix'},
        {input: '+660', error: 'Invalid Tal'},
        {input: '+660\x00', error: 'Invalid Tal'},
        {input: '+abc\x15', error: 'Invalid Tal'},
        {input: '+123\x15\x00', error: 'Invalid Tal'},
        {input: '+123\x15abc\x14', error: 'Invalid Tal'},
        {input: '+123\x15123\x14', error: 'Invalid Tal'},
        {input: '+123\x15123', error: 'Invalid Tal'}
  ]

  bad.forEach(function (test, index) {
    it('Bad Tal decoder test ' + test.input, function () {
      assert.throws(
                () => {
                  tal.TalDecoder(Buffer.from(test.input), new tal.TalContainer())
                },
                Error, test.error
            )
    })
  })
})
