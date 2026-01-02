module.exports = function (self) {
  self.setVariableDefinitions([
    { variableId: 'status', name: 'Timer status' },
    { variableId: 'remaining_seconds', name: 'Remaining seconds' },
    { variableId: 'label', name: 'Timer label' },
    { variableId: 'last_message', name: 'Last response message' },
  ])
}
