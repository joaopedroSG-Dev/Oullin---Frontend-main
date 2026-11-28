import MerchantSidebar from '../components/MerchantSidebar';
import '../styles/merchant-web.css';

const distribution = [94, 5, 1, 0, 0];
const reviews = [
  { initials: 'MC', customer: 'Mariana Costa', stars: '★★★★★', comment: 'A comida chegou quentinha e estava deliciosa!', item: 'Pizza vegana', time: 'há 12 min', pending: true },
  { initials: 'RS', customer: 'Rafael Souza', stars: '★★★★★', comment: 'Atendimento excelente, vou pedir novamente.', item: 'Burger da casa', time: 'há 1 h' },
  { initials: 'CO', customer: 'Camila Oliveira', stars: '★★★★☆', comment: 'Muito bom! Só achei a entrega um pouco demorada.', item: 'Risoto', time: 'há 3 h', pending: true },
];

export default function MerchantReviews() {
  return (
    <div className="merchant-site">
      <MerchantSidebar active="Avaliações" />
      <main className="main reviews-page">
        <header className="greeting"><h1>Olá, Saudavel Life</h1><p>Acompanhe a experiência dos clientes</p></header>
        <section className="reviews-intro"><h2>Avaliações dos clientes</h2><p>Entenda a satisfação e responda aos comentários recentes.</p></section>
        <section className="review-summary">
          <article className="white-card overall"><h3>NOTA GERAL</h3><div className="score"><strong>5,0</strong><span aria-label="5 estrelas">★★★★★</span></div><p>Baseado em 2.000 avaliações</p><b>Excelente</b></article>
          <article className="white-card distribution"><h3>Distribuição das notas</h3><div className="distribution-rows">
            {distribution.map((value, index) => <div key={index}><strong>{5 - index} ★</strong><i><b style={{ width: `${value}%` }} /></i><strong>{value}%</strong></div>)}
          </div></article>
          <article className="white-card response"><h3>Tempo de resposta</h3><strong>2h 18min</strong><p>Média de resposta</p><hr /><strong>94% respondidas</strong><p>Meta recomendada: 100%</p></article>
        </section>
        <section className="recent-reviews"><h2>Comentários recentes</h2><p>Priorize comentários sem resposta para manter a reputação.</p>
          <div className="review-list">{reviews.map((review) => (
            <article key={review.initials}><b className={`initial ${review.pending ? 'orange-text' : ''}`}>{review.initials}</b>
              <div className="review-body"><div><strong>{review.customer}</strong><span>{review.stars}</span></div><p>{review.comment}</p><small>{review.item} · {review.time}</small></div>
              {review.pending ? <a className="orange-text" href="#">Responder</a> : <b>Respondida</b>}
            </article>
          ))}</div>
        </section>
      </main>
    </div>
  );
}
