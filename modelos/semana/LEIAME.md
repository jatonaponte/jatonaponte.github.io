# Reel "A semana na Ponte"

Reel vertical (1080×1920, 30 fps, 27 s, com a trilha dos Reels "Você sabia?") gerado toda semana a partir de dados, sem edição manual.

## Cenas
1. **0–5 s, abertura:** o logo 3D se monta, com "A SEMANA NA PONTE · DD/MM A DD/MM".
2. **5–11 s, O DIA MAIS PESADO:** um cartão por sentido, com o dia e a média do tempo de travessia.
3. **11–16,5 s, O PIOR MOMENTO DA SEMANA:** o maior tempo de travessia, com o sentido, o dia e a hora.
4. **16,5–22,5 s, TEMPO MÉDIO POR DIA (min):** barras animadas de segunda a domingo (Rio #FF8C42, Niterói #7CC4FF). Dia sem dado fica com "—".
5. **22,5–27 s, encerramento:** o logo volta, com "JÁ TÔ NA PONTE!", "@jatonaponte" e "Siga para ver o trânsito em tempo real".

## Entrada (JSON)
O formato oficial é o de `claude/ponte-codigo/semana-reel-dados.md` (o mesmo de `exemplo.json`):
```json
{
  "semana": { "inicio": "2026-11-16", "fim": "2026-11-22" },
  "sentidos": {
    "Rio": {
      "dias": [ { "data": "2026-11-16", "media_min": 11.2 } ],
      "dia_mais_pesado": { "data": "2026-11-19", "media_min": 14.8 },
      "pior_momento": { "data": "2026-11-19", "hora": "07:48", "minutos": 18.1, "status": "lento" }
    },
    "Niterói": { "...": "mesma estrutura" }
  }
}
```
- Campos usados: `semana.inicio/fim`, e em cada sentido `dias[].data` e `dias[].media_min`, `dia_mais_pesado` e `pior_momento` (`data`, `hora`, `minutos`, `status`). Os campos a mais são ignorados.
- O número do pior momento ganha a cor do `status`: livre é verde, lento é âmbar e congestionado é vermelho.
- Um dia sem dado aparece com "—". Se `dia_mais_pesado` ou `pior_momento` faltar, o modelo calcula a partir de `dias`.
- O formato simples antigo (`exemplo-simples.json`) também é aceito.
- Não entra nenhum dado de "via livre" nem de atraso.

## Como renderizar
- **Automático (GitHub Actions):** o n8n faz commit de `semana/AAAA-MM-DD.json` (a data é a segunda-feira). O push dispara `.github/workflows/reel-semana.yml`, que gera `reels/semana-AAAA-MM-DD.mp4` e `reels/semana-AAAA-MM-DD.jpg` (a capa), faz o commit e pede um build do GitHub Pages. Leva uns 3 a 5 minutos.
- **Manual (teste):** abra Actions › "Reel semanal" › Run workflow. O padrão renderiza `modelos/semana/exemplo.json` em `reels/semana-teste.*`.
- **Local (da raiz do repositório):** `cd modelos/semana && npm install && npx playwright install chromium && cd ../..`, depois `node modelos/semana/render-semana.mjs semana/AAAA-MM-DD.json`. Precisa do ffmpeg no PATH. Os dois argumentos opcionais definem os arquivos de saída (mp4 e jpg).

## Links depois de renderizado
- Vídeo (Meta): `https://jatonaponte.github.io/reels/semana-AAAA-MM-DD.mp4`
- Capa: `https://raw.githubusercontent.com/jatonaponte/jatonaponte.github.io/main/reels/semana-AAAA-MM-DD.jpg`
