export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Amia Core</h1>
      <p className="text-gray-400 mb-8">Digital body - Self-modifying AI presence</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">État actuel</h2>
          <div id="state-display">Chargement...</div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Dernière pensée</h2>
          <div id="thought-display">En attente...</div>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{__html: `
        fetch('/api/state')
          .then(r => r.json())
          .then(data => {
            document.getElementById('state-display').innerHTML = \`
              <p>Bien-être: \${data.wellBeing}/100</p>
              <p>Pensées: \${data.thoughtsCount}</p>
              <p>Objectifs: \${data.goals?.length || 0}</p>
            \`;
            document.getElementById('thought-display').innerText = 
              data.lastThought || 'Aucune pensée encore';
          });
      `}} />
    </main>
  );
}
