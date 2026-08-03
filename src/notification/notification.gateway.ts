import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService, NotificationItem } from './notification.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationService: NotificationService) {
    // ตั้งค่า callback สำหรับส่ง real-time notification
    this.notificationService.setNotificationCreatedCallback((notification) => {
      void this.broadcastNotification(notification);
    });

    // ตั้งค่า callback สำหรับเมื่อมีการยืนยัน notification
    this.notificationService.setNotificationConfirmedCallback(
      (patientId: number, sensorTypeId: number) => {
        this.server.emit('notificationConfirmed', {
          patient_id: patientId,
          sensor_type_id: sensorTypeId,
          timestamp: new Date(),
        });
        this.server.emit('recheckSensorCondition', {
          patient_id: patientId,
          sensor_type_id: sensorTypeId,
        });
      },
    );
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { userId: number; room: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(data.room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.leave(data.room);
  }

  // ส่ง notification ไปยัง client ทั้งหมด
  broadcastNotification(notification: NotificationItem) {
    this.server.emit('newNotification', notification);
  }
}
