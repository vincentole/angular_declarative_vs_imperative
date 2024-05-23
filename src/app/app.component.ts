import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImperativeComponent } from './imperative/imperative.component';
import { DeclarativeComponent } from './declarative/declarative.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ImperativeComponent, DeclarativeComponent],
  template: `
    <div class="flex justify-center gap-10">
      <app-imperative />
      <app-declarative />
    </div>
  `,
})
export class AppComponent {
  title = 'declarative_code_example';
}
