import { describe, expect, it } from 'vitest';
import { EquipmentPreviewCard } from './equipment-preview-card';

describe('EquipmentPreviewCard lifecycle (EXP-09 SW-203)', () => {
  it('opens, toggles play/pause, closes on Escape, and disposes cleanly across 20 cycles without leaking', () => {
    const app = document.createElement('div');
    document.body.appendChild(app);
    const card = new EquipmentPreviewCard(app);
    expect(card.getLifecycle()).toBe('IDLE');

    for (let i = 0; i < 20; i += 1) {
      card.open(i % 2 === 0 ? 'CONVEYOR' : 'PROCESSOR');
      expect(card.getLifecycle()).toBe('PLAYING');
      card.togglePlay();
      expect(card.getLifecycle()).toBe('PAUSED');
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      expect(card.getLifecycle()).toBe('IDLE');
      expect(app.querySelectorAll('#equipment-preview-canvas')).toHaveLength(0);
    }

    card.dispose();
    expect(card.getLifecycle()).toBe('DISPOSED');
    app.remove();
  });
});
