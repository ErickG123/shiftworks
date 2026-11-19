import {
  buildCatalogEntries,
  filterAndSortCatalog,
  type CatalogCategory,
  type CatalogEntry,
  type CatalogItemStatus,
  type CatalogSortBy,
} from '../domain/catalog.model';
import type { EditableComponentType } from '../domain/component.model';
import { i18n } from '../../i18n';
import catalogScreenHtml from './catalog-screen.html?raw';

export interface CatalogViewCallbacks {
  readonly getCompletedLevels: () => readonly string[];
  readonly getCollectedItems: () => Readonly<Record<string, number>>;
  readonly onBack: () => void;
  readonly onOpen3DPreview: (
    type: EditableComponentType,
    invoker?: HTMLElement | null,
  ) => void;
  readonly mountHtml: (container: HTMLElement, rawHtml: string) => void;
  readonly applyDataI18n: (root: HTMLElement) => void;
}

export class CatalogViewController {
  private category: CatalogCategory = 'MACHINES';
  private query = '';
  private statusFilter: 'ALL' | CatalogItemStatus = 'ALL';
  private sortBy: CatalogSortBy = 'CAMPAIGN';
  private selectedId: string | null = null;

  constructor(private readonly callbacks: CatalogViewCallbacks) {}

  render(overlay: HTMLElement): void {
    this.callbacks.mountHtml(overlay, catalogScreenHtml);
    this.callbacks.applyDataI18n(overlay);

    const searchInput = overlay.querySelector<HTMLInputElement>('#catalog-search');
    if (searchInput) {
      searchInput.placeholder = i18n.t('catalog.searchPlaceholder');
      searchInput.value = this.query;
      searchInput.addEventListener('input', () => {
        this.query = searchInput.value;
        this.renderEntries(overlay);
      });
    }

    const statusSelect = overlay.querySelector<HTMLSelectElement>('#catalog-status-filter');
    if (statusSelect) {
      statusSelect.value = this.statusFilter;
      statusSelect.addEventListener('change', () => {
        this.statusFilter = statusSelect.value as 'ALL' | CatalogItemStatus;
        this.renderEntries(overlay);
      });
    }

    const sortSelect = overlay.querySelector<HTMLSelectElement>('#catalog-sort');
    if (sortSelect) {
      sortSelect.value = this.sortBy;
      sortSelect.addEventListener('change', () => {
        this.sortBy = sortSelect.value as CatalogSortBy;
        this.renderEntries(overlay);
      });
    }

    overlay.querySelectorAll<HTMLButtonElement>('[data-catalog-tab]').forEach((tab) => {
      const cat = tab.dataset['catalogTab'] as CatalogCategory;
      tab.setAttribute('aria-selected', String(cat === this.category));
      tab.addEventListener('click', () => {
        this.category = cat;
        this.selectedId = null;
        overlay
          .querySelectorAll<HTMLButtonElement>('[data-catalog-tab]')
          .forEach((btn) =>
            btn.setAttribute('aria-selected', String(btn.dataset['catalogTab'] === cat)),
          );
        this.renderEntries(overlay);
      });
    });

    overlay.querySelector('#catalog-back')?.addEventListener('click', () => {
      this.callbacks.onBack();
    });

    this.renderEntries(overlay);
  }

  private getEntryLabel(entry: CatalogEntry): string {
    if (entry.status === 'LOCKED') {
      return i18n.t('catalog.mysteryTitle');
    }
    return entry.category === 'MACHINES'
      ? i18n.t(`components.${entry.id}`)
      : i18n.t(`items.${entry.id}`);
  }

  private renderEntries(overlay: HTMLElement): void {
    const grid = overlay.querySelector<HTMLElement>('#catalog-grid');
    const detail = overlay.querySelector<HTMLElement>('#catalog-detail');
    if (!grid || !detail) return;

    const allEntries = buildCatalogEntries(
      this.callbacks.getCompletedLevels(),
      this.callbacks.getCollectedItems(),
    );
    const items = filterAndSortCatalog(allEntries, {
      category: this.category,
      query: this.query,
      status: this.statusFilter,
      sortBy: this.sortBy,
      getLabel: (e) => this.getEntryLabel(e),
    });

    grid.replaceChildren();
    if (items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'catalog-empty';
      empty.textContent = i18n.t('catalog.emptyState');
      grid.append(empty);
      detail.replaceChildren();
      return;
    }

    if (!this.selectedId || !items.some((i) => i.id === this.selectedId)) {
      this.selectedId = items[0]!.id;
    }

    for (const entry of items) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'catalog-item-card';
      card.dataset['status'] = entry.status;
      card.dataset['selected'] = String(entry.id === this.selectedId);

      const swatch = document.createElement('span');
      swatch.className = 'catalog-swatch';
      swatch.style.backgroundColor = entry.status === 'LOCKED' ? '#334155' : entry.accentColor;

      const info = document.createElement('div');
      info.className = 'catalog-item-info';
      const title = document.createElement('strong');
      title.textContent = this.getEntryLabel(entry);
      const badge = document.createElement('span');
      badge.className = 'catalog-status-badge';
      badge.dataset['status'] = entry.status;
      badge.textContent = i18n.t(`catalog.status.${entry.status}`);

      info.append(title, badge);
      card.append(swatch, info);

      if (entry.category === 'RESOURCES' && entry.collectedCount > 0) {
        const count = document.createElement('small');
        count.className = 'catalog-item-count';
        count.textContent = `×${entry.collectedCount}`;
        card.append(count);
      }

      card.addEventListener('click', () => {
        this.selectedId = entry.id;
        this.renderEntries(overlay);
      });
      grid.append(card);
    }

    const selected = items.find((i) => i.id === this.selectedId) ?? items[0]!;
    this.renderDetail(detail, selected);
  }

  private renderDetail(container: HTMLElement, entry: CatalogEntry): void {
    container.replaceChildren();

    const header = document.createElement('div');
    header.className = 'catalog-detail-header';
    const swatch = document.createElement('span');
    swatch.className = 'catalog-swatch catalog-swatch-lg';
    swatch.style.backgroundColor = entry.status === 'LOCKED' ? '#334155' : entry.accentColor;

    const titleWrap = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = this.getEntryLabel(entry);
    const badge = document.createElement('span');
    badge.className = 'catalog-status-badge';
    badge.dataset['status'] = entry.status;
    badge.textContent = i18n.t(`catalog.status.${entry.status}`);
    titleWrap.append(title, badge);
    header.append(swatch, titleWrap);
    container.append(header);

    const desc = document.createElement('p');
    desc.className = 'catalog-detail-desc';
    if (entry.status === 'LOCKED') {
      desc.textContent = i18n.t('catalog.mysteryDesc');
    } else {
      desc.textContent =
        entry.category === 'MACHINES'
          ? i18n.t(`catalog.machineDesc.${entry.id}`)
          : i18n.t(`catalog.resourceDesc.${entry.id}`);
    }
    container.append(desc);

    const metaList = document.createElement('dl');
    metaList.className = 'catalog-meta-list';

    const addMeta = (label: string, value: string): void => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      metaList.append(dt, dd);
    };

    addMeta(
      i18n.t('catalog.roleLabel'),
      entry.category === 'MACHINES'
        ? i18n.t('catalog.tabMachines')
        : entry.subCategory === 'RAW'
          ? i18n.t('catalog.categoryRaw')
          : i18n.t('catalog.categoryProcessed'),
    );
    addMeta(i18n.t('catalog.unlockReq', { level: entry.unlockLevelId }), entry.unlockLevelId);

    if (entry.status !== 'LOCKED' && entry.recipeSummary) {
      addMeta(i18n.t('catalog.recipeLabel'), entry.recipeSummary);
    }

    if (entry.category === 'RESOURCES' && entry.status !== 'LOCKED') {
      addMeta(
        i18n.t('catalog.collectedCount', { count: entry.collectedCount }),
        String(entry.collectedCount),
      );
    }

    container.append(metaList);

    if (entry.category === 'MACHINES' && entry.status !== 'LOCKED' && entry.has3DPreview) {
      const previewBtn = document.createElement('button');
      previewBtn.type = 'button';
      previewBtn.className = 'btn-primary catalog-preview-btn';
      previewBtn.textContent = i18n.t('catalog.open3DPreview');
      previewBtn.addEventListener('click', () => {
        this.callbacks.onOpen3DPreview(entry.id as EditableComponentType, previewBtn);
      });
      container.append(previewBtn);
    }
  }
}
