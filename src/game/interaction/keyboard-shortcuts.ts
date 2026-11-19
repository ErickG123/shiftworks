export type ShortcutAction =
  | 'ROTATE_PIECE'
  | 'CANCEL_TOOL'
  | 'TOGGLE_SIMULATION'
  | 'CAMERA_PAN_FORWARD'
  | 'CAMERA_PAN_BACKWARD'
  | 'CAMERA_PAN_LEFT'
  | 'CAMERA_PAN_RIGHT'
  | 'CAMERA_ROTATE_LEFT'
  | 'CAMERA_ROTATE_RIGHT'
  | 'CAMERA_CENTER';

const BLOCKED_CONTAINER_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
  '[role="combobox"]',
  'dialog',
  '[role="dialog"]',
  '[aria-modal="true"]',
  '.settings-overlay:not([hidden])',
  '.victory-overlay:not([hidden])',
  '.screen-overlay:not([hidden])',
].join(', ');

function isButtonActivationKey(event: KeyboardEvent): boolean {
  return (
    event.code === 'Space' ||
    event.key === ' ' ||
    event.code === 'Enter' ||
    event.key === 'Enter'
  );
}

function isTargetBlocked(target: EventTarget | null, event: KeyboardEvent): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.closest(BLOCKED_CONTAINER_SELECTOR)) return true;
  if (target.closest('button, [role="button"]') && isButtonActivationKey(event)) {
    return true;
  }
  return false;
}

export function isGlobalShortcutAllowed(
  event: KeyboardEvent,
  options: Readonly<{ allowRepeat?: boolean }> = {},
): boolean {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.isComposing
  ) {
    return false;
  }
  if (!options.allowRepeat && event.repeat) {
    return false;
  }
  if (isTargetBlocked(event.target, event)) {
    return false;
  }
  if (
    typeof document !== 'undefined' &&
    document.activeElement &&
    document.activeElement !== event.target &&
    isTargetBlocked(document.activeElement, event)
  ) {
    return false;
  }
  return true;
}

export function resolveShortcutAction(event: KeyboardEvent): ShortcutAction | null {
  const code = event.code;
  const key = event.key.toLowerCase();

  if (code === 'KeyR' || key === 'r') return 'ROTATE_PIECE';
  if (code === 'Escape' || event.key === 'Escape') return 'CANCEL_TOOL';
  if (code === 'Space' || event.key === ' ') return 'TOGGLE_SIMULATION';
  if (code === 'KeyW' || key === 'w') return 'CAMERA_PAN_FORWARD';
  if (code === 'KeyS' || key === 's') return 'CAMERA_PAN_BACKWARD';
  if (code === 'KeyA' || key === 'a') return 'CAMERA_PAN_LEFT';
  if (code === 'KeyD' || key === 'd') return 'CAMERA_PAN_RIGHT';
  if (code === 'KeyQ' || key === 'q') return 'CAMERA_ROTATE_LEFT';
  if (code === 'KeyE' || key === 'e') return 'CAMERA_ROTATE_RIGHT';
  if (code === 'Home' || event.key === 'Home') return 'CAMERA_CENTER';

  return null;
}
