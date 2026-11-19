import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import type { Component, ComponentType } from '../domain/component.model';
import { getEquipmentCatalogEntry } from '../domain/equipment-catalog.model';
import type { PreviewLifecycleState } from '../domain/expansion-contracts.model';
import { ComponentView, type MachineVisualState } from './component-view';
import { disposeSceneResources } from './grid-view';
import { i18n } from '../../i18n';
import previewModalHtml from '../ui/equipment-preview-modal.html?raw';

const PREVIEW_GRID = Object.freeze({ width: 3, height: 3 });

function buildPreviewComponent(type: ComponentType): Component {
  const position = Object.freeze({ x: 1, y: 1 });
  if (type === 'SOURCE') {
    return Object.freeze({
      id: 'preview-source',
      type: 'SOURCE',
      isFixed: true,
      position,
      direction: 'E',
      sequence: Object.freeze(['BLUE_BLANK' as const, 'AMBER_BLANK' as const]),
      intervalTicks: 5,
    });
  }
  if (type === 'OUTPUT') {
    return Object.freeze({
      id: 'preview-output',
      type: 'OUTPUT',
      isFixed: true,
      position,
      direction: 'E',
      acceptedTypes: Object.freeze(['CUT_PLATE' as const, 'PRESSED_BLOCK' as const]),
      label: 'DOCK',
    });
  }
  if (type === 'PROCESSOR') {
    return Object.freeze({
      id: 'preview-processor',
      type: 'PROCESSOR',
      isFixed: false,
      position,
      direction: 'E',
      defaultMode: 'CUT',
      rules: Object.freeze([
        { when: 'BLUE_BLANK' as const, then: 'CUT' as const },
        { when: 'AMBER_BLANK' as const, then: 'PRESS' as const },
      ]),
    });
  }
  if (type === 'DIVERTER') {
    return Object.freeze({
      id: 'preview-diverter',
      type: 'DIVERTER',
      isFixed: false,
      position,
      direction: 'E',
      rules: Object.freeze([
        { when: 'CUT_PLATE' as const, then: 'A' as const },
        { when: 'PRESSED_BLOCK' as const, then: 'B' as const },
      ]),
    });
  }
  return Object.freeze({
    id: 'preview-conveyor',
    type: 'CONVEYOR',
    isFixed: false,
    position,
    direction: 'E',
  });
}

export class EquipmentPreviewCard {
  private readonly overlay: HTMLElement;
  private lifecycle: PreviewLifecycleState = 'IDLE';
  private activeType: ComponentType | null = null;
  private lastInvoker: HTMLElement | null = null;
  private renderer: WebGLRenderer | null = null;
  private scene: Scene | null = null;
  private camera: OrthographicCamera | null = null;
  private componentView: ComponentView | null = null;
  private demoItem: Mesh | null = null;
  private animationFrame: number | null = null;
  private elapsedMs = 0;
  private lastFrameTime: number | null = null;

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (this.lifecycle === 'IDLE' || this.lifecycle === 'DISPOSED') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  };

  constructor(private readonly app: HTMLElement) {
    this.overlay = document.createElement('div');
    this.overlay.id = 'equipment-preview-overlay';
    this.overlay.className = 'equipment-preview-overlay';
    this.overlay.hidden = true;
    this.app.appendChild(this.overlay);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  getLifecycle(): PreviewLifecycleState {
    return this.lifecycle;
  }

  getActiveType(): ComponentType | null {
    return this.activeType;
  }

  open(type: ComponentType, invoker?: HTMLElement | null): void {
    this.teardownScene();
    this.activeType = type;
    this.lastInvoker = invoker ?? null;
    this.elapsedMs = 0;
    this.overlay.hidden = false;

    const template = document.createElement('template');
    template.innerHTML = previewModalHtml;
    this.overlay.replaceChildren(template.content.cloneNode(true));
    this.populateTranslations();

    this.overlay
      .querySelector<HTMLButtonElement>('#preview-close-btn')
      ?.addEventListener('click', () => this.close());
    this.overlay
      .querySelector<HTMLButtonElement>('#preview-toggle-play')
      ?.addEventListener('click', () => this.togglePlay());
    this.overlay
      .querySelector<HTMLButtonElement>('#preview-reset-demo')
      ?.addEventListener('click', () => this.resetDemo());

    const canvas = this.overlay.querySelector<HTMLCanvasElement>(
      '#equipment-preview-canvas',
    );
    if (canvas) {
      this.mountThreeScene(canvas, type);
    }

    this.lifecycle = 'PLAYING';
    this.syncPlayButton();
    this.startLoop();
    this.overlay.querySelector<HTMLButtonElement>('#preview-close-btn')?.focus();
  }

  close(): void {
    if (this.lifecycle === 'IDLE') return;
    this.teardownScene();
    this.overlay.hidden = true;
    this.overlay.replaceChildren();
    this.activeType = null;
    this.lifecycle = 'IDLE';
    this.lastInvoker?.focus();
    this.lastInvoker = null;
  }

  togglePlay(): void {
    if (this.lifecycle === 'PLAYING') {
      this.lifecycle = 'PAUSED';
      this.stopLoop();
    } else if (this.lifecycle === 'PAUSED') {
      this.lifecycle = 'PLAYING';
      this.startLoop();
    }
    this.syncPlayButton();
  }

  resetDemo(): void {
    this.elapsedMs = 0;
    this.updateDemoFrame(0);
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  refreshTranslations(): void {
    if (this.activeType && !this.overlay.hidden) {
      this.populateTranslations();
      this.syncPlayButton();
    }
  }

  dispose(): void {
    this.close();
    this.lifecycle = 'DISPOSED';
    document.removeEventListener('keydown', this.handleKeyDown);
    this.overlay.remove();
  }

  private populateTranslations(): void {
    if (!this.activeType) return;
    const entry = getEquipmentCatalogEntry(this.activeType);
    this.overlay.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
      const key = el.dataset['i18n'];
      if (key) el.textContent = i18n.t(key);
    });
    const title = this.overlay.querySelector('#preview-card-title');
    const summary = this.overlay.querySelector('#preview-summary');
    const usage = this.overlay.querySelector('#preview-usage');
    const ports = this.overlay.querySelector('#preview-ports');
    if (entry) {
      if (title) title.textContent = i18n.t(entry.nameKey);
      if (summary) summary.textContent = i18n.t(entry.summaryKey);
      if (usage) usage.textContent = i18n.t(entry.usageKey);
      if (ports) ports.textContent = i18n.t(entry.portsSummaryKey);
    }
  }

  private syncPlayButton(): void {
    const btn = this.overlay.querySelector<HTMLButtonElement>('#preview-toggle-play');
    if (!btn) return;
    btn.textContent =
      this.lifecycle === 'PLAYING'
        ? i18n.t('simulation.pause')
        : i18n.t('simulation.resume');
  }

  private mountThreeScene(canvas: HTMLCanvasElement, type: ComponentType): void {
    try {
      this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(380, 220, false);

      this.scene = new Scene();
      this.scene.background = new Color(0x0f172a);

      const aspect = 380 / 220;
      const h = 2.6;
      this.camera = new OrthographicCamera(
        (-h * aspect) / 2,
        (h * aspect) / 2,
        h / 2,
        -h / 2,
        0.1,
        50,
      );
      this.camera.position.set(4.5, 5.5, 4.5);
      this.camera.lookAt(0, 0.3, 0);

      const ambient = new AmbientLight(0xd8e6f8, 1.8);
      const key = new DirectionalLight(0xffffff, 2.2);
      key.position.set(-4, 8, 5);
      this.scene.add(ambient, key);

      this.componentView = new ComponentView(this.scene, PREVIEW_GRID);
      const comp = buildPreviewComponent(type);
      this.componentView.render([comp], null, null);

      this.demoItem = new Mesh(
        new BoxGeometry(0.28, 0.28, 0.28),
        new MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35 }),
      );
      this.demoItem.position.set(-0.9, 0.5, 0);
      this.scene.add(this.demoItem);

      this.updateDemoFrame(0);
      this.renderer.render(this.scene, this.camera);
    } catch {
      this.renderer = null;
      this.scene = null;
      this.camera = null;
    }
  }

  private startLoop(): void {
    this.stopLoop();
    this.lastFrameTime = performance.now();
    const tick = (now: number): void => {
      if (this.lifecycle !== 'PLAYING') return;
      const dt = this.lastFrameTime !== null ? Math.min(100, now - this.lastFrameTime) : 0;
      this.lastFrameTime = now;
      this.elapsedMs += dt;
      this.updateDemoFrame(this.elapsedMs);
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      this.animationFrame = window.requestAnimationFrame(tick);
    };
    this.animationFrame = window.requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.lastFrameTime = null;
  }

  private updateDemoFrame(ms: number): void {
    if (!this.activeType) return;
    const cycle = (ms * 0.0005) % 1;
    const isSecondHalf = cycle >= 0.5;
    const captionEl = this.overlay.querySelector('#preview-step-caption');

    if (this.activeType === 'PROCESSOR') {
      const states: MachineVisualState[] = [
        {
          componentId: 'preview-processor',
          phase: 'PROCESSING',
          mode: isSecondHalf ? 'PRESS' : 'CUT',
          targetMode: isSecondHalf ? 'PRESS' : 'CUT',
          route: null,
        },
      ];
      this.componentView?.setRuntimeStates(states, true);
      this.componentView?.animate(ms);
      if (this.demoItem) {
        (this.demoItem.material as MeshStandardMaterial).color.set(
          isSecondHalf ? 0xf59e0b : 0x38bdf8,
        );
        this.demoItem.position.set(-0.8 + ((cycle * 2) % 1) * 1.6, 0.5, 0);
      }
      if (captionEl) {
        captionEl.textContent = isSecondHalf
          ? i18n.t('preview.caption.processorPress')
          : i18n.t('preview.caption.processorCut');
      }
      return;
    }

    if (this.activeType === 'DIVERTER') {
      const states: MachineVisualState[] = [
        {
          componentId: 'preview-diverter',
          phase: 'PROCESSING',
          mode: 'CUT',
          targetMode: null,
          route: isSecondHalf ? 'B' : 'A',
        },
      ];
      this.componentView?.setRuntimeStates(states, true);
      this.componentView?.animate(ms);
      if (this.demoItem) {
        const t = (cycle * 2) % 1;
        if (isSecondHalf) {
          this.demoItem.position.set(0, 0.5, t * 0.9);
          (this.demoItem.material as MeshStandardMaterial).color.set(0xf59e0b);
        } else {
          this.demoItem.position.set(t * 0.9, 0.5, 0);
          (this.demoItem.material as MeshStandardMaterial).color.set(0x38bdf8);
        }
      }
      if (captionEl) {
        captionEl.textContent = isSecondHalf
          ? i18n.t('preview.caption.diverterB')
          : i18n.t('preview.caption.diverterA');
      }
      return;
    }

    if (this.demoItem) {
      this.demoItem.position.set(-0.85 + cycle * 1.7, 0.5, 0);
    }
    if (captionEl) {
      captionEl.textContent = i18n.t(`preview.caption.${this.activeType}`);
    }
  }

  private teardownScene(): void {
    this.stopLoop();
    this.componentView?.dispose();
    this.componentView = null;
    if (this.scene) {
      disposeSceneResources(this.scene);
      this.scene = null;
    }
    this.demoItem = null;
    this.renderer?.dispose();
    this.renderer = null;
    this.camera = null;
  }
}
