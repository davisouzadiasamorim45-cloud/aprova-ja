import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = { title: "Política de Privacidade — AprovaJá" };

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background bg-grain px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>

        <div className="mt-6 rounded-2xl border border-gold-300 bg-gold-50 p-4 text-sm text-gold-900 dark:border-gold-800 dark:bg-gold-950/40 dark:text-gold-200">
          <strong>🚧 Rascunho — não é o documento final.</strong> Este texto é um ponto de partida genérico e{" "}
          <strong>ainda não passou por revisão jurídica</strong>. Preencha os campos entre colchetes (encarregado de
          dados/DPO, contato, foro) e peça revisão de um advogado antes de publicar como versão oficial — ainda mais
          por lidar com dados pessoais sob a LGPD.
        </div>

        <h1 className="mt-8 font-display text-2xl font-semibold text-ink-900">Política de Privacidade</h1>
        <p className="mt-1 text-sm text-ink-500">Última atualização: [data]</p>

        <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-ink-700">
          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">1. Quais dados coletamos</h2>
            <p className="mt-2">
              Nome completo, e-mail, senha (armazenada de forma criptografada pelo Supabase), estado de residência,
              foto de perfil (opcional), respostas às questões praticadas, progresso no cronograma de estudo e dados
              de pagamento processados diretamente pelo Stripe (não guardamos número de cartão).
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">2. Para que usamos esses dados</h2>
            <p className="mt-2">
              Pra criar e manter sua conta, personalizar o conteúdo (concursos do seu estado, flashcards das
              questões que você errou, estatísticas de desempenho), processar pagamentos e cumprir obrigações
              legais.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">3. Base legal (LGPD)</h2>
            <p className="mt-2">
              Tratamos seus dados com base na execução do contrato (pra fornecer o serviço que você contratou), no
              seu consentimento (ex.: foto de perfil, opcional) e no legítimo interesse (ex.: métricas internas de
              uso, sem identificação individual quando possível).
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">4. Com quem compartilhamos</h2>
            <p className="mt-2">
              Usamos fornecedores que processam dados em nosso nome: <strong>Supabase</strong> (banco de dados,
              autenticação e armazenamento de arquivos) e <strong>Stripe</strong> (processamento de pagamento). Não
              vendemos seus dados a terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">5. Seus direitos</h2>
            <p className="mt-2">
              Você pode, a qualquer momento: acessar e corrigir seus dados (página de Perfil), alterar e-mail e
              senha, baixar/exportar seus dados mediante solicitação, e <strong>excluir permanentemente sua conta</strong>{" "}
              — disponível direto na página de Segurança e privacidade, sem precisar entrar em contato com ninguém.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">6. Por quanto tempo guardamos seus dados</h2>
            <p className="mt-2">
              Enquanto sua conta existir. Ao excluir a conta, seus dados pessoais e de uso são apagados
              permanentemente do nosso banco (ver seção de exclusão nos Termos de Serviço); registros que a lei
              exige manter (ex.: dados fiscais de cobrança) podem ser retidos pelo prazo legal aplicável.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">7. Cookies</h2>
            <p className="mt-2">
              Usamos cookies essenciais para manter sua sessão logada e lembrar preferências (como tema claro/escuro).
              Não usamos cookies de rastreamento publicitário de terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">8. Segurança</h2>
            <p className="mt-2">
              Senhas são armazenadas com hash (nunca em texto puro), o acesso ao banco é protegido por políticas de
              linha (RLS) que restringem cada usuário aos seus próprios dados, e a comunicação é sempre feita via
              HTTPS.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">9. Encarregado de dados (DPO) e contato</h2>
            <p className="mt-2">
              Dúvidas sobre seus dados ou exercício de direitos da LGPD: [e-mail do encarregado/DPO]. Fica eleito o
              foro da comarca de [cidade/UF] pra questões relacionadas a esta política.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-ink-900">10. Alterações nesta política</h2>
            <p className="mt-2">
              Podemos atualizar esta política de tempos em tempos. Mudanças relevantes serão avisadas pelo e-mail
              cadastrado ou dentro do app antes de entrarem em vigor.
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
