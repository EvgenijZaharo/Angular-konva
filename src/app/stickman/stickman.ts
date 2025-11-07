import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {CircleConfig} from 'konva/lib/shapes/Circle';
import {CoreShapeComponent} from 'ng2-konva';
import {GroupConfig} from 'konva/lib/Group';
import {LineConfig} from 'konva/lib/shapes/Line';
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
export class Stickman implements AfterViewInit, OnDestroy {
  animationService = inject(StickmanAnimationService);
  @Input() layer!: any;
  @Input() isGameActive = true;
  @ViewChild('stickman', { static: false }) stickmanNode!: any;
  @ViewChild('leftArm', { static: false }) leftArmComp!: CoreShapeComponent;
  @ViewChild('rightArm', { static: false }) rightArmComp!: CoreShapeComponent;

  protected readonly stickmanBody: LineConfig = STICKMAN_CONFIGS.body;
  protected readonly stickmanHead: CircleConfig = STICKMAN_CONFIGS.head;
  protected readonly stickmanLeftArm: LineConfig = STICKMAN_CONFIGS.leftArm;
  protected readonly stickmanRightArm: LineConfig = STICKMAN_CONFIGS.rightArm;
  protected readonly stickmanLeftLeg: LineConfig = STICKMAN_CONFIGS.leftLeg;
  protected readonly stickmanRightLeg: LineConfig = STICKMAN_CONFIGS.rightLeg;
  protected readonly stickmanConfig: GroupConfig = STICKMAN_CONFIGS.group;
  protected readonly physicStikmanArm = STICKMAN_CONFIGS.physicArm;
  protected readonly physicalStickman = STICKMAN_CONFIGS.physical;
  protected readonly stickmanArmLength :number = STICKMAN_CONFIGS.arm;
  private readonly _gravity :number = STICKMAN_CONFIGS.gravity;
  private readonly _jumpVelocity :number = STICKMAN_CONFIGS.jumpVelocity;

  private _isSpacePressed:boolean = false;

  @HostListener('window:keydown', ['$event'])
  protected onWindowKeyDown(event: KeyboardEvent): void {
    if ((event.code === 'Space' || event.key === ' ') && !this._isSpacePressed && this.isGameActive) {
      event.preventDefault();
      this._isSpacePressed = true;
      this.jump();
    }
  }

  @HostListener('window:keyup', ['$event'])
  protected onWindowKeyUp(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this._isSpacePressed = false;
    }
  }

  protected jump(): void {
    if (!this.isGameActive) {
      return;
    }
    this.physicalStickman.velocity = -this._jumpVelocity;
    console.log('Jump! Velocity set to', this.physicalStickman.velocity);
  }

  protected resetPosition(): void {
    console.log('Resetting stickman position');
    const stickmanNode = this.stickmanNode?.getNode();
    if (!stickmanNode) {
      return;
    }
    this._isSpacePressed = false;
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

  ngAfterViewInit(): void {
    if (!this.stickmanNode) {
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
    const collider = new Konva.Rect({
      x: sizes.x,
      y: sizes.y,
      width: sizes.width,
      height: sizes.height,
      stroke: 'red',
      strokeWidth: 1,
    });
    stickmanNode.add(collider);
    console.log(sizes);
    this.physicalStickman.position.x = stickmanNode.x();
    this.physicalStickman.position.y = stickmanNode.y();
    this.physicalStickman.width = sizes.width;
    this.physicalStickman.height = sizes.height;
    console.log(this.physicalStickman);

    stickmanLayer.add(stickmanNode);

    this.animationService.initMainAnimation(
      stickmanLayer,
      this,
      this._gravity,
    );
    stickmanNode.on('click', () => this.jump());
  }

  ngOnDestroy(): void {
    console.log('Stickman destroyed');
    this.animationService.stopAllAnimations();
  }
}
