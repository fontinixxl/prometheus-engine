import { init } from './app';

const container = document.getElementById('app');
if (container) {
  init(container);
} else {
  console.warn('No #app element found!');
}
