const { execSync, spawn } = require('child_process');
const http = require('http');

// Mata qualquer processo na porta 8081
try { execSync('lsof -ti:8081 | xargs kill -9', { stdio: 'ignore' }); } catch (_) {}

// Aguarda um pouco para a porta liberar
setTimeout(() => {
  // Inicia o Expo desacoplado do processo atual
  const expo = spawn('npm', ['run', 'web'], {
    detached: true,
    stdio: 'ignore',
    shell: true,
  });
  expo.unref();

  // Aguarda a porta 8081 responder
  function waitForServer(retries) {
    if (retries <= 0) { console.error('Timeout: servidor nao iniciou'); process.exit(1); }
    http.get('http://localhost:8081', (res) => {
      process.exit(0);
    }).on('error', () => {
      setTimeout(() => waitForServer(retries - 1), 600);
    });
  }

  waitForServer(60);
}, 800);
