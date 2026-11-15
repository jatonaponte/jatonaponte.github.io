# Reel "A semana na Ponte"

Reel vertical (1080×1920, 30 fps, 15,5 s, com a trilha dos Reels "Você sabia?") gerado toda semana a partir de dados, sem edição manual.

## Cenas
1. **0–3 s, abertura:** o logo 3D se monta, com "A SEMANA NA PONTE · DD/MM A DD/MM".
2. **3,4–6,7 s, O DIA MAIS PESADO:** um cartão por sentido, com o dia e a média do tempo de travessia.
3. **6,7–9,7 s, O PIOR MOMENTO DA SEMANA:** o maior tempo de travessia, com o sentido, o dia e a hora.
4. **9,7–12,7 s, TEMPO MÉDIO POR DIA (min):** barras animadas de segunda a domingo (Rio #FF8C42, Niterói #7CC4FF). Dia sem dado fica com "—".
5. **12,7–15,5 s, encerramento:** o logo volta, com "JÁ TÔ NA PONTE!", "@jatonaponte" e "Siga para ver o trânsito em tempo real".

## Entrada (JSON)
```json
{
  "inicio": "2026-11-16",
  "fim": "2026-11-22",
  "dias": [
    { "data": "2026-11-16", "rio_media": 11.2, "niteroi_media": 16.4,
      "rio_pior_min": 18.1, "rio_pior_hora": "07:48", "niteroi_pior_min": 39.2, "niteroi_pior_hora": "18:03" }
  ]
}
```
- `inicio` é a segunda-feira e `fim` é o domingo, no formato AAAA-MM-DD.
- `dias` tem um objeto por dia com dado, de 0 a 7 itens. Os campos vêm da `ponte_resumo_diario`:
  - `data` = `data`
  - `rio_media` = `rio_tempo_medio_min`
  - `niteroi_media` = `nit_tempo_medio_min`
  - `rio_pior_min` e `rio_pior_hora`: o número e a hora de `rio_pior_leitura` ("17.9 min às 14:03" vira 17.9 e "14:03")
  - `niteroi_pior_min` e `niteroi_pior_hora`: o mesmo, a partir de `nit_pior_leitura`
- O modelo calcula sozinho o dia mais pesado de cada sentido (a maior média) e o pior momento da semana (o maior `*_pior_min`).
- Não entra nenhum dado de "via livre" nem de atraso.

## Como renderizar
- **Automático (GitHub Actions):** o workflow `.github/workflows/reel-semana.yml` recebe um `repository_dispatch` com `event_type: "reel-semana"` e `client_payload: { arquivo, dados }`. Ele grava `reels/<arquivo>.mp4` e `reels/<arquivo>.jpg` (a capa) e pede um build do GitHub Pages. Leva uns 3 a 5 minutos.
- **Manual (teste):** no GitHub, abra Actions › "Reel semanal" › Run workflow. Com o campo de dados vazio, ele usa o `exemplo.json`.
- **Local:** `npm install && npx playwright install chromium`, depois `node render_semana.mjs dados.json saida.mp4 capa.jpg`. Precisa do ffmpeg no PATH.

## Links depois de renderizado
- Vídeo (Meta): `https://jatonaponte.github.io/reels/<arquivo>.mp4`
- Capa: `https://raw.githubusercontent.com/jatonaponte/jatonaponte.github.io/main/reels/<arquivo>.jpg`
