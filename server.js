const http = require('http');
const { exec } = require('child_process');

const PORT = 3000;
const HOST = '127.0.0.1'; // Garante acesso estritamente local (mesma máquina)

const server = http.createServer((req, res) => {
  // Cabeçalhos CORS para permitir requisições do HTML local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Responde imediatamente a requisições prévias do navegador (Preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === '/api/exec-git' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { comando } = JSON.parse(body);

        // Validação básica de segurança
        if (!comando || !comando.trim().startsWith('git ')) {
          res.writeHead(400);
          return res.end(JSON.stringify({ erro: "Apenas comandos iniciados por 'git ' são permitidos!" }));
        }

        // Executa o comando no terminal local
        exec(comando, (error, stdout, stderr) => {
          res.writeHead(200);
          res.end(JSON.stringify({
            saida: stdout || stderr,
            erro: error ? error.message : null
          }));
        });

      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ erro: "Erro ao processar a requisição." }));
      }
    });

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ erro: "Rota não encontrada." }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Painel Git Local rodando em: http://${HOST}:${PORT}`);
});