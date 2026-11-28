import { Link } from 'react-router';
import MerchantSidebar from '../components/MerchantSidebar';
import '../styles/merchant-web.css';

const hours = [
  16, 21, 18, 27, 23, 34, 26, 44, 29, 54, 36, 63,
  49, 73, 56, 82, 66, 93,
];

export default function MerchantDashboard() {
  return (
    <div className="merchant-site">
      <MerchantSidebar active="Início" />
      <main className="main dashboard-page">
        <header className="greeting"><h1>Olá, Saudavel Life</h1><p>Resumo de hoje</p></header>
        <section className="overview">
          <div className="section-heading"><div><h2>Visão geral</h2><p>Acompanhe o que está acontecendo no seu restaurante hoje.</p></div><span className="date">HOJE · 09 NOV</span></div>
          <div className="metrics">
            <article><span>Vendas hoje</span><strong>R$ 4.820,50</strong><small>+12,8% em relação a ontem</small></article>
            <article><span>Pedidos recebidos</span><strong>86</strong><small>+8 pedidos hoje</small></article>
            <article><span>Ticket médio</span><strong>R$ 56,05</strong><small>+4,2% esta semana</small></article>
            <article><span>Avaliação média</span><b className="rating-icon" /><strong>5,0 / 5</strong><small>↑ 0,3 neste mês</small></article>
          </div>
        </section>
        <section className="sales-card">
          <div className="sales-heading"><div><h2>Vendas ao longo do dia</h2><p>Faturamento por faixa de horário</p></div><strong>Últimas 24h</strong></div>
          <div className="chart" role="img" aria-label="Gráfico de vendas por hora, das 08h às 20h">
            <div className="y-labels"><span>150</span><span>100</span><span>50</span><span>0</span></div>
            <div className="plot"><div className="gridlines"><i /><i /><i /><i /></div><div className="bars">
              {hours.map((height, index) => <i className={index === 16 ? 'orange' : ''} style={{ height: `${height}%` }} key={index} />)}
            </div><div className="x-labels"><span>08h</span><span>10h</span><span>12h</span><span>14h</span><span>16h</span><span>18h</span><span>20h</span></div></div>
          </div>
        </section>
        <div className="bottom-grid">
          <section className="white-card recent"><header><h2>Pedidos recentes</h2><Link to="/painel/pedidos">Ver todos →</Link></header>
            <div className="recent-row"><strong>#1052</strong><strong>Pizza vegana</strong><span>12:42</span><strong>R$ 58,90</strong><b>Novo</b></div>
            <div className="recent-row"><strong>#1051</strong><strong>Burger da casa</strong><span>12:38</span><strong>R$ 46,50</strong><b>Preparo</b></div>
            <div className="recent-row"><strong>#1050</strong><strong>Salada Caesar</strong><span>12:31</span><strong>R$ 39,90</strong><b>Entrega</b></div>
          </section>
          <section className="white-card best"><h2>Mais vendidos</h2>
            <div><strong>Risoto de cogumelos</strong><i className="orange" style={{ width: '100%' }} /></div>
            <div><strong>Burger da casa</strong><i style={{ width: '84%' }} /></div>
            <div><strong>Pizza vegana</strong><i style={{ width: '66%' }} /></div>
          </section>
        </div>
      </main>
    </div>
  );
}
