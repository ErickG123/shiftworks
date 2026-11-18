import { WebGLRenderer } from 'three';

type DisposableRenderer = Pick<WebGLRenderer, 'dispose'>;
type RendererFactory = () => DisposableRenderer;

export function probeWebGL(createRenderer: RendererFactory = () => new WebGLRenderer()): boolean {
  try {
    createRenderer().dispose();
    return true;
  } catch {
    return false;
  }
}

export function mountStatusPage(root: HTMLElement, webglAvailable: boolean): void {
  const engineStatus = root.querySelector<HTMLElement>('#engine-status');
  const webglStatus = root.querySelector<HTMLElement>('#webgl-status');
  const message = root.querySelector<HTMLElement>('#runtime-message');

  if (!engineStatus || !webglStatus || !message) {
    return;
  }

  engineStatus.textContent = webglAvailable ? 'Factory editor and simulation ready' : 'Factory editor unavailable';
  engineStatus.dataset.status = webglAvailable ? 'ready' : 'unavailable';

  webglStatus.textContent = webglAvailable ? 'Available' : 'Unavailable';
  webglStatus.dataset.status = webglAvailable ? 'available' : 'unavailable';

  message.textContent = webglAvailable
    ? 'Choose Campaign or Sandbox, then build and run a factory on the shared simulation engine.'
    : 'This browser could not create a WebGL renderer. The status page remains available; try a browser with WebGL enabled.';
}
