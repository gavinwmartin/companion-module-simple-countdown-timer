const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
  self.setFeedbackDefinitions({
    timer_running: {
      name: 'Timer running',
      type: 'boolean',
      defaultStyle: {
        bgcolor: combineRgb(0, 200, 0),
        color: combineRgb(0, 0, 0),
      },
      options: [],
      callback: () => self.state.status === 'running',
    },
    timer_finished: {
      name: 'Timer finished',
      type: 'boolean',
      defaultStyle: {
        bgcolor: combineRgb(255, 0, 0),
        color: combineRgb(255, 255, 255),
      },
      options: [],
      callback: () => self.state.status === 'finished' || self.state.remainingSeconds === 0,
    },
  })
}
