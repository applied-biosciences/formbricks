import { describe, expect, test } from "vitest";
import { CALM_BRAND } from "./calm";

describe("CALM Surveys brand configuration", () => {
  test("keeps the product and ownership identity in one reusable definition", () => {
    expect(CALM_BRAND).toMatchObject({
      productName: "CALM Surveys",
      companyName: "Applied Biosciences",
      ownershipLine: "CALM Surveys by Applied Biosciences",
    });
  });

  test("uses locally served brand assets", () => {
    expect(CALM_BRAND.logoPath).toMatch(/^\/branding\//);
    expect(CALM_BRAND.iconPath).toMatch(/^\/branding\//);
    expect(CALM_BRAND.appliedBiosciencesLogoPath).toMatch(/^\/branding\//);
  });
});
