import Image from "next/image";
import { cn } from "@/lib/cn";

/** Moldura de celular simples, para mostrar um print do app em contexto. */
export function PhoneMockup({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("relative aspect-[390/844] w-full max-w-[280px]", className)}>
      <div className="absolute inset-0 rounded-[2.75rem] bg-stone-900 shadow-soft-lg" />
      <div className="absolute inset-[10px] overflow-hidden rounded-[2.25rem] bg-white">
        <Image src={src} alt={alt} fill className="object-cover object-top" sizes="280px" />
      </div>
      <div className="absolute left-1/2 top-[10px] z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-stone-900" />
    </div>
  );
}
