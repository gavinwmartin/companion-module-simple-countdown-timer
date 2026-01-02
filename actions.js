module.exports = function (self) {
  self.setActionDefinitions({
    start_timer: {
      name: 'Start / Resume timer',
      callback: async () => {
        const response = await self.sendApiRequest('/api/start')
        self.applyStateFromResponse(response)
      },
    },
    pause_timer: {
      name: 'Pause timer',
      callback: async () => {
        const response = await self.sendApiRequest('/api/pause')
        self.applyStateFromResponse(response)
      },
    },
    reset_timer: {
      name: 'Reset timer',
      callback: async () => {
        const response = await self.sendApiRequest('/api/reset')
        self.applyStateFromResponse(response)
      },
    },
    set_duration: {
      name: 'Set duration (seconds)',
      options: [
        {
          id: 'seconds',
          type: 'number',
          label: 'Seconds',
          default: 300,
          min: 1,
        },
      ],
      callback: async (event) => {
        const response = await self.sendApiRequest('/api/duration', {
          body: { seconds: event.options.seconds },
        })
        self.applyStateFromResponse(response)
      },
    },
    set_label: {
      name: 'Set label',
      options: [
        {
          id: 'label',
          type: 'textinput',
          label: 'Label',
          default: '',
        },
      ],
      callback: async (event) => {
        const response = await self.sendApiRequest('/api/label', {
          body: { label: event.options.label },
        })
        self.applyStateFromResponse(response)
      },
    },
    refresh_status: {
      name: 'Refresh status',
      callback: async () => self.refreshState(),
    },
  })
}
