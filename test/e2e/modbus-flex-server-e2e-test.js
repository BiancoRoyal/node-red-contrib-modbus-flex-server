/**
 * End-to-end test to ensure the Modbus Flex Server stays up when a client
 * disconnects with an error (ECONNRESET-like abrupt close).
 */

'use strict'

const net = require('net')
const serverNode = require('../../src/modbus-flex-server.js')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const e2eFlows = require('./flows/modbus-flex-server-e2e-flows')

const TEST_PORT = e2eFlows.TEST_PORT
const flow = e2eFlows.e2eFlexServerFlow

function connectAndAbruptlyClose (port) {
  return new Promise((resolve, reject) => {
    const sock = new net.Socket()
    let connected = false

    sock.once('error', (err) => {
      // When we destroy with an error below, the client gets an error event too
      // We only reject if we never managed to connect
      if (!connected) reject(err)
    })

    sock.connect({ host: '127.0.0.1', port }, () => {
      connected = true
      // Immediately destroy the socket with an error to simulate ECONNRESET-like behavior
      sock.destroy(new Error('e2e test forced disconnect'))
      // Give the server a tick to process the error/close
      setTimeout(resolve, 50)
    })
  })
}

function canConnect (port) {
  return new Promise((resolve, reject) => {
    const sock = new net.Socket()
    let timer

    sock.once('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })

    sock.connect({ host: '127.0.0.1', port }, () => {
      clearTimeout(timer)
      // Success: server still accepts connections
      sock.end(() => resolve(true))
    })

    // Safety timeout in case connect hangs
    timer = setTimeout(() => {
      try { sock.destroy() } catch (e) {}
      reject(new Error('connect timeout'))
    }, 1000)
  })
}

describe('Flex Server E2E', function () {
  // E2E may take a bit longer on CI
  this.timeout(5000)

  before(function (done) {
    helper.startServer(function () { done() })
  })

  afterEach(function (done) {
    helper.unload().then(function () { done() }).catch(function () { done() })
  })

  after(function (done) {
    helper.stopServer(function () { done() })
  })

  it('keeps serving after abrupt client disconnect (no crash on ECONNRESET-like)', async function () {
    await new Promise((resolve, reject) => {
      helper.load([serverNode], flow, function () { resolve() }, function () { /* log cb */ })
    })

    const node = helper.getNode('server1')
    node.should.have.property('modbusServer')

    // Wait briefly to ensure listener is up
    await new Promise((r) => setTimeout(r, 100))

    // 1) Connect and force an error-disconnect
    await connectAndAbruptlyClose(TEST_PORT)

    // 2) Verify we can connect again afterwards
    const ok = await canConnect(TEST_PORT)
    ok.should.equal(true)

    // 3) Optional sanity: listener still marked listening
    if (node.modbusServer && node.modbusServer._server) {
      node.modbusServer._server.listening.should.equal(true)
    }
  })

  it('restarts on fatal listener error (EBADF) and stays available', async function () {
    await new Promise((resolve, reject) => {
      helper.load([serverNode], flow, function () { resolve() }, function () { /* log cb */ })
    })

    const node = helper.getNode('server1')
    node.should.have.property('modbusServer')

    // Wait briefly to ensure listener is up
    await new Promise((r) => setTimeout(r, 100))

    const oldRef = node.modbusServer
    oldRef.should.be.ok()
    oldRef.should.have.property('_server')

    // Simulate a fatal listener error on the underlying net.Server
    const fatalErr = new Error('simulated fatal listener error')
    fatalErr.code = 'EBADF'
    oldRef._server.emit('error', fatalErr)

    // Wait for restart to occur (new server object and listening)
    async function waitForRestart (node, oldRef, timeoutMs = 2000) {
      const start = Date.now()
      while (Date.now() - start < timeoutMs) {
        if (node.modbusServer && node.modbusServer !== oldRef) {
          try {
            if (node.modbusServer._server && node.modbusServer._server.listening) {
              return true
            }
          } catch (e) {}
        }
        await new Promise((r) => setTimeout(r, 25))
      }
      return false
    }

    const restarted = await waitForRestart(node, oldRef, 3000)
    restarted.should.equal(true)

    // Verify we can connect after restart
    const ok2 = await canConnect(TEST_PORT)
    ok2.should.equal(true)
  })
})
