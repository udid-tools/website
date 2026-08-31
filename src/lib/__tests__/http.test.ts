import { describe, expect, it } from "vitest";
import { PayloadTooLargeError, readBody } from "@/lib/http";

describe("bounded request bodies", () => {
  it("reads a request within the limit", async () => {
    const body = await readBody(
      new Request("https://example.test", { method: "POST", body: "hello" }),
      5
    );
    expect(Buffer.from(body).toString("utf8")).toBe("hello");
  });

  it("returns an empty body for requests without a stream", async () => {
    expect((await readBody(new Request("https://example.test"), 5)).byteLength).toBe(0);
  });

  it("rejects a declared oversized body", async () => {
    const request = new Request("https://example.test", {
      method: "POST",
      headers: { "Content-Length": "6" },
      body: "hello",
    });
    await expect(readBody(request, 5)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });

  it("rejects a streamed oversized body", async () => {
    const request = new Request("https://example.test", { method: "POST", body: "too large" });
    await expect(readBody(request, 3)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });
});
