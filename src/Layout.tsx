import "./index.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto bg-zinc-900">
      {/*<header className="mb-12">
        <h1 className="text-4xl font-bold">cute.haus</h1>
      </header>*/}
      {children}
    </main>
  );
}
