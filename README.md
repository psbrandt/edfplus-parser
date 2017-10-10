# EDF+ Parser

Package to parse/process EDF+ file as detailed on the [specification](http://www.edfplus.info/specs/edfplus.html)

The implementation api follows the same idea & components as  package [edf-parser](https://www.npmjs.com/package/edf-parser)
but they have been extended here to support the EDF+ specs.

Until documentation is completed on this package, you can refer to the edf-parser documentation and
follow the guidelines on **sample/sample.js**

##EDF+ Annotations
This package introduces a new type of signal processor class
implementing the Annotations behaviors

##Tals
Time-stamped annotation list (TAL) implementation is also introduced
in this package and they form the core of EDF+ Annotations implementation
