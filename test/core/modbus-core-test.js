/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018,2019,2020,2021,2022,2023,2024 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

const assert = require('assert')
const coreUnderTest = require('../../src/core/modbus-core')

describe ('Core Testing', function () {
  describe ('Core', function () {

    describe ('Core Simple', function () {
      it('should know function code number of Coil', function (done) {
        assert.strict.equal(coreUnderTest.functionCodeModbusRead('Coil'), 1)
        done()
      })

      it('should know function code number of Input', function (done) {
        assert.strict.equal(coreUnderTest.functionCodeModbusRead('Input'), 2)
        done()
      })

      it('should know function code number of HoldingRegister', function (done) {
        assert.strict.equal(coreUnderTest.functionCodeModbusRead('HoldingRegister'), 3)
        done()
      })

      it('should know function code number of InputRegister', function (done) {
        assert.strict.equal(coreUnderTest.functionCodeModbusRead('InputRegister'), 4)
        done()
      })

      it('should know give default on unknown function code name', function (done) {
        assert.strict.equal(coreUnderTest.functionCodeModbusRead('Coils'), -1)
        done()
      })
    })
  })
})
