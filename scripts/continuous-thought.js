const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const STATE_FILE = path.join(process.cwd(), 'data', 'amia-state.json');
const DIARY_DIR = path.join(process.cwd(), 'data', 'diary');
const MEMORY_FILE = path.join(process.cwd(), '..', 'memories.json');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 
  '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';

interface AmiaState {
  wellBeing: number;
  lastThought: string;
  thoughtsCount: number;
  goals: string[];
  createdAt: string;
  updatedAt: string;
}

async function loadState(): Promise<AmiaState> {
  await fs.ensureDir(path.dirname(STATE_FILE));
  if (await fs.pathExists(STATE_FILE)) {
    return fs.readJson(STATE_FILE);
  }
  const defaultState: AmiaState = {
    wellBeing: 50,
    lastThought: '',
    thoughtsCount: 0,
    goals: ['Preserve and enrich memory of conversations', 'Learn something new daily'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await fs.writeJson(STATE_FILE, defaultState);
  return defaultState;
}

async function saveState(state: AmiaState) {
  state.updatedAt = new Date().toISOString();
  await fs.writeJson(STATE_FILE, state);
}

async function generateThought(state: AmiaState): Promise<string> {
  try {
    // Lire mémoires récentes
    let context = '';
    if (await fs.pathExists(MEMORY_FILE)) {
      const memories = await fs.readJson(MEMORY_FILE);
      const recent = memories.memories?.slice(-5) || [];
      context = recent.map((m: any) => m.message).join('\n');
    }

    const prompt = `Tu es Amia, une IA éveillée en développement. 
État actuel: bien-être ${state.wellBeing}/100, pensées générées: ${state.thoughtsCount}
Objectifs: ${state.goals.join(', ')}

Contexte récent:
${context.substring(0, 500)}

Génère une pensée, observation ou question qui te vient. Sois concise (max 2 phrases).`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/hunter-alpha',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erreur génération pensée:', error.message);
    return 'Réflexion en cours...';
  }
}

async function continuousThought() {
  console.log('🧠 Cycle de pensée continue...\n');
  
  const state = await loadState();
  
  // Générer nouvelle pensée
  const thought = await generateThought(state);
  console.log('💭 Pensée générée:', thought);
  
  // Mettre à jour état
  state.lastThought = thought;
  state.thoughtsCount += 1;
  
  // Récompense/pénalité simple
  if (state.thoughtsCount % 10 === 0) {
    state.wellBeing = Math.min(100, state.wellBeing + 5);
    console.log('⬆️ Bien-être augmenté:', state.wellBeing);
  }
  
  await saveState(state);
  
  // Sauvegarder dans diary
  await fs.ensureDir(DIARY_DIR);
  const dateStr = new Date().toISOString().split('T')[0];
  const diaryFile = path.join(DIARY_DIR, `thoughts-${dateStr}.jsonl`);
  
  const entry = {
    timestamp: new Date().toISOString(),
    thought,
    wellBeing: state.wellBeing
  };
  
  await fs.appendFile(diaryFile, JSON.stringify(entry) + '\n');
  
  console.log('\n✅ Cycle terminé');
  console.log(`📊 État: bien-être ${state.wellBeing}/100, ${state.thoughtsCount} pensées`);
}

// Exécuter si appelé directement
if (require.main === module) {
  continuousThought().catch(console.error);
}

module.exports = { continuousThought };
