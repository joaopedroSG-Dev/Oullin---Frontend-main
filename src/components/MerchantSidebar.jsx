import { Link } from 'react-router';
import logo from '../assets/Logo_principal.png';

const items = [
  { label: 'Início', to: '/painel' },
  { label: 'Avaliações', to: '/painel/avaliacoes' },
  { label: 'Pedidos', to: '/painel/pedidos' },
  { label: 'Financeiro' },
  { label: 'Cardápio' },
  { label: 'Área de entrega' },
  { label: 'Perfil' },
  { label: 'Desempenho' },
  { label: 'Ajuda' },
];

export default function MerchantSidebar({ active }) {
  return (
    <aside className="sidebar">
      <Link className="brand" to="/painel" aria-label="Oullin, início"><img src={logo} alt="Oullin" /></Link>
      <div className="restaurant-hours"><strong>Restaurante aberto</strong><span>13h às 17h</span></div>
      <nav aria-label="Menu do restaurante">
        {items.map((item) => item.to ? (
          <Link className={active === item.label ? 'selected' : ''} to={item.to} key={item.label}>{item.label}</Link>
        ) : (
          <span key={item.label}>{item.label}</span>
        ))}
      </nav>
    </aside>
  );
}
