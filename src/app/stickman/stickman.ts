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
  imports: [CoreShapeComponent],
})
export class Stickman implements AfterViewInit,  OnDestroy {
  animationService = inject(StickmanAnimationService);
  @Input() layer!: any;
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
  private isInitialized = false;

  initializeSize(): void {
    if (this.isInitialized) {
      console.warn('Stickman size already initialized');
    }
    const konvaNode = this.stickmanNode?.getNode();
    if (!konvaNode) {
      console.log('Cannot initialize stickman size: Konva');
      return;
    }

    const sizes = konvaNode.getClientRect();
    this.physicalStickman.position.x = sizes.x;
    this.physicalStickman.position.y = sizes.y;
    this.physicalStickman.width = sizes.width + this.stickmanConfig.x;
    this.physicalStickman.height = sizes.height + this.stickmanArmLength;
    this.isInitialized = true;

  }

  getPhysicalParams(): any {
    return {
      physicalStickman: this.physicalStickman,
      physicalArm: this.physicStikmanArm,
      armLength: this.stickmanArmLength,
      gravity: this.gravity,
      height: this.stickmanHeight,
      jumpVelocity: this.jumpVelocity,
    }
  }



  handleJumpKeyDown = (event: KeyboardEvent): void => {
    if ((event.code === 'Space' || event.key === ' ') && !this.isSpacePressed) {
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
      this.physicalStickman.velocity = -this.jumpVelocity;
      console.log('Jump! Velocity set to', this.physicalStickman.velocity);
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
    else {
      console.log('Stickman node initialized');
    }
    const stickmanNode = this.stickmanNode.getNode();
    const stickmanLayer = this.layer;

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

    this.layer.getNode().add(stickmanLayer);

    this.animationService.initMainAnimation(
      stickmanLayer,
      this,
      this.gravity,
      4000
    );

    window.addEventListener('keydown', this.handleJumpKeyDown);
    window.addEventListener('keyup', this.handleJumpKeyUp);
    stickmanNode.on('click', () => this.jump());
  }
}
