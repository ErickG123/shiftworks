export type InspectorTabName = 'objective' | 'selection' | 'diagnostics' | 'resources';

export class InspectorPanelController {
  private activeTab: InspectorTabName = 'objective';
  private collapsed = false;
  private readonly observer: MutationObserver | null;

  constructor(app: HTMLElement) {
    const tabs = app.querySelectorAll<HTMLButtonElement>('[data-inspector-tab]');
    const panes = app.querySelectorAll<HTMLElement>('[data-inspector-pane]');

    const setTab = (tabName: InspectorTabName): void => {
      this.activeTab = tabName;
      tabs.forEach((btn) => {
        btn.setAttribute('aria-selected', String(btn.dataset['inspectorTab'] === tabName));
      });
      panes.forEach((pane) => {
        pane.hidden = pane.dataset['inspectorPane'] !== tabName;
      });
    };

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.dataset['inspectorTab'] as InspectorTabName | undefined;
        if (name) setTab(name);
      });
    });
    setTab(this.activeTab);

    const toggleBtn = app.querySelector<HTMLButtonElement>('#toggle-inspector-btn');
    const workspace = app.querySelector<HTMLElement>('.game-workspace');
    const inspector = app.querySelector<HTMLElement>('#right-inspector-panel');
    toggleBtn?.addEventListener('click', () => {
      this.collapsed = !this.collapsed;
      if (workspace) {
        workspace.dataset['inspectorCollapsed'] = String(this.collapsed);
      }
      if (inspector) {
        inspector.hidden = this.collapsed;
      }
      toggleBtn.setAttribute('aria-expanded', String(!this.collapsed));
      window.dispatchEvent(new Event('resize'));
    });

    const procPanel = app.querySelector('#processor-rule-panel');
    const divPanel = app.querySelector('#diverter-rule-panel');
    if (procPanel || divPanel) {
      this.observer = new MutationObserver(() => {
        if (
          (procPanel && !procPanel.hasAttribute('hidden')) ||
          (divPanel && !divPanel.hasAttribute('hidden'))
        ) {
          setTab('selection');
        }
      });
      if (procPanel) {
        this.observer.observe(procPanel, { attributes: true, attributeFilter: ['hidden'] });
      }
      if (divPanel) {
        this.observer.observe(divPanel, { attributes: true, attributeFilter: ['hidden'] });
      }
    } else {
      this.observer = null;
    }
  }

  dispose(): void {
    this.observer?.disconnect();
  }
}
