#!/usr/bin/env node
// Bed-sensor simulator: stands in for the Raspberry Pi + load cells + pulse
// oximeters. Every few seconds it publishes synthetic readings over MQTT using
// the same topics/payloads as the real devices:
//
//   posture/<MAC>    raw posture class 0..4 (backend adds 1 -> 1..5), -1 = lost
//   heartrate/<MAC>  bpm, -1 = lost
//   spo2/<MAC>       %,   -1 = lost
//
// It asks the backend which sensors are installed on which bed (GET /sensors)
// and refreshes that list every 30 s, so beds/sensors you add in the UI start
// "breathing" on their own.
//
// Env: MQTT_URL (mqtt://mosquitto:1883), MQTT_USERNAME, MQTT_PASSWORD,
//      API_URL (http://backend:3000), TICK_MS (3000)
import mqtt from 'mqtt'
import { createBedState, step } from './vitals-model.mjs'

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883'
const API_URL = (process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '')
const TICK_MS = Number(process.env.TICK_MS || 3000)
const TOPIC = { 1: 'posture', 2: 'heartrate', 3: 'spo2' }

const client = mqtt.connect(MQTT_URL, {
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
  clientId: `bed-simulator-${Math.random().toString(16).slice(2, 8)}`,
  reconnectPeriod: 3000,
})
client.on('connect', () => console.log(`[sim] connected to ${MQTT_URL}`))
client.on('error', (e) => console.error(`[sim] mqtt error: ${e.message}`))

// bed_id -> { state, sensors: { 1: mac, 2: mac, 3: mac } }
const beds = new Map()

// small deterministic RNG per bed so each bed has a stable "personality"
function rngFor(n) {
  let a = 0x9e3779b9 ^ n
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function refreshSensors() {
  try {
    const res = await fetch(`${API_URL}/sensors`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const sensors = await res.json()
    const seen = new Set()
    for (const s of sensors) {
      if (!s.bed_id || !TOPIC[s.sensorType_Id]) continue
      seen.add(s.bed_id)
      if (!beds.has(s.bed_id)) {
        const r = rngFor(s.bed_id)
        beds.set(s.bed_id, {
          state: createBedState(
            { bed_id: s.bed_id, hr: 66 + Math.floor(r() * 26), spo2: 94 + Math.floor(r() * 5), restless: [0.02, 0.05, 0.12][s.bed_id % 3] },
            Math.random,
          ),
          sensors: {},
        })
      }
      beds.get(s.bed_id).sensors[s.sensorType_Id] = s.mac
    }
    for (const id of beds.keys()) if (!seen.has(id)) beds.delete(id)
    console.log(`[sim] simulating ${beds.size} beds`)
  } catch (e) {
    console.warn(`[sim] could not load sensors from ${API_URL}: ${e.message} (retrying)`)
  }
}

function tick() {
  if (!client.connected) return
  for (const { state, sensors } of beds.values()) {
    const v = step(state)
    if (sensors[1]) client.publish(`posture/${sensors[1]}`, String(v.posture === -1 ? -1 : v.posture - 1))
    if (sensors[2]) client.publish(`heartrate/${sensors[2]}`, String(v.heartRate))
    if (sensors[3]) client.publish(`spo2/${sensors[3]}`, String(v.spo2))
  }
}

await refreshSensors()
setInterval(refreshSensors, 30_000)
setInterval(tick, TICK_MS)
