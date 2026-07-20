import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getBotState, getBotStatus, clearLogs, addLog } from "./bot-manager";

describe("bot-manager", () => {
  const testUserId = 999;

  afterEach(() => {
    clearLogs(testUserId);
  });

  it("getBotState returns default idle state for new user", () => {
    const state = getBotState(testUserId);
    expect(state.status).toBe("idle");
    expect(state.pairingCode).toBeNull();
    expect(state.pairingCodeExpiresAt).toBeNull();
    expect(state.logs).toEqual([]);
  });

  it("getBotStatus returns correct structure", () => {
    const status = getBotStatus(testUserId);
    expect(status).toHaveProperty("status", "idle");
    expect(status).toHaveProperty("pairingCode", null);
    expect(status).toHaveProperty("pairingCodeExpiresAt", null);
    expect(status).toHaveProperty("logs");
    expect(Array.isArray(status.logs)).toBe(true);
  });

  it("addLog adds entries and clears them", () => {
    addLog(testUserId, "info", "Test log entry");
    const status = getBotStatus(testUserId);
    expect(status.logs.length).toBe(1);
    expect(status.logs[0].message).toBe("Test log entry");
    expect(status.logs[0].level).toBe("info");

    clearLogs(testUserId);
    const afterClear = getBotStatus(testUserId);
    expect(afterClear.logs).toEqual([]);
  });

  it("addLog caps at 200 entries", () => {
    for (let i = 0; i < 250; i++) {
      addLog(testUserId, "info", `Log entry ${i}`);
    }
    const status = getBotStatus(testUserId);
    expect(status.logs.length).toBeLessThanOrEqual(200);
    expect(status.logs[status.logs.length - 1].message).toBe("Log entry 249");
  });
});
