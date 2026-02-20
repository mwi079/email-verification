import logger from "../logger";

interface ValidationResult {
  valid: boolean;
}

const mockValidateEmail = async (
  email: string,
  delayMs = 100
): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ valid: email.includes("@") });
    }, delayMs);
  });
};

export async function validateWithTimeout(
  email: string,
  timeoutMs = 1000
): Promise<ValidationResult> {
  const start = Date.now();

  const timeoutPromise = new Promise<ValidationResult>((_, reject) =>
    setTimeout(() => reject(new Error("Validation timeout")), timeoutMs)
  );

  try {
    const result = await Promise.race([
      mockValidateEmail(email),
      timeoutPromise,
    ]);

    logger.info("Email validation completed", {
      email,
      valid: result.valid,
      durationMs: Date.now() - start,
    });

    return result;
  } catch (err) {
    logger.error("Email validation failed", {
      email,
      error: (err as Error).message,
      durationMs: Date.now() - start,
    });

    throw err;
  }
}
