import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
          404
        </div>

        <h1 className="text-3xl font-bold text-slate-900">Página não encontrada</h1>

        <p className="mt-4 text-base leading-7 text-slate-600">
          A rota acessada não existe, foi removida ou ainda não foi publicada.
          Verifique a URL e tente novamente.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Voltar ao painel
          </Link>
        </div>
      </div>
    </main>
  );
}
