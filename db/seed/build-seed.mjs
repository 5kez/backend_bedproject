#!/usr/bin/env node
// Builds the fictional demo dataset used by BOTH:
//   - db/init/02-seed.sql            (self-hosted stack: MySQL initdb)
//   - db/seed/demo-dataset.json      (copied into the frontend's in-browser demo)
//
// Every person, ID number, phone number and MAC address here is invented.
// Dates are stored relative to "now" ({ $ago: minutes }) so the demo always
// looks fresh: the SQL uses NOW() - INTERVAL n MINUTE, the browser demo uses
// Date.now() at the moment the visitor first loads it.
//
// Usage: node db/seed/build-seed.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

// ---------- deterministic RNG so every run produces the same dataset ----------
let seed = 20251108
function rand() {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const int = (a, b) => a + Math.floor(rand() * (b - a + 1))
const ago = (minutes) => ({ $ago: Math.max(0, Math.round(minutes)) })
const DAY = 24 * 60

// bcrypt hash of "demo1234" (all demo accounts share it)
const DEMO_PASSWORD_HASH = '$2b$10$D2ryOPoKTR2ytYWI92jbwu/rZ6ZgVE5qSi6yYPBTBUn6cObJmMX1a'

const t = {}

// ---------- reference data ----------
t.province = [
  [1, '10', 'Bangkok', 'กรุงเทพมหานคร', 2],
  [2, '20', 'Chon Buri', 'ชลบุรี', 6],
  [3, '21', 'Rayong', 'ระยอง', 6],
  [4, '24', 'Chachoengsao', 'ฉะเชิงเทรา', 6],
  [5, '50', 'Chiang Mai', 'เชียงใหม่', 1],
  [6, '40', 'Khon Kaen', 'ขอนแก่น', 3],
  [7, '90', 'Songkhla', 'สงขลา', 4],
  [8, '30', 'Nakhon Ratchasima', 'นครราชสีมา', 3],
].map(([id, prov_code, prov_name, prov_name_th, geo_id]) => ({
  province_id: id, prov_code, prov_name, prov_name_th, hash: null, remark: null,
  created_at: ago(400 * DAY), updated_at: ago(400 * DAY), geo_id,
}))

t.sites_type = [
  { site_type_id: 1, name: 'โรงพยาบาล', remark: 'Hospital', created_at: ago(400 * DAY), updated_at: ago(400 * DAY) },
  { site_type_id: 2, name: 'คลินิก', remark: 'Clinic', created_at: ago(400 * DAY), updated_at: ago(400 * DAY) },
  { site_type_id: 3, name: 'สถานดูแลผู้สูงอายุ', remark: 'Nursing home', created_at: ago(400 * DAY), updated_at: ago(400 * DAY) },
]

t.sites = [
  {
    site_id: 1, sites_name: 'โรงพยาบาลสาธิตชายฝั่ง', lat: 13.2835, lng: 100.9241,
    address: '99/9 ถนนตัวอย่าง ตำบลสาธิต อำเภอเมือง จังหวัดชลบุรี 20000 (ที่อยู่สมมติ)',
    sites_type_id: 1, prov_id: 2, created_at: ago(300 * DAY), updated_at: ago(300 * DAY),
    site_global: 1, name_img: null,
  },
]

t.building = [
  { building_id: 1, build_name: 'อาคารผู้ป่วยใน A', lat: 13.2838, lng: 100.9236, site_id: 1, global_id: 1, floor_count: 2, created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
  { building_id: 2, build_name: 'อาคารผู้สูงอายุ B', lat: 13.2829, lng: 100.9249, site_id: 1, global_id: 2, floor_count: 1, created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
]

t.floor = [
  { floor_id: 1, floor_name: 'ชั้น 1', floor_name_en: 'Floor 1', remark: null, created_at: ago(300 * DAY), updated_at: ago(300 * DAY), building_id: 1 },
  { floor_id: 2, floor_name: 'ชั้น 2', floor_name_en: 'Floor 2', remark: null, created_at: ago(300 * DAY), updated_at: ago(300 * DAY), building_id: 1 },
  { floor_id: 3, floor_name: 'ชั้น 1', floor_name_en: 'Floor 1', remark: null, created_at: ago(300 * DAY), updated_at: ago(300 * DAY), building_id: 2 },
]

t.departments = [
  { department_id: 1, department_name: 'อายุรกรรม', created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
  { department_id: 2, department_name: 'ศัลยกรรม', created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
  { department_id: 3, department_name: 'ผู้สูงอายุ', created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
]

// department_building = a ward: one department on one floor of a building
t.department_building = [
  { department_building_id: 1, department_id: 1, building_id: 1, floor_id: 1, floor_number: 1, created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
  { department_building_id: 2, department_id: 2, building_id: 1, floor_id: 2, floor_number: 2, created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
  { department_building_id: 3, department_id: 3, building_id: 2, floor_id: 3, floor_number: 1, created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
]
const WARD = { 1: { dept: 1, floor: 1, building: 1 }, 2: { dept: 2, floor: 2, building: 1 }, 3: { dept: 3, floor: 3, building: 2 } }

// role ids are hard-coded throughout the frontend (LoginPage, MainLayout)
t.roles = [
  [1, 'พยาบาล', 'Nurse — monitors patients in own department', 'US'],
  [2, 'ผู้ดูแลระบบ', 'Admin — manages users, locations, sensors', 'AD'],
  [3, 'ผู้ดูแลระบบสูงสุด', 'Super admin — everything', 'SA'],
  [4, 'ประชาสัมพันธ์', 'Reception — registers patients', 'RC'],
  [5, 'ช่างเทคนิค', 'Technician — manages sensors', 'TC'],
].map(([role_id, roles_name, description, roles_code]) => ({
  role_id, roles_name, description, roles_code,
  created_at: '2025-01-01 00:00:00', updated_at: '2025-01-01 00:00:00',
}))

// ---------- staff (all fictional) ----------
const staff = [
  // user_name,  first,     last,         role, dept, ward/building
  ['nurse', 'มาลี', 'ใจดี', 1, 1, 1],
  ['nurse2', 'สมศรี', 'รักษ์ไข้', 1, 2, 1],
  ['nurse3', 'วิภา', 'อุ่นใจ', 1, 3, 2],
  ['admin', 'ปกรณ์', 'จัดระบบ', 2, 1, 1],
  ['superadmin', 'ธนา', 'สูงสุด', 3, 1, 1],
  ['reception', 'อรุณี', 'ต้อนรับ', 4, 1, 1],
  ['tech', 'กิตติ', 'ช่างซ่อม', 5, 1, 1],
]
const roleCode = Object.fromEntries(t.roles.map((r) => [r.role_id, r.roles_code]))
t.profile = []
t.user = []
staff.forEach(([user_name, name, last, role, dept, building], i) => {
  const id = i + 1
  t.profile.push({
    profile_id: id, name, surname: last, email: `${user_name}@demo.invalid`, line_id: `demo_${user_name}`,
    photo: '', site_id: 1, created_at: ago(200 * DAY), updated_at: ago(200 * DAY),
  })
  t.user.push({
    user_id: id, profile_id: id, site_id: 1, user_name, user_password: DEMO_PASSWORD_HASH,
    name, last_name: last, build_id: building, status: '1', role_id: role,
    roles_code: roleCode[role], department_id: dept, floor_id: WARD[dept].floor,
  })
})

t.sensor_type = [
  { sensor_type_id: 1, name: 'BedSensor', desc: 'Load-cell bed sensor (posture / bed exit)', created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
  { sensor_type_id: 2, name: 'HeartRate', desc: 'Heart rate (bpm)', created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
  { sensor_type_id: 3, name: 'SpO2', desc: 'Blood oxygen saturation (%)', created_at: ago(300 * DAY), updated_at: ago(300 * DAY) },
]

t.master_status = ['ไม่อยู่เตียง', 'นั่ง', 'นอนซ้าย', 'นอนกลาง', 'นอนขวา'].map((name, i) => ({
  id: i + 1, name, name_img: null, status_group: 1, active: '1',
  created_at: ago(300 * DAY), updated_at: ago(300 * DAY), create_userlogin: 5, update_userlogin: 5,
}))

const poseConfig = (activeIdx) => ({
  poses: ['ไม่อยู่เตียง', 'นั่ง', 'นอนซ้าย', 'นอนกลาง', 'นอนขวา'].map((name, i) => ({
    name, name_img: 'noimg.png', active: activeIdx.includes(i), delay: 1, repeat: 1, sensitivity: 1,
  })),
  globalSensitivity: 5,
})
t.sensor_template = [
  { sensor_template_id: 1, name: 'ผู้ป่วยติดเตียง (เฝ้าระวังลุกจากเตียง)', sensorType_Id: 1, config: poseConfig([0, 1]), created_at: ago(200 * DAY), updated_at: ago(200 * DAY) },
  { sensor_template_id: 2, name: 'ป้องกันแผลกดทับ (แจ้งเตือนนอนท่าเดิม)', sensorType_Id: 1, config: poseConfig([0, 3]), created_at: ago(200 * DAY), updated_at: ago(200 * DAY) },
]

// ---------- beds ----------
// 5 beds medicine, 4 surgery, 3 geriatrics
t.bed = []
const bedWard = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3]
bedWard.forEach((ward, i) => {
  t.bed.push({ bed_id: i + 1, department_building_id: ward, patient_id: null, created_at: ago(250 * DAY), updated_at: ago(250 * DAY) })
})

// ---------- patients (fictional names, 13-digit IDs starting with 0 so they can never be real Thai IDs) ----------
const first = ['สมชาย', 'สมหญิง', 'บุญมา', 'คำแก้ว', 'ประเสริฐ', 'จันทร์เพ็ญ', 'ทองดี', 'บัวผัน', 'สายใจ', 'ชูชาติ', 'ละเอียด', 'พรทิพย์', 'วิชัย', 'อำนวย', 'สุนีย์', 'ประยูร', 'บุญเรือน', 'มณี', 'สมบัติ', 'ทองใบ']
const last = ['ทดลองดี', 'ตัวอย่างสุข', 'สาธิตกุล', 'สมมุติวงศ', 'จำลองศรี', 'ทดสอบชัย', 'ตัวแทนงาม', 'สาธิตพร']
const usedNames = new Set()
function patientName() {
  for (;;) {
    const n = `${pick(first)} ${pick(last)}`
    if (!usedNames.has(n)) {
      usedNames.add(n)
      return n
    }
  }
}
const remarks = ['ผู้ป่วยติดเตียง เสี่ยงแผลกดทับ', 'หลังผ่าตัดสะโพก ห้ามลุกเอง', 'เบาหวาน ความดันสูง', 'ภาวะหัวใจล้มเหลว เฝ้าระวัง SpO2', 'สับสนช่วงกลางคืน เสี่ยงพลัดตก', 'ปอดอักเสบ', 'หลังผ่าตัดช่องท้อง', 'อ่อนแรงครึ่งซีก']
t.patient = []
t.history_patient = []
t.bed_assignments = []
let pid = 0
let hid = 0
let aid = 0

function addPatient({ ward, admittedAgo, dischargedAgo, bedId }) {
  pid++
  const sex = rand() < 0.5 ? 'M' : 'F'
  const age = int(55, 92)
  const birth = new Date(Date.UTC(2026 - age, int(0, 11), int(1, 28)))
  const w = WARD[ward]
  const active = dischargedAgo === undefined
  t.patient.push({
    patient_id: pid, name: patientName(), birthDate: birth.toISOString().slice(0, 10),
    status: active ? 1 : 0, telFam: `080-000-${String(1000 + pid).slice(-4)}`,
    thaiId: `00000000${String(10000 + pid).slice(-5)}`, image: '', sex,
    remark: pick(remarks), created_at: ago(admittedAgo), updated_at: ago(dischargedAgo ?? admittedAgo),
    create_user_id: 6, update_user_id: 6, room_id: ward, floor_id: w.floor,
    admitDate: ago(admittedAgo), bed_id: bedId ?? null, site_id: 1, department_id: w.dept,
  })
  hid++
  t.history_patient.push({
    history_id: hid, patient_id: pid, sensors_id: null, in_date: ago(admittedAgo),
    out_date: active ? null : ago(dischargedAgo), remark: '', status: active ? '0' : '1',
    create_user_id: 6, update_user_id: 6, created_at: ago(admittedAgo), updated_at: ago(dischargedAgo ?? admittedAgo),
  })
  return pid
}

// 10 active patients on beds 1-4, 6-8, 10-12 (beds 5 and 9 left free)
const occupied = [1, 2, 3, 4, 6, 7, 8, 10, 11, 12]
for (const bedId of occupied) {
  const bed = t.bed[bedId - 1]
  const admitted = int(1 * DAY, 18 * DAY)
  const id = addPatient({ ward: bed.department_building_id, admittedAgo: admitted, bedId })
  bed.patient_id = id
  aid++
  t.bed_assignments.push({
    assignment_id: aid, patient_id: id, bed_id: bedId, status: 'active', assigned_at: ago(admitted - 30),
    transferred_at: null, notes: null, assigned_by: 1, created_at: ago(admitted - 30), updated_at: ago(admitted - 30),
  })
}
// 3 newly registered patients waiting for a bed (one per department) - lets
// visitors try "assign patient to bed" right away
for (const ward of [1, 2, 3]) addPatient({ ward, admittedAgo: int(20, 240) })

// a transfer in the history: patient on bed 7 came from bed 9
{
  const a = t.bed_assignments.find((x) => x.bed_id === 7)
  const p = t.patient.find((x) => x.patient_id === a.patient_id)
  aid++
  t.bed_assignments.push({
    assignment_id: aid, patient_id: p.patient_id, bed_id: 9, status: 'transferred', assigned_at: p.admitDate,
    transferred_at: ago(a.assigned_at.$ago - 1), notes: 'ย้ายเตียงใกล้เคาน์เตอร์พยาบาล', assigned_by: 2,
    created_at: p.admitDate, updated_at: ago(a.assigned_at.$ago - 1),
  })
  a.assigned_at = ago(a.assigned_at.$ago - 1)
  a.notes = 'ย้ายมาจากเตียง 9'
}
// ~36 discharged patients spread over the last 6 months (feeds trends / avg-stay charts)
for (let i = 0; i < 36; i++) {
  const ward = pick([1, 1, 2, 2, 3])
  const discharged = int(1 * DAY, 180 * DAY)
  const stay = int(2 * DAY, 14 * DAY)
  const id = addPatient({ ward, admittedAgo: discharged + stay, dischargedAgo: discharged })
  const bedId = pick(t.bed.filter((b) => b.department_building_id === ward)).bed_id
  aid++
  t.bed_assignments.push({
    assignment_id: aid, patient_id: id, bed_id: bedId, status: 'discharged', assigned_at: ago(discharged + stay),
    transferred_at: ago(discharged), notes: 'จำหน่ายกลับบ้าน', assigned_by: 1,
    created_at: ago(discharged + stay), updated_at: ago(discharged),
  })
}

// ---------- sensors: every bed has BedSensor + HeartRate + SpO2, plus 4 spares ----------
t.sensor = []
t.sensor_profile = []
t.bed_sensors = []
let sid = 0
const mac = (n) => `02:00:5E:10:${(Math.floor(n / 256) % 256).toString(16).padStart(2, '0').toUpperCase()}:${(n % 256).toString(16).padStart(2, '0').toUpperCase()}`
const typeLabel = { 1: 'BED', 2: 'HR', 3: 'SPO2' }
function addSensor(type, bedId) {
  sid++
  const created = int(120 * DAY, 240 * DAY)
  t.sensor.push({
    sensor_id: sid, bed_id: bedId, mac: mac(sid), name: `${typeLabel[type]}-${String(sid).padStart(3, '0')}`,
    description: bedId ? `ติดตั้งที่เตียง ${bedId}` : 'สำรอง', hash: null, site_Id: 1, sensor_type_id: type,
    created_at: ago(created), updated_at: ago(created),
  })
  if (type === 1) {
    t.sensor_profile.push({
      sensor_profile_id: t.sensor_profile.length + 1, sensorType_Id: 1, config: poseConfig([0, 1]),
      created_at: ago(created), updated_at: ago(created), sensorId: sid,
    })
  }
  if (bedId) {
    const issue = rand() < 0.12
    const maint = rand() < 0.4 ? ago(int(5 * DAY, 150 * DAY)) : null
    t.bed_sensors.push({
      bed_sensor_id: t.bed_sensors.length + 1, bed_id: bedId, sensor_id: sid, sensor_type_id: type,
      installation_date: ago(created), last_maintenance: maint, calibration_data: null,
      status: issue ? pick(['maintenance', 'inactive']) : 'active', installed_by: 7, notes: null,
      created_at: ago(created), updated_at: issue ? ago(int(3 * DAY, 120 * DAY)) : ago(created),
    })
  }
}
for (const b of t.bed) for (const type of [1, 2, 3]) addSensor(type, b.bed_id)
for (const type of [1, 2, 3, 1]) addSensor(type, null)

// ---------- per-patient notification settings for active patients ----------
t.notification_setting = []
for (const p of t.patient.filter((x) => x.status === 1)) {
  const cfg = {
    1: { alert_positions: [1, 2] },
    2: { threshold_low: 60, threshold_high: 100 },
    3: { threshold_low: 92 },
  }
  for (const type of [1, 2, 3]) {
    t.notification_setting.push({
      id: t.notification_setting.length + 1, patient_id: p.patient_id, sensor_type_id: type,
      enabled: 1, config: cfg[type], updated_at: ago(int(0, 2 * DAY)),
    })
  }
}

// ---------- confirmed-alert history: last 30 days ----------
t.history_notification = []
const active = t.patient.filter((x) => x.status === 1)
const deptName = Object.fromEntries(t.departments.map((d) => [d.department_id, d.department_name]))
for (let day = 29; day >= 0; day--) {
  const count = int(6, 16)
  for (let k = 0; k < count; k++) {
    // dates are relative to load time, so spread alerts across each 24h window
    const minutesAgo = day === 0 ? int(5, 8 * 60) : day * DAY + int(0, DAY - 1)
    const p = pick(active)
    const kind = rand()
    let type, desc
    if (kind < 0.5) {
      type = 'BedSensor'
      desc = rand() < 0.7 ? 'ตำแหน่ง: 1, การแจ้งเตือน: position_check' : 'ตำแหน่ง: 2, การแจ้งเตือน: position_check'
    } else if (kind < 0.75) {
      type = 'HeartRate'
      const v = rand() < 0.5 ? int(42, 58) : int(105, 132)
      desc = `อัตราการเต้นของหัวใจ: ${v} bpm (${v < 60 ? 'ต่ำกว่า 60' : 'สูงกว่า 100'} bpm)`
    } else if (kind < 0.93) {
      type = 'SpO2'
      desc = `ระดับออกซิเจนในเลือด: ${int(84, 91)}% (ต่ำกว่า 92%)`
    } else {
      type = pick(['BedSensor', 'HeartRate', 'SpO2'])
      desc = 'หลุดการเชื่อมต่อ'
    }
    const typeId = { BedSensor: 1, HeartRate: 2, SpO2: 3 }[type]
    const nurse = t.user.find((u) => u.role_id === 1 && u.department_id === p.department_id)
    t.history_notification.push({
      Id: t.history_notification.length + 1, Patient_Id: p.patient_id, Noti_time: ago(minutesAgo),
      Noti_type: type, Noti_desc: desc, Noti_id: 0, Noti_setting_id: 0, Status: 1, Sensor_id: typeId,
      Sensor_type: type, Device_id: '', User_id: nurse ? nurse.user_id : 1, Patient_indate: p.admitDate,
      Patient_remark: desc, Patient_department: deptName[p.department_id], Patient_room_num: p.room_id,
    })
  }
}
t.history_notification.sort((a, b) => b.Noti_time.$ago - a.Noti_time.$ago)
t.history_notification.forEach((h, i) => (h.Id = i + 1))

// ---------- simulator profile: what each occupied bed "does" ----------
// Used by the MQTT simulator (self-host) and the in-browser fake socket.
const simulator = occupied.map((bedId, i) => {
  const s = t.sensor.filter((x) => x.bed_id === bedId)
  return {
    bed_id: bedId,
    patient_id: t.bed[bedId - 1].patient_id,
    macs: { posture: s.find((x) => x.sensor_type_id === 1).mac, heartrate: s.find((x) => x.sensor_type_id === 2).mac, spo2: s.find((x) => x.sensor_type_id === 3).mac },
    // baseline vitals + how "restless" this patient is
    hr: int(66, 92), spo2: int(94, 99), restless: [0.02, 0.05, 0.12][i % 3],
  }
})

// ---------- outputs ----------
const ORDER = [
  'province', 'sites_type', 'sites', 'building', 'floor', 'departments', 'department_building', 'roles',
  'profile', 'user', 'sensor_type', 'master_status', 'sensor_template', 'patient', 'bed', 'bed_assignments',
  'history_patient', 'sensor', 'sensor_profile', 'bed_sensors', 'notification_setting', 'history_notification',
]

const dataset = { generated: 'db/seed/build-seed.mjs', note: 'Fictional demo data. Dates are { $ago: minutes before load }.', tables: {}, simulator }
for (const name of ORDER) dataset.tables[name] = t[name]
writeFileSync(join(here, 'demo-dataset.json'), JSON.stringify(dataset, null, 1) + '\n')

const sqlValue = (v) => {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'object' && '$ago' in v) return v.$ago === 0 ? 'NOW()' : `NOW() - INTERVAL ${v.$ago} MINUTE`
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? '1' : '0'
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}
let sql = `-- Fictional demo data for the Smart Bed system. Generated by db/seed/build-seed.mjs - do not edit by hand.
-- All people, ID numbers, phone numbers and MAC addresses are invented.
-- Demo logins (password for all: demo1234): ${staff.map((s) => s[0]).join(', ')}
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
`
for (const name of ORDER) {
  const rows = t[name]
  if (!rows.length) continue
  const cols = Object.keys(rows[0])
  sql += `\nINSERT INTO \`${name}\` (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES\n`
  sql += rows.map((r) => `  (${cols.map((c) => sqlValue(r[c])).join(', ')})`).join(',\n') + ';\n'
}
sql += '\nSET FOREIGN_KEY_CHECKS = 1;\n'
mkdirSync(join(here, '..', 'init'), { recursive: true })
writeFileSync(join(here, '..', 'init', '02-seed.sql'), sql)

console.log(
  `Wrote demo-dataset.json and db/init/02-seed.sql — ${ORDER.map((n) => `${n}:${t[n].length}`).join(' ')}`,
)
