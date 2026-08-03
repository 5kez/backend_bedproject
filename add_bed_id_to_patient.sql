-- ==========================================
-- Add bed_id column to patient table
-- ==========================================

-- 1. เพิ่ม bed_id column ในตาราง patient
ALTER TABLE patient 
ADD COLUMN bed_id INT NULL;

-- 2. Update bed_id จากข้อมูลที่มีอยู่ในตาราง bed
-- (ที่ bed.patient_id ชี้ไปหา patient_id)
UPDATE patient p 
INNER JOIN bed b ON b.patient_id = p.patient_id 
SET p.bed_id = b.bed_id;

-- 3. ตรวจสอบผลลัพธ์
SELECT 
    p.patient_id,
    p.name,
    p.department_id,
    p.bed_id,
    b.bed_id as actual_bed_id,
    b.bed_name
FROM patient p
LEFT JOIN bed b ON b.patient_id = p.patient_id
WHERE p.status = 1
ORDER BY p.department_id, p.name;

-- 4. ตรวจสอบจำนวนผู้ป่วยที่มี bed_id
SELECT 
    'Total active patients' as description,
    COUNT(*) as count
FROM patient 
WHERE status = 1

UNION ALL

SELECT 
    'Active patients with bed_id' as description,
    COUNT(*) as count
FROM patient 
WHERE status = 1 AND bed_id IS NOT NULL

UNION ALL

SELECT 
    'Active patients without bed_id' as description,
    COUNT(*) as count
FROM patient 
WHERE status = 1 AND bed_id IS NULL;

-- 5. ตรวจสอบตามแผนก (department)
SELECT 
    p.department_id,
    d.name as department_name,
    COUNT(*) as total_patients,
    COUNT(p.bed_id) as patients_with_bed
FROM patient p
LEFT JOIN department d ON d.department_id = p.department_id
WHERE p.status = 1
GROUP BY p.department_id, d.name
ORDER BY p.department_id;