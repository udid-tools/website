export async function writeClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Use the compatibility fallback below.
  }

  let textarea: HTMLTextAreaElement | undefined;
  let focusedElement: HTMLElement | null = null;
  let selection: Selection | null = null;
  const ranges: Range[] = [];
  let inputSelection:
    { start: number; end: number; direction: "forward" | "backward" | "none" | null } | undefined;
  try {
    focusedElement = document.activeElement as HTMLElement | null;
    selection = window.getSelection();
    if (selection) {
      for (let index = 0; index < selection.rangeCount; index++) {
        ranges.push(selection.getRangeAt(index).cloneRange());
      }
    }
    const input = focusedElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (
      input &&
      typeof input.selectionStart === "number" &&
      typeof input.selectionEnd === "number"
    ) {
      inputSelection = {
        start: input.selectionStart,
        end: input.selectionEnd,
        direction: input.selectionDirection,
      };
    }

    textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea?.remove();
    try {
      focusedElement?.focus({ preventScroll: true });
      if (selection) {
        selection.removeAllRanges();
        for (const range of ranges) selection.addRange(range);
      }
      if (inputSelection) {
        (focusedElement as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
          inputSelection.start,
          inputSelection.end,
          inputSelection.direction ?? undefined
        );
      }
    } catch {
      // A removed control or unsupported selection must not turn copying into an error.
    }
  }
}
