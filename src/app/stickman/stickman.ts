import {AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, ViewChild} from '@angular/core';
import { StageConfig } from 'konva/lib/Stage';
import { CircleConfig } from 'konva/lib/shapes/Circle';
import { CoreShapeComponent, StageComponent } from 'ng2-konva';
import { GroupConfig } from 'konva/lib/Group';
import { LineConfig } from 'konva/lib/shapes/Line';
import {STICKMAN_CONFIGS} from './stickman.config';
import {StickmanAnimationService} from '../stickman-animation';

@Component({
  selector: 'app-stickman',
  templateUrl: './stickman.html',
  styleUrls: ['./stickman.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [StageComponent, CoreShapeComponent],
})
export class Stickman implements AfterViewInit, OnDestroy {

  animationService = inject(StickmanAnimationService);
  @ViewChild('stickman') stickmanNode!: any;
  @ViewChild('leftArm') leftArmComp!: CoreShapeComponent;
  @ViewChild('rightArm') rightArmComp!: CoreShapeComponent;


  configStage: StageConfig = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  stickmanHead: CircleConfig = STICKMAN_CONFIGS.head;
  stickmanBody: LineConfig = STICKMAN_CONFIGS.body;
  stickmanLeftArm: LineConfig = STICKMAN_CONFIGS.leftArm;
  stickmanRightArm: LineConfig = STICKMAN_CONFIGS.rightArm;
  stickmanLeftLeg: LineConfig = STICKMAN_CONFIGS.leftLeg;
  stickmanRightLeg: LineConfig = STICKMAN_CONFIGS.rightLeg;
  stickmanConfig: GroupConfig = STICKMAN_CONFIGS.group;
  physicStikmanArm = STICKMAN_CONFIGS.physicArm;
  physicalStickman = STICKMAN_CONFIGS.physical;
  stickmanArmLength = STICKMAN_CONFIGS.arm;
  gravity = STICKMAN_CONFIGS.gravity;
  stickmanHeight = STICKMAN_CONFIGS.height;
  jumpVelocity = STICKMAN_CONFIGS.jumpVelocity;


  ngAfterViewInit(): void {
    if (!this.stickmanNode) return;
    const stickmanNode = this.stickmanNode.getNode();
    const stickmanLayer = stickmanNode.getLayer();

    this.animationService.initLimbAnimation(
      stickmanLayer,
      this.leftArmComp,
      this.rightArmComp,
      this.physicStikmanArm,
      this.stickmanArmLength
    );

    const sizes = stickmanNode.getClientRect();
    this.physicalStickman.position.x = sizes.x;
    this.physicalStickman.position.y = sizes.y;
    this.physicalStickman.width = sizes.width + this.stickmanConfig.x;
    this.physicalStickman.height = sizes.height + this.stickmanArmLength;
    console.log(this.physicalStickman);
    console.log(STICKMAN_CONFIGS.headY + this.stickmanHeight + this.stickmanArmLength);

    this.animationService.initMainAnimation(
      stickmanLayer,
      this,
      this.gravity,
      this.configStage.height!
    );

    this.animationService.initJumpAnimation(
      stickmanLayer,
      this,
      this.jumpVelocity
    )
  }

  ngOnDestroy(): void {
    this.animationService.stopAllAnimations();
  }
}
