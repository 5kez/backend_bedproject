-- ==========================================
-- Alternative: สร้าง View แทนการใช้ bed_id column
-- ==========================================

-- สร้าง View ที่รวม patient กับ bed_id โดยอัตโนมัติ
CREATE OR REPLACE VIEW patient_with_bed AS
SELECT 
    p.*,
    b.bed_id,
    b.bed_name,
    b.room_id as bed_room_id,
    b.status as bed_status
FROM patient p
LEFT JOIN bed b ON b.patient_id = p.patient_id;

-- ทดสอบ View
SELECT 
    patient_id,
    name,
    department_id,
    bed_id,
    bed_name,
    status
FROM patient_with_bed 
WHERE department_id = 1 AND status = 1 AND bed_id IS NOT NULL
ORDER BY name;