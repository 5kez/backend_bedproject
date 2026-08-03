-- ==========================================
-- Setup Foreign Key และ Triggers สำหรับ bed_id sync
-- ==========================================

-- 1. เพิ่ม Foreign Key Constraint
ALTER TABLE patient 
ADD CONSTRAINT fk_patient_bed_id 
FOREIGN KEY (bed_id) REFERENCES bed(bed_id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- 2. สร้าง Trigger เพื่อ sync bed_id เมื่อ bed.patient_id เปลี่ยน
DELIMITER $$

-- Trigger เมื่อ Insert bed record
CREATE TRIGGER tr_bed_insert_sync_patient
AFTER INSERT ON bed
FOR EACH ROW
BEGIN
    IF NEW.patient_id IS NOT NULL THEN
        UPDATE patient 
        SET bed_id = NEW.bed_id 
        WHERE patient_id = NEW.patient_id;
    END IF;
END$$

-- Trigger เมื่อ Update bed record
CREATE TRIGGER tr_bed_update_sync_patient
AFTER UPDATE ON bed
FOR EACH ROW
BEGIN
    -- ถ้า patient_id เปลี่ยน
    IF OLD.patient_id != NEW.patient_id OR (OLD.patient_id IS NULL AND NEW.patient_id IS NOT NULL) OR (OLD.patient_id IS NOT NULL AND NEW.patient_id IS NULL) THEN
        
        -- เคลียร์ bed_id ของ patient เก่า (ถ้ามี)
        IF OLD.patient_id IS NOT NULL THEN
            UPDATE patient 
            SET bed_id = NULL 
            WHERE patient_id = OLD.patient_id;
        END IF;
        
        -- กำหนด bed_id ให้ patient ใหม่ (ถ้ามี)
        IF NEW.patient_id IS NOT NULL THEN
            UPDATE patient 
            SET bed_id = NEW.bed_id 
            WHERE patient_id = NEW.patient_id;
        END IF;
        
    END IF;
END$$

-- Trigger เมื่อ Delete bed record
CREATE TRIGGER tr_bed_delete_sync_patient
BEFORE DELETE ON bed
FOR EACH ROW
BEGIN
    -- เคลียร์ bed_id ของ patient
    IF OLD.patient_id IS NOT NULL THEN
        UPDATE patient 
        SET bed_id = NULL 
        WHERE patient_id = OLD.patient_id;
    END IF;
END$$

DELIMITER ;

-- 3. ทดสอบการทำงาน
-- Test 1: Update bed.patient_id
SELECT 'Before Update' as status, p.name, p.bed_id, b.bed_id as actual_bed_id
FROM patient p 
LEFT JOIN bed b ON b.patient_id = p.patient_id 
WHERE p.patient_id = 1;

-- Test 2: เปลี่ยน patient_id ในเตียง (ถ้าต้องการทดสอบ)
-- UPDATE bed SET patient_id = 2 WHERE bed_id = 1;

-- Test 3: ดูผลลัพธ์
SELECT 'After Update' as status, p.name, p.bed_id, b.bed_id as actual_bed_id
FROM patient p 
LEFT JOIN bed b ON b.patient_id = p.patient_id 
WHERE p.patient_id IN (1, 2);

-- 4. ตรวจสอบ Triggers ที่สร้าง
SHOW TRIGGERS LIKE 'bed';