const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')

class ModuleInstance extends InstanceBase {
  constructor(internal) {
    super(internal)
    this.state = {
      status: 'unknown',
      remainingSeconds: null,
      label: '',
      lastMessage: '',
    }
  }

  async init(config) {
    this.config = config

    this.updateStatus(InstanceStatus.Ok)

    this.updateActions()
    this.updateFeedbacks()
    this.updateVariableDefinitions()
    await this.refreshState()
  }

  async destroy() {
    this.log('debug', 'destroy')
  }

  async configUpdated(config) {
    this.config = config
    await this.refreshState()
  }

  get baseUrl() {
    const { host, port } = this.config || {}
    if (!host || !port) return null
    return `http://${host}:${port}`
  }

  getConfigFields() {
    return [
      {
        type: 'textinput',
        id: 'host',
        label: 'Timer Host',
        width: 8,
        regex: Regex.IP,
        default: '127.0.0.1',
      },
      {
        type: 'textinput',
        id: 'port',
        label: 'Timer Port',
        width: 4,
        regex: Regex.PORT,
        default: '3000',
      },
    ]
  }

  async sendApiRequest(path, { method = 'POST', body } = {}) {
    if (!this.baseUrl) {
      this.updateStatus(InstanceStatus.BadConfig)
      this.log('warn', 'Host and port are required before sending commands')
      return null
    }

    const headers = {}
    let requestBody = undefined

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
      requestBody = JSON.stringify(body)
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: requestBody,
      })

      const text = await response.text()
      let payload = text

      try {
        payload = text ? JSON.parse(text) : null
      } catch (error) {
        // leave payload as raw text
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`)
      }

      this.state.lastMessage =
        typeof payload === 'object' && payload?.message
          ? payload.message
          : typeof payload === 'string'
            ? payload
            : 'Request completed'
      this.updateStatus(InstanceStatus.Ok)
      this.updateVariables()
      return payload
    } catch (error) {
      this.log('error', `Failed to reach timer API: ${error.message}`)
      this.state.lastMessage = error.message
      this.updateStatus(InstanceStatus.ConnectionFailure)
      this.updateVariables()
      return null
    }
  }

  applyStateFromResponse(response) {
    if (!response || typeof response !== 'object') return

    const status = response.state ?? response.status ?? this.state.status
    const remainingSeconds =
      response.remainingSeconds ?? response.remaining ?? response.secondsRemaining ?? this.state.remainingSeconds
    const label = response.label ?? response.title ?? this.state.label

    this.state = {
      ...this.state,
      status,
      remainingSeconds,
      label,
    }

    this.updateVariables()
    this.checkFeedbacks()
  }

  async refreshState() {
    const payload = await this.sendApiRequest('/api/status', { method: 'GET' })
    this.applyStateFromResponse(payload)
  }

  updateActions() {
    UpdateActions(this)
  }

  updateFeedbacks() {
    UpdateFeedbacks(this)
  }

  updateVariableDefinitions() {
    UpdateVariableDefinitions(this)
  }

  updateVariables() {
    this.setVariableValues({
      status: this.state.status,
      remaining_seconds: this.state.remainingSeconds ?? '',
      label: this.state.label,
      last_message: this.state.lastMessage,
    })
  }
}

runEntrypoint(ModuleInstance, UpgradeScripts)
