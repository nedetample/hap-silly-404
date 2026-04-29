import { afterEach, describe, expect, it } from "vitest";

import handler from "../netlify/functions/insult.mjs";

const ORIGINAL_ENV = { ...globalThis.process.env };

afterEach(() => {
  globalThis.process.env = { ...ORIGINAL_ENV };
});

describe("insult handler path query handling", () => {
  it("accepts valid path query values and continues normal response flow", async () => {
    globalThis.process.env.NETLIFY_DEV = "true";
    delete globalThis.process.env.SITE_URL;
    delete globalThis.process.env.GROQ_API_KEY;

    const request = new globalThis.Request(
      "http://localhost/.netlify/functions/insult?path=/this-page-does-not-exist",
      {
        headers: {
          origin: "http://localhost:8888",
        },
      },
    );

    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("fallback");
    expect(typeof body.insult).toBe("string");
  });

  it("returns 400 for invalid path query values and skips roast payload", async () => {
    globalThis.process.env.NETLIFY_DEV = "true";
    delete globalThis.process.env.SITE_URL;
    delete globalThis.process.env.GROQ_API_KEY;

    const request = new globalThis.Request(
      "http://localhost/.netlify/functions/insult?path=this-page-does-not-exist",
      {
        headers: {
          origin: "http://localhost:8888",
        },
      },
    );

    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty("error");
    expect(body).not.toHaveProperty("insult");
    expect(body).not.toHaveProperty("source");
  });

  it("returns 403 for cross-origin requests even when path is invalid", async () => {
    globalThis.process.env.NETLIFY_DEV = "true";
    delete globalThis.process.env.SITE_URL;
    delete globalThis.process.env.GROQ_API_KEY;

    const request = new globalThis.Request(
      "http://localhost/.netlify/functions/insult?path=this-page-does-not-exist",
      {
        headers: {
          origin: "https://evil.example",
        },
      },
    );

    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Forbidden.");
    expect(body).not.toHaveProperty("insult");
    expect(body).not.toHaveProperty("source");
  });
});
