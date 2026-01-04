module.exports = function (self) {
  self.setVariableDefinitions([
    { variableId: 'connected', name: 'Connected (true/false)' },
    { variableId: 'last_action', name: 'Last action sent' },
    { variableId: 'supported_actions', name: 'Supported actions (from /api/health)' },
    { variableId: 'last_message', name: 'Last status / error message' },
  ])
}
