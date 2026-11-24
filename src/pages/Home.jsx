import { Link } from 'react-router';
import { products } from '../App';
import '../styles/shop.css';

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Home({ cart, onAdd }) {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <main className="shop-shell">
      <header className="shop-header">
        <Link className="brand" to="/" aria-label="Oullin início"><span className="brand-mark">o</span> oullin</Link>
        <div className="delivery-note"><span>⌖</span><div><small>Entregar em</small><strong>São Paulo, SP⌄</strong></div></div>
        <Link className="header-cart" to="/cart" aria-label={`Carrinho, ${count} itens`}>♧{count > 0 && <b>{count}</b>}</Link>
      </header>
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow">COMIDA BOA, COM MAIS CUIDADO</span><h1>Seu próximo prato<br /><em>favorito</em> está aqui.</h1><p>Encontre sabores feitos com carinho por quem cozinha perto de você.</p><a href="#menu" className="hero-cta">Ver cardápio <span>↓</span></a></div>
        <div className="hero-art" aria-hidden="true"><span className="hero-orbit orbit-one"/><span className="hero-orbit orbit-two"/><span className="hero-food">🥙</span><span className="hero-spark">✳</span><span className="hero-leaf">✿</span></div>
      </section>
      <section className="menu-section" id="menu">
        <div className="section-heading"><div><span className="eyebrow">FEITO PARA VOCÊ</span><h2>O que vai ser hoje?</h2></div><span className="open-tag"><i/> Cozinhas abertas</span></div>
        <div className="category-row"><button className="category active">✦　Todos</button><button className="category">🍽️　Pratos</button><button className="category">🥗　Leves</button><button className="category">🍰　Doces</button></div>
        <div className="product-grid">{products.map((product) => <article className="product-card" key={product.id}>
          <div className={`product-art ${product.color}`}><span>{product.emoji}</span><button className="favorite" aria-label="Favoritar">♡</button></div>
          <div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.price)}</strong></div>
          <button className="add-button" onClick={() => onAdd(product)}><span>＋</span> Adicionar ao carrinho</button>
        </article>)}</div>
      </section>
      <footer className="shop-footer">Feito com cuidado <span>♥</span> perto de você.</footer>
      <nav className="bottom-nav"><Link className="nav-item selected" to="/"><span>⌂</span>Início</Link><a className="nav-item" href="#menu"><span>⌕</span>Buscar</a><Link className="nav-item" to="/cart"><span className="nav-bag">▤{count > 0 && <i>{count}</i>}</span>Pedidos</Link><a className="nav-item" href="#perfil"><span>♙</span>Perfil</a></nav>
    </main>
  );
}
