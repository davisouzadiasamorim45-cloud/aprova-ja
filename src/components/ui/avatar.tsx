import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Mostra a foto de perfil (do bucket "avatars" no Storage) ou, na ausência
 * dela, as iniciais sobre um círculo colorido — mesmo fallback usado antes de
 * a foto existir. `tamanho` é em pixels; classes de tamanho (h-9 w-9 etc.) no
 * `className` continuam controlando o fallback, já que <Image> precisa do
 * número exato.
 */
export function Avatar({
  avatarUrl,
  iniciais,
  tamanho,
  className,
}: {
  avatarUrl?: string | null;
  iniciais: string;
  tamanho: number;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={tamanho}
        height={tamanho}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      style={{ width: tamanho, height: tamanho }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800",
        className
      )}
    >
      {iniciais || "?"}
    </div>
  );
}
