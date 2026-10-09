import { describe, expect, it } from "vitest";
import { createDemo } from "./demo";
import {
  galleryEntries,
  recordBins,
  recordSector,
  requestIndexFromAngle,
} from "./experience";

describe("experience request navigation", () => {
  it("keeps the selected session centered when a spread wraps around either boundary", () => {
    const sessions = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));
    expect(galleryEntries(sessions, 0, true).map((e) => e.session.id)).toEqual([
      "8",
      "9",
      "0",
      "1",
      "2",
    ]);
    expect(galleryEntries(sessions, 9, true).map((e) => e.session.id)).toEqual([
      "7",
      "8",
      "9",
      "0",
      "1",
    ]);
    for (const index of [0, 9]) {
      const entries = galleryEntries(sessions, index, true);
      expect(entries.find((e) => e.offset === 0)?.session).toBe(
        sessions[index],
      );
      expect(new Set(entries.map((e) => e.session.id)).size).toBe(
        entries.length,
      );
      entries.forEach((e) => expect(e.ordinal).toBe(Number(e.session.id) + 1));
    }
  });
  it("does not duplicate cards for small sources or mutate chronological order", () => {
    expect(galleryEntries([], 0, true)).toEqual([]);
    for (const count of [1, 2, 3]) {
      const sessions = Array.from({ length: count }, (_, i) => ({
        id: String(i),
      }));
      for (const spread of [true, false]) {
        const entries = galleryEntries(sessions, count - 1, spread);
        expect(entries).toHaveLength(count);
        expect(entries.find((e) => e.offset === 0)?.session.id).toBe(
          String(count - 1),
        );
        expect(new Set(entries.map((e) => e.session.id)).size).toBe(count);
      }
      expect(sessions.map((s) => s.id)).toEqual(
        Array.from({ length: count }, (_, i) => String(i)),
      );
    }
  });
  it("ignores the record label, empty corners and missing data when selecting a request", () => {
    expect(recordSector(0, 0, 64)).toBeNull();
    expect(recordSector(260, 260, 64)).toBeNull();
    expect(recordSector(250, 0, 64)).toBeNull();
    expect(recordSector(0, -180, 0)).toBeNull();
    expect(recordSector(0, -180, 64)).toBe(0);
    expect(recordSector(180, 0, 64)).toBe(16);
  });
  it("bins long sessions without losing usage or request boundaries", () => {
    const sample = createDemo().sessions[0].requests[0];
    const requests = Array.from({ length: 10003 }, (_, index) => ({
      ...sample,
      id: String(index),
      input: index,
      output: 3,
      cacheRead: index % 2 === 0 ? 5 : null,
    }));
    const bins = recordBins(requests);
    expect(bins).toHaveLength(64);
    expect(bins.reduce((n, b) => n + b.input, 0)).toBe(
      requests.reduce((n, r) => n + r.input, 0),
    );
    expect(bins.reduce((n, b) => n + b.output, 0)).toBe(requests.length * 3);
    expect(bins.reduce((n, b) => n + b.cache, 0)).toBe(5002 * 5);
    expect(bins[0].first).toBe(0);
    expect(bins.at(-1)?.last).toBe(requests.length - 1);
    bins
      .slice(1)
      .forEach((bin, index) => expect(bin.first).toBe(bins[index].last + 1));
  });
  it("retains unknown cache and handles empty or single-request sources", () => {
    const request = {
      ...createDemo().sessions[0].requests[0],
      cacheRead: null,
    };
    expect(recordBins([])).toEqual([]);
    expect(recordBins([request], 0)[0]).toMatchObject({
      cacheKnown: false,
      cache: 0,
      first: 0,
      last: 0,
    });
  });
  it("maps clockwise sectors from twelve oclock and wraps safely", () => {
    expect(requestIndexFromAngle(0, -1, 64)).toBe(0);
    expect(requestIndexFromAngle(1, 0, 64)).toBe(16);
    expect(requestIndexFromAngle(0, 1, 64)).toBe(32);
    expect(requestIndexFromAngle(-1, 0, 64)).toBe(48);
    expect(requestIndexFromAngle(-0.0001, -1, 64)).toBe(63);
    expect(requestIndexFromAngle(0, 0, 0)).toBe(0);
  });
});
