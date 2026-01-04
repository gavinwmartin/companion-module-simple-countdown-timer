const { combineRgb } = require('@companion-module/base')

module.exports = function (self) {
	const presets = {}

	// Colors
	const white = combineRgb(255, 255, 255)
	const black = combineRgb(0, 0, 0)
	const grey = combineRgb(50, 50, 50)

	const green = combineRgb(0, 170, 0)
	const amber = combineRgb(255, 170, 0)
	const red = combineRgb(200, 0, 0)
	const blue = combineRgb(0, 90, 200)

	// Helper to build a simple action button
	const makeButton = (id, category, label, emoji, bgcolor, actionId) => {
		presets[id] = {
			type: 'button',
			category,
			name: label,
			style: {
				text: `${emoji}\n${label.toUpperCase()}`,
				size: '18',
				color: white,
				bgcolor,
			},
			steps: [
				{
					down: [{ actionId, options: {} }],
					up: [],
				},
			],
			feedbacks: [
				// If disconnected, make the button obviously "not ready"
				{
					feedbackId: 'disconnected',
					style: {
						color: white,
						bgcolor: grey,
					},
				},
			],
		}
	}

	// Transport controls
	makeButton('timer-start', 'Timer', 'Start', '▶', green, 'start')
	makeButton('timer-pause', 'Timer', 'Pause', '⏸', amber, 'pause')
	makeButton('timer-stop', 'Timer', 'Stop', '⏹', red, 'stop')
	makeButton('timer-reset', 'Timer', 'Reset', '↺', blue, 'reset')

	// Display
	makeButton('timer-fullscreen', 'Display', 'Fullscreen', '⛶', black, 'fullscreen')

	// Utility
	presets['timer-health'] = {
		type: 'button',
		category: 'Utility',
		name: 'Health check',
		style: {
			text: `🩺\nHEALTH`,
			size: '18',
			color: white,
			bgcolor: black,
		},
		steps: [
			{
				down: [{ actionId: 'health_check', options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	// Status button (no actions, just shows variables)
	// Note: variable token uses the instance label in Companion, so the user may need to adjust the prefix.
	// Many people just use “Internal: variables” on a separate button anyway, but this is a handy preset.
	presets['timer-status'] = {
		type: 'button',
		category: 'Utility',
		name: 'Status',
		style: {
			text: `STATUS\n$(simple-countdown:connected)\n$(simple-countdown:last_message)`,
			size: '14',
			color: white,
			bgcolor: black,
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'connected',
				style: {
					color: black,
					bgcolor: green,
				},
			},
			{
				feedbackId: 'disconnected',
				style: {
					color: white,
					bgcolor: red,
				},
			},
		],
	}

	self.setPresetDefinitions(presets)
}
