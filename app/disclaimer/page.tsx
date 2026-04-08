export default function DisclaimerPage() {
  return (
    <main className="prose mx-auto max-w-3xl px-4 py-16">
      <h1>Disclaimer</h1>
      <p>This disclaimer applies to test.</p>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
    </main>
  );
}
