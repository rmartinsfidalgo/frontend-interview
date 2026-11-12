import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "../header";

describe("Header", () => {
  it("renders as the page banner landmark", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("shows the CuP title inside the banner", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toHaveTextContent("CuP");
  });

  it("has an accessible menu button", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: "menu" })).toBeInTheDocument();
  });
});
