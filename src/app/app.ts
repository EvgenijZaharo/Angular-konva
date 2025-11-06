import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal, ViewChild} from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);
  
  configStage: StageConfig = {
    width: window.innerWidth,
    height: window.innerHeight!,
  };
  score = signal(0);
  gameState = signal<GameState>(GameState.PLAYING);
  GameState = GameState;

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

    this.pipeService.initPipeAnimation(gameLayerNode, this.configStage.width!);
    this.pipeService.startSpawning(this.configStage.width!, this.configStage.height!, gameLayerNode);
    this.startGameLoop( stickmanNode);
  }

  private startGameLoop(stickmanNode: any): void {
    const gameLoop = () => {
      if (this.gameState() !== GameState.PLAYING) {
        return;
      }

      const stickmanBounds = stickmanNode.getClientRect();
      
      // Проверка столкновения с трубами
      if (this.pipeService.checkCollision(stickmanBounds)) {
        this.handleGameOver('Столкновение с трубой!');
        return;
      }
      
      // Проверка касания нижней границы
      if (stickmanBounds.y + stickmanBounds.height >= this.configStage.height!) {
        this.handleGameOver('Падение на землю!');
        return;
      }
      
      // Проверка касания верхней границы
      if (stickmanBounds.y <= 0) {
        this.handleGameOver('Вылет за верхнюю границу!');
        return;
      }
      
      // Проверка касания боковых границ
      if (stickmanBounds.x <= 0 || stickmanBounds.x + stickmanBounds.width >= this.configStage.width!) {
        this.handleGameOver('Вылет за боковую границу!');
        return;
      }

      const newScore = this.pipeService.getScore(stickmanBounds.x);
      if (newScore > 0) {
        this.score.set(this.score() + newScore);
        console.log('Score:', this.score);
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
    this.cdr.detectChanges();
  }

  restartGame(): void {
    console.log('Перезапуск игры');
    this.score.set(0);
    this.gameState.set(GameState.PLAYING);
    this.cdr.detectChanges();
    
    // Очистка труб
    this.pipeService.cleanup();
    
    // Сброс позиции stickman и возобновление анимаций
    if (this.stickmanComp) {
      this.stickmanComp.resetPosition();
    }
    
    // Возобновление анимаций стикмена
    this.animationService.startAllAnimations();
    
    // Перезапуск игры
    setTimeout(() => {
      this.initGame();
      this.cdr.detectChanges();
    }, 100);
  }
}
