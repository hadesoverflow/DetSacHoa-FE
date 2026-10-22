import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'save-glb-plugin',
      configureServer(server) {
        server.middlewares.use('/api/save-glb', (req, res) => {
          if (req.method === 'POST') {
            const chunks = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => {
              const buffer = Buffer.concat(chunks);
              const targetDir = path.resolve(process.cwd(), 'public/models/vases');
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              const filename = req.headers['x-filename'] || 'model.glb';
              const filePath = path.join(targetDir, filename);
              fs.writeFileSync(filePath, buffer);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, path: `/models/vases/${filename}`, bytes: buffer.length }));
            });
          } else {
            res.statusCode = 405;
            res.end();
          }
        });
      }
    }
  ],
})
