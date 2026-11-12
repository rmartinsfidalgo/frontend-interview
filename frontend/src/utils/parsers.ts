export const jsonParser = <T>(jsonString: string): T | undefined => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return undefined;
  }
};