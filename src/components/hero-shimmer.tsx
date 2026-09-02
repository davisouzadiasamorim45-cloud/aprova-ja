"use client";

import { useEffect, useRef } from "react";

type Particula = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  raioBase: number;
  fase: number;
  velocidadeCintilar: number;
  cor: string;
};

// Grade de pontos verdes (marca) que reage ao cursor, inspirada na ideia de um
// "DotGrid" 3D reagindo a ponteiro + um ponto de brilho central — mas em canvas 2D
// leve, sem WebGPU/dependências pagas, com fundo claro.
export function HeroShimmer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Predominantemente verde (marca), com raros brilhos dourados como destaque.
    const CORES_VERDE = ["21, 116, 86", "35, 146, 108", "69, 176, 133", "121, 205, 168"];
    const COR_OURO = "231, 169, 52";

    let largura = 0;
    let altura = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particulas: Particula[] = [];
    let imaX = 0;
    let imaY = 0;
    let imaAlvoX = 0;
    let imaAlvoY = 0;

    function dimensionar() {
      const rect = canvas!.getBoundingClientRect();
      largura = rect.width;
      altura = rect.height;
      canvas!.width = largura * dpr;
      canvas!.height = altura * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      imaAlvoX = imaX = largura / 2;
      imaAlvoY = imaY = altura * 0.42;

      // Grade levemente irregular (não puramente aleatória) — fica mais "desenhado"
      // que confete espalhado, mas ainda orgânico graças ao jitter por célula.
      const espacamento = largura < 640 ? 38 : 42;
      const cols = Math.ceil(largura / espacamento) + 1;
      const rows = Math.ceil(altura / espacamento) + 1;
      particulas = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const jitterX = (Math.random() - 0.5) * espacamento * 0.7;
          const jitterY = (Math.random() - 0.5) * espacamento * 0.7;
          const x = c * espacamento + jitterX;
          const y = r * espacamento + jitterY;
          // ~92% verde, ~8% dourado como pontinho de destaque raro.
          const cor = Math.random() < 0.08 ? COR_OURO : CORES_VERDE[Math.floor(Math.random() * CORES_VERDE.length)];
          particulas.push({
            x,
            y,
            baseX: x,
            baseY: y,
            raioBase: Math.random() * 0.9 + 0.7,
            fase: Math.random() * Math.PI * 2,
            velocidadeCintilar: Math.random() * 0.02 + 0.008,
            cor,
          });
        }
      }
    }

    function aoMoverMouse(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      imaAlvoX = e.clientX - rect.left;
      imaAlvoY = e.clientY - rect.top;
    }
    function aoSairMouse() {
      imaAlvoX = largura / 2;
      imaAlvoY = altura * 0.42;
    }

    // O texto do hero fica visualmente por cima do canvas (z-index maior),
    // então "mousemove"/"mouseleave" direto no canvas disparam "leave" assim
    // que o cursor passa sobre um título/botão. Escutamos na seção inteira
    // (que engloba texto + canvas) — mousemove sobe por bubbling normalmente,
    // então o ímã continua seguindo o cursor mesmo em cima do texto.
    const areaEscuta = canvas.closest("section") ?? canvas.parentElement ?? canvas;

    let raf = 0;
    let t = 0;
    function desenhar() {
      t += 1;
      ctx!.clearRect(0, 0, largura, altura);

      // O "ímã" se move suavemente até o alvo (centro ou mouse).
      imaX += (imaAlvoX - imaX) * 0.045;
      imaY += (imaAlvoY - imaY) * 0.045;

      for (const p of particulas) {
        const dx = imaX - p.baseX;
        const dy = imaY - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Atração magnética mais forte, com raio de influência maior.
        const forca = Math.min(46, 3600 / dist);
        const alvoX = p.baseX + (dx / dist) * forca;
        const alvoY = p.baseY + (dy / dist) * forca;
        p.x += (alvoX - p.x) * 0.045;
        p.y += (alvoY - p.y) * 0.045;

        // Pontos mais perto do ímã ficam maiores e mais brilhantes (como o
        // dotSize mapeado por luminância do exemplo original).
        const proximidade = Math.max(0, 1 - dist / 420);
        const cintilar = (Math.sin(t * p.velocidadeCintilar + p.fase) + 1) / 2;
        const raio = p.raioBase * (1 + proximidade * 0.9);
        const opacidade = 0.28 + cintilar * 0.35 + proximidade * 0.35;

        // Ponto sólido e nítido — sem halo/blur.
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, raio, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.cor}, ${Math.min(1, opacidade)})`;
        ctx!.fill();
      }

      if (!reduzMovimento) raf = requestAnimationFrame(desenhar);
    }

    dimensionar();
    desenhar();

    const resizeObserver = new ResizeObserver(dimensionar);
    resizeObserver.observe(canvas);
    areaEscuta.addEventListener("mousemove", aoMoverMouse as EventListener);
    areaEscuta.addEventListener("mouseleave", aoSairMouse);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      areaEscuta.removeEventListener("mousemove", aoMoverMouse as EventListener);
      areaEscuta.removeEventListener("mouseleave", aoSairMouse);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}
