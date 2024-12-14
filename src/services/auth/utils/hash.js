import { scryptSync, randomBytes } from "crypto";

const scryptConfig = {
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
  keyLength: 64,
};

export const hashPassword = (password) => {
  // Generate a random salt and remove trailing `=` in Base64
  const salt = randomBytes(16).toString("base64").replace(/=+$/, "");

  // Hash the password using scryptSync
  const derivedKey = scryptSync(password, salt, scryptConfig.keyLength, {
    n: scryptConfig.cost,
    r: scryptConfig.blockSize,
    p: scryptConfig.parallelization,
  });

  // Return the hashed password in scrypt format
  return `$scrypt$n=${scryptConfig.cost},r=${scryptConfig.blockSize},p=${
    scryptConfig.parallelization
  }$${salt}$${derivedKey.toString("base64").replace(/=+$/, "")}`;
};

export const validatePassword = (password, storedHash) => {
  try {
    const [, params, salt, hash] = storedHash.split("$");

    if (params && params.startsWith("n=") && salt && hash) {
      const config = Object.fromEntries(
        params.split(",").map((param) => param.split("="))
      );

      console.log("Validation Config:", { n: config.n, r: config.r, p: config.p, salt });

      const derivedKey = scryptSync(password, salt, 64, {
        n: parseInt(config.n),
        r: parseInt(config.r),
        p: parseInt(config.p),
      });

      const derivedHash = derivedKey.toString("base64").replace(/=+$/, "");
      console.log("Derived Hash:", derivedHash);
      console.log("Stored Hash:", hash);

      return derivedHash === hash.replace(/=+$/, "");
    }

    return false;
  } catch (error) {
    console.error("Error in password validation:", error);
    return false;
  }
};