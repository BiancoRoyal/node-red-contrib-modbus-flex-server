const helperExtensions = require('../../helper/test-helper-extensions')

const TEST_PORT = 8521

const e2eFlexServerFlow = helperExtensions.cleanFlowPositionData([
  {
    id: 'tab1',
    type: 'tab',
    label: 'E2E Flex Server',
    disabled: false,
    info: '',
    env: []
  },
  {
    id: 'server1',
    type: 'modbus-flex-server',
    z: 'tab1',
    name: 'ModbusFlexServer-E2E',
    logEnabled: false,
    serverAddress: '127.0.0.1',
    serverPort: TEST_PORT,
    responseDelay: 50,
    unitId: 1,
    delayUnit: 'ms',
    coilsBufferSize: 1000,
    registersBufferSize: 1000,
    minAddress: 0,
    splitAddress: 100,
    funcGetCoil: 'function getFlexCoil(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}',
    funcGetDiscreteInput: 'function getFlexDiscreteInput(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}',
    funcGetInputRegister: 'function getFlexInputRegister(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}',
    funcGetHoldingRegister: 'function getFlexHoldingRegsiter(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}',
    funcSetCoil: 'function setFlexCoil(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.coils.writeUInt8(value, addr * node.bufferFactor)  \n\t} \n}',
    funcSetRegister: 'function setFlexRegister(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.registers.writeUInt16BE(value, addr * node.bufferFactor)  \n\t} \n}',
    showErrors: true,
    wires: [[], [], [], [], []]
  }
])

module.exports = {
  TEST_PORT,
  e2eFlexServerFlow
}
