const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const UpdatePresets = require('./presets')

/**
 * Bitfocus Companion module: Simple Countdown Timer (control-server.js)
 *
 * Control server API:
 *  - GET  /api/health  -> { ok: true, actions: [...] }
 *  - POST /api/action  -> { action: "start" | "pause" | "reset" | "stop" | "fullscreen" }
 *
 * The timer display listens on WebSocket:
 *  - ws(s)://<host>:<port>/control  (handled by the timer app)
 */
class ModuleInstance extends InstanceBase {
  constructor(internal) {
    super(internal)

    this.state = {
      connected: false,
      lastAction: '',
      lastMessage: '',
      supportedActions: [],
    }

    this._pollTimer = undefined
  }

  async init(config) {
    this.config = config

    this.updateActions()
    this.updateFeedbacks()
    this.updateVariableDefinitions()
    this.updatePresets()

    // Try an immediate health check, then poll
    await this.refreshState()
    this.startPolling()
  }

  async destroy() {
    this.stopPolling()
    this.log('debug', 'destroy')
  }

  async configUpdated(config) {
    this.config = config
    await this.refreshState()
    this.startPolling(true)
  }

  startPolling(reset = false) {
    if (reset) this.stopPolling()
    if (this._pollTimer) return

    // Keep it light – just a periodic /api/health check
    this._pollTimer = setInterval(() => {
      this.refreshState().catch(() => null)
    }, 5000)
  }

  stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer)
      this._pollTimer = undefined
    }
  }

  get baseUrl() {
    const { host, port, ssl } = this.config || {}
    if (!host || !port) return null
    const proto = ssl ? 'https' : 'http'
    return `${proto}://${host}:${port}`
  }

  getConfigFields() {
    return [
      {
        type: 'textinput',
        id: 'host',
        label: 'Control server host',
        width: 8,
        // Allow IPs or hostnames. Companion's built-in Regex has IP and HOSTNAME, but not an "either".
        // We'll validate lightly here and rely on runtime connectivity checks.
        regex: Regex.IP,
        default: '127.0.0.1',
      },
      {
        type: 'textinput',
        id: 'port',
        label: 'Control server port',
        width: 4,
        regex: Regex.PORT,
        default: '3000',
      },
      {
        type: 'checkbox',
        id: 'ssl',
        label: 'Use HTTPS',
        width: 4,
        default: false,
      },
    ]
  }

  /**
   * Generic API request helper (JSON in/out)
   */
  async sendApiRequest(path, { method = 'POST', body } = {}) {
    if (!this.baseUrl) {
      this.updateStatus(InstanceStatus.BadConfig)
      this.state.connected = false
      this.state.lastMessage = 'Host and port are required'
      this.updateVariables()
      this.checkFeedbacks()
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
      } catch (_error) {
        // leave payload as raw text
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`)
      }

      this.state.lastMessage =
        typeof payload === 'object' && payload?.error
          ? String(payload.error)
          : typeof payload === 'object' && payload?.message
            ? String(payload.message)
            : 'OK'

      this.state.connected = true
      this.updateStatus(InstanceStatus.Ok)
      this.updateVariables()
      this.checkFeedbacks()
      return payload
    } catch (error) {
      this.log('error', `Failed to reach countdown control server: ${error.message}`)
      this.state.connected = false
      this.state.lastMessage = error.message
      this.updateStatus(InstanceStatus.ConnectionFailure)
      this.updateVariables()
      this.checkFeedbacks()
      return null
    }
  }

  /**
   * POST an action to the control server
   */
  async sendAction(action) {
    const payload = await this.sendApiRequest('/api/action', {
      method: 'POST',
      body: { action },
    })

    if (payload) {
      this.state.lastAction = action
      this.updateVariables()
      this.checkFeedbacks()
    }

    return payload
  }

  async refreshState() {
    const payload = await this.sendApiRequest('/api/health', { method: 'GET' })
    if (payload && typeof payload === 'object') {
      const actions = Array.isArray(payload.actions) ? payload.actions : []
      this.state.supportedActions = actions
      this.updateVariables()
      this.checkFeedbacks()
    }
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
      connected: this.state.connected ? 'true' : 'false',
      last_action: this.state.lastAction || '',
      supported_actions: (this.state.supportedActions || []).join(', '),
      last_message: this.state.lastMessage || '',
    })
  }

  updatePresets() {
    UpdatePresets(this)
  }
}

runEntrypoint(ModuleInstance, UpgradeScripts)
