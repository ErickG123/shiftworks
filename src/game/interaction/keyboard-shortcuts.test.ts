import { describe, expect, it } from 'vitest';
import { isGlobalShortcutAllowed, resolveShortcutAction } from './keyboard-shortcuts';

function keydown(target: HTMLElement, options: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: 'r',
    code: 'KeyR',
    bubbles: true,
    cancelable: true,
    ...options,
  });
  target.dispatchEvent(event);
  return event;
}

describe('global keyboard shortcuts', () => {
  it.each(['input', 'textarea', 'select'])(
    'does not steal keys from %s form controls',
    (tagName) => {
      const element = document.createElement(tagName);
      expect(isGlobalShortcutAllowed(keydown(element))).toBe(false);
      expect(
        isGlobalShortcutAllowed(keydown(element, { key: 'w', code: 'KeyW' })),
      ).toBe(false);
      expect(
        isGlobalShortcutAllowed(keydown(element, { key: 'q', code: 'KeyQ' })),
      ).toBe(false);
    },
  );

  it('does not steal Space or Enter from buttons, but allows board shortcuts when a toolbar button is focused', () => {
    const button = document.createElement('button');
    const label = document.createElement('span');
    button.append(label);

    expect(
      isGlobalShortcutAllowed(keydown(button, { key: ' ', code: 'Space' })),
    ).toBe(false);
    expect(
      isGlobalShortcutAllowed(keydown(label, { key: 'Enter', code: 'Enter' })),
    ).toBe(false);

    // R, WASD, Q/E must still work after clicking a toolbar button
    expect(isGlobalShortcutAllowed(keydown(button, { key: 'r', code: 'KeyR' }))).toBe(true);
    expect(isGlobalShortcutAllowed(keydown(button, { key: 'q', code: 'KeyQ' }))).toBe(true);
    expect(isGlobalShortcutAllowed(keydown(button, { key: 'w', code: 'KeyW' }))).toBe(true);
  });

  it('blocks all shortcuts inside dialogs, modals, comboboxes, and contenteditable elements', () => {
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    expect(isGlobalShortcutAllowed(keydown(editable))).toBe(false);

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    const dialogBtn = document.createElement('button');
    dialog.append(dialogBtn);
    expect(isGlobalShortcutAllowed(keydown(dialogBtn, { key: 'r', code: 'KeyR' }))).toBe(false);
    expect(isGlobalShortcutAllowed(keydown(dialogBtn, { key: 'q', code: 'KeyQ' }))).toBe(false);
  });

  it('allows shortcuts from the board and rejects modified or repeated shortcuts', () => {
    const canvas = document.createElement('canvas');
    expect(isGlobalShortcutAllowed(keydown(canvas))).toBe(true);
    expect(isGlobalShortcutAllowed(keydown(canvas, { ctrlKey: true }))).toBe(false);
    expect(isGlobalShortcutAllowed(keydown(canvas, { altKey: true }))).toBe(false);
    expect(isGlobalShortcutAllowed(keydown(canvas, { metaKey: true }))).toBe(false);
    expect(isGlobalShortcutAllowed(keydown(canvas, { shiftKey: true }))).toBe(false);
    expect(isGlobalShortcutAllowed(keydown(canvas, { repeat: true }))).toBe(false);
    expect(
      isGlobalShortcutAllowed(keydown(canvas, { repeat: true }), { allowRepeat: true }),
    ).toBe(true);
  });

  it('maps R to piece rotation and WASD/QE to camera navigation independently', () => {
    const canvas = document.createElement('canvas');
    expect(resolveShortcutAction(keydown(canvas, { key: 'r', code: 'KeyR' }))).toBe(
      'ROTATE_PIECE',
    );
    expect(resolveShortcutAction(keydown(canvas, { key: 'R', code: 'KeyR' }))).toBe(
      'ROTATE_PIECE',
    );
    expect(resolveShortcutAction(keydown(canvas, { key: 'w', code: 'KeyW' }))).toBe(
      'CAMERA_PAN_FORWARD',
    );
    expect(resolveShortcutAction(keydown(canvas, { key: 's', code: 'KeyS' }))).toBe(
      'CAMERA_PAN_BACKWARD',
    );
    expect(resolveShortcutAction(keydown(canvas, { key: 'a', code: 'KeyA' }))).toBe(
      'CAMERA_PAN_LEFT',
    );
    expect(resolveShortcutAction(keydown(canvas, { key: 'd', code: 'KeyD' }))).toBe(
      'CAMERA_PAN_RIGHT',
    );
    expect(resolveShortcutAction(keydown(canvas, { key: 'q', code: 'KeyQ' }))).toBe(
      'CAMERA_ROTATE_LEFT',
    );
    expect(resolveShortcutAction(keydown(canvas, { key: 'e', code: 'KeyE' }))).toBe(
      'CAMERA_ROTATE_RIGHT',
    );
    expect(resolveShortcutAction(keydown(canvas, { key: 'Escape', code: 'Escape' }))).toBe(
      'CANCEL_TOOL',
    );
    expect(resolveShortcutAction(keydown(canvas, { key: ' ', code: 'Space' }))).toBe(
      'TOGGLE_SIMULATION',
    );
  });
});
