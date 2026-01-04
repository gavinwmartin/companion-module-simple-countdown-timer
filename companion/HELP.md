## Simple Countdown Timer

This module connects Bitfocus Companion to the [simple-countdown-timer](https://github.com/gavinwmartin/simple-countdown-timer-server) HTTP server. Configure the host and port for the timer in the module settings (defaults to `127.0.0.1` and `3000`).

The module expects the timer to expose these endpoints:

- `GET /api/status` → returns JSON containing `status`, `remainingSeconds`, and `label`.
- `POST /api/start` → starts or resumes the timer.
- `POST /api/pause` → pauses the timer.
- `POST /api/reset` → resets the timer to the configured duration.
- `POST /api/duration` with `{ "seconds": <number> }` → sets the countdown length.
- `POST /api/label` with `{ "label": "<text>" }` → updates the timer label.

### Actions
- **Start / Resume timer** — POST `/api/start`.
- **Pause timer** — POST `/api/pause`.
- **Reset timer** — POST `/api/reset`.
- **Set duration (seconds)** — POST `/api/duration` with a new length in seconds.
- **Set label** — POST `/api/label` to update the visible label.
- **Refresh status** — GET `/api/status` to sync Companion variables/feedbacks.

### Feedbacks
- **Timer running** — True when the timer status is `running`.
- **Timer finished** — True when the status is `finished` or remaining seconds reach `0`.

### Variables
- `status` — Latest timer status returned by the API.
- `remaining_seconds` — Remaining seconds reported by the timer.
- `label` — Current timer label.
- `last_message` — Last response message or error text received from the API.
