import { afterEach, describe, expect, it, vi } from "vitest";
import { writeClipboard } from "./clipboard";

function browser({ secure = true, native = false } = {}) {
  const originalRange = { cloneRange: vi.fn() };
  const savedRange = {};
  originalRange.cloneRange.mockReturnValue(savedRange);
  const selection = {
    rangeCount: 1,
    getRangeAt: vi.fn().mockReturnValue(originalRange),
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
  };
  const control = { focus: vi.fn() };
  const textarea = {
    value: "",
    style: { position: "", opacity: "" },
    setAttribute: vi.fn(),
    select: vi.fn(),
    remove: vi.fn(),
  };
  const document = {
    activeElement: control,
    body: { appendChild: vi.fn() },
    createElement: vi.fn().mockReturnValue(textarea),
    execCommand: vi.fn().mockReturnValue(true),
  };
  const clipboard = native ? { writeText: vi.fn().mockResolvedValue(undefined) } : undefined;
  vi.stubGlobal("navigator", { clipboard });
  vi.stubGlobal("window", {
    isSecureContext: secure,
    getSelection: vi.fn().mockReturnValue(selection),
  });
  vi.stubGlobal("document", document);
  return { clipboard, control, document, textarea, selection, savedRange };
}

afterEach(() => vi.unstubAllGlobals());

describe("writeClipboard", () => {
  it("does nothing for an empty value", async () => {
    const { clipboard, document } = browser({ native: true });
    expect(await writeClipboard("")).toBe(false);
    expect(clipboard?.writeText).not.toHaveBeenCalled();
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("prefers the native clipboard in a secure context without moving focus", async () => {
    const { clipboard, control, document } = browser({ native: true });
    expect(await writeClipboard("Example text")).toBe(true);
    expect(clipboard?.writeText).toHaveBeenCalledWith("Example text");
    expect(document.createElement).not.toHaveBeenCalled();
    expect(control.focus).not.toHaveBeenCalled();
  });

  it("falls back when the native clipboard rejects and restores focus and selection", async () => {
    const { clipboard, control, document, textarea, selection, savedRange } = browser({
      native: true,
    });
    clipboard?.writeText.mockRejectedValue(new Error("Clipboard unavailable"));
    expect(await writeClipboard("Example text")).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(textarea.value).toBe("Example text");
    expect(textarea.setAttribute).toHaveBeenCalledWith("readonly", "");
    expect(document.body.appendChild).toHaveBeenCalledWith(textarea);
    expect(textarea.select).toHaveBeenCalledOnce();
    expect(textarea.remove).toHaveBeenCalledOnce();
    expect(control.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(selection.removeAllRanges).toHaveBeenCalledOnce();
    expect(selection.addRange).toHaveBeenCalledWith(savedRange);
  });

  it("uses the fallback on insecure origins even when the native clipboard exists", async () => {
    const { clipboard, textarea } = browser({ native: true, secure: false });
    expect(await writeClipboard("Example text")).toBe(true);
    expect(clipboard?.writeText).not.toHaveBeenCalled();
    expect(textarea.remove).toHaveBeenCalledOnce();
  });

  it("restores selection inside a text input", async () => {
    const { document } = browser();
    const input = {
      focus: vi.fn(),
      selectionStart: 2,
      selectionEnd: 7,
      selectionDirection: "backward",
      setSelectionRange: vi.fn(),
    };
    document.activeElement = input;
    expect(await writeClipboard("Example text")).toBe(true);
    expect(input.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(input.setSelectionRange).toHaveBeenCalledWith(2, 7, "backward");
  });

  it("restores input selection with no direction when the browser returns null", async () => {
    const { document } = browser();
    const input = {
      focus: vi.fn(),
      selectionStart: 0,
      selectionEnd: 4,
      selectionDirection: null,
      setSelectionRange: vi.fn(),
    };
    document.activeElement = input;
    expect(await writeClipboard("Example text")).toBe(true);
    expect(input.setSelectionRange).toHaveBeenCalledWith(0, 4, undefined);
  });

  it("cleans up and restores focus when the browser throws during copy", async () => {
    const { control, document, textarea, selection } = browser();
    document.execCommand.mockImplementation(() => {
      throw new Error("Copy unavailable");
    });
    expect(await writeClipboard("Example text")).toBe(false);
    expect(textarea.remove).toHaveBeenCalledOnce();
    expect(control.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(selection.removeAllRanges).toHaveBeenCalledOnce();
  });

  it("returns an unsuccessful fallback result and still cleans up", async () => {
    const { document, textarea } = browser();
    document.execCommand.mockReturnValue(false);
    expect(await writeClipboard("Example text")).toBe(false);
    expect(textarea.remove).toHaveBeenCalledOnce();
  });

  it("works with no selection or active control", async () => {
    const { document, textarea } = browser();
    vi.stubGlobal("window", { isSecureContext: false, getSelection: () => null });
    vi.stubGlobal("document", { ...document, activeElement: null });
    expect(await writeClipboard("Example text")).toBe(true);
    expect(textarea.remove).toHaveBeenCalledOnce();
  });

  it("returns false if creating the fallback element fails", async () => {
    const { control, document } = browser();
    document.createElement.mockImplementation(() => {
      throw new Error("Document unavailable");
    });
    expect(await writeClipboard("Example text")).toBe(false);
    expect(control.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("keeps a successful result when a previously focused control is removed", async () => {
    const { control, textarea } = browser();
    control.focus.mockImplementation(() => {
      throw new Error("Control was removed");
    });
    expect(await writeClipboard("Example text")).toBe(true);
    expect(textarea.remove).toHaveBeenCalledOnce();
  });
});
