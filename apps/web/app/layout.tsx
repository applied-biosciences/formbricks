import { Metadata } from "next";
import React from "react";
import { NoScriptWarning } from "@/app/components/NoScriptWarning";
import { CALM_BRAND } from "@/lib/branding/calm";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { SentryClientConfigScript } from "@/lib/sentry/SentryClientConfigScript";
import { I18nProvider } from "@/lingodotdev/client";
import { getLocale } from "@/lingodotdev/language";
import { StaleDeploymentPrompt } from "@/modules/ui/components/stale-deployment-prompt";
import "../modules/ui/globals.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${CALM_BRAND.productName}`,
    default: CALM_BRAND.productName,
  },
  description: "Secure survey and feedback platform by Applied Biosciences.",
  applicationName: CALM_BRAND.productName,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const locale = await getLocale();

  return (
    <html lang={locale} translate="no">
      <body className="flex h-dvh flex-col transition-all ease-in-out">
        {/* First in the document so instrumentation-client.ts can start Sentry as early as possible. */}
        <SentryClientConfigScript />
        <NoScriptWarning locale={locale} />
        <I18nProvider language={locale} defaultLanguage={DEFAULT_LOCALE}>
          <StaleDeploymentPrompt />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
};

export default RootLayout;
