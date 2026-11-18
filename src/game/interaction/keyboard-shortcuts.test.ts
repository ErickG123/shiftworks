import { describe, expect, it } from 'vitest';
import { isGlobalShortcutAllowed } from './keyboard-shortcuts';

function keydown(target: HTMLElement, options: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'r', bubbles: true, ...options, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('global keyboard shortcuts', () => {
  it.each(['input', 'textarea', 'select', 'button'])('does not steal keys from %s controls', (tagName) => {
    expect(isGlobalShortcutAllowed(keydown(document.createElement(tagName)))).toBe(false);
  });

  it('does not steal keys from nested button content or editable text', () => {
    const button = document.createElement('button');
    const label = document.createElement('span');
    button.append(label);
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    expect(isGlobalShortcutAllowed(keydown(label))).toBe(false);
    expect(isGlobalShortcutAllowed(keydown(editable))).toBe(false);
  });

  it('allows shortcuts from the board and rejects modified/repeated shortcuts', () => {
    const canvas = document.createElement('canvas');
    expect(isGlobalShortcutAllowed(keydown(canvas))).toBe(true);
    expect(isGlobalShortcutAllowed(keydown(canvas, { ctrlKey: true }))).toBe(false);
    expect(isGlobalShortcutAllowed(keydown(canvas, { repeat: true }))).toBe(false);
  });
});
