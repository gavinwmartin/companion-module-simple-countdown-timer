const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
  self.setFeedbackDefinitions({
    connected: {
      name: 'Connected to control server',
      type: 'boolean',
      defaultStyle: {
        bgcolor: combineRgb(0, 200, 0),
        color: combineRgb(0, 0, 0),
      },
      options: [],
      callback: () => !!self.state.connected,
    },
    disconnected: {
      name: 'Disconnected from control server',
      type: 'boolean',
      defaultStyle: {
        bgcolor: combineRgb(200, 0, 0),
        color: combineRgb(255, 255, 255),
      },
      options: [],
      callback: () => !self.state.connected,
    },
  })
}
