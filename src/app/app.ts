import { ChangeDetectionStrategy,  Component } from '@angular/core';



import {Stickman} from './stickman/stickman';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [ Stickman],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class App   {

}
