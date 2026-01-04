module.exports = function (self) {
  self.setActionDefinitions({
    start: {
      name: 'Start countdown',
      options: [],
      callback: async () => self.sendAction('start'),
    },
    pause: {
      name: 'Pause countdown',
      options: [],
      callback: async () => self.sendAction('pause'),
    },
    reset: {
      name: 'Reset countdown',
      options: [],
      callback: async () => self.sendAction('reset'),
    },
    stop: {
      name: 'Stop countdown',
      options: [],
      callback: async () => self.sendAction('stop'),
    },
    fullscreen: {
      name: 'Toggle fullscreen',
      options: [],
      callback: async () => self.sendAction('fullscreen'),
    },
    health_check: {
      name: 'Health check (refresh supported actions)',
      options: [],
      callback: async () => self.refreshState(),
    },
  })
}
