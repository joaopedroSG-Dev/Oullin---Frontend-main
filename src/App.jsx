import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantReviews from './pages/MerchantReviews';
import MerchantOrders from './pages/MerchantOrders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MerchantDashboard />} />
        <Route path="/painel" element={<MerchantDashboard />} />
        <Route path="/painel/avaliacoes" element={<MerchantReviews />} />
        <Route path="/painel/pedidos" element={<MerchantOrders />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
