import Image from "next/image";
import Link from "next/link";
import { CALM_BRAND } from "@/lib/branding/calm";
import { CalmLogo } from "@/modules/ui/components/calm-logo";

interface FormWrapperProps {
  children: React.ReactNode;
}

/**
 * The one shell every signed-out screen renders inside. It owns the backdrop and the
 * centring so each auth page stays a bare form — before ENG-2428 login and signup each
 * repeated their own full-screen wrapper and two routes hand-copied a second one.
 *
 * Mobile-first: `min-h-dvh` rather than `min-h-screen`, because `100vh` on mobile is the
 * *large* viewport, which pushes a vertically centred card under the browser chrome.
 */
export const FormWrapper = async ({ children }: Readonly<FormWrapperProps>) => {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-auth-backdrop px-4 py-8 sm:px-6 sm:py-12">
      <main className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <Link
            href="/"
            aria-label={CALM_BRAND.productName}
            className="inline-block rounded-md focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 focus-visible:outline-hidden">
            <CalmLogo priority className="mx-auto w-28 sm:w-32" />
          </Link>
          <p className="mt-3 text-sm font-semibold tracking-wide text-calm-purple-900">
            {CALM_BRAND.productName}
          </p>
          <p className="mt-1 text-xs text-slate-600">Secure survey and feedback platform</p>
        </div>
        {children}
      </main>
      <footer className="mt-5 flex items-center gap-2 text-xs text-white/75">
        <Image
          src={CALM_BRAND.appliedBiosciencesLogoPath}
          alt="Applied Biosciences"
          width={24}
          height={27}
          className="h-6 w-auto"
        />
        <span>{CALM_BRAND.ownershipLine}</span>
      </footer>
    </div>
  );
};
