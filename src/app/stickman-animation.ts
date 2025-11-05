import {Injectable} from '@angular/core';
import Konva from 'konva';
import {CoreShapeComponent} from 'ng2-konva';

@Injectable({
  providedIn: 'root',
})
export class StickmanAnimationService {
  private mainAnimation: Konva.Animation | null = null;
  private limbAnim: Konva.Animation | null = null;

  initLimbAnimation(
    layer: Konva.Layer,
    leftArmComp: CoreShapeComponent,
    rightArmComp: CoreShapeComponent,
    physicStikmanArm: any,
    stickmanArmLength: number
  ): void {
    const leftLineNode: any = leftArmComp?.getNode?.() ?? null;
    const rightLineNode: any = rightArmComp?.getNode?.() ?? null;
    if (!leftLineNode) {
      console.warn('leftArm Konva node not found');
      return;
    }

    this.limbAnim = new Konva.Animation((frame) => {
      const dt = (frame?.timeDiff ?? 16) / 1000;
      const max = Math.PI / 6;

      physicStikmanArm.leftAngle += physicStikmanArm.angularSpeed * dt * physicStikmanArm.leftDirection;
      if (physicStikmanArm.leftAngle > max) {
        physicStikmanArm.leftAngle = max;
        physicStikmanArm.leftDirection = -1;
      } else if (physicStikmanArm.leftAngle < -max) {
        physicStikmanArm.leftAngle = -max;
        physicStikmanArm.leftDirection = 1;
      }

      physicStikmanArm.rightAngle += physicStikmanArm.angularSpeed * dt * physicStikmanArm.rightDirection;
      if (physicStikmanArm.rightAngle > max) {
        physicStikmanArm.rightAngle = max;
        physicStikmanArm.rightDirection = -1;
      } else if (physicStikmanArm.rightAngle < -max) {
        physicStikmanArm.rightAngle = -max;
        physicStikmanArm.rightDirection = 1;
      }

      const sx = physicStikmanArm.shoulder.x;
      const sy = physicStikmanArm.shoulder.y;

      const leftX = sx + stickmanArmLength * -Math.cos(physicStikmanArm.leftAngle);
      const leftY = sy + stickmanArmLength * -Math.sin(physicStikmanArm.leftAngle);

      const rightX = sx + stickmanArmLength * Math.cos(physicStikmanArm.rightAngle);
      const rightY = sy + stickmanArmLength * Math.sin(physicStikmanArm.rightAngle);

      leftLineNode.points([sx, sy, leftX, leftY]);
      rightLineNode.points([sx, sy, rightX, rightY]);

      return true;
    }, layer);

    this.limbAnim.start();
  }

  initMainAnimation(
    layer: Konva.Layer,
    component: any,
    gravity: number,
    stageHeight: number
  ): void {
    this.mainAnimation = new Konva.Animation((frame) => {
      // Если персонаж перетаскивается, не применяем физику
      if (component.isDragging) {
        return true;
      }

      const dt = frame.timeDiff / 1000;

      // Применяем гравитацию
      component.physicalStickman.velocity += gravity * dt;
      component.physicalStickman.position.y += component.physicalStickman.velocity * dt;

      // Проверяем столкновение с землей
      const groundLevel = stageHeight - component.physicalStickman.height;
      if (component.physicalStickman.position.y >= groundLevel) {
        component.physicalStickman.position.y = groundLevel;
        
        // Если падаем вниз (velocity > 0), обрабатываем приземление
        if (component.physicalStickman.velocity > 0) {
          // Добавляем отскок (умножаем на отрицательный коэффициент)
          component.physicalStickman.velocity *= -0.6;
          
          // Если скорость отскока слишком мала, останавливаем персонажа
          if (Math.abs(component.physicalStickman.velocity) < 10) {
            component.physicalStickman.velocity = 0;
            component.isOnGround = true;
          }
        }
      } else {
        // Если не на земле, сбрасываем флаг
        component.isOnGround = false;
      }

      // Обновляем позицию узла Konva
      const newX = component.physicalStickman.position.x;
      const newY = component.physicalStickman.position.y;
      const stickmanNode = component.stickmanNode.getNode();
      if (stickmanNode.x() !== newX || stickmanNode.y() !== newY) {
        stickmanNode.x(newX);
        stickmanNode.y(newY);
      }

      return true;
    }, layer);

    setTimeout(() => this.mainAnimation?.start(), 0);
  }

  startMainAnimation(): void {
    this.mainAnimation?.start();
  }

  stopMainAnimation(): void {
    this.mainAnimation?.stop();
  }

  stopAllAnimations(): void {
    this.mainAnimation?.stop();
    this.limbAnim?.stop();
  }
}
