jest.mock("../server/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import logger from "../server/logger";
import { validateWithTimeout } from "../server/services/emailValidator";

describe("validateWithTimeout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns valid=true for an email containing @ and logs a completed entry", async () => {
    const result = await validateWithTimeout("john@example.com", 1000);

    expect(result).toEqual({ valid: true });

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      "Email validation completed",
      expect.objectContaining({
        email: "john@example.com",
        valid: true,
        durationMs: expect.any(Number),
      })
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  test("returns valid=false for an email without @ and logs a completed entry", async () => {
    const result = await validateWithTimeout("invalid-email", 1000);

    expect(result).toEqual({ valid: false });

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      "Email validation completed",
      expect.objectContaining({
        email: "invalid-email",
        valid: false,
        durationMs: expect.any(Number),
      })
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  test("throws 'Validation timeout' and logs a failed entry when timeout is shorter than validation delay", async () => {
    jest.useFakeTimers();

    const promise = validateWithTimeout("slow@example.com", 50);

    jest.advanceTimersByTime(60);

    await expect(promise).rejects.toThrow("Validation timeout");

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      "Email validation failed",
      expect.objectContaining({
        email: "slow@example.com",
        error: "Validation timeout",
        durationMs: expect.any(Number),
      })
    );

    expect(logger.info).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
