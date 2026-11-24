import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  orange: '#FF8500',
  amber: '#FFB400',
  blue: '#124F8C',
  text: '#171717',
  muted: '#777777',
  white: '#FFFFFF',
};

const FOOD_CATEGORIES = [
  // A foto dos chefs representa a seleção geral e evita repetir o card de hambúrguer.
  { label: 'Todos', image: require('./assets/saudavel-life-chefs.png') },
  { label: 'Hambúrguer', image: require('./assets/burger-photo.jpg') },
  { label: 'Pizza', image: require('./assets/pizza-photo.jpg') },
  { label: 'Marmitas', image: require('./assets/meal-banner-user.png') },
  { label: 'Saladas', image: require('./assets/salad-photo.jpg') },
  { label: 'Massas', image: require('./assets/pasta-photo.jpg') },
  { label: 'Sushi', image: require('./assets/sushi-photo.jpg') },
  { label: 'Doces', image: require('./assets/dessert-photo.jpg') },
  { label: 'Bebidas', image: require('./assets/drink-photo.jpg') },
  { label: 'Salgados', image: require('./assets/food-pastel.png') },
  { label: 'Porções', image: require('./assets/food-fries.png') },
];

// Catálogo demonstrativo; a lista poderá ser substituída pela resposta do backend.
const FOOD_CARDS = [
  {
    id: 'burger',
    restaurantId: 'burger-house',
    name: 'Hambúrguer artesanal',
    category: 'Hambúrguer',
    image: require('./assets/burger-photo.jpg'),
    backgroundColor: '#B43724',
  },
  {
    id: 'pizza',
    restaurantId: 'pizza-da-vila',
    name: 'Pizza artesanal',
    category: 'Pizza',
    image: require('./assets/pizza-photo.jpg'),
    backgroundColor: '#8D1737',
  },
  {
    id: 'salad',
    restaurantId: 'salada-viva',
    name: 'Salada fresca',
    category: 'Saladas',
    image: require('./assets/salad-photo.jpg'),
    backgroundColor: '#387C4B',
  },
  {
    id: 'pasta',
    restaurantId: 'massa-da-casa',
    name: 'Massa da casa',
    category: 'Massas',
    image: require('./assets/pasta-photo.jpg'),
    backgroundColor: '#B76520',
  },
  {
    id: 'dessert',
    restaurantId: 'doce-cantinho',
    name: 'Doces especiais',
    category: 'Doces',
    image: require('./assets/dessert-photo.jpg'),
    backgroundColor: '#A74569',
  },
  {
    id: 'drink',
    restaurantId: 'bebidas-geladas',
    name: 'Bebidas geladas',
    category: 'Bebidas',
    image: require('./assets/drink-photo.jpg'),
    backgroundColor: '#357C91',
  },
  {
    id: 'sushi',
    restaurantId: 'sushi-oullin',
    name: 'Sushi variado',
    category: 'Sushi',
    image: require('./assets/sushi-photo.jpg'),
    backgroundColor: '#624332',
  },
  {
    id: 'meal',
    restaurantId: 'marmitas-da-ana',
    name: 'Marmitas da semana',
    category: 'Marmitas',
    image: require('./assets/meal-banner-user.png'),
    backgroundColor: '#537344',
  },
  {
    id: 'fries',
    restaurantId: 'burger-house',
    name: 'Batata frita',
    category: 'Porções',
    image: require('./assets/food-fries-card.png'),
    backgroundColor: '#A85A18',
  },
  {
    id: 'pastel',
    restaurantId: 'doce-cantinho',
    name: 'Pastel de feira',
    category: 'Salgados',
    image: require('./assets/food-pastel-card.png'),
    backgroundColor: '#B46B20',
  },
  {
    id: 'veggie-burger',
    restaurantId: 'burger-house',
    name: 'Hambúrguer vegano',
    category: 'Hambúrguer',
    image: require('./assets/food-veggie-burger-card.png'),
    backgroundColor: '#3D6944',
  },
  {
    id: 'pizza-margherita',
    restaurantId: 'pizza-da-vila',
    name: 'Pizza marguerita',
    category: 'Pizza',
    image: require('./assets/food-pizza-card.png'),
    backgroundColor: '#9A3A25',
  },
  {
    id: 'cola',
    restaurantId: 'bebidas-geladas',
    name: 'Refrigerante de cola',
    category: 'Bebidas',
    image: require('./assets/drink-cola-card.png'),
    backgroundColor: '#872928',
  },
  {
    id: 'cola-zero',
    restaurantId: 'bebidas-geladas',
    name: 'Refrigerante cola zero',
    category: 'Bebidas',
    image: require('./assets/drink-cola-zero-card.png'),
    backgroundColor: '#333333',
  },
  {
    id: 'meal-chicken',
    restaurantId: 'marmitas-da-ana',
    name: 'Marmita de frango',
    category: 'Marmitas',
    image: require('./assets/marmita-detail-frango.png'),
    backgroundColor: '#7B5933',
  },
  {
    id: 'meal-vegetables',
    restaurantId: 'marmitas-da-ana',
    name: 'Marmita de legumes',
    category: 'Marmitas',
    image: require('./assets/marmita-card-salada.png'),
    backgroundColor: '#477044',
  },
  {
    id: 'meal-homestyle',
    restaurantId: 'marmitas-da-ana',
    name: 'Marmita caseira',
    category: 'Marmitas',
    image: require('./assets/marmita-card-caseira.png'),
    backgroundColor: '#76513C',
  },
];

const SEARCH_FILTERS = [
  'Todo Oullin',
  'Perfil alimentar',
  'restaurantes',
  'bebidas',
  'região',
  'menor preço',
];

const FOOD_CARD_PRICES = {
  burger: 28.9,
  pizza: 38.9,
  salad: 18.99,
  pasta: 18.99,
  dessert: 12.99,
  drink: 9.99,
  sushi: 32,
  meal: 15.99,
  fries: 12,
  pastel: 8.99,
  'veggie-burger': 24.9,
  'pizza-margherita': 34.9,
  cola: 6.99,
  'cola-zero': 6.99,
  'meal-chicken': 15.99,
  'meal-vegetables': 15.99,
  'meal-homestyle': 18.99,
};

const RECENT_STORES = [
  {
    id: 'saudavel-life',
    name: 'Saudável Life',
    image: require('./assets/saudavel-life-logo.png'),
  },
  { id: 'burger-house', name: 'Burger House', image: require('./assets/burger-photo.jpg') },
  { id: 'pizza-da-vila', name: 'Pizza da Vila', image: require('./assets/pizza-photo.jpg') },
  { id: 'sushi-oullin', name: 'Sushi Oullin', image: require('./assets/sushi-photo.jpg') },
  { id: 'marmitas-da-ana', name: 'Marmitas da Ana', image: require('./assets/meal-banner-user.png') },
  { id: 'salada-viva', name: 'Salada Viva', image: require('./assets/salad-photo.jpg') },
  { id: 'doce-cantinho', name: 'Doce Cantinho', image: require('./assets/dessert-photo.jpg') },
  { id: 'massa-da-casa', name: 'Massa da Casa', image: require('./assets/pasta-photo.jpg') },
  { id: 'bebidas-geladas', name: 'Bebidas Geladas', image: require('./assets/drink-photo.jpg') },
];
const INITIAL_RECENT_SEARCHES = ['Pizza', 'Pastel', 'torta', 'filé a parmegiana'];
const SEARCH_HISTORY_STORAGE_KEY = '@oullin/search-history';

const MEAL_FEATURES = [
  { type: 'utensils', label: 'Utensílios dedicados' },
  { type: 'ingredientCard', label: 'Ingredientes utilizados' },
  { type: 'nutrition', label: 'Ficha nutricional' },
  { type: 'certificate', label: 'Certificações' },
];

const MEAL_SEARCH_ITEMS = [
  {
    id: 'meal-chicken',
    name: 'Marmita Simples',
    detailName: 'Marmita de frango',
    price: 'R$ 15,99',
    description: 'Frango grelhado, arroz e feijão.',
    image: require('./assets/marmita-detail-frango.png'),
    filters: ['Sem glúten', 'Sem lactose'],
    dietaryCompatibility: { vegan: false, vegetarian: false, glutenFree: true, lactoseFree: true },
    features: MEAL_FEATURES,
  },
  {
    id: 'meal-vegetables',
    name: 'Marmita de legumes',
    detailName: 'Marmita vegana de legumes',
    price: 'R$ 15,99',
    description: 'Legumes, arroz integral e grão-de-bico.',
    image: require('./assets/marmita-card-salada.png'),
    filters: ['Vegano', 'Sem glúten', 'Sem lactose'],
    dietaryCompatibility: { vegan: true, vegetarian: true, glutenFree: true, lactoseFree: true },
    features: MEAL_FEATURES,
  },
  {
    id: 'meal-homestyle',
    name: 'Marmita caseira',
    detailName: 'Marmita caseira de frango',
    price: 'R$ 18,99',
    description: 'Frango, arroz, feijão e legumes preparados no dia.',
    image: require('./assets/marmita-card-caseira.png'),
    filters: ['Sem glúten', 'Sem lactose'],
    dietaryCompatibility: { vegan: false, vegetarian: false, glutenFree: true, lactoseFree: true },
    features: MEAL_FEATURES,
  },
];

const RESTAURANT_MEALS = [
  {
    name: 'Marmita simples',
    detailName: 'Marmita de frango',
    price: 'R$ 15,99',
    description: 'Arroz, frango e legumes preparados no dia.',
    image: require('./assets/marmita-detail-frango.png'),
  },
  {
    name: 'Marmita de legumes',
    price: 'R$ 15,99',
    description: 'Legumes frescos com acompanhamento da casa.',
    image: require('./assets/marmita-card-salada.png'),
  },
  {
    name: 'Marmita caseira',
    price: 'R$ 18,99',
    description: 'Uma refeição completa feita com ingredientes selecionados.',
    image: require('./assets/marmita-card-caseira.png'),
  },
];

const RESTAURANT_FOODS = [
  {
    name: 'Salada fresca',
    price: 'R$ 12,99',
    description: 'Salada fresca com folhas e vegetais variados.',
    image: require('./assets/salad-photo.jpg'),
  },
  {
    name: 'Massa da casa',
    price: 'R$ 18,99',
    description: 'Massa preparada com molho e ingredientes frescos.',
    image: require('./assets/pasta-photo.jpg'),
  },
  {
    name: 'Hambúrguer artesanal',
    price: 'R$ 25,00',
    description: 'Hambúrguer artesanal com ingredientes selecionados.',
    image: require('./assets/burger-photo.jpg'),
  },
];

function makeMenuItem(name, price, description, image) {
  return { name, detailName: name, price, description, image };
}

const UNCONFIRMED_FOOD_SAFETY = {
  glutenFree: 'Não confirmado com o restaurante',
  lactoseFree: 'Não confirmado com o restaurante',
  crossContamination: 'Não informado pelo restaurante',
  equipment: 'Não informado pelo restaurante',
};

export const RESTAURANT_DIRECTORY = [
  {
    id: 'saudavel-life',
    name: 'Saudável Life',
    verified: true,
    image: require('./assets/saudavel-life-logo.png'),
    heroImage: require('./assets/saudavel-life-chefs.png'),
    rating: '4,6 (200 avaliações)',
    deliveryTime: '30–45 min',
    minimumOrder: 'R$ 25,00',
    description: 'Marmitas e refeições para a rotina.',
    foodSafety: {
      ...UNCONFIRMED_FOOD_SAFETY,
      equipment: 'Utensílios dedicados (cadastro demonstrativo; confirme com a loja)',
    },
    filters: ['Todo Oullin', 'Perfil alimentar', 'Marmitas', 'alimentos', 'menor preço'],
    features: [
      { type: 'utensils', label: 'Utensílios dedicados' },
      { type: 'ingredientCard', label: 'Dados de ingredientes' },
      { type: 'utensils', label: 'Utensílios dedicados' },
    ],
    sections: [
      { title: 'Marmitas', items: RESTAURANT_MEALS },
      { title: 'Alimentos', items: RESTAURANT_FOODS },
    ],
  },
  {
    id: 'burger-house',
    name: 'Burger House',
    image: require('./assets/burger-photo.jpg'),
    heroImage: require('./assets/burger-photo.jpg'),
    rating: '4,8 (320 avaliações)',
    deliveryTime: '25–40 min',
    minimumOrder: 'R$ 20,00',
    description: 'Hambúrgueres artesanais e acompanhamentos.',
    foodSafety: UNCONFIRMED_FOOD_SAFETY,
    filters: ['Todo Oullin', 'Perfil alimentar', 'hambúrgueres', 'acompanhamentos', 'menor preço'],
    features: [
      { type: 'ingredients', label: 'Ingredientes frescos' },
      { type: 'nutrition', label: 'Carne selecionada' },
      { type: 'certificate', label: 'Preparo na hora' },
    ],
    sections: [{
      title: 'Hambúrgueres e acompanhamentos',
      items: [
        makeMenuItem('Burger da casa', 'R$ 28,90', 'Hambúrguer artesanal com queijo e molho da casa.', require('./assets/burger-photo.jpg')),
        makeMenuItem('Burger vegetariano', 'R$ 24,90', 'Hambúrguer vegetariano com salada fresca.', require('./assets/food-veggie-burger-card.png')),
        makeMenuItem('Batata crocante', 'R$ 12,00', 'Batatas douradas e crocantes.', require('./assets/food-fries-card.png')),
      ],
    }],
  },
  {
    id: 'pizza-da-vila',
    name: 'Pizza da Vila',
    image: require('./assets/pizza-photo.jpg'),
    heroImage: require('./assets/pizza-photo.jpg'),
    rating: '4,7 (245 avaliações)',
    deliveryTime: '35–50 min',
    minimumOrder: 'R$ 30,00',
    description: 'Pizzas artesanais feitas para compartilhar.',
    foodSafety: {
      ...UNCONFIRMED_FOOD_SAFETY,
      equipment: 'Forno especial (cadastro demonstrativo; confirme com a loja)',
    },
    filters: ['Todo Oullin', 'Perfil alimentar', 'pizzas', 'bebidas', 'menor preço'],
    features: [
      { type: 'ingredients', label: 'Ingredientes frescos' },
      { type: 'nutrition', label: 'Massa artesanal' },
      { type: 'certificate', label: 'Forno especial' },
    ],
    sections: [{
      title: 'Pizzas',
      items: [
        makeMenuItem('Pizza da Vila', 'R$ 38,90', 'Pizza artesanal preparada com ingredientes frescos.', require('./assets/pizza-photo.jpg')),
        makeMenuItem('Pizza marguerita', 'R$ 34,90', 'Molho de tomate, queijo, tomate e manjericão.', require('./assets/food-pizza-card.png')),
        makeMenuItem('Pizza especial', 'R$ 42,90', 'Uma combinação especial da casa.', require('./assets/promo-pizza.png')),
      ],
    }],
  },
  {
    id: 'sushi-oullin',
    name: 'Sushi Oullin',
    image: require('./assets/sushi-photo.jpg'),
    heroImage: require('./assets/sushi-photo.jpg'),
    rating: '4,9 (180 avaliações)',
    deliveryTime: '30–45 min',
    minimumOrder: 'R$ 35,00',
    description: 'Combinados e peças variadas.',
    foodSafety: UNCONFIRMED_FOOD_SAFETY,
    filters: ['Todo Oullin', 'Perfil alimentar', 'combinados', 'bebidas', 'menor preço'],
    features: [
      { type: 'ingredients', label: 'Ingredientes frescos' },
      { type: 'nutrition', label: 'Preparo cuidadoso' },
      { type: 'certificate', label: 'Qualidade verificada' },
    ],
    sections: [{
      title: 'Combinados',
      items: [
        makeMenuItem('Combinado Oullin', 'R$ 42,00', 'Seleção de sushis variados preparados na hora.', require('./assets/sushi-photo.jpg')),
        makeMenuItem('Sushi variado', 'R$ 32,00', 'Peças variadas para compartilhar.', require('./assets/sushi-photo.jpg')),
        makeMenuItem('Combo especial', 'R$ 49,90', 'Combo especial da casa.', require('./assets/promo-sushi.png')),
      ],
    }],
  },
  {
    id: 'marmitas-da-ana',
    name: 'Marmitas da Ana',
    image: require('./assets/marmita-detail-frango.png'),
    heroImage: require('./assets/marmita-detail-frango.png'),
    rating: '4,8 (156 avaliações)',
    deliveryTime: '25–40 min',
    minimumOrder: 'R$ 18,00',
    description: 'Marmitas caseiras para a rotina.',
    foodSafety: UNCONFIRMED_FOOD_SAFETY,
    filters: ['Todo Oullin', 'Perfil alimentar', 'marmitas', 'saladas', 'menor preço'],
    features: [
      { type: 'ingredients', label: 'Ingredientes do dia' },
      { type: 'nutrition', label: 'Receitas caseiras' },
      { type: 'certificate', label: 'Embalagem segura' },
    ],
    sections: [{
      title: 'Marmitas',
      items: [
        makeMenuItem('Marmita de frango', 'R$ 15,99', 'Frango grelhado, arroz e feijão.', require('./assets/marmita-detail-frango.png')),
        makeMenuItem('Frango com legumes', 'R$ 15,99', 'Frango acompanhado de legumes variados.', require('./assets/marmita-card-salada.png')),
        makeMenuItem('Marmita caseira', 'R$ 18,99', 'Refeição completa preparada no dia.', require('./assets/marmita-card-caseira.png')),
      ],
    }],
  },
  {
    id: 'salada-viva',
    name: 'Salada Viva',
    image: require('./assets/salad-photo.jpg'),
    heroImage: require('./assets/salad-photo.jpg'),
    rating: '4,7 (112 avaliações)',
    deliveryTime: '20–35 min',
    minimumOrder: 'R$ 16,00',
    description: 'Saladas e bowls com combinações variadas.',
    foodSafety: UNCONFIRMED_FOOD_SAFETY,
    filters: ['Todo Oullin', 'Perfil alimentar', 'saladas', 'sucos', 'menor preço'],
    features: [
      { type: 'ingredients', label: 'Folhas frescas' },
      { type: 'nutrition', label: 'Ingredientes selecionados' },
      { type: 'certificate', label: 'Preparo cuidadoso' },
    ],
    sections: [{
      title: 'Saladas e bowls',
      items: [
        makeMenuItem('Salada da horta', 'R$ 18,99', 'Salada fresca com folhas e vegetais variados.', require('./assets/salad-photo.jpg')),
        makeMenuItem('Bowl de legumes', 'R$ 21,99', 'Bowl colorido com legumes e grãos.', require('./assets/marmita-card-salada.png')),
        makeMenuItem('Salada tropical', 'R$ 19,99', 'Combinação fresca da casa.', require('./assets/promo-salad.png')),
      ],
    }],
  },
  {
    id: 'doce-cantinho',
    name: 'Doce Cantinho',
    image: require('./assets/dessert-photo.jpg'),
    heroImage: require('./assets/dessert-photo.jpg'),
    rating: '4,9 (208 avaliações)',
    deliveryTime: '20–35 min',
    minimumOrder: 'R$ 15,00',
    description: 'Doces e sobremesas da casa.',
    foodSafety: UNCONFIRMED_FOOD_SAFETY,
    filters: ['Todo Oullin', 'Perfil alimentar', 'doces', 'bebidas', 'menor preço'],
    features: [
      { type: 'ingredients', label: 'Ingredientes frescos' },
      { type: 'nutrition', label: 'Receitas artesanais' },
      { type: 'certificate', label: 'Feito com carinho' },
    ],
    sections: [{
      title: 'Doces especiais',
      items: [
        makeMenuItem('Doce da casa', 'R$ 12,99', 'Sobremesa preparada artesanalmente.', require('./assets/dessert-photo.jpg')),
        makeMenuItem('Pastel doce', 'R$ 8,99', 'Massa dourada com recheio doce.', require('./assets/food-pastel-card.png')),
        makeMenuItem('Sobremesa especial', 'R$ 14,99', 'Uma sobremesa especial para adoçar o dia.', require('./assets/promo-dessert.png')),
      ],
    }],
  },
  {
    id: 'massa-da-casa',
    name: 'Massa da Casa',
    image: require('./assets/pasta-photo.jpg'),
    heroImage: require('./assets/pasta-photo.jpg'),
    rating: '4,6 (174 avaliações)',
    deliveryTime: '30–45 min',
    minimumOrder: 'R$ 25,00',
    description: 'Massas e receitas da casa.',
    foodSafety: UNCONFIRMED_FOOD_SAFETY,
    filters: ['Todo Oullin', 'Perfil alimentar', 'massas', 'saladas', 'menor preço'],
    features: [
      { type: 'ingredients', label: 'Ingredientes frescos' },
      { type: 'nutrition', label: 'Molhos da casa' },
      { type: 'certificate', label: 'Preparo na hora' },
    ],
    sections: [{
      title: 'Massas',
      items: [
        makeMenuItem('Massa da casa', 'R$ 18,99', 'Massa preparada com molho e ingredientes frescos.', require('./assets/pasta-photo.jpg')),
        makeMenuItem('Penne especial', 'R$ 22,99', 'Penne servido com molho especial da casa.', require('./assets/promo-pasta.png')),
        makeMenuItem('Lasanha caseira', 'R$ 24,99', 'Lasanha preparada no forno.', require('./assets/pasta-photo.jpg')),
      ],
    }],
  },
  {
    id: 'bebidas-geladas',
    name: 'Bebidas Geladas',
    image: require('./assets/drink-photo.jpg'),
    heroImage: require('./assets/drink-photo.jpg'),
    rating: '4,8 (97 avaliações)',
    deliveryTime: '15–25 min',
    minimumOrder: 'R$ 10,00',
    description: 'Sucos e bebidas para acompanhar seu pedido.',
    foodSafety: {
      ...UNCONFIRMED_FOOD_SAFETY,
      equipment: 'Refrigeração (tipo de equipamento não informado)',
    },
    filters: ['Todo Oullin', 'Perfil alimentar', 'sucos', 'refrigerantes', 'menor preço'],
    features: [
      { type: 'ingredients', label: 'Opções variadas' },
      { type: 'nutrition', label: 'Informações claras' },
      { type: 'certificate', label: 'Bem refrigeradas' },
    ],
    sections: [{
      title: 'Bebidas',
      items: [
        makeMenuItem('Suco natural', 'R$ 9,99', 'Suco gelado para acompanhar sua refeição.', require('./assets/drink-photo.jpg')),
        makeMenuItem('Refrigerante cola', 'R$ 6,99', 'Bebida gelada.', require('./assets/drink-cola-card.png')),
        makeMenuItem('Refrigerante zero', 'R$ 6,99', 'Bebida gelada sem açúcar.', require('./assets/drink-cola-zero-card.png')),
      ],
    }],
  },
];

function normalizeSearchTerm(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function getDietaryProfileRules(profileSelections = {}) {
  const restrictions = (profileSelections.restrictions || []).map(normalizeSearchTerm);
  const rules = [];
  const restrictionRules = [
    ['alimentacao kosher', 'kosher', 'Kosher'],
    ['alimentacao halal', 'halal', 'Halal'],
    ['restricao a sodio', 'lowSodium', 'Baixo sódio'],
    ['intolerancia a lactose', 'lactoseFree', 'Sem lactose'],
    ['sensibilidade ao gluten', 'glutenFree', 'Sem glúten'],
    ['alergia a proteina do leite de vaca', 'milkFree', 'Sem proteína do leite'],
    ['alergia a amendoim e castanhas', 'nutsFree', 'Sem amendoim e castanhas'],
    ['alergia a frutos do mar', 'seafoodFree', 'Sem frutos do mar'],
    ['alergia a ovos', 'eggFree', 'Sem ovos'],
    ['alergia a soja', 'soyFree', 'Sem soja'],
    ['doenca celiaca', 'glutenFree', 'Sem glúten'],
    ['diabetes', 'diabeticFriendly', 'Adequado para diabetes'],
    ['hipertensao', 'lowSodium', 'Baixo sódio'],
  ];
  restrictionRules.forEach(([restriction, key, label]) => {
    if (restrictions.includes(restriction)) rules.push({ key, label });
  });
  if (restrictions.includes('veganismo')) rules.push({ key: 'vegan', label: 'Vegano' });
  else if (restrictions.includes('vegetarianismo')) rules.push({ key: 'vegetarian', label: 'Vegetariano' });
  const crossContamination = (profileSelections.crossContamination || []).map(normalizeSearchTerm);
  const sensitivity = (profileSelections.sensitivity || []).map(normalizeSearchTerm);
  if (
    crossContamination.includes('sim zero tracos') ||
    sensitivity.some((level) => level.startsWith('severa'))
  ) rules.push({ key: 'crossContaminationSafe', label: 'Sem contaminação cruzada' });
  return rules;
}

export function filterMealsForProfile(meals, rules) {
  if (!rules.length) return meals;
  return meals.filter((meal) =>
    rules.every((rule) => meal.dietaryCompatibility?.[rule.key] === true),
  );
}

function FoodFeatureCard({ label, type, size }) {
  if (type === 'utensils' || type === 'ingredientCard') {
    const source = type === 'utensils'
      ? require('./assets/restaurant-dedicated-utensils.png')
      : require('./assets/restaurant-ingredient-data.png');

    return (
      <Image
        accessibilityLabel={label}
        source={source}
        style={{ height: size, width: size }}
      />
    );
  }

  return (
    <View style={[styles.foodFeatureCard, { height: size, width: size }]}>
      {type === 'ingredients' ? (
        <View style={styles.foodUpdatedIcon}>
          <Text style={styles.foodUpdatedCheck}>✓</Text>
        </View>
      ) : type === 'nutrition' ? (
        <View style={styles.foodNutritionIcon}>
          <View style={styles.foodNutritionLine} />
          {[0, 1, 2].map((row) => (
            <View key={row} style={styles.foodNutritionRow}>
              <View style={styles.foodNutritionBullet} />
              <View style={[styles.foodNutritionTextLine, row === 2 && styles.foodNutritionShortLine]} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.foodCertificateIcon}>
          <Text style={styles.foodCertificateStar}>★</Text>
          <View style={styles.foodCertificateRibbons}>
            <View style={styles.foodCertificateRibbon} />
            <View style={styles.foodCertificateRibbon} />
          </View>
        </View>
      )}
      <Text numberOfLines={2} style={styles.foodFeatureLabel}>{label}</Text>
    </View>
  );
}

export function FoodDetailsScreen({ item, onBack, onSelectItem, profileSelections = {}, screenWidth }) {
  const featureSize = Math.min(76, (screenWidth - 72) / 4);
  const cardWidth = Math.min(116, (screenWidth - 64) / 3);
  const recommendations = item.recommendations || RESTAURANT_MEALS;
  const productFeatures = item.features || [];
  const productImageWidth = screenWidth - 32;
  const profileRules = getDietaryProfileRules(profileSelections);
  const profileTags = profileRules
    .filter((rule) => item.dietaryCompatibility?.[rule.key] === true)
    .map((rule) => rule.label);
  const productFilters = [...new Set([...(item.filters || []), ...profileTags])].filter(
    (filter) => !['todo oullin', 'perfil alimentar', 'menor preco'].includes(
      normalizeSearchTerm(filter),
    ),
  );

  return (
    <View style={styles.foodDetailsScreen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView
        contentContainerStyle={styles.foodDetailsScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.foodDetailsHeader}>
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={onBack}
            style={styles.foodDetailsBackButton}
          >
            <Text style={styles.foodDetailsBackText}>‹</Text>
          </Pressable>
          <Text style={styles.foodDetailsTitle}>{item.detailName || item.name}</Text>
        </View>

        <View style={styles.foodProductSummary}>
          <Image
            accessibilityLabel={item.detailName || item.name}
            resizeMode="cover"
            source={item.image}
            style={[styles.foodProductImage, { height: productImageWidth * 0.58 }]}
          />
          <Text style={styles.foodProductPrice}>{item.price}</Text>
          {!!item.description && (
            <Text style={styles.foodProductDescription}>{item.description}</Text>
          )}
          {!!item.restaurantName && (
            <Text style={styles.foodProductRestaurant}>{item.restaurantName}</Text>
          )}
        </View>

        {!!productFilters.length && (
          <View style={styles.foodDetailsTags}>
            {productFilters.map((filter) => (
              <View key={filter} style={styles.foodDetailTag}>
                <Text style={styles.foodDetailTagText}>{filter}</Text>
              </View>
            ))}
          </View>
        )}
        {!!profileRules.length && (
          <Text style={styles.foodProfileNote}>
            Confirme ingredientes e risco de contaminação cruzada com a loja antes de pedir.
          </Text>
        )}

        {!!productFeatures.length && (
          <View style={styles.foodDetailFeatures}>
            {productFeatures.map((feature, index) => (
              <FoodFeatureCard
                key={`${feature.label}-${index}`}
                label={feature.label}
                size={featureSize}
                type={feature.type}
              />
            ))}
          </View>
        )}

        {!!(item.ingredients || item.utensils) && (
          <View style={styles.productPreparation}>
            {!!item.ingredients && (
              <View style={styles.productPreparationBlock}>
                <Text style={styles.productPreparationTitle}>Ingredientes</Text>
                <Text style={styles.productPreparationText}>{item.ingredients}</Text>
              </View>
            )}
            {!!item.utensils && (
              <View style={styles.productPreparationBlock}>
                <Text style={styles.productPreparationTitle}>Utensílios utilizados</Text>
                <Text style={styles.productPreparationText}>{item.utensils}</Text>
              </View>
            )}
          </View>
        )}

        {!!recommendations.length && (
          <View style={styles.foodRecommendations}>
            <Text style={styles.foodRecommendationsTitle}>Seu perfil alimentar</Text>
            <ScrollView
              contentContainerStyle={styles.foodRecommendationList}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {recommendations.map((recommendation) => (
                <View key={recommendation.name} style={[styles.foodRecommendationCard, { width: cardWidth }]}>
                  <Pressable
                    accessibilityLabel={`Ver ${recommendation.detailName || recommendation.name}`}
                    accessibilityRole="button"
                    onPress={() => onSelectItem({ ...recommendation, recommendations })}
                  >
                    <Image
                      accessibilityLabel={recommendation.detailName || recommendation.name}
                      resizeMode="cover"
                      source={recommendation.image}
                      style={[styles.foodRecommendationImage, { height: cardWidth * 0.66 }]}
                    />
                    <Text style={styles.foodRecommendationPrice}>{recommendation.price}</Text>
                    <Text numberOfLines={1} style={styles.foodRecommendationName}>
                      {recommendation.name}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onSelectItem({ ...recommendation, recommendations })}
                    style={styles.foodRecommendationButton}
                  >
                    <Text style={styles.foodRecommendationButtonText}>Ver informações</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        {!!profileRules.length && !recommendations.length && (
          <View style={styles.foodRecommendations}>
            <Text style={styles.foodRecommendationsTitle}>Seu perfil alimentar</Text>
            <Text style={styles.foodProductDescription}>
              Esta é a opção compatível encontrada. Confira os ingredientes e o preparo com a loja antes de pedir.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function RestaurantProductRow({ title, items, screenWidth, onSelectItem }) {
  const cardWidth = Math.min(128, (screenWidth - 48) / 3);

  return (
    <View style={styles.restaurantProductSection}>
      <Text style={styles.restaurantSectionTitle}>{title}</Text>
      <ScrollView
        contentContainerStyle={styles.restaurantProducts}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
      >
        {items.map((item) => (
          <View key={item.name} style={[styles.restaurantProduct, { width: cardWidth }]}>
            <Pressable
              accessibilityLabel={`Ver ${item.detailName || item.name}`}
              accessibilityRole="button"
              onPress={() => onSelectItem(item)}
            >
              <Image
                accessibilityLabel={item.detailName || item.name}
                resizeMode="cover"
                source={item.image}
                style={[styles.restaurantProductImage, { height: cardWidth * 0.66 }]}
              />
              <Text style={styles.restaurantProductPrice}>{item.price}</Text>
              <Text numberOfLines={1} style={styles.restaurantProductName}>
                {item.name}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelectItem(item)}
              style={styles.mealInfoButton}
            >
              <Text style={styles.mealInfoButtonText}>Ver informações</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function RestaurantDetailScreen({ restaurant, screenWidth, onBack }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const scrollRef = useRef(null);
  const recommendations = restaurant.sections.flatMap((section) => section.items);

  function selectProduct(item) {
    setSelectedItem({
      ...item,
      features: restaurant.features,
      filters: restaurant.filters,
      recommendations,
      restaurantName: restaurant.name,
    });
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  if (selectedItem) {
    return (
      <FoodDetailsScreen
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
        onSelectItem={selectProduct}
        screenWidth={screenWidth}
      />
    );
  }

  return (
    <View style={styles.restaurantScreen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.orange} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.restaurantScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.restaurantHero}>
          <Image
            accessibilityLabel={`Imagem de ${restaurant.name}`}
            resizeMode="cover"
            source={restaurant.heroImage}
            style={styles.restaurantHeroImage}
          />
          <View style={styles.restaurantHeroShade} />
          <View style={styles.restaurantHeroHeader}>
            <Pressable
              accessibilityLabel="Voltar para resultados"
              accessibilityRole="button"
              onPress={onBack}
              style={styles.restaurantBackButton}
            >
              <Text style={styles.restaurantBackText}>‹</Text>
            </Pressable>
            <View style={styles.restaurantSearchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <Text style={styles.restaurantSearchText}>Peça na Oullin</Text>
            </View>
          </View>
        </View>

        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantInfoRow}>
            <Image
              accessibilityLabel={`Imagem de ${restaurant.name}`}
              source={restaurant.image}
              style={styles.restaurantLogo}
            />
            <View style={styles.restaurantInfoText}>
              <View style={styles.restaurantNameRow}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                {restaurant.verified && (
                  <Text style={styles.restaurantVerified}>✓</Text>
                )}
              </View>
              <Text style={styles.restaurantRating}>★ {restaurant.rating}</Text>
              <Text style={styles.restaurantMeta}>
                ◷ {restaurant.deliveryTime}   ▱ Min. {restaurant.minimumOrder}
              </Text>
            </View>
            <Text style={styles.restaurantArrow}>›</Text>
          </View>
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>

          <View style={styles.restaurantFoodSafety}>
            <Text style={styles.restaurantSectionTitle}>Glúten, lactose e preparo</Text>
            {[
              ['Sem glúten', restaurant.foodSafety.glutenFree],
              ['Sem lactose', restaurant.foodSafety.lactoseFree],
              ['Contaminação cruzada', restaurant.foodSafety.crossContamination],
              ['Equipamentos e utensílios', restaurant.foodSafety.equipment],
            ].map(([label, value]) => (
              <View key={label} style={styles.restaurantFoodSafetyRow}>
                <Text style={styles.restaurantFoodSafetyLabel}>{label}</Text>
                <Text style={styles.restaurantFoodSafetyValue}>{value}</Text>
              </View>
            ))}
            <Text style={styles.restaurantFoodSafetyNote}>
              Informações demonstrativas. Confirme ingredientes, equipamentos e risco de contaminação
              cruzada diretamente com o restaurante antes de pedir.
            </Text>
          </View>

          <View style={styles.preparationSection}>
            <Text style={styles.restaurantSectionTitle}>
              {restaurant.featuresTitle || 'Como preparamos seu prato'}
            </Text>
            <View style={styles.preparationFeatures}>
              {restaurant.features.map((feature, index) => (
                <FoodFeatureCard
                  key={`${feature.label}-${index}`}
                  label={feature.label}
                  size={76}
                  type={feature.type}
                />
              ))}
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.restaurantFilters}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {restaurant.filters.map((filter, index) => (
            <View
              key={filter}
              style={[styles.restaurantFilter, index === 0 && styles.restaurantFilterActive]}
            >
              <Text style={[styles.restaurantFilterText, index === 0 && styles.restaurantFilterTextActive]}>
                {filter}
              </Text>
            </View>
          ))}
        </ScrollView>

        {restaurant.sections.map((section) => (
          <RestaurantProductRow
            key={section.title}
            items={section.items}
            onSelectItem={selectProduct}
            screenWidth={screenWidth}
            title={section.title}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function MarmitaSearchResults({ items, onBack, onOpenRestaurant, onSelectFood }) {
  const [favorite, setFavorite] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={styles.mealResultsContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mealResultsHeading}>
        <Pressable accessibilityLabel="Voltar às categorias" onPress={onBack} style={styles.mealResultsBack}>
          <Text style={styles.mealResultsBackText}>‹</Text>
        </Pressable>
        <View>
          <Text style={styles.mealResultsTitle}>{'Marmitas para voc\u00ea'}</Text>
          <Text style={styles.mealResultsSubtitle}>Opções de acordo com seu perfil alimentar</Text>
        </View>
      </View>
      <View style={styles.mealStoreHeader}>
        <Pressable
          accessibilityLabel="Ver restaurante Saudável Life"
          accessibilityRole="button"
          onPress={onOpenRestaurant}
          style={styles.mealStoreSummary}
        >
          <Image
            accessibilityLabel="Logo Saudável Life"
            source={require('./assets/saudavel-life-logo.png')}
            style={styles.mealStoreImage}
          />
          <View style={styles.mealStoreInfo}>
            <Text style={styles.mealStoreName}>Saudável Life</Text>
            <Text style={styles.mealStoreDetails}>
              ★ 4,6 (200)   30–45 min   Min. R$ 25,00
            </Text>
          </View>
          <Text style={styles.mealStoreArrow}>›</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={favorite ? 'Remover loja dos favoritos' : 'Favoritar loja'}
          accessibilityRole="button"
          onPress={() => setFavorite((current) => !current)}
          style={styles.mealFavoriteButton}
        >
          <Text style={styles.mealFavoriteIcon}>{favorite ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
      {items.length ? items.map((item) => (
          <View key={item.id} style={styles.mealListItem}>
            <Pressable
              accessibilityLabel={`Ver ${item.detailName || item.name}`}
              accessibilityRole="button"
              onPress={() => onSelectFood(item)}
              style={styles.mealListItemContent}
            >
              <Image
                accessibilityLabel={item.detailName || item.name}
                resizeMode="cover"
                source={item.image}
                style={styles.mealListImage}
              />
              <View style={styles.mealListDetails}>
                <Text style={styles.mealListName}>{item.detailName || item.name}</Text>
                <Text style={styles.mealListPrice}>{item.price}</Text>
                <Text numberOfLines={2} style={styles.mealListDescription}>{item.description}</Text>
                <Text numberOfLines={1} style={styles.mealListTags}>{(item.filters || []).join(' · ')}</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelectFood(item)}
              style={styles.mealInfoButton}
            >
              <Text style={styles.mealInfoButtonText}>Ver informações</Text>
            </Pressable>
          </View>
        )) : (
          <View style={styles.mealEmptyState}>
            <Text style={styles.mealProductName}>Ainda não encontramos marmitas compatíveis.</Text>
            <Text style={styles.mealListDescription}>Revise seu perfil alimentar ou confira outras opções com a loja.</Text>
          </View>
        )}
    </ScrollView>
  );
}

function RestaurantSearchResults({ restaurants, onSelectRestaurant }) {
  return (
    <ScrollView
      contentContainerStyle={styles.mealResultsContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.mealResultsTitle}>Restaurantes encontrados</Text>
      {restaurants.map((restaurant) => (
        <Pressable
          accessibilityLabel={`Ver restaurante ${restaurant.name}`}
          accessibilityRole="button"
          key={restaurant.id}
          onPress={() => onSelectRestaurant(restaurant.id)}
          style={styles.restaurantSearchResult}
        >
          <Image
            accessibilityLabel={`Imagem de ${restaurant.name}`}
            source={restaurant.image}
            style={styles.mealStoreImage}
          />
          <View style={styles.mealStoreInfo}>
            <Text style={styles.mealStoreName}>{restaurant.name}</Text>
            <Text style={styles.mealStoreDetails}>
              ★ {restaurant.rating}   {restaurant.deliveryTime}   Min. {restaurant.minimumOrder}
            </Text>
          </View>
          <Text style={styles.mealStoreArrow}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default function SearchScreen({ profileSelections = {} }) {
  const { width: screenWidth } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedSearchFilter, setSelectedSearchFilter] = useState('Todo Oullin');
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT_SEARCHES);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [showRestaurantFilter, setShowRestaurantFilter] = useState(false);
  const profileRules = useMemo(() => getDietaryProfileRules(profileSelections), [profileSelections]);
  const compatibleMealItems = useMemo(
    () => filterMealsForProfile(MEAL_SEARCH_ITEMS, profileRules),
    [profileRules],
  );
  const visibleRecentSearches = recentSearches.filter((item) =>
    item.toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR')),
  );
  const showSearchFilters =
    searchOpen || query.trim().length > 0 || selectedSearchFilter !== 'Todo Oullin';
  const normalizedQuery = normalizeSearchTerm(query);
  const matchingRestaurants = normalizedQuery
    ? RESTAURANT_DIRECTORY.filter((restaurant) =>
        normalizeSearchTerm(restaurant.name).includes(normalizedQuery),
      )
    : [];
  const exactRestaurantMatch = matchingRestaurants.some(
    (restaurant) => normalizeSearchTerm(restaurant.name) === normalizedQuery,
  );
  const showSaudavelLife = selectedCategory === 'Marmitas' || normalizedQuery.includes('saudavel') ||
    (normalizedQuery.includes('marmita') && !exactRestaurantMatch);
  const saudavelLifeRestaurant = RESTAURANT_DIRECTORY.find(
    (restaurant) => restaurant.id === 'saudavel-life',
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSearchHistory() {
      try {
        const storedHistory = await AsyncStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
        if (!isMounted) return;
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          if (!Array.isArray(parsedHistory) || !parsedHistory.every((item) => typeof item === 'string')) {
            throw new Error('O histórico salvo não possui o formato esperado.');
          }
          setRecentSearches(parsedHistory.slice(0, 8));
        }
      } catch (error) {
        console.error('Não foi possível carregar o histórico de buscas.', error);
      } finally {
        if (isMounted) setHistoryLoaded(true);
      }
    }

    loadSearchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!historyLoaded) return;
    AsyncStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(recentSearches)).catch((error) => {
      console.error('Não foi possível salvar o histórico de buscas.', error);
    });
  }, [historyLoaded, recentSearches]);

  function submitSearch(value = query) {
    const searchTerm = value.trim();
    if (!searchTerm) return;
    setRecentSearches((previousSearches) => [
      searchTerm,
      ...previousSearches.filter(
        (item) => item.toLocaleLowerCase('pt-BR') !== searchTerm.toLocaleLowerCase('pt-BR'),
      ),
    ].slice(0, 8));
    setQuery(searchTerm);
    setSelectedCategory('Todos');
    setShowRestaurantFilter(false);
    setSearchOpen(false);
    Keyboard.dismiss();
  }

  function selectSaudavelFood(item) {
    setSelectedProduct({
      ...item,
      features: item.features || saudavelLifeRestaurant.features,
      filters: item.filters || [],
      recommendations: compatibleMealItems.filter((meal) => meal.id !== item.id),
      restaurantName: saudavelLifeRestaurant.name,
    });
  }

  const visibleFoods = useMemo(() => {
    const normalizedQuery = normalizeSearchTerm(query);
    const filteredFoods = FOOD_CARDS.filter((food) => {
      const matchesCategory =
        selectedCategory === 'Todos' || food.category === selectedCategory;
      const matchesSearch =
        !normalizedQuery ||
        normalizeSearchTerm(`${food.name} ${food.category}`).includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
    return normalizeSearchTerm(selectedSearchFilter) === 'menor preco'
      ? filteredFoods.sort((first, second) => FOOD_CARD_PRICES[first.id] - FOOD_CARD_PRICES[second.id])
      : filteredFoods;
  }, [query, selectedCategory, selectedSearchFilter]);

  if (selectedProduct) {
    return (
      <FoodDetailsScreen
        item={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        profileSelections={profileSelections}
        onSelectItem={(item) =>
          setSelectedProduct({
            ...item,
            features: selectedProduct.features,
            filters: selectedProduct.filters,
            recommendations: selectedProduct.recommendations,
            restaurantName: selectedProduct.restaurantName,
          })
        }
        screenWidth={screenWidth}
      />
    );
  }

  const selectedRestaurant = RESTAURANT_DIRECTORY.find(
    (restaurant) => restaurant.id === selectedRestaurantId,
  );

  if (selectedRestaurantId && !selectedRestaurant) {
    throw new Error(`Restaurante não encontrado: ${selectedRestaurantId}`);
  }

  if (selectedRestaurant) {
    return (
      <RestaurantDetailScreen
        onBack={() => {
          setSelectedRestaurantId(null);
        }}
        restaurant={selectedRestaurant}
        screenWidth={screenWidth}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.orange} />
      <View style={[styles.searchHeader, showSearchFilters && styles.searchHeaderExpanded]}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Buscar alimentos"
            autoCapitalize="none"
            onChangeText={(value) => {
              setQuery(value);
              setShowRestaurantFilter(false);
            }}
            onFocus={() => {
              setSearchOpen(true);
              setShowRestaurantFilter(false);
            }}
            onSubmitEditing={() => submitSearch()}
            placeholder="Peça na Oullin"
            placeholderTextColor={COLORS.muted}
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
          {!!query && (
            <Pressable
              accessibilityLabel="Limpar busca"
              onPress={() => {
                setQuery('');
                setSearchOpen(true);
              }}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          )}
        </View>
        {showSearchFilters && (
          <ScrollView
            contentContainerStyle={styles.searchFilters}
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
            {SEARCH_FILTERS.map((filter) => {
              const active = selectedSearchFilter === filter;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Filtro ${filter}`}
                  key={filter}
                  onPress={() => {
                    const normalizedFilter = normalizeSearchTerm(filter);
                    setSelectedSearchFilter(filter);
                    setQuery('');
                    setSearchOpen(false);
                    setShowRestaurantFilter(false);
                    Keyboard.dismiss();

                    if (normalizedFilter === 'restaurantes' || normalizedFilter === 'regiao') {
                      setSelectedCategory('Todos');
                      setShowRestaurantFilter(true);
                    } else if (normalizedFilter === 'perfil alimentar') {
                      setSelectedCategory('Marmitas');
                    } else if (normalizedFilter === 'bebidas') {
                      setSelectedCategory('Bebidas');
                    } else {
                      setSelectedCategory('Todos');
                    }
                  }}
                  style={[styles.searchFilterChip, active && styles.searchFilterChipActive]}
                >
                  <Text style={[styles.searchFilterText, active && styles.searchFilterTextActive]}>
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {showRestaurantFilter ? (
        <RestaurantSearchResults
          onSelectRestaurant={setSelectedRestaurantId}
          restaurants={RESTAURANT_DIRECTORY}
        />
      ) : searchOpen ? (
        <ScrollView
          contentContainerStyle={styles.searchLandingContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.searchSectionTitle}>Lojas recentes</Text>
          <ScrollView
            contentContainerStyle={styles.recentStores}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentStoresScroller}
          >
            {RECENT_STORES.map((store) => (
              <Pressable
                accessibilityRole="button"
                key={store.name}
                onPress={() => {
                  setSelectedRestaurantId(store.id);
                  Keyboard.dismiss();
                }}
                style={styles.recentStore}
              >
                <Image source={store.image} style={styles.recentStoreCircle} />
                <Text numberOfLines={1} style={styles.recentStoreLabel}>{store.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            onPress={() => setSelectedSearchFilter('Perfil alimentar')}
          >
            <Text style={styles.searchSectionTitle}>Seu perfil alimentar</Text>
          </Pressable>

          <Text style={[styles.searchSectionTitle, styles.recentSearchHeading]}>
            Buscas recentes
          </Text>
          {visibleRecentSearches.length ? (
            visibleRecentSearches.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item}
                onPress={() => submitSearch(item)}
                style={styles.recentSearchRow}
              >
                <Text style={styles.recentSearchIcon}>⌕</Text>
                <Text style={styles.recentSearchText}>{item}</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.noRecentSearches}>Nenhuma busca encontrada.</Text>
          )}
        </ScrollView>
      ) : showSaudavelLife ? (
        <MarmitaSearchResults
          items={compatibleMealItems}
          onBack={() => {
            setSelectedCategory('Todos');
            setQuery('');
          }}
          onOpenRestaurant={() => setSelectedRestaurantId('saudavel-life')}
          onSelectFood={selectSaudavelFood}
        />
      ) : matchingRestaurants.length > 0 ? (
        <RestaurantSearchResults
          onSelectRestaurant={setSelectedRestaurantId}
          restaurants={matchingRestaurants}
        />
      ) : (
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setSelectedCategory('Marmitas');
            setQuery('');
            setSearchOpen(false);
            Keyboard.dismiss();
          }}
          style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
        >
          <Image
            accessibilityLabel="Refeição fresca para sua rotina"
            resizeMode="cover"
            source={require('./assets/meal-banner-user.png')}
            style={styles.bannerImage}
          />
          <View style={styles.bannerShade} />
          <View style={styles.bannerCopy}>
            <View style={styles.bannerBadge}>
              <Image source={require('./assets/koala-icon.png')} style={styles.bannerKoala} />
            </View>
            <Text style={styles.bannerText}>Marmitas para sua rotina</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Explore o cardapio</Text>
        <Text style={styles.categoryHeading}>Filtrar por categoria</Text>
        <ScrollView
          contentContainerStyle={styles.categoryList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {FOOD_CATEGORIES.map((category) => {
            const active = selectedCategory === category.label;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={category.label}
                onPress={() => {
                  setSelectedCategory(category.label);
                  setQuery('');
                  setSearchOpen(false);
                  setShowRestaurantFilter(false);
                  Keyboard.dismiss();
                }}
                style={styles.categoryItem}
              >
                <View style={[styles.categoryCircle, active && styles.categoryCircleActive]}>
                  <Image
                    accessibilityLabel={category.label}
                    source={category.image}
                    style={styles.categoryImage}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.categoryLabel, active && styles.categoryLabelActive]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.foodHeading}>
          <Text style={styles.foodSectionTitle}>O que você está com vontade?</Text>
        </View>
        <Text style={styles.foodCount}>
          {visibleFoods.length} {visibleFoods.length === 1 ? 'item encontrado' : 'itens encontrados'}
        </Text>
        {visibleFoods.length ? (
          <View style={styles.foodResultList}>
            {visibleFoods.map((food) => (
              <View key={food.id} style={styles.foodResultCard}>
                <Image
                  accessibilityLabel={food.name}
                  resizeMode="cover"
                  source={food.image}
                  style={styles.foodResultImage}
                />
                <View style={styles.foodResultInfo}>
                  <Text numberOfLines={2} style={styles.foodResultName}>{food.name}</Text>
                  <Text style={styles.foodResultCategory}>{food.category}</Text>
                  <Text style={styles.foodResultPrice}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(FOOD_CARD_PRICES[food.id])}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ver loja para ${food.name}`}
                  onPress={() => setSelectedRestaurantId(food.restaurantId)}
                  style={({ pressed }) => [styles.foodStoreButton, pressed && styles.pressed]}
                >
                  <Text style={styles.foodStoreButtonText}>Ver loja</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum alimento encontrado</Text>
            <Text style={styles.emptyText}>Tente outro nome ou escolha outra categoria.</Text>
          </View>
        )}
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  searchHeader: {
    backgroundColor: COLORS.orange,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  searchHeaderExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 9,
    paddingTop: 12,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    flexDirection: 'row',
    height: 46,
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: COLORS.orange,
    fontSize: 23,
    lineHeight: 27,
    marginRight: 7,
  },
  searchInput: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 28,
  },
  clearText: {
    color: COLORS.muted,
    fontSize: 21,
  },
  searchFilters: {
    alignItems: 'center',
    paddingTop: 12,
    paddingRight: 10,
  },
  searchFilterChip: {
    alignItems: 'center',
    backgroundColor: '#FFC477',
    borderRadius: 18,
    height: 32,
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 14,
  },
  searchFilterChipActive: {
    backgroundColor: COLORS.white,
  },
  searchFilterText: {
    color: COLORS.text,
    fontSize: 11,
  },
  searchFilterTextActive: {
    fontWeight: '600',
  },
  searchLandingContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexGrow: 1,
    marginTop: -1,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchSectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 11,
  },
  recentStores: {
    paddingRight: 10,
  },
  recentStoresScroller: {
    flexGrow: 0,
    flexShrink: 0,
    height: 86,
  },
  recentStore: {
    alignItems: 'center',
    marginRight: 12,
    width: 68,
  },
  recentStoreCircle: {
    backgroundColor: '#D9D9D9',
    borderRadius: 28,
    height: 56,
    resizeMode: 'cover',
    width: 56,
  },
  recentStoreLabel: {
    color: COLORS.text,
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
    width: 68,
  },
  recentSearchHeading: {
    marginBottom: 10,
    marginTop: 12,
  },
  recentSearchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 34,
  },
  recentSearchIcon: {
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 25,
    marginRight: 8,
  },
  recentSearchText: {
    color: COLORS.text,
    fontSize: 14,
  },
  noRecentSearches: {
    color: COLORS.muted,
    fontSize: 14,
  },
  mealResultsContent: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mealResultsTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  mealResultsHeading: { alignItems: 'center', flexDirection: 'row', marginBottom: 14 },
  mealResultsBack: { alignItems: 'center', height: 42, justifyContent: 'center', marginRight: 8, width: 30 },
  mealResultsBackText: { color: COLORS.orange, fontSize: 30, lineHeight: 34 },
  mealResultsSubtitle: { color: COLORS.muted, fontSize: 10, marginTop: -12 },
  mealStoreHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  mealStoreSummary: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  mealStoreImage: {
    borderRadius: 21,
    height: 42,
    width: 42,
  },
  mealStoreArrow: {
    color: COLORS.orange,
    fontSize: 24,
    marginLeft: 8,
  },
  mealStoreInfo: {
    flex: 1,
    marginLeft: 9,
  },
  mealStoreName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  mealStoreDetails: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 4,
  },
  restaurantSearchResult: {
    alignItems: 'center',
    borderBottomColor: '#EAEAEA',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  mealFavoriteButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 32,
  },
  mealFavoriteIcon: {
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 28,
  },
  mealProducts: {
    paddingRight: 8,
  },
  mealProduct: {
    marginRight: 8,
  },
  mealProductImage: {
    borderRadius: 8,
    width: '100%',
  },
  mealProductPrice: {
    color: COLORS.text,
    fontSize: 10,
    marginTop: 6,
  },
  mealProductName: {
    color: COLORS.text,
    fontSize: 9,
    marginTop: 2,
  },
  mealListItem: { backgroundColor: COLORS.white, borderColor: '#ECECEC', borderRadius: 10, borderWidth: 1, marginBottom: 10, padding: 10 },
  mealListItemContent: { alignItems: 'center', flexDirection: 'row' },
  mealListImage: { borderRadius: 8, height: 88, width: 96 },
  mealListDetails: { flex: 1, marginLeft: 10 },
  mealListName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  mealListPrice: { color: COLORS.orange, fontSize: 12, fontWeight: '700', marginTop: 4 },
  mealListDescription: { color: COLORS.muted, fontSize: 10, lineHeight: 14, marginTop: 3 },
  mealListTags: { color: '#298A53', fontSize: 9, marginTop: 5 },
  mealEmptyState: { backgroundColor: COLORS.white, borderRadius: 10, padding: 18 },
  mealInfoButton: {
    alignItems: 'center',
    backgroundColor: '#D5262C',
    borderRadius: 4,
    height: 21,
    justifyContent: 'center',
    marginTop: 7,
    paddingHorizontal: 2,
  },
  mealInfoButtonText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '600',
  },
  restaurantScreen: {
    backgroundColor: '#F3F3F5',
    flex: 1,
  },
  restaurantScroll: {
    paddingBottom: 20,
  },
  restaurantHero: {
    backgroundColor: COLORS.text,
    height: 190,
    overflow: 'hidden',
    position: 'relative',
  },
  restaurantHeroImage: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  restaurantHeroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  restaurantHeroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 12,
  },
  restaurantBackButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  restaurantBackText: {
    color: COLORS.blue,
    fontSize: 30,
    lineHeight: 34,
    marginTop: -4,
  },
  restaurantSearchBox: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    flex: 1,
    flexDirection: 'row',
    height: 40,
    marginLeft: 8,
    paddingHorizontal: 12,
  },
  restaurantSearchText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  restaurantInfo: {
    backgroundColor: '#F3F3F5',
    paddingBottom: 16,
  },
  restaurantInfoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: -26,
    paddingHorizontal: 16,
  },
  restaurantLogo: {
    borderColor: COLORS.white,
    borderRadius: 34,
    borderWidth: 2,
    height: 68,
    width: 68,
  },
  restaurantInfoText: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 25,
  },
  restaurantNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  restaurantName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  restaurantVerified: {
    backgroundColor: COLORS.blue,
    borderRadius: 7,
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    height: 14,
    lineHeight: 14,
    marginLeft: 5,
    overflow: 'hidden',
    textAlign: 'center',
    width: 14,
  },
  restaurantRating: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },
  restaurantMeta: {
    color: COLORS.text,
    fontSize: 9,
    marginTop: 6,
  },
  restaurantArrow: {
    color: COLORS.orange,
    fontSize: 26,
    marginLeft: 5,
    paddingTop: 25,
  },
  restaurantDescription: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: 16,
    marginTop: 12,
  },
  restaurantFoodSafety: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  restaurantFoodSafetyRow: {
    alignItems: 'flex-start',
    borderBottomColor: '#ECECEC',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  restaurantFoodSafetyLabel: {
    color: COLORS.text,
    flex: 1,
    fontSize: 11,
    marginRight: 8,
  },
  restaurantFoodSafetyValue: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 11,
    textAlign: 'right',
  },
  restaurantFoodSafetyNote: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 8,
  },
  preparationSection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  restaurantSectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  preparationFeatures: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  preparationFeature: {
    height: 76,
    width: 76,
  },
  restaurantFilters: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  restaurantFilter: {
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    borderRadius: 14,
    height: 27,
    justifyContent: 'center',
    marginRight: 6,
    paddingHorizontal: 11,
  },
  restaurantFilterActive: {
    backgroundColor: '#FFF5E8',
    borderColor: COLORS.orange,
    borderWidth: 1,
  },
  restaurantFilterText: {
    color: COLORS.text,
    fontSize: 9,
  },
  restaurantFilterTextActive: {
    color: COLORS.orange,
  },
  restaurantProductSection: {
    backgroundColor: COLORS.white,
    marginTop: 10,
    paddingBottom: 14,
    paddingTop: 14,
  },
  restaurantProducts: {
    paddingHorizontal: 12,
    paddingTop: 9,
  },
  restaurantProduct: {
    marginRight: 10,
  },
  restaurantProductImage: {
    borderRadius: 9,
    width: '100%',
  },
  restaurantProductPrice: {
    color: COLORS.text,
    fontSize: 10,
    marginTop: 6,
  },
  restaurantProductName: {
    color: COLORS.text,
    fontSize: 9,
    marginTop: 2,
  },
  foodDetailsScreen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  foodDetailsScroll: {
    paddingBottom: 18,
  },
  foodDetailsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  foodDetailsBackButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 24,
  },
  foodDetailsBackText: {
    color: COLORS.text,
    fontSize: 30,
    lineHeight: 34,
    marginTop: -4,
  },
  foodDetailsTitle: {
    color: COLORS.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 4,
  },
  foodProductSummary: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  foodProductImage: {
    borderRadius: 12,
    width: '100%',
  },
  foodProductPrice: {
    color: COLORS.orange,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  foodProductDescription: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  foodProductRestaurant: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  foodDetailsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  foodProfileNote: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 2, paddingHorizontal: 20 },
  foodDetailTag: {
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 6,
    marginRight: 6,
    minHeight: 22,
    paddingHorizontal: 9,
  },
  foodDetailTagText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: '600',
  },
  foodDetailFeatures: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingHorizontal: 16,
  },
  productPreparation: { marginTop: 15, paddingHorizontal: 20 },
  productPreparationBlock: { marginBottom: 10 },
  productPreparationTitle: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  productPreparationText: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  foodFeatureCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.orange,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
  },
  foodUpdatedIcon: {
    alignItems: 'center',
    borderColor: COLORS.text,
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    marginBottom: 4,
    width: 20,
  },
  foodUpdatedCheck: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 17,
  },
  foodNutritionIcon: {
    borderColor: COLORS.text,
    borderRadius: 2,
    borderWidth: 1,
    height: 25,
    justifyContent: 'center',
    marginBottom: 4,
    paddingHorizontal: 3,
    width: 18,
  },
  foodNutritionLine: {
    backgroundColor: COLORS.text,
    height: 2,
    marginBottom: 2,
    width: 9,
  },
  foodNutritionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 1,
  },
  foodNutritionBullet: {
    backgroundColor: COLORS.text,
    borderRadius: 2,
    height: 3,
    marginRight: 2,
    width: 3,
  },
  foodNutritionTextLine: {
    backgroundColor: COLORS.text,
    height: 1.5,
    width: 7,
  },
  foodNutritionShortLine: {
    width: 5,
  },
  foodCertificateIcon: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    marginBottom: 4,
    width: 24,
  },
  foodCertificateStar: {
    color: COLORS.text,
    fontSize: 19,
    lineHeight: 22,
  },
  foodCertificateRibbons: {
    bottom: 0,
    flexDirection: 'row',
    position: 'absolute',
  },
  foodCertificateRibbon: {
    backgroundColor: COLORS.text,
    height: 6,
    marginHorizontal: 1,
    transform: [{ rotate: '12deg' }],
    width: 3,
  },
  foodFeatureLabel: {
    color: COLORS.text,
    fontSize: 7,
    lineHeight: 8,
    textAlign: 'center',
  },
  foodRecommendations: {
    backgroundColor: '#F3F3F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 28,
    paddingBottom: 18,
    paddingTop: 10,
  },
  foodRecommendationsTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  foodRecommendationList: {
    paddingHorizontal: 18,
  },
  foodRecommendationCard: {
    marginRight: 10,
  },
  foodRecommendationImage: {
    borderRadius: 10,
    width: '100%',
  },
  foodRecommendationPrice: {
    color: COLORS.text,
    fontSize: 10,
    marginTop: 6,
  },
  foodRecommendationName: {
    color: COLORS.text,
    fontSize: 9,
    marginTop: 3,
  },
  foodRecommendationButton: {
    alignItems: 'center',
    backgroundColor: '#D5262C',
    borderRadius: 5,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 20,
  },
  foodRecommendationButtonText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 18,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  banner: {
    borderRadius: 12,
    height: 126,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  bannerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  bannerCopy: {
    alignItems: 'center',
    flexDirection: 'row',
    left: 10,
    position: 'absolute',
    top: 10,
  },
  bannerBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    height: 25,
    justifyContent: 'center',
    marginRight: 6,
    width: 25,
  },
  bannerKoala: {
    height: 23,
    width: 23,
  },
  bannerText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 11,
    marginTop: 17,
  },
  foodSectionTitle: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 1,
  },
  categoryHeading: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 11,
    marginTop: 6,
  },
  categoryList: {
    paddingBottom: 8,
    paddingRight: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 13,
    width: 64,
  },
  categoryCircle: {
    backgroundColor: '#E5E5E5',
    borderColor: 'transparent',
    borderRadius: 28,
    borderWidth: 2,
    height: 56,
    overflow: 'hidden',
    width: 56,
  },
  categoryCircleActive: {
    backgroundColor: '#FFF2DF',
    borderColor: COLORS.orange,
  },
  categoryImage: {
    height: '100%',
    width: '100%',
  },
  categoryLabel: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 5,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  foodHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodCount: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  foodResultList: {
    paddingBottom: 12,
  },
  foodResultCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: '#E9E9E9',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 9,
    padding: 9,
  },
  foodResultImage: {
    backgroundColor: '#F1F1F1',
    borderRadius: 9,
    height: 64,
    width: 64,
  },
  foodResultInfo: {
    flex: 1,
    marginHorizontal: 10,
    minWidth: 0,
  },
  foodResultName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  foodResultCategory: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },
  foodResultPrice: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  foodStoreButton: {
    alignItems: 'center',
    backgroundColor: '#FFB400',
    borderRadius: 7,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 9,
  },
  foodStoreButtonText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
