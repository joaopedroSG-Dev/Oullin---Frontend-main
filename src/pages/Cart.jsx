import { Link } from 'react-router';
import '../styles/shop.css';

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Cart({ cart, onAdd, onChangeQuantity, onRemove }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = cart.length ? 10.99 : 0;
  const service = cart.length ? subtotal * 0.0716 : 0;
  const total = subtotal + delivery + service;
  return <main className="shop-shell cart-shell">
    <header className="cart-header"><Link className="back-link" to="/">←</Link><div><span className="eyebrow">SEU PEDIDO</span><h1>Meu carrinho</h1></div><span className="cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)} itens</span></header>
    {cart.length ? <>
      <section className="cart-list" aria-label="Itens no carrinho">{cart.map((item) => <article className="cart-item" key={item.id}>
        <div className={`cart-product-art ${item.color}`}><span>{item.emoji}</span></div>
        <div className="cart-item-info"><h2>{item.name}</h2><p>{item.description}</p><strong>{money(item.price * item.quantity)}</strong>
          <div className="quantity-control"><button onClick={() => onChangeQuantity(item.id, -1)} aria-label={`Diminuir ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={() => onChangeQuantity(item.id, 1)} aria-label={`Aumentar ${item.name}`}>＋</button></div>
        </div>
        <button className="remove-item" onClick={() => onRemove(item.id)} aria-label={`Remover ${item.name}`}>♧</button>
      </article>)}</section>
      <Link to="/" className="more-items"><span>＋</span> Adicionar mais itens <b>→</b></Link>
      <section className="summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Entrega</span><strong>{money(delivery)}</strong></div><div><span>Taxa de serviço</span><strong>{money(service)}</strong></div><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><p>Confira ingredientes e possíveis alérgenos antes de finalizar.</p></section>
      <button className="checkout-button" onClick={() => window.alert('Pedido pronto para seguir para o pagamento!')}><span>▤</span> Continuar para o pagamento <b>→</b></button>
    </> : <section className="empty-cart"><span>🛍️</span><h2>Seu carrinho está esperando</h2><p>Escolha algo gostoso no cardápio para começar seu pedido.</p><Link to="/" className="checkout-button">Explorar o cardápio <b>→</b></Link></section>}
    <nav className="bottom-nav"><Link className="nav-item" to="/"><span>⌂</span>Início</Link><Link className="nav-item" to="/#menu"><span>⌕</span>Buscar</Link><Link className="nav-item selected" to="/cart"><span className="nav-bag">▤</span>Pedidos</Link><a className="nav-item" href="#perfil"><span>♙</span>Perfil</a></nav>
  </main>;
}
