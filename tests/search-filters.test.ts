import { describe, expect, it } from "vitest";
import { appendMultiParam, parseMultiParam } from "@/lib/search-filters";

describe("search filters helpers", () => {
  it("parses comma separated values and arrays", () => {
    expect(parseMultiParam("a,b,,c")).toEqual(["a", "b", "c"]);
    expect(parseMultiParam(["x", ""])).toEqual(["x"]);
    expect(parseMultiParam(null)).toEqual([]);
  });

  it("appends values preserving multiple entries", () => {
    const params = new URLSearchParams("status=NOWE");
    appendMultiParam(params, "tags", ["t1", "t2"]);
    expect(params.getAll("tags")).toEqual(["t1", "t2"]);
    appendMultiParam(params, "tags", []);
    expect(params.getAll("tags")).toEqual([]);
  });
});
