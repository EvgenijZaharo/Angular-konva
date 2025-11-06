import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { CircleConfig } from 'konva/lib/shapes/Circle';
import { CoreShapeComponent } from 'ng2-konva';
import { GroupConfig } from 'konva/lib/Group';
import { LineConfig } from 'konva/lib/shapes/Line';
import {STICKMAN_CONFIGS} from './stickman.config';
import {StickmanAnimationService} from '../stickman-animation';
import Konva from 'konva';

@Component({
  selector: 'app-stickman',
  templateUrl: './stickman.html',
  styleUrls: ['./stickman.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CoreShapeComponent],
})
export class Stickman implements AfterViewInit,  OnDestroy {
  animationService = inject(StickmanAnimationService);
  @Input() layer!: any;
  @Input() isGameActive: boolean = true;
  @ViewChild('stickman') stickmanNode!: any;
  @ViewChild('leftArm') leftArmComp!: CoreShapeComponent;
  @ViewChild('rightArm') rightArmComp!: CoreShapeComponent;

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

  private isSpacePressed = false;

  handleJumpKeyDown = (event: KeyboardEvent): void => {
    if ((event.code === 'Space' || event.key === ' ') && !this.isSpacePressed && this.isGameActive) {
      event.preventDefault();
      this.isSpacePressed = true;
      this.jump();
    }
  }

  handleJumpKeyUp = (event: KeyboardEvent): void => {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this.isSpacePressed = false;
    }
  }

  jump(): void {
    if (!this.isGameActive) {
      return;
    }
    this.physicalStickman.velocity = -this.jumpVelocity;
    console.log('Jump! Velocity set to', this.physicalStickman.velocity);
  }

  resetPosition(): void {
    console.log('Resetting stickman position');
    const stickmanNode = this.stickmanNode?.getNode();
    if (!stickmanNode) {
      return;
    }


    this.isSpacePressed = false;

    this.physicalStickman.velocity = 0;
    this.physicalStickman.position.x = this.stickmanConfig.x!;
    this.physicalStickman.position.y = this.stickmanConfig.y!;

    stickmanNode.x(this.stickmanConfig.x!);
    stickmanNode.y(this.stickmanConfig.y!);

    const stickmanLayer = this.layer.getNode();
    if (stickmanLayer) {
      stickmanLayer.batchDraw();
    }
  }

  ngOnDestroy(): void {
    console.log('Stickman destroyed');
    this.animationService.stopAllAnimations();
    window.removeEventListener('keydown', this.handleJumpKeyDown);
    window.removeEventListener('keyup', this.handleJumpKeyUp);
  }

  ngAfterViewInit(): void {
    if (!this.stickmanNode)
    {
      console.log('Stickman node not initialized');
      return;
    }
    const stickmanNode = this.stickmanNode.getNode();
    const stickmanLayer = this.layer.getNode();


    this.animationService.initLimbAnimation(
      stickmanLayer,
      this.leftArmComp,
      this.rightArmComp,
      this.physicStikmanArm,
      this.stickmanArmLength
    );

    const sizes = stickmanNode.getClientRect({relativeTo: stickmanNode});
    var box = new Konva.Rect({
      x: sizes.x,
      y: sizes.y,
      width: sizes.width,
      height: sizes.height,
      stroke: 'red',
      strokeWidth: 1,
    });
    stickmanNode.add(box);
    console.log(sizes);
    this.physicalStickman.position.x = stickmanNode.x();
    this.physicalStickman.position.y = stickmanNode.y();
    this.physicalStickman.width = sizes.width;
    this.physicalStickman.height = sizes.height;
    console.log(this.physicalStickman);
    console.log(STICKMAN_CONFIGS.headY + this.stickmanHeight + this.stickmanArmLength);

    stickmanLayer.add(stickmanNode);

    this.animationService.initMainAnimation(
      stickmanLayer,
      this,
      this.gravity,
      stickmanLayer.getHeight()
    );

    window.addEventListener('keydown', this.handleJumpKeyDown);
    window.addEventListener('keyup', this.handleJumpKeyUp);
    stickmanNode.on('click', () => this.jump());
  }
}
