export function isGlobalShortcutAllowed(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing || event.repeat) return false;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  return !target.isContentEditable && !target.closest('input, textarea, select, button, [role="button"], [contenteditable="true"]');
}
