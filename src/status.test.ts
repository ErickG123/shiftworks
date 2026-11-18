import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountStatusPage, probeWebGL } from './status';

describe('foundation status page', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('reports the factory editor is ready when WebGL is available', () => {
    document.body.innerHTML = `
      <main>
        <dd id="engine-status"></dd>
        <dd id="webgl-status"></dd>
        <p id="runtime-message"></p>
      </main>`;

    const root = document.querySelector<HTMLElement>('main');
    expect(root).not.toBeNull();
    if (!root) return;

    mountStatusPage(root, true);

    expect(root.querySelector('#engine-status')?.textContent).toContain('Factory editor and simulation ready');
    expect(root.querySelector('#engine-status')?.getAttribute('data-status')).toBe('ready');
    expect(root.querySelector('#webgl-status')?.textContent).toBe('Available');
    expect(root.querySelector('#webgl-status')?.getAttribute('data-status')).toBe('available');
  });

  it('keeps a visible explanation when WebGL is unavailable', () => {
    document.body.innerHTML = `
      <main>
        <dd id="engine-status"></dd>
        <dd id="webgl-status"></dd>
        <p id="runtime-message"></p>
      </main>`;
    const root = document.querySelector<HTMLElement>('main');
    expect(root).not.toBeNull();
    if (!root) return;

    mountStatusPage(root, false);

    expect(root.querySelector('#webgl-status')?.textContent).toBe('Unavailable');
    expect(root.querySelector('#runtime-message')?.textContent).toContain('could not create a WebGL renderer');
  });

  it('returns false and does not throw when renderer creation fails', () => {
    const createRenderer = vi.fn(() => {
      throw new Error('WebGL unavailable');
    });

    expect(probeWebGL(createRenderer)).toBe(false);
    expect(createRenderer).toHaveBeenCalledOnce();
  });

  it('returns true and disposes a successfully created renderer', () => {
    const dispose = vi.fn();

    expect(probeWebGL(() => ({ dispose }))).toBe(true);
    expect(dispose).toHaveBeenCalledOnce();
  });
});
