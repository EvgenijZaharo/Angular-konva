import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild} from '@angular/core';
import {StageConfig} from 'konva/lib/Stage';
import {CircleConfig} from 'konva/lib/shapes/Circle';
import {
  CoreShapeComponent,
  StageComponent,
} from 'ng2-konva';
import Konva from 'konva';

@Component({
  selector: 'app-root',
  template: `
    <ko-stage
      #stage
      [config]="configStage">
      <ko-layer>
        <ko-circle
          #circle
          [config]="configCircle"
          (dragstart)="handleDragstart()"
          (dragend)="handleDragend()"
        ></ko-circle>
      </ko-layer>
    </ko-stage>
  `,
  imports: [StageComponent, CoreShapeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class App implements AfterViewInit, OnDestroy {
  animation: any = null;
  readonly GRAVITY = 400;


  @ViewChild('circle') circle!: any;


  isDragging = false;
  isAnimating = true;

  // Единственный источник истины для физики
  physicalCircle = {
    position: {x: 100, y: 100},
    velocity: {x: 10, y: 0},
    radius: 70
  };

  public configStage: StageConfig = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Инициализируется из physicalCircle
  public configCircle: CircleConfig = {
    x: this.physicalCircle.position.x,
    y: this.physicalCircle.position.y,
    radius: this.physicalCircle.radius,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 4,
    draggable: true,
  };


  public handleDragstart(): void {
    this.isDragging = true;
    this.animation?.stop(); // <-- добавь это
    const circleNode = this.circle.getNode();
    if (circleNode) {
      circleNode.moveToTop();
    }
  }


  public handleDragend(): void {
    this.isDragging = false;
    const circleNode = this.circle.getNode();
    if (circleNode) {
      // Обновляем физическую позицию из финальной позиции перетаскивания
      this.physicalCircle.position.x = circleNode.x();
      this.physicalCircle.position.y = circleNode.y();
      // Сбрасываем скорость
      this.physicalCircle.velocity.x = 0;
      this.physicalCircle.velocity.y = 0;
      // Перезапускаем анимацию
      this.isAnimating = true;
      this.animation?.start(); // <-- добавь
    }
  }


  ngAfterViewInit(): void {
    const circleNode = this.circle.getNode();
    const layer = circleNode.getLayer(); // Кэшируем слой

    this.animation = new Konva.Animation((frame) => {
      if (this.isDragging || !this.isAnimating) {
        return true; // Stop frame if not needed
      }

      const dt = frame.timeDiff / 1000;

      // Physics
      this.physicalCircle.velocity.y += this.GRAVITY * dt;
      this.physicalCircle.position.x += this.physicalCircle.velocity.x * dt;
      this.physicalCircle.position.y += this.physicalCircle.velocity.y * dt;

      // Bounce
      if (this.physicalCircle.position.y + this.physicalCircle.radius > this.configStage.height!) {
        this.physicalCircle.position.y = this.configStage.height! - this.physicalCircle.radius;
        this.physicalCircle.velocity.y *= -0.8;
      }

      // Stop condition
      if (Math.abs(this.physicalCircle.velocity.y) <= 5 &&
        this.physicalCircle.position.y + this.physicalCircle.radius >= this.configStage.height! - 5) {
        this.physicalCircle.velocity.y = 0;
        this.physicalCircle.velocity.x = 0;
        this.isAnimating = false;
        return true;
      }

      // Update only if changed
      const newX = this.physicalCircle.position.x;
      const newY = this.physicalCircle.position.y;
      if (circleNode.x() !== newX || circleNode.y() !== newY) {
        circleNode.x(newX);
        circleNode.y(newY);
        layer.batchDraw();
      }

      return true; // Always return a value
    }, layer);
    // Запуск с задержкой, как я предлагал раньше
    setTimeout(() => this.animation.start(), 0);
  }

  ngOnDestroy(): void {
    this.animation?.stop();
  }
}
