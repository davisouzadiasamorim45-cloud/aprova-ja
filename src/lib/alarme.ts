"use client";

/**
 * Alarme do cronômetro: uma sequência de bips gerada na hora com a Web Audio
 * API (sem arquivo de áudio para baixar). Retorna uma função que interrompe o
 * som antes da hora — usada quando a pessoa pausa ou para o cronômetro.
 */
const INTERVALO_BIP = 0.6; // segundos entre o início de um bip e o do próximo
const DURACAO_BIP = 0.25;
const FREQUENCIA_HZ = 880;

export function tocarAlarme({ segundos, volume }: { segundos: number; volume: number }): () => void {
  const semSom = () => {};
  if (typeof window === "undefined") return semSom;

  const Contexto = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Contexto) return semSom;

  let ctx: AudioContext;
  try {
    ctx = new Contexto();
  } catch {
    // Navegador bloqueou o áudio (sem interação do usuário, por exemplo).
    return semSom;
  }

  const inicio = ctx.currentTime + 0.05;
  const quantidade = Math.max(1, Math.ceil(segundos / INTERVALO_BIP));

  for (let i = 0; i < quantidade; i++) {
    const t = inicio + i * INTERVALO_BIP;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = FREQUENCIA_HZ;
    // Rampas curtas na entrada e na saída: sem elas o bip estala.
    ganho.gain.setValueAtTime(0, t);
    ganho.gain.linearRampToValueAtTime(volume, t + 0.02);
    ganho.gain.setValueAtTime(volume, t + DURACAO_BIP - 0.05);
    ganho.gain.linearRampToValueAtTime(0, t + DURACAO_BIP);
    osc.connect(ganho).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + DURACAO_BIP);
  }

  const fechar = () => {
    ctx.close().catch(() => {});
  };
  const agendado = window.setTimeout(fechar, (segundos + 0.5) * 1000);

  return () => {
    window.clearTimeout(agendado);
    fechar();
  };
}
