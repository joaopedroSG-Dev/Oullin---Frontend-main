import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  filterMealsForProfile,
  FoodDetailsScreen,
  getDietaryProfileRules,
  RESTAURANT_DIRECTORY,
  RestaurantDetailScreen,
} from './SearchScreen';

const COLORS = {
  orange: '#FF8900',
  navy: '#183F67',
  dark: '#191919',
  white: '#FFFFFF',
  muted: '#777777',
};

const scale = Math.min(Dimensions.get('window').width / 390, 1.15);
const size = (value) => Math.round(value * scale);

const FOODS = [
  { image: require('./assets/food-fries-card.png'), price: 'R$ 40,00', name: 'Batata Frita', detail: 'Porção 300g', seller: 'Mcdonalds', rating: '4,8 (452)', category: 'Porções' },
  { image: require('./assets/food-pastel-card.png'), price: 'R$ 15,00', name: 'Pastel', detail: 'Queijo, Pizza e Carne', seller: 'Feira', rating: '4,8 (452)', category: 'Salgados' },
  { image: require('./assets/food-veggie-burger-card.png'), price: 'R$ 52,00', name: 'Hambúrguer veg...', detail: 'Pão e hambúrguer vegetal', seller: 'Vegan house', rating: '4,8 (452)', category: 'Hambúrgueres', detailName: 'Hambúrguer vegano' },
  { image: require('./assets/food-pizza-card.png'), price: 'R$ 45,00', name: 'Pizza grande', detail: 'Marguerita, mus...', seller: 'Habibs', rating: '4,8 (452)', category: 'Pizzas' },
  { image: require('./assets/drink-cola-card.png'), price: 'R$ 9,00', name: 'Coca cola', detail: '600ml', seller: 'Mercadinho da esquina', rating: '4,8 (452)', category: 'Bebidas' },
  { image: require('./assets/drink-cola-zero-card.png'), price: 'R$ 6,00', name: 'Coca-Cola Zero', detail: 'Lata 350ml', seller: 'Primus Adega', rating: '4,8 (452)', category: 'Bebidas' },
  { image: require('./assets/marmita-detail-frango.png'), price: 'R$ 15,99', name: 'Marmita de frango', detail: 'Frango, arroz e feijão', seller: 'Marmitas da Ana', rating: '4,8 (156)', category: 'Marmitas' },
  { image: require('./assets/marmita-card-salada.png'), price: 'R$ 15,99', name: 'Marmita de legumes', detail: 'Legumes, arroz e grão-de-bico', seller: 'Marmitas da Ana', rating: '4,8 (156)', category: 'Marmitas' },
  { image: require('./assets/marmita-card-caseira.png'), price: 'R$ 18,99', name: 'Marmita caseira', detail: 'Refeição completa do dia', seller: 'Marmitas da Ana', rating: '4,8 (156)', category: 'Marmitas' },
  { image: require('./assets/sushi-photo.jpg'), price: 'R$ 42,00', name: 'Combinado de sushi', detail: 'Seleção variada da casa', seller: 'Sushi Oullin', rating: '4,9 (180)', category: 'Sushi' },
  { image: require('./assets/salad-photo.jpg'), price: 'R$ 18,99', name: 'Salada da horta', detail: 'Folhas, vegetais e grãos', seller: 'Salada Viva', rating: '4,7 (112)', category: 'Saladas' },
  { image: require('./assets/dessert-photo.jpg'), price: 'R$ 12,99', name: 'Taça de frutas', detail: 'Frutas com creme', seller: 'Doce Cantinho', rating: '4,9 (208)', category: 'Sobremesas' },
];

const HOME_FOOD_FEATURES = [
  { type: 'utensils', label: 'Utensílios usados' },
  { type: 'ingredientCard', label: 'Ingredientes' },
  { type: 'nutrition', label: 'Ficha nutricional' },
  { type: 'certificate', label: 'Dados do vendedor' },
];

const HOME_FOOD_DETAILS = {
  'Batata Frita': {
    description: 'Batatas fritas servidas quentes, em porção de 300g.',
    ingredients: 'Batata, óleo e sal. Consulte a loja sobre temperos e preparo.',
    utensils: 'Fritadeira, escumadeira e recipiente para servir.',
    filters: ['Porções', 'Vegetariano'],
    dietaryCompatibility: { vegetarian: true },
  },
  Pastel: {
    description: 'Pastel frito com recheio de queijo, pizza ou carne.',
    ingredients: 'O recheio varia entre queijo, pizza e carne. Confirme a opção com a loja.',
    utensils: 'Fritadeira, pegador e utensílios de montagem.',
    filters: ['Salgados', 'Recheio variável'],
    dietaryCompatibility: {},
  },
  'Hambúrguer veg...': {
    description: 'Pão e hambúrguer vegetal preparados pela Vegan House.',
    ingredients: 'Pão, hambúrguer vegetal e acompanhamentos. Consulte a loja para confirmar molhos e ingredientes.',
    utensils: 'Chapa, espátula e utensílios de montagem.',
    filters: ['Hambúrgueres', 'Vegano'],
    dietaryCompatibility: { vegan: true, vegetarian: true },
  },
  'Pizza grande': {
    description: 'Pizza grande de muçarela com molho de tomate e manjericão.',
    ingredients: 'Massa, molho de tomate, muçarela e manjericão. Confirme os ingredientes da massa com a loja.',
    utensils: 'Forno, pá de pizza e cortador.',
    filters: ['Pizzas', 'Vegetariano'],
    dietaryCompatibility: { vegetarian: true },
  },
  'Coca cola': {
    description: 'Refrigerante de cola em embalagem de 600ml.',
    ingredients: 'Consulte o rótulo da embalagem para a lista completa de ingredientes e alergênicos.',
    utensils: 'Embalagem original; copo quando solicitado.',
    filters: ['Bebidas'],
    dietaryCompatibility: {},
  },
  'Coca-Cola Zero': {
    description: 'Refrigerante de cola sem açúcar em lata de 350ml.',
    ingredients: 'Consulte o rótulo da embalagem para a lista completa de ingredientes e alergênicos.',
    utensils: 'Embalagem original; copo quando solicitado.',
    filters: ['Bebidas', 'Sem açúcar'],
    dietaryCompatibility: {},
  },
  'Marmita de frango': {
    description: 'Frango grelhado com arroz e feijão, preparado pela Marmitas da Ana.',
    ingredients: 'Frango, arroz e feijão. Consulte a loja sobre temperos e alergênicos.',
    utensils: 'Grelha, panela e utensílios de montagem.',
    filters: ['Marmitas', 'Refeição completa'],
    dietaryCompatibility: {},
  },
  'Marmita de legumes': {
    description: 'Legumes, arroz e grão-de-bico em uma refeição sem ingredientes de origem animal informados.',
    ingredients: 'Legumes, arroz e grão-de-bico. Confirme preparo e risco de contaminação cruzada com a loja.',
    utensils: 'Panelas, escumadeira e utensílios de montagem.',
    filters: ['Marmitas', 'Vegano', 'Vegetariano'],
    dietaryCompatibility: { vegan: true, vegetarian: true },
  },
  'Marmita caseira': {
    description: 'Refeição caseira completa preparada no dia pela Marmitas da Ana.',
    ingredients: 'A composição varia conforme o prato do dia. Consulte a loja antes de pedir.',
    utensils: 'Panelas, pegadores e utensílios de montagem.',
    filters: ['Marmitas', 'Prato do dia'],
    dietaryCompatibility: {},
  },
  'Combinado de sushi': {
    description: 'Seleção de peças variadas preparadas na hora pelo Sushi Oullin.',
    ingredients: 'Ingredientes variam conforme as peças. Consulte a loja para alergênicos e opções sem peixe.',
    utensils: 'Faca, tábua e utensílios de montagem.',
    filters: ['Sushi', 'Combinados'],
    dietaryCompatibility: {},
  },
  'Salada da horta': {
    description: 'Salada fresca de folhas, vegetais e grãos da Salada Viva.',
    ingredients: 'Folhas, vegetais e grãos. Confirme molhos e acompanhamentos com a loja.',
    utensils: 'Faca, tábua e utensílios de preparo.',
    filters: ['Saladas', 'Vegetariano'],
    dietaryCompatibility: { vegetarian: true },
  },
  'Taça de frutas': {
    description: 'Frutas servidas com creme pelo Doce Cantinho.',
    ingredients: 'Frutas e creme. Consulte a loja sobre ingredientes e alergênicos.',
    utensils: 'Faca, tábua e recipiente para servir.',
    filters: ['Sobremesas', 'Frutas'],
    dietaryCompatibility: { vegetarian: true },
  },
};

const PROMOTIONS = [
  { image: require('./assets/promo-burger-reference.png'), color: '#81231B' },
  { image: require('./assets/promo-pizza.png'), color: '#791B3B' },
  { image: require('./assets/promo-salad.png'), color: '#204D2B' },
  { image: require('./assets/promo-sushi.png'), color: '#0F3E59' },
  { image: require('./assets/promo-dessert.png'), color: '#572C53' },
  { image: require('./assets/promo-pasta.png'), color: '#913D0B' },
];

export function RegistrationCompleteScreen({ onFinish }) {
  const dotOne = useRef(new Animated.Value(0.35)).current;
  const dotTwo = useRef(new Animated.Value(0.35)).current;
  const dotThree = useRef(new Animated.Value(0.35)).current;
  const mascotOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const dotLoop = (value, delay) => Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.sequence([
        Animated.timing(value, { toValue: 1, duration: 360, useNativeDriver }),
        Animated.timing(value, { toValue: 0.35, duration: 520, useNativeDriver }),
        Animated.delay(220),
      ])),
    ]);
    const dotsAnimation = Animated.parallel([
      dotLoop(dotOne, 0),
      dotLoop(dotTwo, 170),
      dotLoop(dotThree, 340),
    ]);
    const mascotAnimation = Animated.loop(Animated.sequence([
      Animated.timing(mascotOffset, { toValue: -4, duration: 650, useNativeDriver }),
      Animated.timing(mascotOffset, { toValue: 0, duration: 650, useNativeDriver }),
    ]));
    dotsAnimation.start();
    mascotAnimation.start();
    const finishTimer = setTimeout(onFinish, 3800);

    return () => {
      clearTimeout(finishTimer);
      dotsAnimation.stop();
      mascotAnimation.stop();
    };
  }, [dotOne, dotTwo, dotThree, mascotOffset, onFinish]);

  return (
    <SafeAreaView style={styles.splash}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.completeContent}>
        <View pointerEvents="none" style={styles.loadingGlow} />
        <Animated.Image
          accessibilityLabel="Mascote Oullin carregando"
          resizeMode="contain"
          source={require('./assets/mascote-loading.png')}
          style={[styles.completeMascot, { transform: [{ translateY: mascotOffset }] }]}
        />
        <Text style={styles.completeTitle}>{'S\u00f3 um instante...'}</Text>
        <Text style={styles.completeSubtitle}>
          {'Preparando tudo com carinho para voc\u00ea.'}
        </Text>
        <View accessibilityLabel="Carregando" accessibilityRole="progressbar" style={styles.loadingDots}>
          {[dotOne, dotTwo, dotThree].map((opacity, index) => (
            <Animated.View key={index} style={[styles.loadingDot, { opacity }]} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
function BellIcon() {
  return (
    <View style={styles.bellShape}>
      <View style={styles.bellClapper} />
    </View>
  );
}

function FoodCard({ food, onPress }) {
  return (
    <Pressable
      accessibilityLabel={`Ver informações de ${food.detailName || food.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.foodCard}
    >
      <View style={styles.foodImageWrap}>
        <Image
          accessibilityLabel={food.name}
          source={food.image}
          style={styles.foodPhoto}
          resizeMode="cover"
        />
      </View>
      <View style={styles.foodCardInfo}>
        <Text style={styles.foodPrice}>{food.price}</Text>
        <Text numberOfLines={1} style={styles.foodName}>{food.name}</Text>
        <Text numberOfLines={1} style={styles.foodDetail}>{food.detail}</Text>
        <Text numberOfLines={1} style={styles.foodSeller}>{food.seller}</Text>
        <View style={styles.foodRatingRow}>
          <Text style={styles.foodRating}>{food.rating}</Text>
          <View accessibilityLabel="Localização do vendedor" style={styles.locationMarker}>
            <View style={styles.locationMarkerDot} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function RestaurantHomeCard({ restaurant, onPress }) {
  return (
    <Pressable
      accessibilityLabel={`Ver restaurante ${restaurant.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.restaurantHomeCard}
    >
      <Image
        accessibilityLabel={restaurant.name}
        resizeMode="cover"
        source={restaurant.image}
        style={styles.restaurantHomeImage}
      />
      <Text numberOfLines={1} style={styles.restaurantHomeName}>{restaurant.name}</Text>
      <Text numberOfLines={1} style={styles.restaurantHomeDetails}>
        ★ {restaurant.rating} · {restaurant.deliveryTime}
      </Text>
    </Pressable>
  );
}

export function HomeScreen({
  deliveryAddress,
  firstName,
  onNotifications,
  onSelectTab,
  profileSetupComplete,
  profileSelections = {},
}) {
  const [promotionIndex, setPromotionIndex] = useState(0);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const { width: screenWidth } = useWindowDimensions();
  const promotionOpacity = useRef(new Animated.Value(1)).current;
  const profileRules = getDietaryProfileRules(profileSelections);

  useEffect(() => {
    let active = true;
    const interval = setInterval(() => {
      Animated.timing(promotionOpacity, {
        toValue: 0,
        duration: 240,
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished }) => {
        if (!finished || !active) return;
        setPromotionIndex((current) => (current + 1) % PROMOTIONS.length);
        Animated.timing(promotionOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      });
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
      promotionOpacity.stopAnimation();
    };
  }, [promotionOpacity]);

  const selectedRestaurant = RESTAURANT_DIRECTORY.find(
    (restaurant) => restaurant.id === selectedRestaurantId,
  );

  if (selectedRestaurant) {
    return (
      <RestaurantDetailScreen
        onBack={() => setSelectedRestaurantId(null)}
        restaurant={selectedRestaurant}
        screenWidth={screenWidth}
      />
    );
  }

  if (selectedFood) {
    return (
      <FoodDetailsScreen
        item={selectedFood}
        onBack={() => setSelectedFood(null)}
        onSelectItem={setSelectedFood}
        profileSelections={profileSelections}
        screenWidth={screenWidth}
      />
    );
  }

  return (
    <SafeAreaView edges={[]} style={styles.homeScreen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView
        contentContainerStyle={styles.homeScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingRow}>
          <View style={styles.avatar}>
            <Image
              accessibilityLabel="Foto de perfil"
              resizeMode="contain"
              source={require('./assets/koala-enhanced.png')}
              style={styles.avatarImage}
            />
          </View>
          <View style={styles.greetingText}>
            <Text style={styles.hello}>Olá {firstName || 'Ouli'}!</Text>
            <Pressable
              accessibilityLabel={
                deliveryAddress
                  ? 'Gerenciar perfil e endereço pelas notificações'
                  : 'Adicionar endereço pelas notificações'
              }
              accessibilityRole="button"
              onPress={onNotifications}
              style={styles.addressButton}
            >
              <Text numberOfLines={1} style={styles.address}>
                {deliveryAddress || 'Adicione seu endereço'}
              </Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityLabel="Abrir notificações"
            accessibilityRole="button"
            onPress={onNotifications}
            style={styles.bellButton}
          >
            <BellIcon />
          </Pressable>
        </View>

        {!profileSetupComplete && (
          <Pressable
            accessibilityRole="button"
            onPress={onNotifications}
            style={styles.tipBanner}
          >
            <View style={styles.tipBubble} />
            <Text style={styles.tipTitle}>Falta pouco para o match perfeito!</Text>
            <Text style={styles.tipText}>
              Defina o que você adora para receber nossas melhores opções.
            </Text>
          </Pressable>
        )}

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Promoções do dia</Text>
        </View>
        <View style={[styles.promoCard, { backgroundColor: PROMOTIONS[promotionIndex].color }]}>
          <Animated.Image
            source={PROMOTIONS[promotionIndex].image}
            style={[StyleSheet.absoluteFill, styles.promoImage, { opacity: promotionOpacity }]}
            resizeMode="cover"
          />
        </View>

        <View style={styles.foodHeading}>
          <View>
            <Text style={styles.foodSectionTitle}>Restaurantes</Text>
            <Text style={styles.foodSectionSubtitle}>
              Conheça os restaurantes e seus cardápios
            </Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.restaurantHomeList}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
        >
          {RESTAURANT_DIRECTORY.map((restaurant) => (
            <RestaurantHomeCard
              key={restaurant.id}
              onPress={() => setSelectedRestaurantId(restaurant.id)}
              restaurant={restaurant}
            />
          ))}
        </ScrollView>

        <View style={styles.foodHeading}>
          <View>
            <Text style={styles.foodSectionTitle}>Em alta</Text>
            <Text style={styles.foodSectionSubtitle}>Confira os mais amados</Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.foodList}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
        >
          {FOODS.map((food) => (
            <FoodCard
              key={food.name}
              food={food}
              onPress={() => {
                const foodDetails = HOME_FOOD_DETAILS[food.name] || {};
                const recommendations = filterMealsForProfile(
                  FOODS
                    .filter((candidate) => candidate.name !== food.name)
                    .map((candidate) => ({
                      ...candidate,
                      ...HOME_FOOD_DETAILS[candidate.name],
                    })),
                  profileRules,
                );
                setSelectedFood({
                  ...food,
                  ...foodDetails,
                  description: foodDetails.description || food.detail,
                  features: HOME_FOOD_FEATURES,
                  name: food.detailName || food.name,
                  recommendations,
                  restaurantName: food.seller,
                });
              }}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const NOTIFICATION_FILTERS = ['Todas', 'Pagamentos', 'Cancelados', 'Entregas', 'Outros'];

export function NotificationsScreen({ onBack, onConfigure }) {
  const [selectedFilter, setSelectedFilter] = useState('Todas');
  const [selectedSection, setSelectedSection] = useState('Notificações');

  return (
    <SafeAreaView edges={[]} style={styles.notificationsScreen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.notificationTop}>
        <Pressable
          accessibilityLabel="Voltar para início"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
      </View>
      <View style={styles.notificationTabs}>
        {['Notificações', 'Mensagens'].map((section, index) => (
          <React.Fragment key={section}>
            {index > 0 && <Text style={styles.tabDivider}>|</Text>}
            <Pressable onPress={() => setSelectedSection(section)}>
              <Text style={selectedSection === section ? styles.notificationTabActive : styles.notificationTab}>
                {section}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          contentContainerStyle={styles.filterRail}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {NOTIFICATION_FILTERS.map((filter) => {
            const active = selectedFilter === filter;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[styles.filterChip, active && styles.filterSelected]}
              >
                <Text style={[styles.filterText, active && styles.filterTextSelected]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {selectedSection === 'Notificações' ? (
          <View style={styles.notificationContent}>
            <Text style={styles.todayLabel}>Hoje</Text>
            <View style={styles.notificationRow}>
              <View style={styles.notificationIcon}>
                <Image
                  source={require('./assets/koala-enhanced.png')}
                  style={styles.notificationKoala}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.notificationMessage}>
                <View style={styles.notificationTitleRow}>
                  <Text style={styles.notificationTitle}>Alerta Titu</Text>
                  <Text style={styles.notificationDate}>1 OUT, 2026</Text>
                </View>
                <Text style={styles.notificationBody}>Vamos completar seu perfil</Text>
                <Text style={styles.notificationDescription}>
                  Adicione suas restrições e seus pratos preferidos para o Titu procurar as melhores
                  opções para você. Certifique-se de ter seu endereço de entrega cadastrado para
                  receber seu pedido!
                </Text>
                <Pressable accessibilityRole="button" onPress={onConfigure}>
                  <Text style={styles.configureLink}>CONFIGURAR AQUI</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.notificationDivider} />
          </View>
        ) : (
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyMessagesText}>Você ainda não tem mensagens.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flex: 1,
    justifyContent: 'center',
  },
  completeContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: size(24),
    paddingTop: size(70),
    position: 'relative',
  },
  loadingGlow: {
    backgroundColor: '#FFFDF4',
    borderRadius: size(110),
    height: size(220),
    position: 'absolute',
    top: '29%',
    width: size(220),
  },
  completeMascot: {
    height: size(112),
    marginBottom: size(57),
    width: size(112),
  },
  completeTitle: {
    color: COLORS.navy,
    fontSize: size(20),
    fontWeight: '700',
    textAlign: 'center',
  },
  completeSubtitle: {
    color: COLORS.muted,
    fontSize: size(13),
    lineHeight: size(19),
    marginTop: size(20),
    textAlign: 'center',
  },
  loadingDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: size(12),
    marginTop: size(70),
  },
  loadingDot: {
    backgroundColor: '#FFD7B1',
    borderRadius: size(5),
    height: size(8),
    width: size(8),
  },
  homeScreen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  homeScroll: {
    paddingBottom: size(16),
  },
  greetingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: size(18),
    paddingHorizontal: size(20),
    paddingTop: size(14),
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#FFF1DF',
    borderColor: '#F3D7B5',
    borderRadius: size(23),
    borderWidth: 1,
    height: size(46),
    justifyContent: 'center',
    overflow: 'hidden',
    width: size(46),
  },
  avatarImage: {
    height: size(39),
    width: size(39),
  },
  greetingText: {
    flex: 1,
    marginLeft: size(10),
  },
  hello: {
    color: '#222222',
    fontSize: size(16),
    fontWeight: '700',
  },
  address: {
    color: COLORS.muted,
    fontSize: size(12),
    marginTop: size(2),
  },
  addressButton: {
    alignSelf: 'flex-start',
  },
  bellButton: {
    alignItems: 'center',
    height: size(38),
    justifyContent: 'center',
    width: size(38),
  },
  bellShape: {
    alignItems: 'center',
    borderColor: '#171717',
    borderTopLeftRadius: size(12),
    borderTopRightRadius: size(12),
    borderWidth: 1.8,
    height: size(20),
    width: size(18),
  },
  bellClapper: {
    backgroundColor: '#171717',
    borderRadius: 2,
    bottom: -size(5),
    height: size(4),
    position: 'absolute',
    width: size(7),
  },
  tipBanner: {
    backgroundColor: COLORS.orange,
    borderRadius: size(14),
    justifyContent: 'center',
    marginHorizontal: size(20),
    minHeight: size(76),
    overflow: 'visible',
    paddingHorizontal: size(15),
    paddingVertical: size(12),
  },
  tipBubble: {
    borderBottomColor: COLORS.orange,
    borderBottomWidth: size(12),
    borderLeftColor: 'transparent',
    borderLeftWidth: size(8),
    borderRightColor: 'transparent',
    borderRightWidth: size(8),
    position: 'absolute',
    right: size(12),
    top: -size(8),
  },
  tipTitle: {
    color: COLORS.white,
    fontSize: size(14),
    fontWeight: '800',
    marginBottom: size(4),
  },
  tipText: {
    color: '#FFF4E6',
    fontSize: size(12),
    lineHeight: size(16),
    paddingRight: size(8),
  },
  sectionHeading: {
    marginBottom: size(10),
    marginHorizontal: size(22),
    marginTop: size(24),
  },
  sectionTitle: {
    color: COLORS.dark,
    fontSize: size(17),
    fontWeight: '800',
  },
  promoCard: {
    aspectRatio: 400 / 253,
    borderRadius: size(14),
    marginHorizontal: size(20),
    overflow: 'hidden',
  },
  promoImage: {
    height: '100%',
    width: '100%',
  },
  foodHeading: {
    marginBottom: size(10),
    marginHorizontal: size(22),
    marginTop: size(18),
  },
  foodSectionTitle: {
    color: '#222222',
    fontSize: size(17),
    fontWeight: '800',
  },
  foodSectionSubtitle: {
    color: '#666666',
    fontSize: size(13),
    marginTop: size(2),
  },
  foodList: {
    paddingLeft: size(20),
    paddingRight: size(16),
    paddingBottom: size(8),
  },
  restaurantHomeList: {
    paddingBottom: size(8),
    paddingLeft: size(20),
    paddingRight: size(16),
  },
  restaurantHomeCard: {
    marginRight: size(12),
    width: size(148),
  },
  restaurantHomeImage: {
    backgroundColor: '#F7F7F7',
    borderRadius: size(10),
    height: size(88),
    width: '100%',
  },
  restaurantHomeName: {
    color: COLORS.dark,
    fontSize: size(12),
    fontWeight: '700',
    marginTop: size(6),
  },
  restaurantHomeDetails: {
    color: COLORS.muted,
    fontSize: size(9),
    marginTop: size(3),
  },
  foodCard: {
    marginRight: size(16),
    width: size(128),
  },
  foodImageWrap: {
    backgroundColor: '#F7F7F7',
    borderRadius: size(12),
    height: size(128),
    overflow: 'hidden',
    width: '100%',
  },
  foodPhoto: {
    height: '100%',
    width: '100%',
  },
  foodPrice: {
    color: COLORS.dark,
    fontSize: size(12),
    marginBottom: size(4),
  },
  foodCardInfo: {
    paddingBottom: size(8),
    paddingHorizontal: size(4),
    paddingTop: size(7),
  },
  foodName: {
    color: '#242424',
    fontSize: size(12),
    fontWeight: '600',
    lineHeight: size(16),
  },
  foodDetail: {
    color: '#555555',
    fontSize: size(11),
    lineHeight: size(15),
    marginTop: size(2),
  },
  foodSeller: {
    color: '#444444',
    fontSize: size(9),
    lineHeight: size(12),
    marginTop: size(2),
  },
  foodRatingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: size(7),
  },
  foodRating: {
    color: '#333333',
    fontSize: size(11),
  },
  locationMarker: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 99,
    height: size(12),
    justifyContent: 'center',
    marginLeft: size(5),
    width: size(12),
  },
  locationMarkerDot: {
    backgroundColor: COLORS.white,
    borderRadius: 99,
    height: size(3),
    width: size(3),
  },
  notificationsScreen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  notificationTop: {
    height: size(52),
    justifyContent: 'center',
    paddingHorizontal: size(12),
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFB900',
    borderRadius: size(8),
    height: size(36),
    justifyContent: 'center',
    width: size(36),
  },
  backArrow: {
    color: COLORS.white,
    fontSize: size(24),
    fontWeight: '700',
    lineHeight: size(28),
    marginTop: -size(2),
  },
  notificationTabs: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: size(14),
    marginLeft: size(18),
    marginTop: size(8),
  },
  notificationTabActive: {
    color: COLORS.navy,
    fontSize: size(15),
    fontWeight: '800',
  },
  tabDivider: {
    color: '#C79D36',
    fontSize: size(15),
    marginHorizontal: size(10),
  },
  notificationTab: {
    color: COLORS.navy,
    fontSize: size(15),
    fontWeight: '700',
  },
  filterRail: {
    alignItems: 'center',
    paddingHorizontal: size(12),
  },
  filterChip: {
    alignItems: 'center',
    borderColor: '#DEDEDE',
    borderRadius: size(10),
    borderWidth: 1,
    height: size(36),
    justifyContent: 'center',
    marginRight: size(7),
    paddingHorizontal: size(14),
  },
  filterSelected: {
    backgroundColor: '#FFFDF5',
    borderColor: '#E0BD5B',
  },
  filterText: {
    color: COLORS.muted,
    fontSize: size(12),
  },
  filterTextSelected: {
    color: '#B9911B',
  },
  notificationContent: {
    paddingHorizontal: size(14),
  },
  todayLabel: {
    color: COLORS.navy,
    fontSize: size(14),
    fontWeight: '800',
    marginBottom: size(14),
    marginTop: size(18),
  },
  notificationRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  notificationIcon: {
    alignItems: 'center',
    borderColor: COLORS.navy,
    borderRadius: 999,
    borderWidth: 1.5,
    height: size(44),
    justifyContent: 'center',
    marginRight: size(12),
    width: size(44),
  },
  notificationKoala: {
    height: size(34),
    width: size(34),
  },
  notificationMessage: {
    flex: 1,
  },
  notificationTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    color: COLORS.navy,
    fontSize: size(13),
    fontWeight: '800',
  },
  notificationDate: {
    color: COLORS.navy,
    fontSize: size(10),
  },
  notificationBody: {
    color: COLORS.navy,
    fontSize: size(14),
    fontWeight: '700',
    marginTop: size(5),
  },
  notificationDescription: {
    color: COLORS.orange,
    fontSize: size(12),
    lineHeight: size(18),
    marginTop: size(6),
  },
  configureLink: {
    color: '#D2A000',
    fontSize: size(12),
    fontWeight: '800',
    marginTop: size(7),
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  notificationDivider: {
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    marginLeft: size(56),
    marginTop: size(16),
  },
  emptyMessages: {
    alignItems: 'center',
    padding: size(30),
  },
  emptyMessagesText: {
    color: COLORS.muted,
    fontSize: size(14),
  },
});
