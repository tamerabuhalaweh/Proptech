import { useLocale } from "next-intl";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-accent text-accent-foreground font-bold text-2xl shadow-xl">
            P
          </div>
          <h1 className="text-3xl font-bold text-white">PropTech</h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Professional property management platform for Saudi real estate
            companies. Manage properties, units, tenants, leads, and finances
            — all in one place.
          </p>
          <div className="flex items-center justify-center gap-6 text-white/50 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">500+</p>
              <p>Properties</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">10K+</p>
              <p>Units</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">50+</p>
              <p>Companies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
