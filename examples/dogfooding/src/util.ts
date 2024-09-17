export const generateRandomNumber = (): number => {
    return Math.floor(Math.random() * 1000000);
  };
  
export const sha256 = async (number: number | string ): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(number.toString());
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };