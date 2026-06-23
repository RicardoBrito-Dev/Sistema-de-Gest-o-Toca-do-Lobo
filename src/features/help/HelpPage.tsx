import type { CSSProperties, ReactNode } from 'react';

const itemStyle: CSSProperties = { borderBottom: '1px solid var(--border)', padding: '12px 4px' };
const summaryStyle: CSSProperties = { cursor: 'pointer', fontWeight: 600, color: 'var(--text-100)', fontFamily: 'var(--ff-title)', listStyle: 'revert' };
const answerStyle: CSSProperties = { marginTop: 10, color: 'var(--text-200)', lineHeight: 1.65, fontSize: '.92rem' };
const ulStyle: CSSProperties = { margin: '6px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 };

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details style={itemStyle}>
      <summary style={summaryStyle}>{q}</summary>
      <div style={answerStyle}>{children}</div>
    </details>
  );
}

export function HelpPage() {
  return (
    <section className="tab-content active">
      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">❓ Central de Ajuda · FAQ</h3>
        <p style={{ color: 'var(--text-200)', lineHeight: 1.65 }}>
          Tudo o que o sistema faz e como usar. Clique em cada pergunta para expandir a resposta.
          O <strong>Toca do Lobo</strong> é um sistema de gestão para campo de Airsoft: controla
          presenças, comandas, financeiro, sócios e o time — direto no navegador, sem servidor.
        </p>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">🔐 Acesso e Login</h3>
        <Faq q="Quais são o usuário e a senha padrão?">
          Usuário <strong>admin</strong> e senha <strong>toca2026</strong>. Troque-os na aba
          <strong> Configurações → Credenciais de Acesso</strong>.
        </Faq>
        <Faq q="Por quanto tempo fico logado?">
          A sessão vale enquanto a aba do navegador estiver aberta. Ao fechar a aba ou clicar em
          <strong> Sair</strong>, é preciso entrar novamente.
        </Faq>
        <Faq q="Esqueci a senha. E agora?">
          Como não há servidor, não existe “recuperar senha”. A senha fica salva no próprio
          navegador. Se ninguém souber a senha atual, é necessário limpar os dados do site no
          navegador (o que <em>apaga todos os registros</em>) para voltar ao padrão <strong>admin/toca2026</strong>.
          Por isso, anote a senha em local seguro ao alterá-la.
        </Faq>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">📊 Dashboard</h3>
        <Faq q="O que o Dashboard mostra?">
          Um resumo do <strong>mês atual</strong>: total de <strong>Entradas</strong>,
          <strong> Saídas</strong>, <strong>Saldo</strong> e número de <strong>Jogadores</strong>,
          além das <strong>últimas presenças</strong> (até 5 datas mais recentes).
        </Faq>
        <Faq q="O saldo pode ficar vermelho?">
          Sim. O saldo é Entradas − Saídas do mês; quando negativo, aparece em vermelho.
        </Faq>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">📋 Presenças</h3>
        <Faq q="Como registrar um jogador?">
          Na aba <strong>Presenças</strong>, escolha a <strong>Data</strong> no topo e clique em
          <strong> ➕ Adicionar Jogador</strong>. Informe nome, se aluga arma ou usa a própria,
          carregadores e bebidas. O <strong>total é calculado ao vivo</strong> no rodapé do modal.
        </Faq>
        <Faq q="O que é “Jogador é membro do Time”?">
          Marque essa opção para membros do time: eles ficam <strong>isentos da taxa de campo e de
          carregadores</strong> e pagam a <strong>bebida com preço de membro do time</strong>.
        </Faq>
        <Faq q="Como editar ou excluir um registro?">
          Use os botões <strong>✏️</strong> (editar) e <strong>🗑️</strong> (excluir) na linha do
          jogador. A exclusão pede confirmação.
        </Faq>
        <Faq q="O que é o resumo do dia?">
          A faixa acima da tabela soma, para a data selecionada: nº de jogadores, total a receber,
          carregadores e bebidas.
        </Faq>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">📝 Comandas</h3>
        <Faq q="De onde vêm as comandas?">
          São geradas automaticamente a partir das <strong>Presenças</strong>. Adicionou um jogador
          numa data? Ele aparece na comanda daquela data — sem digitar de novo.
        </Faq>
        <Faq q="Como ajustar carregadores e bebidas na comanda?">
          Use os botões <strong>−</strong> / <strong>+</strong> ou digite o número direto na linha do
          jogador. O total recalcula na hora e já fica salvo.
        </Faq>
        <Faq q="O que faz o botão “✅ Fechar”?">
          Marca a comanda do jogador como <strong>PAGA</strong> (com o horário do pagamento). Depois
          de fechada, os campos ficam bloqueados para evitar alterações.
        </Faq>
        <Faq q="Como imprimir a comanda?">
          Clique em <strong>📋 Imprimir</strong> no topo do cartão da data. Abre uma versão formatada
          pronta para impressão, com o total geral.
        </Faq>
        <Faq q="Posso filtrar?">
          Sim: por <strong>data</strong> e por <strong>nome do jogador</strong> (campo de busca).
        </Faq>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">💰 Financeiro</h3>
        <Faq q="Quais períodos posso analisar?">
          <strong>Hoje</strong>, <strong>Esta Semana</strong> e <strong>Este Mês</strong>. Em “Hoje”
          dá para escolher uma data específica.
        </Faq>
        <Faq q="Como as Entradas são detalhadas?">
          Em quatro linhas: <strong>Taxa do Campo</strong> (arma própria), <strong>Aluguel de Armas</strong>,
          <strong> Carregadores</strong> e <strong>Bebidas</strong>, com o total do período.
        </Faq>
        <Faq q="Como lançar uma despesa?">
          Clique em <strong>➕ Lançar Despesa</strong>, escolha a categoria (Manutenção, Combustível,
          Equipamentos, Alimentação, Marketing, Aluguel ou Outros), descreva e informe o valor.
        </Faq>
        <Faq q="O que é o Saldo Líquido?">
          Entradas − Saídas do período, com uma barra visual indicando a proporção do saldo.
        </Faq>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">👥 Sócios</h3>
        <Faq q="Como os sócios se relacionam com as presenças?">
          As estatísticas (visitas, última visita, dias de inatividade) são calculadas a partir das
          <strong> Presenças com o mesmo nome</strong> do sócio.
        </Faq>
        <Faq q="Como o status de atividade é definido?">
          <ul style={ulStyle}>
            <li><strong>✅ Ativo</strong>: visitou nos últimos 30 dias.</li>
            <li><strong>⚠️ Inativo</strong>: sem visitas há mais de 30 dias.</li>
            <li><strong>🔴 Crítico</strong>: sem visitas há mais de 60 dias.</li>
          </ul>
        </Faq>
        <Faq q="Posso filtrar os sócios?">
          Sim, por <strong>status</strong> (ativo/inativo/crítico) e por <strong>nome</strong>.
        </Faq>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">🪖 Time</h3>
        <Faq q="O que é a aba Time?">
          O cadastro dos membros do time, em cartões, com nome, codinome, patente, arma principal,
          data de entrada e observações.
        </Faq>
        <Faq q="Como os cartões são ordenados?">
          Por <strong>patente</strong> (da mais alta para a mais baixa): General, Coronel, Major,
          Capitão, Tenente, Sargento, Cabo, Soldado — e, em empate, por nome.
        </Faq>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">⚙️ Configurações</h3>
        <Faq q="O que dá para configurar?">
          A <strong>tabela de preços</strong> (aluguel, taxa de campo, carregador, bebida e bebida de
          membro do time) e as <strong>credenciais de acesso</strong> (usuário e senha).
        </Faq>
        <Faq q="Mudar um preço afeta registros antigos?">
          Sim — os totais são sempre recalculados com os preços atuais. Ajuste os preços antes de
          fechar comandas se quiser “congelar” valores diferentes.
        </Faq>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">🧮 Como o preço é calculado</h3>
        <Faq q="Qual a fórmula do total de um jogador?">
          <strong>Total = Armamento + Carregadores + Bebidas.</strong>
          <ul style={ulStyle}>
            <li><strong>Armamento</strong>: quem <em>aluga</em> paga a taxa de aluguel; quem usa <em>arma própria</em> paga a taxa de campo (menor).</li>
            <li><strong>Carregadores</strong>: quem aluga arma ganha os <strong>2 primeiros de cortesia</strong>; o restante é cobrado por unidade. Com arma própria, todos são cobrados.</li>
            <li><strong>Bebidas</strong>: cobradas por unidade.</li>
          </ul>
        </Faq>
        <Faq q="E para membros do Time?">
          Ficam <strong>isentos de armamento e carregadores</strong> e pagam a bebida com o
          <strong> preço de membro do time</strong> (configurável).
        </Faq>
      </div>

      <div className="section-card" style={{ marginBottom: 18 }}>
        <h3 className="section-title">💾 Dados e Privacidade</h3>
        <Faq q="Onde os dados ficam salvos?">
          Tudo é salvo <strong>localmente no navegador</strong> (armazenamento do próprio dispositivo),
          sem servidor e sem internet. Cada navegador/dispositivo tem seus próprios dados.
        </Faq>
        <Faq q="Os dados somem ao recarregar a página?">
          Não. Eles persistem automaticamente. Só são perdidos se você limpar os dados do site no
          navegador ou usar um dispositivo/navegador diferente.
        </Faq>
        <Faq q="Tem backup?">
          Não há backup automático em nuvem. Como tudo fica no navegador, evite “limpar dados de
          navegação” do site e prefira sempre o mesmo dispositivo para o caixa.
        </Faq>
      </div>

      <div className="section-card">
        <h3 className="section-title">🛠️ Problemas comuns</h3>
        <Faq q="“Os dados sumiram!”">
          Provavelmente você abriu em outro navegador/dispositivo, em aba anônima, ou limpou os
          dados do site. Os registros ficam atrelados ao navegador onde foram criados.
        </Faq>
        <Faq q="A comanda não deixa eu alterar.">
          Ela já foi <strong>fechada (PAGA)</strong>. Comandas pagas ficam bloqueadas. Para corrigir,
          ajuste o registro na aba <strong>Presenças</strong>.
        </Faq>
        <Faq q="Um jogador não aparece nas Comandas.">
          Confira se a <strong>data</strong> selecionada nas Comandas é a mesma do registro de
          presença, e se a busca por nome não está filtrando demais.
        </Faq>
      </div>
    </section>
  );
}
