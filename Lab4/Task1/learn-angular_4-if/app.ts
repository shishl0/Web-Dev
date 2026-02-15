import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    @if (isLoggedIn) {
      <p>Welcome back, Friend!</p>
    } @else {
      <p>I don't know you...</p>
    }

    <p>Is the server running? :</p>
    @if (isServerRunning) {
      <p>Yes! It is.</p>
    } @else {
      <p>No. It is not</p>
    }
  `,
})
export class App {
  isLoggedIn = false;
  isServerRunning = true;
}
