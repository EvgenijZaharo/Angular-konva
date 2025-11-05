import {AfterViewInit, ChangeDetectionStrategy,  Component, OnDestroy, ViewChild} from '@angular/core';
import {StageConfig} from 'konva/lib/Stage';
import {CircleConfig} from 'konva/lib/shapes/Circle';
import {
  CoreShapeComponent,
  StageComponent,
} from 'ng2-konva';
import Konva from 'konva';
import {GroupConfig} from 'konva/lib/Group';
import {LineConfig} from 'konva/lib/shapes/Line';

@Component({
  selector: 'app-root',
  template: `
    <ko-stage
      #stage
      [config]="configStage">
      <ko-layer>
        <ko-group
          [config]="stickmanConfig"
          (dragstart)="handleDragstart()"
          (dragend)="handleDragend()"
          #stickman
        >
          <ko-line
          [config]="stickmanBody"
          />
          <ko-circle
            [config]="stickmanHead"

           />
          <ko-line
          [config]="stickmanLeftArm"
          />
          <ko-line
          [config]="stickmanRightArm"
          /><ko-line
          [config]="stickmanLeftLeg"
          />
          <ko-line
          [config]="stickmanRightLeg"
          />
        </ko-group>
      </ko-layer>
    </ko-stage>
  `,
  imports: [StageComponent, CoreShapeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class App implements  AfterViewInit, OnDestroy {
  animation: any = null;
  readonly GRAVITY = 400;
  readonly stickmanHeight:number = 70;
  readonly stickmanArmLength:number = 30;

  @ViewChild('stickman') stickmanNode!: any;
  isDragging = false;
  isAnimating = true;



  public configStage: StageConfig = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  public stickmanHead: CircleConfig = {
    x: 50,
    y: 50,
    radius: 15,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 2,
  };

  readonly headX = this.stickmanHead.x!;
  readonly headRadius = this.stickmanHead.radius!;
  readonly headY = this.stickmanHead.y! + this.headRadius;
  public stickmanBody: LineConfig = {
    points:[this.headX, this.headY, this.headX, this.headY + this.stickmanHeight],
    stroke: 'black',
    strokeWidth: 4,
  }

  public stickmanLeftArm: LineConfig = {
    points:[this.headX, this.headY + this.stickmanHeight/2 - 10, this.headX - this.stickmanArmLength, this.headY + this.stickmanHeight/2 - 10],
    stroke: 'black',
    strokeWidth: 3,
  }

  public stickmanRightArm: LineConfig = {
    points:[this.headX, this.headY + this.stickmanHeight/2 - 10, this.headX + this.stickmanArmLength, this.headY + this.stickmanHeight/2 - 10],
    stroke: 'black',
    strokeWidth: 3,
  }
  public stickmanRightLeg: LineConfig = {
    points:[this.headX, this.headY + this.stickmanHeight, this.headX + this.stickmanArmLength, this.headY + this.stickmanHeight + this.stickmanArmLength],
    stroke: 'black',
    strokeWidth: 5,
  }
  public stickmanLeftLeg: LineConfig = {
    points:[this.headX, this.headY + this.stickmanHeight, this.headX - this.stickmanArmLength, this.headY + this.stickmanHeight + this.stickmanArmLength],
    stroke: 'black',
    strokeWidth: 5,
  }

  public stickmanConfig: GroupConfig = {
    x: 10,
    y: 10,
    draggable: true,
  }
  physicalStickman = {
    position: {x: 0, y: 0},
    velocity: {x: 15, y: 0},
    height:0,
    width: 0,
  };

  public handleDragstart(): void {
    this.isDragging = true;
    this.animation?.stop();
    const stickmanNode = this.stickmanNode.getNode();
    if (stickmanNode) {
      stickmanNode.moveToTop();
    }
  }


  public handleDragend(): void {
    this.isDragging = false;
    const stickmanNode = this.stickmanNode.getNode();
    if (stickmanNode) {
      this.physicalStickman.position.x = stickmanNode.x();
      this.physicalStickman.position.y = stickmanNode.y();
      this.physicalStickman.velocity.x = 0;
      this.physicalStickman.velocity.y = 0;
      this.isAnimating = true;
      this.animation?.start();
    }
  }

  ngAfterViewInit(): void {
    const stickmanNode = this.stickmanNode.getNode();
    const layer = stickmanNode.getLayer();
    const sizes = stickmanNode.getClientRect();
    this.physicalStickman.position.x = sizes.x;
    this.physicalStickman.position.y = sizes.y;
    this.physicalStickman.width = sizes.width + this.stickmanConfig.x;
    this.physicalStickman.height = sizes.height + this.stickmanArmLength;
    console.log(this.physicalStickman);
    console.log(this.headY + this.stickmanHeight + this.stickmanArmLength);

    this.animation = new Konva.Animation((frame) => {
      if (this.isDragging || !this.isAnimating) {
        return true;
      }

      const dt = frame.timeDiff / 1000;

      this.physicalStickman.velocity.y += this.GRAVITY * dt;
      this.physicalStickman.position.x += this.physicalStickman.velocity.x * dt;
      this.physicalStickman.position.y += this.physicalStickman.velocity.y * dt;

      if (this.physicalStickman.position.y + this.physicalStickman.height > this.configStage.height!) {
        this.physicalStickman.position.y = this.configStage.height! - this.physicalStickman.height;
        this.physicalStickman.velocity.y *= -0.8;
      }

      if (Math.abs(this.physicalStickman.velocity.y) <= 5 &&
        this.physicalStickman.position.y + this.physicalStickman.height >= this.configStage.height! - 5) {
        this.physicalStickman.velocity.y = 0;
        this.physicalStickman.velocity.x = 0;
        this.isAnimating = false;
        return true;
      }

      const newX = this.physicalStickman.position.x;
      const newY = this.physicalStickman.position.y;
      if (stickmanNode.x() !== newX || stickmanNode.y() !== newY) {
        stickmanNode.x(newX);
        stickmanNode.y(newY);
      }

      return true;
    }, layer);
    setTimeout(() => this.animation.start(), 0);
  }

  ngOnDestroy(): void {
    this.animation?.stop();
  }
}
