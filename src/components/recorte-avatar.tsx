"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const TAMANHO_QUADRO = 280; // px, área visível de recorte
const TAMANHO_EXPORTACAO = 512; // px, resolução final salva
const ZOOM_MAXIMO = 3;

type Posicao = { x: number; y: number };

/**
 * Recorte de avatar estilo WhatsApp: arrasta pra posicionar, controle
 * deslizante pra dar zoom. A guia circular é só visual — o arquivo salvo é
 * quadrado, e o app já exibe avatares arredondados em todo canto (Avatar,
 * componente `rounded-full`).
 */
export function RecorteAvatar({
  arquivo,
  onCancelar,
  onConfirmar,
}: {
  arquivo: File;
  onCancelar: () => void;
  onConfirmar: (blob: Blob) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [imagem, setImagem] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState<Posicao>({ x: 0, y: 0 });
  const arrastando = useRef<{ inicioX: number; inicioY: number; posInicial: Posicao } | null>(null);

  // Criação e revogação da URL do blob precisam viver no MESMO effect: em dev,
  // o React roda cada effect duas vezes (StrictMode) — se a URL nascesse fora
  // daqui (ex: num inicializador de useState) e fosse revogada num effect
  // separado, a segunda rodada revogaria a URL antes da imagem carregar, e ela
  // nunca mais aparecia. setUrl/setImagem acontecem dentro do callback
  // assíncrono onload, não direto no corpo do effect.
  useEffect(() => {
    const objUrl = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      setUrl(objUrl);
      setImagem(img);
    };
    img.src = objUrl;
    return () => URL.revokeObjectURL(objUrl);
  }, [arquivo]);

  // Escala mínima: a imagem sempre cobre o quadro inteiro (como object-fit: cover).
  const escalaBase = imagem ? Math.max(TAMANHO_QUADRO / imagem.width, TAMANHO_QUADRO / imagem.height) : 1;
  const escala = escalaBase * zoom;

  function limitar(p: Posicao, escalaAtual: number): Posicao {
    if (!imagem) return p;
    const largura = imagem.width * escalaAtual;
    const altura = imagem.height * escalaAtual;
    const limiteX = Math.max(0, (largura - TAMANHO_QUADRO) / 2);
    const limiteY = Math.max(0, (altura - TAMANHO_QUADRO) / 2);
    return {
      x: Math.min(limiteX, Math.max(-limiteX, p.x)),
      y: Math.min(limiteY, Math.max(-limiteY, p.y)),
    };
  }

  function aoMudarZoom(novoZoom: number) {
    setZoom(novoZoom);
    setPos((p) => limitar(p, escalaBase * novoZoom));
  }

  function aoIniciarArrasto(clientX: number, clientY: number) {
    arrastando.current = { inicioX: clientX, inicioY: clientY, posInicial: pos };
  }
  function aoMoverArrasto(clientX: number, clientY: number) {
    if (!arrastando.current) return;
    const dx = clientX - arrastando.current.inicioX;
    const dy = clientY - arrastando.current.inicioY;
    setPos(limitar({ x: arrastando.current.posInicial.x + dx, y: arrastando.current.posInicial.y + dy }, escala));
  }
  function aoSoltarArrasto() {
    arrastando.current = null;
  }

  function confirmar() {
    if (!imagem) return;
    const canvas = document.createElement("canvas");
    canvas.width = TAMANHO_EXPORTACAO;
    canvas.height = TAMANHO_EXPORTACAO;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fator = TAMANHO_EXPORTACAO / TAMANHO_QUADRO;
    // Fundo branco: cobre a transparência de um PNG (o avatar salvo é JPEG).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, TAMANHO_EXPORTACAO, TAMANHO_EXPORTACAO);

    const larguraDesenhada = imagem.width * escala * fator;
    const alturaDesenhada = imagem.height * escala * fator;
    const x = TAMANHO_EXPORTACAO / 2 + pos.x * fator - larguraDesenhada / 2;
    const y = TAMANHO_EXPORTACAO / 2 + pos.y * fator - alturaDesenhada / 2;

    ctx.drawImage(imagem, x, y, larguraDesenhada, alturaDesenhada);
    canvas.toBlob((blob) => blob && onConfirmar(blob), "image/jpeg", 0.9);
  }

  return (
    <div
      role="presentation"
      onClick={onCancelar}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        role="dialog"
        aria-label="Ajustar foto de perfil"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-fade-up rounded-2xl border border-ink-200 bg-surface p-5 shadow-soft-lg"
      >
        <h2 className="font-display text-lg font-semibold text-ink-900">Ajustar foto</h2>
        <p className="mt-1 text-xs text-ink-500">Arraste para posicionar e use o controle para dar zoom.</p>

        <div
          className="relative mx-auto mt-4 touch-none select-none overflow-hidden rounded-xl bg-ink-900"
          style={{ width: TAMANHO_QUADRO, height: TAMANHO_QUADRO }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            aoIniciarArrasto(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => aoMoverArrasto(e.clientX, e.clientY)}
          onPointerUp={aoSoltarArrasto}
          onPointerCancel={aoSoltarArrasto}
        >
          {imagem && url && (
            // eslint-disable-next-line @next/next/no-img-element -- preview arrastável com zoom; o recorte final é exportado via canvas, next/image não se aplica aqui
            <img
              src={url}
              alt=""
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none"
              style={{
                width: imagem.width * escala,
                height: imagem.height * escala,
                transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
              }}
            />
          )}
          {/* Guia circular — só o lembrete visual de como o avatar fica
              arredondado em todo o app; o arquivo salvo continua quadrado. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 0 9999px rgba(20, 17, 13, 0.55)" }}
          />
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <ZoomIn className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="range"
            min={1}
            max={ZOOM_MAXIMO}
            step={0.01}
            value={zoom}
            onChange={(e) => aoMudarZoom(Number(e.target.value))}
            disabled={!imagem}
            className="w-full accent-brand-600"
            aria-label="Zoom da foto"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancelar}>
            <X className="h-4 w-4" /> Cancelar
          </Button>
          <Button type="button" size="sm" onClick={confirmar} disabled={!imagem}>
            <Check className="h-4 w-4" /> Usar foto
          </Button>
        </div>
      </div>
    </div>
  );
}
