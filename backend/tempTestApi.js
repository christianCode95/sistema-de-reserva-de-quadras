import http from 'node:http';

const url = 'http://localhost:3000/api/reservas/verificar-horario?horario=2026-06-20T10:00:00';

http.get(url, (res) => {
  console.log('status', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('body', data);
  });
}).on('error', (err) => {
  console.error('error', err.message);
});
