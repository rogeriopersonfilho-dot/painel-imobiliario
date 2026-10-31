export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
      }}>
        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2563eb' }}>
          404
        </p>
        <h1 style={{ margin: '0.75rem 0', fontSize: '2rem' }}>Página não encontrada</h1>
        <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
          A rota acessada não existe ou foi removida. Verifique a URL e tente novamente.
        </p>
      </div>
    </main>
  );
}
