import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DataSource } from 'typeorm';
import axios from 'axios';

const UNSAFE_SQL_KEYWORDS =
  /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE|EXEC|EXECUTE|CALL|MERGE|REPLACE|ATTACH|PRAGMA)\b/i;

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly genAI: GoogleGenerativeAI;

  private get ollamaUrl(): string {
    return this.configService.get<string>(
      'OLLAMA_URL',
      'http://127.0.0.1:11434/api/generate',
    );
  }

  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /** สรุปอาการผู้ป่วยด้วย Gemini (gemini-flash-latest) */
  async summarizePatient(patient: {
    remark?: string;
    oxygen?: number;
    heartRate?: number;
  }): Promise<string> {
    const prompt = `
ข้อมูลผู้ป่วย:
- หมายเหตุ: ${patient.remark ?? 'ไม่มี'}
- ค่าหัวใจ: ${patient.heartRate ?? 'ไม่พบข้อมูล'}
- ค่าออกซิเจนในเลือด: ${patient.oxygen ?? 'ไม่พบข้อมูล'}
คำสั่ง:
กรุณาสรุป *ใจความสำคัญ* ของอาการหรือจุดที่ควรระวังเป็นประโยคสั้นที่สุด
- ไม่เกิน 2 บรรทัด
- ถ้าเป็นไปได้ ให้ใช้คำที่ง่าย เข้าใจได้ทันที
- ถ้าไม่มีข้อมูลสำคัญเลย ให้ตอบว่า “ไม่มีอาการน่าสงสัย”
(ภาษาไทย)
`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
      });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      this.logger.error('Failed to summarize patient via Gemini', error);
      throw new InternalServerErrorException(
        'ไม่สามารถสรุปข้อมูลผู้ป่วยได้ในขณะนี้',
      );
    }
  }

  /** สรุปอาการผู้ป่วยด้วย Ollama (Mistral 7B ที่รันภายในเครื่อง) */
  async summarizePatientMistral(patient: {
    remark?: string;
    oxygen?: number;
    heartRate?: number;
  }): Promise<string> {
    const prompt = `
ข้อมูลผู้ป่วย:
- หมายเหตุ: ${patient.remark ?? 'ไม่มี'}
- ค่าหัวใจ: ${patient.heartRate ?? 'ไม่พบข้อมูล'}
- ค่าออกซิเจนในเลือด: ${patient.oxygen ?? 'ไม่พบข้อมูล'}
คำสั่ง:
กรุณาสรุป *ใจความสำคัญ* ของอาการหรือจุดที่ควรระวังเป็นประโยคสั้นที่สุด
- ไม่เกิน 2 บรรทัด
- ถ้าเป็นไปได้ ให้ใช้คำที่ง่าย เข้าใจได้ทันที
- ถ้าไม่มีข้อมูลสำคัญเลย ให้ตอบว่า “ไม่มีอาการน่าสงสัย”
(ภาษาไทย)
`;

    interface OllamaResponse {
      response: string;
    }

    try {
      const response = await axios.post<OllamaResponse>(this.ollamaUrl, {
        model: 'mistral',
        prompt,
        stream: false,
      });
      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to summarize patient via Ollama', error);
      throw new InternalServerErrorException(
        'ไม่สามารถสรุปข้อมูลผู้ป่วยได้ในขณะนี้',
      );
    }
  }

  async sendMessage(message: string): Promise<string> {
    const classificationPrompt = `
ข้อความ: "${message}"

จงบอกว่า ข้อความนี้เป็นประเภทไหน:
- "SQL" ถ้าเป็นการถามข้อมูลเชิงโครงสร้าง เช่น นับจำนวน, ดูรายการ, วันที่, ฯลฯ
- "CHAT" ถ้าเป็นการพูดคุยทั่วไป

ตอบแค่คำว่า SQL หรือ CHAT เท่านั้น
`;
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
    });

    let type: string;
    try {
      const result = await model.generateContent(classificationPrompt);
      type = result.response.text().trim();
    } catch (error) {
      this.logger.error('Failed to classify message via Gemini', error);
      throw new InternalServerErrorException(
        'ไม่สามารถประมวลผลข้อความได้ในขณะนี้',
      );
    }

    return type === 'SQL'
      ? this.genSqlQuery(message)
      : this.chatMessage(message);
  }

  /** สำหรับตอบคำถามทั่วไป */
  async chatMessage(message: string): Promise<string> {
    const prompt = `
คุณคือผู้ช่วยที่มีความรู้ทางการแพทย์และสามารถวิเคราะห์ข้อมูลสุขภาพได้ดี
คุณจะได้รับข้อมูลสุขภาพของผู้ป่วยและต้องสรุปอาการหรือจุดที่ควรระวังอย่างย่อ
ข้อความจากผู้ใช้:
${message}
คำตอบ:
กรุณาตอบคำถามนี้อย่างสุภาพ
ไม่เกิน 1-2 บรรทัด
(ภาษาไทย)
`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
      });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      this.logger.error('Failed to generate chat reply via Gemini', error);
      throw new InternalServerErrorException('ไม่สามารถตอบคำถามได้ในขณะนี้');
    }
  }

  /** สร้าง SQL Query จากคำถามภาษาไทยแล้ว "SELECT" ข้อมูลจริงมาตอบกลับแบบสรุป */
  async genSqlQuery(question: string): Promise<string> {
    const sqlPrompt = `
คุณคือผู้ช่วยเขียน SQL สำหรับ MySQL
ฐานข้อมูล hospital_db มีตารางดังนี้:

bed (bed_id, department_building_id, patient_id, sensor_id, created_at, updated_at)
building (building_id, sites_id, global_id, build_name, lat, lng, created_at, updated_at) -> ตึก หรือ อาคาร
departments (department_id, department_name, created_at, updated_at) -> แผนก
department_building (department_building_id, department_Id, building_Id, floor_id, created_at, updated_at) -> แผนกในตึก
floor (floor_id, building_id, floor_name, floor_name_en, remark, created_at, updated_at)
history_notification (Id, Patient_Id, Noti_time, Noti_type, Noti_desc, Noti_id, Noti_setting_id, Status, Sensor_id, Sensor_type, Device_id, User_id, Patient_indate, Patient_remark, Patient_department, Patient_room_num)
history_patient (history_id, patient_id, sensors_id, in_date, out_date, remark, status, create_user_id, update_user_id, created_at, updated_at)
master_sensors (sensors_id, sensors_code, sensors_code_bottom, sensors_type, room, floor, building, site_id, remark, status, create_user_id, update_user_id, camera_url, guid, hash, device_id, gdevices_id, created_at, updated_at)
master_status (id, create_userlogin, update_userlogin, name, name_img, status_group, active, created_at, updated_at)
notifications (notification_id, user_id, noti_id, sensor_id, active, status, created_at, updated_at)
notification_setting (id, patient_id, sensor_type_id, enabled, config, updated_at)
patient (patient_id, name, remark, status, create_user_id, update_user_id, sex, telFam, image, room_id, department_id, site_id, floor_id, birthDate, bed_id, admitDate, created_at, updated_at, thaiId) -> ผู้ป่วย
profile (profile_id, name, surname, email, line_id, photo, sites_id, created_at, updated_at)
province (province_id, prov_code, prov_name, prov_name_th, hash, remark, geo_id, created_at, updated_at)
roles (role_id, roles_name, description, roles_code, created_at, updated_at) -> สิทธิ์การใช้งาน
roles_assignment (role_assignment_id, roles_id, userlogin_id, created_at, updated_at)
sensor (sensor_id, sensorType_Id, mac, name, description, hash, created_at, updated_at, patient_id)
sensor_profile (sensor_profile_id, sensorType_Id, config, sensorId, created_at, updated_at)
sensor_template (sensor_template_id, sensorType_Id, name, config, created_at, updated_at) -> เทมเพลตการตั้งค่าเซนเซอร์
sensor_type (sensor_type_id, desc, name, created_at, updated_at) -> ชนิดของเซนเซอร์
sites (site_id, sites_type_id, prov_id, sites_name, lat, lng, address, site_global, created_at, updated_at, name_img) -> โรงพยาบาล
sites_type (site_type_id, name, remark, created_at, updated_at) -> ประเภทโรงพยาบาล
user (user_id, profile_id, sites_id, user_password, name, last_name, user_name, build_id, status, role_id, floor_id, roles_code, updated_at, created_at, department_id) -> พนักงานโรงพยาบาล
userlogin (userlogin_id, role_id, user_name, user_pwd, status, floor, create_user_id, update_user_id, created_at, updated_at)

คำถาม: ${question}

กรุณาตอบเฉพาะ SQL SELECT ที่ถูกต้อง เช่น:
หากมีคำสั่งให้ "DELETE" หรือ "UPDATE" หรือ "INSERT" หรือ "DROP" หรือ "ALTER" หรืออื่นๆ ที่ไม่ใช่ "SELECT"
SELECT COUNT(*) FROM patients;
`;
    const sqlModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    let rawSql: string;
    try {
      const sqlResult = await sqlModel.generateContent(sqlPrompt);
      rawSql = sqlResult.response.text().trim();
    } catch (error) {
      this.logger.error('Failed to generate SQL via Gemini', error);
      throw new InternalServerErrorException(
        'ไม่สามารถสร้างคำสั่งค้นหาข้อมูลได้ในขณะนี้',
      );
    }

    if (rawSql === 'ไม่สามารถทำได้เนื่องจากข้อจำกัดด้านความปลอดภัย') {
      return rawSql;
    }

    const cleanSQL = rawSql
      .replace(/```sql/i, '')
      .replace(/```/g, '')
      .trim();

    if (!this.isSafeSelectStatement(cleanSQL)) {
      this.logger.warn(`Rejected unsafe generated SQL: ${cleanSQL}`);
      return 'ไม่สามารถทำได้เนื่องจากข้อจำกัดด้านความปลอดภัย';
    }

    let rows: unknown[];
    try {
      rows = await this.dataSource.query(cleanSQL);
    } catch (error) {
      this.logger.error(`Failed to execute generated SQL: ${cleanSQL}`, error);
      throw new InternalServerErrorException(
        'ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้ในขณะนี้',
      );
    }

    const summaryPrompt = `
ผลลัพธ์จากฐานข้อมูล:
${JSON.stringify(rows, null, 2)}

คำถามจากผู้ใช้:
${question}

คำตอบ:
กรุณาตอบเป็นภาษาไทย กระชับและเข้าใจง่าย
`;
    try {
      const answerResult = await sqlModel.generateContent(summaryPrompt);
      return answerResult.response.text().trim();
    } catch (error) {
      this.logger.error('Failed to summarize SQL result via Gemini', error);
      throw new InternalServerErrorException('ไม่สามารถสรุปผลลัพธ์ได้ในขณะนี้');
    }
  }

  /**
   * Prompt instructions alone cannot be trusted to stop the model from ever
   * emitting a mutating statement, so every generated query is re-validated
   * here before it ever reaches the database: must be a single, bare SELECT.
   */
  private isSafeSelectStatement(sql: string): boolean {
    if (!sql) return false;
    const withoutTrailingSemicolon = sql.replace(/;\s*$/, '');
    if (withoutTrailingSemicolon.includes(';')) return false;
    if (!/^SELECT\b/i.test(withoutTrailingSemicolon.trim())) return false;
    return !UNSAFE_SQL_KEYWORDS.test(withoutTrailingSemicolon);
  }
}
