import MerchantSidebar from '../components/MerchantSidebar';
import '../styles/merchant-web.css';

const columns = [
  { title: 'Novos', count: '02', tone: 'new', orders: [
    { id: '#1052', customer: 'Ana Paula', item: 'Pizza vegana', time: '12:42', price: 'R$ 58,90', action: 'Aceitar' },
    { id: '#1053', customer: 'Bruno Lima', item: 'Salada + suco', time: '12:45', price: 'R$ 42,00', action: 'Aceitar' },
  ] },
  { title: 'Em preparo', count: '02', tone: 'preparing', orders: [
    { id: '#1051', customer: 'João Pedro', item: 'Burger da casa', time: '12:38', price: 'R$ 46,50', action: 'Ver preparo' },
    { id: '#1048', customer: 'Lucas Reis', item: 'Risoto de cogumelos', time: '12:25', price: 'R$ 52,00', action: 'Ver preparo' },
  ] },
  { title: 'Prontos para sair', count: '01', tone: 'ready', orders: [
    { id: '#1050', customer: 'Mariana Lima', item: 'Salada Caesar', time: '12:31', price: 'R$ 39,90', action: 'Despachar' },
  ] },
  { title: 'Concluídos', count: '02', tone: 'done', orders: [
    { id: '#1047', customer: 'Pedro Alves', item: 'Batata rústica', time: '12:18', price: 'R$ 28,00', action: 'Detalhes' },
    { id: '#1046', customer: 'Julia Santos', item: 'Combo saudável', time: '12:10', price: 'R$ 64,00', action: 'Detalhes' },
  ] },
];
const totals = [['Novos', '08'], ['Em preparo', '12'], ['Prontos para sair', '05'], ['Concluídos', '61']];

export default function MerchantOrders() {
  return (
    <div className="merchant-site">
      <MerchantSidebar active="Pedidos" />
      <main className="main orders-page">
        <header className="greeting"><h1>Olá, Saudavel Life</h1><p>Gerencie pedidos recebidos e entregues</p></header>
        <section className="orders-intro"><h2>Central de pedidos</h2><p>Acompanhe cada etapa do atendimento em um só lugar.</p></section>
        <section className="totals">{totals.map(([label, value]) => <article key={label}>{label}<strong>{value}</strong></article>)}</section>
        <section className="board">{columns.map((column) => (
          <article className={`order-column ${column.tone}`} key={column.title}>
            <header><h3>{column.title}</h3><strong>{column.count}</strong></header>
            {column.orders.map((order) => <div className="ticket" key={order.id}>
              <b>{order.id}</b><strong>{order.customer}</strong><span>{order.item}</span>
              <div><span>{order.time}</span><strong>{order.price}</strong></div><b>{order.action}</b>
            </div>)}
          </article>
        ))}</section>
      </main>
    </div>
  );
}
