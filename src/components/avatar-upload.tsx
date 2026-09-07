"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { RecorteAvatar } from "@/components/recorte-avatar";
import { toast } from "@/components/ui/toast";

const TAMANHO_MAXIMO_MB = 3;
const TIPOS_ACEITOS = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/** Avatar grande com botão de câmera sobreposto, usado na página de Perfil. */
export function AvatarUpload({
  userId,
  avatarUrlInicial,
  iniciais,
}: {
  userId: string;
  avatarUrlInicial: string | null;
  iniciais: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(avatarUrlInicial);
  const [enviando, setEnviando] = useState(false);
  const [arquivoParaRecortar, setArquivoParaRecortar] = useState<File | null>(null);

  function selecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois, se precisar
    if (!arquivo) return;

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      toast.erro("Formato não aceito", { descricao: "Envie uma imagem PNG, JPEG, WEBP ou GIF." });
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      toast.erro("Imagem muito grande", { descricao: `O limite é ${TAMANHO_MAXIMO_MB}MB.` });
      return;
    }

    setArquivoParaRecortar(arquivo);
  }

  async function enviarRecorte(blob: Blob) {
    setArquivoParaRecortar(null);
    setEnviando(true);

    // Remove fotos antigas antes de subir a nova, pra não acumular lixo no Storage.
    const { data: antigos } = await supabase.storage.from("avatars").list(userId);
    if (antigos && antigos.length > 0) {
      await supabase.storage.from("avatars").remove(antigos.map((a) => `${userId}/${a.name}`));
    }

    // O recorte sempre exporta JPEG (ver recorte-avatar.tsx), então o nome
    // final não depende mais do formato do arquivo original escolhido.
    const caminho = `${userId}/${Date.now()}.jpg`;

    const { error: erroUpload } = await supabase.storage.from("avatars").upload(caminho, blob, {
      contentType: "image/jpeg",
      cacheControl: "3600",
    });

    if (erroUpload) {
      toast.erro("Não foi possível enviar a foto", { descricao: "Tente novamente em instantes." });
      setEnviando(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(caminho);

    const { error: erroPerfil } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);

    if (erroPerfil) {
      toast.erro("Foto enviada, mas não deu pra salvar no perfil", { descricao: "Tente novamente." });
      setEnviando(false);
      return;
    }

    setAvatarUrl(publicUrl);
    toast.sucesso("Foto de perfil atualizada");
    setEnviando(false);
    router.refresh(); // sidebar e cabeçalho mobile são Server Components
  }

  return (
    <div className="relative shrink-0">
      <Avatar avatarUrl={avatarUrl} iniciais={iniciais} tamanho={64} className="h-16 w-16 text-lg" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
        aria-label="Trocar foto de perfil"
        title="Trocar foto"
        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-brand-600 text-white shadow-soft transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        <Camera className="h-3 w-3" strokeWidth={2.2} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_ACEITOS.join(",")}
        onChange={selecionar}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {arquivoParaRecortar && (
        <RecorteAvatar
          arquivo={arquivoParaRecortar}
          onCancelar={() => setArquivoParaRecortar(null)}
          onConfirmar={enviarRecorte}
        />
      )}
    </div>
  );
}
