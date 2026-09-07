import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = { title: "Termos de Serviço — AprovaJá" };

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background bg-grain px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>

        <div className="mt-6 rounded-2xl border border-gold-300 bg-gold-50 p-4 text-sm text-gold-900 dark:border-gold-800 dark:bg-gold-950/40 dark:text-gold-200">
          <strong>🚧 Rascunho — não é o documento final.</strong> Este texto é um ponto de partida genérico e{" "}
          <strong>ainda não passou por revisão jurídica</strong>. Não deve ser tratado como aconselhamento legal nem
          publicado como versão oficial antes de um advogado revisar e preencher os campos entre colchetes (razão
          social, CNPJ, foro, etc).
        </div>

        <h1 className="mt-8 font-display text-2xl font-semibold text-ink-900">Termos de Serviço</h1>
        <p className="mt-1 text-sm text-ink-500">Última atualização: [data]</p>

        <div className="prose-config mt-6 flex flex-col gap-6 text-sm leading-relaxed text-ink-700">
          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">1. Quem somos</h2>
            <p className="mt-2">
              O AprovaJá é uma plataforma de preparação para concursos públicos, operada por [razão social],
              inscrita no CNPJ [000.000.000/0000-00]. Ao criar uma conta ou usar o serviço, você concorda com estes
              termos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">2. Sua conta</h2>
            <p className="mt-2">
              Você é responsável por manter sua senha em sigilo e por tudo que acontecer na sua conta. Avise a gente
              imediatamente se suspeitar de acesso não autorizado. Você precisa fornecer informações verdadeiras no
              cadastro (nome, e-mail, estado).
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">3. Planos e pagamento</h2>
            <p className="mt-2">
              Alguns recursos exigem assinatura paga, processada via Stripe. A cobrança é recorrente conforme o
              ciclo do plano escolhido, renovando automaticamente até que você cancele. Você pode cancelar a
              qualquer momento pela página de Plano e assinatura — o acesso pago continua até o fim do período já
              pago, sem reembolso proporcional, salvo o disposto em lei (ex.: arrependimento em até 7 dias da
              primeira contratação, conforme o Código de Defesa do Consumidor).
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">4. Uso aceitável</h2>
            <p className="mt-2">
              Não é permitido: burlar limites técnicos do sistema, revender ou redistribuir o conteúdo do catálogo
              (questões, flashcards, cronogramas gerados) fora da plataforma, tentar acessar dados de outros
              usuários, ou usar o serviço para fins ilegais.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">5. Conteúdo e propriedade intelectual</h2>
            <p className="mt-2">
              O catálogo de concursos, questões, flashcards e o software em si são propriedade do AprovaJá ou de
              seus licenciadores. Links de edital apontam para as fontes oficiais dos órgãos/bancas responsáveis —
              não hospedamos nem somos responsáveis pelo conteúdo desses editais externos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">6. Limitação de responsabilidade</h2>
            <p className="mt-2">
              O AprovaJá é uma ferramenta de apoio aos estudos. Não garantimos aprovação em concurso nenhum, nem a
              exatidão, atualidade ou completude do conteúdo do catálogo (editais, gabaritos, prazos). Consulte
              sempre as fontes oficiais do concurso antes de tomar decisões importantes (ex.: data de prova,
              documentação exigida).
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">7. Cancelamento e exclusão de conta</h2>
            <p className="mt-2">
              Você pode excluir sua conta a qualquer momento pela página de Segurança e privacidade. A exclusão é
              permanente e cancela qualquer assinatura ativa — veja a Política de Privacidade para detalhes sobre o
              que acontece com seus dados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">8. Alterações nestes termos</h2>
            <p className="mt-2">
              Podemos atualizar estes termos de tempos em tempos. Mudanças relevantes serão avisadas pelo e-mail
              cadastrado ou dentro do app antes de entrarem em vigor.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">9. Foro e contato</h2>
            <p className="mt-2">
              Fica eleito o foro da comarca de [cidade/UF] para dirimir eventuais controvérsias. Dúvidas? Fale com a
              gente em [e-mail de contato].
            </p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm font-medium text-brand-700 hover:underline">
          ← Voltar para o início
        </Link>
      </div>
    </div>
  );
}
