import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Home from './pages/Home';
import Cart from './pages/Cart';
import InitScreen from './pages/Init-screen';
import WelcomeScreen from './pages/Welcome-screen';

export const products = [
  { id: 1, name: 'Batata frita', description: 'Porção crocante feita na hora', price: 10, emoji: '🍟', color: 'peach' },
  { id: 2, name: 'Pizza vegetariana', description: 'Tomate, queijo, manjericão e carinho', price: 52, emoji: '🍕', color: 'green' },
  { id: 3, name: 'Almoço caseiro', description: 'Comida fresca com gostinho de casa', price: 24, emoji: '🍛', color: 'yellow' },
  { id: 4, name: 'Salada colorida', description: 'Leve, fresca e cheia de sabor', price: 18, emoji: '🥗', color: 'mint' },
];

function App() {
  const [cart, setCart] = useState([]);
  const addItem = (product) => setCart((current) => {
    const found = current.find((item) => item.id === product.id);
    return found ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
  });
  const changeQuantity = (id, amount) => setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  const removeItem = (id) => setCart((current) => current.filter((item) => item.id !== id));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home cart={cart} onAdd={addItem} />} />
        <Route path="/cart" element={<Cart cart={cart} onAdd={addItem} onChangeQuantity={changeQuantity} onRemove={removeItem} />} />
        <Route path="/init" element={<InitScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
