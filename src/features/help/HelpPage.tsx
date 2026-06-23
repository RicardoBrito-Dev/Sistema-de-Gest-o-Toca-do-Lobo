import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '../../components/Card';

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group border-b border-line py-3 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-surface-fg">
        <span>{q}</span>
        <ChevronDown size={16} className="shrink-0 text-surface-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 text-sm leading-relaxed text-surface-muted">{children}</div>
    </details>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="mb-1 font-highlight text-base font-bold text-surface-fg">{title}</h3>
      {children}
    </Card>
  );
}

export function HelpPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Card className="p-5">
        <h2 className="mb-2 font-highlight text-lg font-bold text-surface-fg">Central de Ajuda · FAQ</h2>
        <p className="text-sm leading-relaxed text-surface-muted">
          Tudo o que o sistema faz e como usar. Clique em cada pergunta para expandir. O <strong>Toca do Lobo</strong> é
          um sistema de gestão para campo de Airsoft (presenças, comandas, financeiro, sócios e time), rodando direto no
          navegador, sem servidor.
        </p>
      </Card>

      <Section title="🔐 Acesso e Login">
        <Faq q="Quais são o usuário e a senha padrão?">Usuário <strong>admin</strong> e senha <strong>toca2026</strong>. Troque em <strong>Configurações → Credenciais</strong>.</Faq>
        <Faq q="Por quanto tempo fico logado?">A sessão vale enquanto a aba estiver aberta. Ao fechar ou clicar em <strong>Sair</strong>, é preciso entrar de novo.</Faq>
        <Faq q="Esqueci a senha. E agora?">Não há recuperação (sem servidor). A senha fica no navegador. Sem ela, é preciso limpar os dados do site (apaga tudo) para voltar ao padrão. Anote a senha ao alterá-la.</Faq>
        <Faq q="Tem tema claro e escuro?">Sim — use o botão Sol/Lua no header (ou no login). A preferência é salva no navegador.</Faq>
      </Section>

      <Section title="📊 Dashboard">
        <Faq q="O que o Dashboard mostra?">Resumo do mês: Entradas, Saídas, Saldo e nº de Jogadores, mais as últimas presenças.</Faq>
      </Section>

      <Section title="📋 Presenças">
        <Faq q="Como registrar um jogador?">Aba Presenças → escolha a Data → <strong>Adicionar Jogador</strong>. O total é calculado ao vivo no modal.</Faq>
        <Faq q="O que é 'membro do Time'?">Membros ficam isentos de taxa de campo e carregadores, e pagam a bebida com preço de time.</Faq>
        <Faq q="Como editar/excluir?">Ícones de lápis (editar) e lixeira (excluir) na linha. A exclusão pede confirmação.</Faq>
      </Section>

      <Section title="📝 Comandas">
        <Faq q="De onde vêm as comandas?">São geradas automaticamente a partir das Presenças da data selecionada.</Faq>
        <Faq q="Como ajustar carregadores/bebidas?">Use os botões − / + na linha do jogador; o total recalcula e já salva.</Faq>
        <Faq q="O que faz 'Fechar'?">Marca a comanda como paga (com horário) e bloqueia alterações.</Faq>
        <Faq q="Como imprimir?">Botão Imprimir abre uma versão formatada (comprovante) pronta para impressão.</Faq>
      </Section>

      <Section title="💰 Financeiro">
        <Faq q="Quais períodos posso ver?">Hoje, Esta Semana e Este Mês.</Faq>
        <Faq q="Como lançar uma despesa?">Botão Lançar Despesa → categoria, descrição e valor.</Faq>
        <Faq q="O que é o Saldo Líquido?">Entradas − Saídas do período, com barra visual.</Faq>
      </Section>

      <Section title="👥 Sócios">
        <Faq q="Como o status é calculado?">Pelas presenças com o mesmo nome: <strong>Ativo</strong> (≤30 dias), <strong>Inativo</strong> (30+), <strong>Crítico</strong> (60+).</Faq>
        <Faq q="Dá pra filtrar?">Sim, por status e por nome.</Faq>
      </Section>

      <Section title="🪖 Time">
        <Faq q="O que é a aba Time?">Cadastro dos membros (nome, codinome, patente, arma, entrada, observações), em cards.</Faq>
        <Faq q="Como os cards são ordenados?">Por patente (da mais alta para a mais baixa) e, em empate, por nome.</Faq>
      </Section>

      <Section title="🧮 Como o preço é calculado">
        <Faq q="Qual a fórmula do total?"><strong>Armamento + Carregadores + Bebidas.</strong> Quem aluga ganha os 2 primeiros carregadores de cortesia; com arma própria todos são cobrados.</Faq>
        <Faq q="E para o Time?">Isento de armamento e carregadores; bebida com preço de membro do time.</Faq>
      </Section>

      <Section title="💾 Dados e Privacidade">
        <Faq q="Onde os dados ficam?">No navegador (localStorage), sem servidor. Cada dispositivo tem seus próprios dados.</Faq>
        <Faq q="Some ao recarregar?">Não — persiste. Só some se você limpar os dados do site ou usar outro navegador/dispositivo.</Faq>
      </Section>
    </div>
  );
}
