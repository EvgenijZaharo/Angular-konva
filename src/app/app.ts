import {AfterViewInit, ChangeDetectionStrategy, Component, inject, ViewChild} from '@angular/core';
import {Stickman} from './stickman/stickman';
import {PipeService} from './pipe/pipe-service';
import {StageConfig} from 'konva/lib/Stage';
import {StickmanAnimationService} from './stickman-animation';
import {CoreShapeComponent, StageComponent} from 'ng2-konva';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [Stickman, StageComponent, CoreShapeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class App implements AfterViewInit {
  @ViewChild('stage') stageComp!: StageComponent;
  @ViewChild('gameLayer') gameLayer!: any;
  @ViewChild(Stickman) stickmanComp!: any;
  pipeService = inject(PipeService);
  animationService = inject(StickmanAnimationService);
  configStage: StageConfig = {
    width: window.innerWidth,
    height: window.innerHeight!,
  };
  score = 0;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initGame();
    } , 0);
  }

  private initGame(): void {
    const stickmanNode = this.stickmanComp?.stickmanNode?.getNode?.();
    if (!stickmanNode) {
      console.error('Stickman Konva node not found');
      return;
    }
    const gameLayerNode: any = this.gameLayer?.getNode?.() ?? null;
    if (!gameLayerNode) {
      console.error('Game layer Konva node not found');
      return;
    }
    this.stickmanComp.initializeSize();
    const stickmanParams = this.stickmanComp.getPhysicalParams();

    this.animationService.initLimbAnimation(
      gameLayerNode,
      this.stickmanComp.leftArmComp,
      this.stickmanComp.rightArmComp,
      this.stickmanComp.physicStikmanArm,
      this.stickmanComp.stickmanArmLength
    );
    this.animationService.initMainAnimation(
      gameLayerNode,
      this.stickmanComp,
      stickmanParams.gravity,
      this.configStage.height!
    );
    this.pipeService.initPipeAnimation(gameLayerNode, this.configStage.width!);
    this.pipeService.startSpawning(this.configStage.width!, this.configStage.height!, gameLayerNode);
    this.startGameLoop(this.gameLayer, stickmanNode);
  }

  private startGameLoop(layer:any, stickmanNode:any): void {
    const gameLoop = () => {
      const stickmanBounds = stickmanNode.getClientRect();
      if (this.pipeService.checkCollision(stickmanBounds)) {
        console.log('Game Over');
        this.animationService.stopMainAnimation();
        this.pipeService.cleanup();
        return;
      }
      const newScore = this.pipeService.getScore(stickmanBounds.x);
      if (newScore > 0) {
        this.score += newScore;
        console.log('Score:', this.score);
      }
      requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
  }
}
