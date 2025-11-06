import { Injectable } from '@angular/core';
import Konva from 'konva';
import RectConfig = Konva.RectConfig;
import {STICKMAN_CONFIGS} from '../stickman/stickman.config';

export interface PipePair {
  upper: Konva.Rect;
  lower: Konva.Rect;
  upperConfig: RectConfig;
  lowerConfig: RectConfig;
  passed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PipeService {
  readonly PIPE_SPEED = 120; // Скорость движения труб влево (пиксели в секунду)
  readonly PIPE_GAP = STICKMAN_CONFIGS.height;
  readonly PIPE_WIDTH = 50; // Ширина трубы
  readonly PIPE_INTERVAL = 5000; // Интервал генерации новых труб (мс)

  pipes: PipePair[] = [];
  private spawnInterval: any = null;
  private pipeAnimation: Konva.Animation | null = null;

  generatePipePair(stageWidth: number, stageHeight: number, layer: Konva.Layer): void {
    const minGapY = 100;
    const maxGapY = stageHeight - this.PIPE_GAP - 100;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    const upperConfig: RectConfig = {
      x: stageWidth,
      y: 0,
      width: this.PIPE_WIDTH,
      height: gapY,
      fill: 'green',
      stroke: 'darkgreen',
      strokeWidth: 3,
    };

    const lowerConfig: RectConfig = {
      x: stageWidth,
      y: gapY + this.PIPE_GAP,
      width: this.PIPE_WIDTH,
      height: stageHeight - (gapY + this.PIPE_GAP),
      fill: 'green',
      stroke: 'darkgreen',
      strokeWidth: 3,
    };

    const upperNode = new Konva.Rect(upperConfig);
    const lowerNode = new Konva.Rect(lowerConfig);

    layer.add(upperNode);
    layer.add(lowerNode);

    this.pipes.push({
      upper: upperNode,
      lower: lowerNode,
      upperConfig: upperConfig,
      lowerConfig: lowerConfig,
      passed: false,
    });
  }

  startSpawning(stageWidth: number, stageHeight: number, layer: Konva.Layer): void {
    // Создаём первую пару труб сразу
    this.generatePipePair(stageWidth, stageHeight, layer);

    // Запускаем интервал для создания новых труб
    this.spawnInterval = setInterval(() => {
      this.generatePipePair(stageWidth, stageHeight, layer);
    }, this.PIPE_INTERVAL);
  }

  stopSpawning(): void {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  initPipeAnimation(layer: Konva.Layer, stageWidth: number): void {
    this.pipeAnimation = new Konva.Animation((frame) => {
      const dt = (frame?.timeDiff ?? 16) / 1000;
      const displacement = this.PIPE_SPEED * dt;

      // Обновляем позицию каждой пары труб
      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const pipe = this.pipes[i];

        // Двигаем трубы влево
        const newX = pipe.upper.x() - displacement;
        pipe.upper.x(newX);
        pipe.lower.x(newX);
        pipe.upperConfig.x = newX;
        pipe.lowerConfig.x = newX;

        // Удаляем трубы, которые вышли за пределы экрана
        if (newX + this.PIPE_WIDTH < 0) {
          pipe.upper.destroy();
          pipe.lower.destroy();
          this.pipes.splice(i, 1);
        }
      }

      return true;
    }, layer);

    this.pipeAnimation.start();
  }

  checkCollision(stickmanBounds: any): boolean {
    for (const pipe of this.pipes) {
      const upperBounds = pipe.upper.getClientRect();
      const lowerBounds = pipe.lower.getClientRect();

      if (
        this.isColliding(stickmanBounds, upperBounds) ||
        this.isColliding(stickmanBounds, lowerBounds)
      ) {
        return true;
      }
    }
    return false;
  }

  private isColliding(rect1: any, rect2: any): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect1.x > rect2.x + rect2.width ||
      rect1.y + rect1.height < rect2.y ||
      rect1.y > rect2.y + rect2.height
    );
  }

  cleanup(): void {
    this.stopSpawning();
    this.pipeAnimation?.stop();

    // Удаляем все трубы
    for (const pipe of this.pipes) {
      pipe.upper.destroy();
      pipe.lower.destroy();
    }
    this.pipes = [];
  }

  getScore(stickmanX: number): number {
    let score = 0;
    for (const pipe of this.pipes) {
      if (!pipe.passed && pipe.upper.x() + this.PIPE_WIDTH < stickmanX) {
        pipe.passed = true;
        score++;
      }
    }
    return score;
  }
}

