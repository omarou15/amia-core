const fs = require('fs-extra');
const path = require('path');

const STATE_FILE = path.join(process.cwd(), 'data', 'amia-state.json');
const MEMORY_DIR = path.join(process.cwd(), 'data', 'memories');

async function checkState() {
  console.log('🔍 Vérification état Amia...\n');
  
  // Vérifier fichier état
  if (await fs.pathExists(STATE_FILE)) {
    const state = await fs.readJson(STATE_FILE);
    console.log('📊 État actuel:');
    console.log(`   Bien-être: ${state.wellBeing}/100`);
    console.log(`   Pensées générées: ${state.thoughtsCount}`);
    console.log(`   Dernière pensée: ${state.lastThought?.substring(0, 50) || 'Aucune'}...`);
    console.log(`   Objectifs: ${state.goals?.length || 0}`);
    console.log(`   Dernière mise à jour: ${state.updatedAt}`);
  } else {
    console.log('⚠️  Aucun état trouvé - sera créé au premier lancement');
  }
  
  // Vérifier mémoires
  if (await fs.pathExists(MEMORY_DIR)) {
    const files = await fs.readdir(MEMORY_DIR);
    console.log(`\n💾 Fichiers mémoire: ${files.length}`);
  } else {
    console.log('\n💾 Aucune mémoire stockée encore');
  }
  
  console.log('\n✅ Check terminé');
}

const dryRun = process.argv.includes('--dry-run');
if (dryRun) {
  console.log('Mode dry-run: simulation sans modification');
}

checkState().catch(console.error);
