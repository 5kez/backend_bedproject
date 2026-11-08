-- Keep patient.bed_id in sync with bed.patient_id (the bed row is the source of truth).
-- Same triggers the team ran on the original database (see sync_bed_id_triggers.sql).
DELIMITER $$
CREATE TRIGGER tr_bed_insert_sync_patient AFTER INSERT ON bed FOR EACH ROW
BEGIN
  IF NEW.patient_id IS NOT NULL THEN
    UPDATE patient SET bed_id = NEW.bed_id WHERE patient_id = NEW.patient_id;
  END IF;
END$$
CREATE TRIGGER tr_bed_update_sync_patient AFTER UPDATE ON bed FOR EACH ROW
BEGIN
  IF NOT (OLD.patient_id <=> NEW.patient_id) THEN
    IF OLD.patient_id IS NOT NULL THEN
      UPDATE patient SET bed_id = NULL WHERE patient_id = OLD.patient_id;
    END IF;
    IF NEW.patient_id IS NOT NULL THEN
      UPDATE patient SET bed_id = NEW.bed_id WHERE patient_id = NEW.patient_id;
    END IF;
  END IF;
END$$
CREATE TRIGGER tr_bed_delete_sync_patient BEFORE DELETE ON bed FOR EACH ROW
BEGIN
  IF OLD.patient_id IS NOT NULL THEN
    UPDATE patient SET bed_id = NULL WHERE patient_id = OLD.patient_id;
  END IF;
END$$
DELIMITER ;
