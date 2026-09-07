// Confete leve em <canvas>, sem dependência. Dispara jatos a partir dos cantos
// da tela — usado em pequenas comemorações (ex.: revisão de flashcards em dia).

type Particula = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotacao: number;
  velocidadeRotacao: number;
  tamanho: number;
  cor: string;
};

const CORES = ["#23926c", "#45b085", "#e7a934", "#efc157", "#79cda8", "#d18d20"];

const GRAVIDADE = 0.28;
const ARRASTO = 0.995;
const DURACAO_MS = 3000;

/** Comemoração rápida: confetes saem dos quatro cantos em direção ao centro. */
export function dispararConfete() {
  if (typeof window === "undefined") return;

  const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefereMenosMovimento) return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const largura = window.innerWidth;
  const altura = window.innerHeight;
  canvas.width = largura * dpr;
  canvas.height = altura * dpr;
  ctx.scale(dpr, dpr);

  // Cada canto lança um leque de partículas apontando para dentro da tela.
  const cantos: Array<{ x: number; y: number; anguloBase: number }> = [
    { x: 0, y: altura, anguloBase: -Math.PI / 4 },
    { x: largura, y: altura, anguloBase: (-3 * Math.PI) / 4 },
    { x: 0, y: 0, anguloBase: Math.PI / 4 },
    { x: largura, y: 0, anguloBase: (3 * Math.PI) / 4 },
  ];

  const particulas: Particula[] = [];
  for (const canto of cantos) {
    for (let i = 0; i < 45; i++) {
      const angulo = canto.anguloBase + (Math.random() - 0.5) * (Math.PI / 2.2);
      const forca = 13 + Math.random() * 12;
      particulas.push({
        x: canto.x,
        y: canto.y,
        vx: Math.cos(angulo) * forca,
        vy: Math.sin(angulo) * forca,
        rotacao: Math.random() * Math.PI,
        velocidadeRotacao: (Math.random() - 0.5) * 0.3,
        tamanho: 6 + Math.random() * 6,
        cor: CORES[Math.floor(Math.random() * CORES.length)],
      });
    }
  }

  const inicio = performance.now();

  function quadro(agora: number) {
    const decorrido = agora - inicio;
    ctx!.clearRect(0, 0, largura, altura);

    for (const p of particulas) {
      p.vx *= ARRASTO;
      p.vy = p.vy * ARRASTO + GRAVIDADE;
      p.x += p.vx;
      p.y += p.vy;
      p.rotacao += p.velocidadeRotacao;

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotacao);
      ctx!.globalAlpha = Math.max(0, 1 - decorrido / DURACAO_MS);
      ctx!.fillStyle = p.cor;
      ctx!.fillRect(-p.tamanho / 2, -p.tamanho / 2, p.tamanho, p.tamanho * 0.4);
      ctx!.restore();
    }

    if (decorrido < DURACAO_MS) {
      requestAnimationFrame(quadro);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(quadro);
}
