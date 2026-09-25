/**
 * Product-facing CALM Surveys identity.
 *
 * Keep this separate from Formbricks package names, licence notices and
 * Enterprise controls so the fork remains straightforward to maintain and
 * upstream changes remain easy to review.
 */
export const CALM_BRAND = {
  productName: "CALM Surveys",
  productFamily: "CALM",
  productDescription: "Clinical Adaptive Learning Model",
  companyName: "Applied Biosciences",
  ownershipLine: "CALM Surveys by Applied Biosciences",
  publicUrl: "https://surveys.calmos.io",
  logoPath: "/branding/calm-logo.png",
  iconPath: "/branding/calm-icon.png",
  appliedBiosciencesLogoPath: "/branding/applied-biosciences-logo.png",
} as const;
