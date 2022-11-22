import { Component } from '@angular/core';
import { CI_CODE, TEST_CODE } from './code';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'github-action-guide-ng';

  ci = CI_CODE;

  test = TEST_CODE;
}
