// Synthetic vital-sign model shared by the MQTT simulator (self-host) and the
// in-browser demo (frontend src/demo/vitalsModel.ts is a TypeScript copy of this file;
// keep the two in sync).
//
// Values are synthetic, not recorded patient data. Each bed drifts around a
// baseline with occasional excursions so the alert pipeline has something to do:
//   posture   1 = out of bed, 2 = sitting, 3 = left, 4 = back, 5 = right
//   heartRate bpm, occasionally < 60 or > 100
//   spo2      %, occasionally < 92
//   any channel can briefly read -1 (sensor disconnected)

export function createBedState(profile, rand = Math.random) {
  return {
    bed_id: profile.bed_id,
    hr: profile.hr,
    spo2: profile.spo2,
    baseHr: profile.hr,
    baseSpo2: profile.spo2,
    restless: profile.restless,
    posture: 3 + Math.floor(rand() * 3),
    excursion: null, // { channel, ticksLeft }
    rand,
  }
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

/** Advance one tick (~3 s). Returns { posture, heartRate, spo2 } (-1 = disconnected). */
export function step(s) {
  const r = s.rand

  // posture: lying patients turn now and then; restless ones sit up / leave the bed
  if (s.posture >= 3) {
    const x = r()
    if (x < s.restless * 0.35) s.posture = 1
    else if (x < s.restless) s.posture = 2
    else if (x < s.restless + 0.04) s.posture = 3 + Math.floor(r() * 3)
  } else if (r() < 0.25) {
    s.posture = s.posture === 1 ? 2 : 3 + Math.floor(r() * 3)
  }

  // start an excursion occasionally
  if (!s.excursion && r() < 0.015) {
    const channel = ['hr_high', 'hr_low', 'spo2_low', 'disconnect'][Math.floor(r() * 4)]
    s.excursion = { channel, ticksLeft: 4 + Math.floor(r() * 8) }
  }

  let hrTarget = s.baseHr
  let spo2Target = s.baseSpo2
  let disconnected = false
  if (s.excursion) {
    const e = s.excursion
    if (e.channel === 'hr_high') hrTarget = 112 + r() * 15
    if (e.channel === 'hr_low') hrTarget = 48 + r() * 8
    if (e.channel === 'spo2_low') spo2Target = 86 + r() * 4
    if (e.channel === 'disconnect') disconnected = true
    if (--e.ticksLeft <= 0) s.excursion = null
  }
  if (s.posture === 1) hrTarget += 8 // getting up raises the heart rate a little

  s.hr = clamp(s.hr + (hrTarget - s.hr) * 0.35 + (r() - 0.5) * 3, 35, 160)
  s.spo2 = clamp(s.spo2 + (spo2Target - s.spo2) * 0.4 + (r() - 0.5) * 0.8, 80, 100)

  const lost = disconnected ? ['posture', 'hr', 'spo2'][s.bed_id % 3] : null
  return {
    posture: lost === 'posture' ? -1 : s.posture,
    heartRate: lost === 'hr' ? -1 : Math.round(s.hr),
    spo2: lost === 'spo2' ? -1 : Math.round(s.spo2),
  }
}
