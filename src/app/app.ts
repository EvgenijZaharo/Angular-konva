import {AfterViewInit, ChangeDetectionStrategy,  Component, inject, signal, ViewChild} from '@angular/core';
import {Stickman} from './stickman/stickman';
import {PipeService} from './pipe/pipe-service';
import {StageConfig} from 'konva/lib/Stage';
import {StickmanAnimationService} from './stickman-animation';
import {CoreShapeComponent, StageComponent} from 'ng2-konva';

export enum GameState {
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
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

  protected readonly configStage: StageConfig = {
    width: window.innerWidth,
    height: window.innerHeight!,
  };
  protected score = signal(0);
  protected gameState = signal<GameState>(GameState.PLAYING);
  protected GameState = GameState;

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
    const stickheight: number = stickmanNode.getClientRect().height * 1.75;
    console.log('Calculated stick height:', stickheight);
    const gameLayerNode: any = this.gameLayer?.getNode?.() ?? null;
    if (!gameLayerNode) {
      console.error('Game layer Konva node not found');
      return;
    }

    this.pipeService.initPipeAnimation(gameLayerNode);
    this.pipeService.startSpawning(stickheight, this.configStage.width!, this.configStage.height!, gameLayerNode);
    this.startGameLoop( stickmanNode);
  }

  private startGameLoop(stickmanNode: any): void {
    const gameLoop = () => {
      if (this.gameState() !== GameState.PLAYING) {
        return;
      }

      const stickmanBounds = stickmanNode.getClientRect();

      if (this.pipeService.checkCollision(stickmanBounds)) {
        this.handleGameOver('Collide with pipe');
        return;
      }

      if (stickmanBounds.y + stickmanBounds.height >= this.configStage.height!) {
        this.handleGameOver('Ground');
        return;
      }

      if (stickmanBounds.y <= 0) {
        this.handleGameOver('Upper bound');
        return;
      }

      const newScore = this.pipeService.getScore(stickmanBounds.x);
      if (newScore > 0) {
        this.score.set(this.score() + newScore);
        console.log('Score:', this.score());
      }
      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }

  private handleGameOver(reason: string): void {
    console.log('Game Over:', reason);
    this.gameState.set(GameState.GAME_OVER);
    this.animationService.stopAllAnimations();
    this.pipeService.cleanup();
  }

  protected restartGame(): void {
    console.log('Restarting game');
    this.score.set(0);
    this.gameState.set(GameState.PLAYING);

    this.pipeService.cleanup();

    if (this.stickmanComp) {
      this.stickmanComp.resetPosition();
    }

    this.animationService.startAllAnimations();

    setTimeout(() => {
      this.initGame();
    }, 100);
  }
}
