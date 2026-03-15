export const metadata = {
  title: 'Amia Core',
  description: 'Digital body for Amia - Self-modifying AI presence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  );
}
