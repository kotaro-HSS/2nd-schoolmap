export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">文化祭マップ</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
