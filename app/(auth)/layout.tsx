export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Project Jesus</h1>
          <p className="text-sm text-muted-foreground">
            Your curated article platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
