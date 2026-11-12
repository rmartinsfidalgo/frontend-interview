import { describe, expect, it } from "vitest";
import { jsonParser } from "../parsers";

describe("jsonParser", () => {
  it("parses a JSON object", () => {
    expect(jsonParser<{ id: string }>('{"id":"abc"}')).toEqual({ id: "abc" });
  });

  it("parses a JSON array", () => {
    expect(jsonParser<number[]>("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("parses JSON primitives", () => {
    expect(jsonParser<number>("42")).toBe(42);
    expect(jsonParser<string>('"text"')).toBe("text");
    expect(jsonParser<boolean>("true")).toBe(true);
  });

  it("returns null (not undefined) for the JSON literal null", () => {
    expect(jsonParser("null")).toBeNull();
  });

  it.each(["", "{", "{id: 'abc'}", "undefined", "not json"])(
    "returns undefined for invalid JSON (%j)",
    (input) => {
      expect(jsonParser(input)).toBeUndefined();
    },
  );
});
