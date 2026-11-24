import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Image,
  Pressable,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AddressScreen from './AddressScreen';
import {
  HomeScreen,
  NotificationsScreen,
  RegistrationCompleteScreen,
} from './HomeScreens';
import OnboardingScreen from './OnboardingScreen';
import SearchScreen from './SearchScreen';

const COLORS = {
  amber: '#FFB400',
  blue: '#124F8C',
  text: '#101010',
  muted: '#777777',
  border: '#D5D5D5',
  white: '#FFFFFF',
};

const ROUTES = {
  onboarding: 'onboarding',
  registrationComplete: 'registrationComplete',
  home: 'home',
  search: 'search',
  orders: 'orders',
  preferences: 'preferences',
  profile: 'profile',
  address: 'address',
  notifications: 'notifications',
};

const TAB_ROUTES = {
  Início: ROUTES.home,
  Buscar: ROUTES.search,
  Pedidos: ROUTES.orders,
  Perfil: ROUTES.profile,
};

const QUESTIONS = [
  {
    id: 'restrictions',
    title: 'O que precisamos evitar no seu prato?',
    label: 'Selecionar restrições',
    options: [
      'Alimentação Kosher',
      'Alimentação Halal',
      'Restrição a sódio',
      'Intolerância à lactose',
      'Sensibilidade ao glúten',
      'Alergia à proteína do leite de vaca',
      'Alergia a amendoim e castanhas',
      'Alergia a frutos do mar',
      'Alergia a ovos',
      'Alergia à soja',
      'Doença celíaca',
      'Diabetes',
      'Hipertensão',
      'Vegetarianismo',
      'Veganismo',
    ],
  },
  {
    id: 'sensitivity',
    title: 'Qual é o seu nível de sensibilidade para esses ingredientes?',
    label: 'Selecione as opções',
    options: [
      'Severa / Anafilaxia / Celíaca',
      'Intolerância Moderada',
      'Preferência Alimentar',
    ],
  },
  {
    id: 'crossContamination',
    title: 'Precisamos ter atenção com contaminação cruzada?',
    label: 'Selecione as opções',
    options: ['Sim, zero traços', 'Não, apenas sem o ingrediente direto'],
  },
  {
    id: 'favoriteFoods',
    title: 'Quais são suas comidas prediletas?',
    label: 'Selecionar refeições preferidas',
    options: [
      'Pão francês sem glúten',
      'Pizza vegana',
      'Bolo de aniversário sem alergênicos',
      'Salgadinho de festa sem glúten',
      'Chocolate sem lactose',
      'Massa folhada sem glúten',
      'Sorvete sem leite de vaca',
      'Molho de tomate sem açúcar',
      'Bolacha recheada sem glúten',
      'Pão de forma sem soja',
      'Hambúrguer vegano sem soja',
      'Comida japonesa sem glúten',
      'Sobremesas para diabéticos',
      'Cerveja sem glúten',
      'Queijo vegetal que derrete',
      'Iogurte vegetal sem açúcar',
      'Pratos congelados com baixo sódio',
      'Doces de festa sem castanhas',
      'Pão de queijo sem leite',
    ],
  },
  {
    id: 'dailyMeals',
    title: 'Quais refeições você mais procura no seu dia a dia?',
    label: 'Selecione as opções',
    options: ['Café da manhã', 'Almoço', 'Doces', 'Marmitas da Semana', 'Jantar'],
  },
];

function SelectionField({ question, selected, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const filteredOptions = question.options.filter((option) =>
    option.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')),
  );

  function toggleExpanded() {
    setExpanded((isExpanded) => !isExpanded);
    setSearch('');
  }

  return (
    <View style={styles.question}>
      <Text style={styles.questionTitle}>{question.title}</Text>
      <Text style={styles.fieldLabel}>{question.label}</Text>
      <View style={styles.dropdown}>
        {expanded ? (
          <View style={styles.searchRow}>
            <TextInput
              accessibilityLabel={`Pesquisar em ${question.label.toLocaleLowerCase('pt-BR')}`}
              autoCapitalize="none"
              onChangeText={setSearch}
              placeholder="Pesquisar"
              placeholderTextColor={COLORS.muted}
              returnKeyType="search"
              style={styles.searchInput}
              value={search}
            />
            <Pressable
              accessibilityLabel="Fechar opções"
              accessibilityRole="button"
              onPress={toggleExpanded}
              style={styles.chevronButton}
            >
              <Text style={styles.chevron}>⌃</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityLabel={selected.length ? `${selected.length} selecionadas` : 'Pesquisar opções'}
            accessibilityRole="button"
            accessibilityState={{ expanded: false }}
            onPress={toggleExpanded}
            style={styles.collapsedField}
          >
            <Text style={[styles.collapsedText, selected.length > 0 && styles.selectedSummary]}>
              {selected.length ? `${selected.length} selecionada${selected.length > 1 ? 's' : ''}` : 'Pesquisar'}
            </Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
        )}
        {expanded && (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={styles.optionsList}
          >
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const checked = selected.includes(option);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    key={option}
                    onPress={() => onToggle(option)}
                    style={styles.optionRow}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                  </Pressable>
                );
              })
            ) : (
              <Text style={styles.emptySearch}>Nenhuma opção encontrada.</Text>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function TabIcon({ label, active }) {
  if (label === 'Início') {
    return (
      <View style={styles.koalaBadge}>
        <Image
          accessibilityLabel="Coala"
          resizeMode="contain"
          source={require('./assets/nav-koala.png')}
          style={styles.koalaIcon}
        />
      </View>
    );
  }

  const iconStyle = [styles.tabIconShape, active && styles.activeTabIconShape];
  if (label === 'Buscar') {
    return (
      <View style={styles.searchIcon}>
        <View style={iconStyle} />
        <View style={[styles.searchHandle, active && styles.activeSearchHandle]} />
      </View>
    );
  }
  if (label === 'Pedidos') {
    return (
      <View style={[styles.receiptIcon, active && styles.activeReceiptIcon]}>
        <View style={[styles.receiptLine, active && styles.activeReceiptLine]} />
        <View style={[styles.receiptLine, active && styles.activeReceiptLine]} />
        <View style={[styles.receiptLine, active && styles.activeReceiptLine]} />
      </View>
    );
  }
  return (
    <View style={styles.profileIcon}>
      <View style={[styles.profileHead, active && styles.activeProfileIcon]} />
      <View style={[styles.profileBody, active && styles.activeProfileIcon]} />
    </View>
  );
}

function PreferencesScreen({ onBack, onContinue, selections, setSelections }) {

  function toggleOption(questionId, option) {
    setSelections((current) => {
      const selected = current[questionId] || [];
      const next = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option];
      return { ...current, [questionId]: next };
    });
  }

  return (
    <View style={styles.screen}>
      <Pressable
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        onPress={onBack}
        style={styles.backButton}
      >
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {QUESTIONS.map((question) => (
          <SelectionField
            key={question.id}
            onToggle={(option) => toggleOption(question.id, option)}
            question={question}
            selected={selections[question.id] || []}
          />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
        >
          <Text style={styles.continueText}>Continuar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BottomNavigation({ activeTab, onSelectTab, bottomInset }) {
  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(bottomInset, 8) }]}>
      {[
        { label: 'Início' },
        { label: 'Buscar' },
        { label: 'Pedidos' },
        { label: 'Perfil' },
      ].map((tab) => {
        const active = activeTab === tab.label;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={tab.label}
            onPress={() => onSelectTab(tab.label)}
            style={styles.tab}
          >
            <TabIcon active={active} label={tab.label} />
            <Text style={[styles.tabLabel, active && styles.activeTabText]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PlaceholderScreen({ tab }) {
  const isOrders = tab === ROUTES.orders;
  const isProfile = tab === ROUTES.profile;

  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>
        {isOrders ? 'Seus pedidos' : isProfile ? 'Seu perfil' : 'Bem-vindo ao Oullin'}
      </Text>
      <Text style={styles.placeholderDescription}>
        {isOrders
          ? 'Seus pedidos aparecerão aqui quando você fizer uma compra.'
          : isProfile
            ? 'Para completar seu perfil alimentar e endereço, acesse as notificações.'
          : 'Esta tela ainda está sendo preparada.'}
      </Text>
    </View>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [routeStack, setRouteStack] = useState([ROUTES.onboarding]);
  const [selections, setSelections] = useState({});
  const [firstName, setFirstName] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [profileSetupComplete, setProfileSetupComplete] = useState(false);
  const currentRoute = routeStack[routeStack.length - 1];

  function resetNavigation(route) {
    setRouteStack([route]);
  }

  function navigate(route) {
    setRouteStack((current) => [...current, route]);
  }

  function goBack() {
    setRouteStack((current) => {
      if (current.length > 1) return current.slice(0, -1);
      if (current[0] !== ROUTES.home && current[0] !== ROUTES.onboarding) {
        return [ROUTES.home];
      }
      return current;
    });
  }

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (routeStack.length > 1) {
        goBack();
        return true;
      }
      if (currentRoute !== ROUTES.home && currentRoute !== ROUTES.onboarding) {
        resetNavigation(ROUTES.home);
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [currentRoute, routeStack]);

  if (currentRoute === ROUTES.onboarding) {
    return (
      <OnboardingScreen
        onComplete={(registration) => {
          setFirstName(registration.firstName);
          resetNavigation(ROUTES.registrationComplete);
        }}
      />
    );
  }
  if (currentRoute === ROUTES.registrationComplete) {
    return (
      <RegistrationCompleteScreen
        onFinish={() => resetNavigation(ROUTES.home)}
      />
    );
  }

  const isOverlayRoute = currentRoute === ROUTES.address || currentRoute === ROUTES.notifications;
  const activeTab = Object.keys(TAB_ROUTES).find((tab) => TAB_ROUTES[tab] === currentRoute);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.mainContent}>
        {currentRoute === ROUTES.notifications ? (
          <NotificationsScreen
            onBack={goBack}
            onConfigure={() => navigate(ROUTES.preferences)}
          />
        ) : currentRoute === ROUTES.address ? (
          <SafeAreaView edges={['bottom']} style={styles.addressSafeArea}>
            <AddressScreen
              completeLabel="Confirmar endereço"
              onBack={goBack}
              onComplete={(address) => {
                setSelectedAddress(address);
                setProfileSetupComplete(true);
                resetNavigation(ROUTES.home);
              }}
            />
          </SafeAreaView>
        ) : currentRoute === ROUTES.search ? (
          <SearchScreen profileSelections={selections} />
        ) : currentRoute === ROUTES.home ? (
          <HomeScreen
            deliveryAddress={
              selectedAddress
                ? [selectedAddress.street, selectedAddress.number].filter(Boolean).join(', ')
                : ''
            }
            firstName={firstName}
            onNotifications={() => navigate(ROUTES.notifications)}
            onSelectTab={(tab) => resetNavigation(TAB_ROUTES[tab])}
            profileSetupComplete={profileSetupComplete}
            profileSelections={selections}
          />
        ) : currentRoute === ROUTES.preferences ? (
          <PreferencesScreen
            onBack={goBack}
            onContinue={() => navigate(ROUTES.address)}
            selections={selections}
            setSelections={setSelections}
          />
        ) : (
          <PlaceholderScreen tab={currentRoute} />
        )}
      </View>
      {!isOverlayRoute && (
        <BottomNavigation
          activeTab={activeTab}
          bottomInset={insets.bottom}
          onSelectTab={(tab) => resetNavigation(TAB_ROUTES[tab])}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mainContent: {
    flex: 1,
  },
  addressSafeArea: {
    flex: 1,
  },
  screen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  backButton: {
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backArrow: {
    color: COLORS.amber,
    fontSize: 34,
    lineHeight: 38,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 22,
    paddingBottom: 18,
  },
  question: {
    marginBottom: 26,
  },
  questionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
    marginBottom: 9,
  },
  fieldLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginBottom: 3,
  },
  dropdown: {
    borderColor: COLORS.border,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  collapsedField: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 36,
    justifyContent: 'space-between',
    paddingHorizontal: 13,
  },
  collapsedText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  selectedSummary: {
    color: COLORS.text,
  },
  searchRow: {
    alignItems: 'center',
    borderBottomColor: '#E7E7E7',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 38,
    paddingLeft: 13,
  },
  searchInput: {
    color: COLORS.text,
    flex: 1,
    fontSize: 12,
    height: '100%',
    paddingVertical: 0,
  },
  chevronButton: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 40,
  },
  chevron: {
    color: COLORS.muted,
    fontSize: 19,
  },
  optionsList: {
    maxHeight: 220,
  },
  optionRow: {
    alignItems: 'center',
    borderBottomColor: '#E7E7E7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 39,
    paddingHorizontal: 12,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 4,
    borderWidth: 1,
    height: 16,
    justifyContent: 'center',
    marginRight: 9,
    width: 16,
  },
  checkboxChecked: {
    backgroundColor: COLORS.amber,
    borderColor: COLORS.amber,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  optionText: {
    color: '#333333',
    flex: 1,
    fontSize: 12,
  },
  emptySearch: {
    color: COLORS.muted,
    fontSize: 12,
    padding: 14,
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingBottom: 8,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: COLORS.amber,
    borderRadius: 9,
    height: 47,
    justifyContent: 'center',
    marginBottom: 19,
    marginHorizontal: 13,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  bottomNav: {
    backgroundColor: COLORS.blue,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 7,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  koalaBadge: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 46,
  },
  koalaIcon: {
    height: 30,
    width: 46,
  },
  searchIcon: {
    height: 25,
    justifyContent: 'flex-start',
    position: 'relative',
    width: 25,
  },
  tabIconShape: {
    borderColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    height: 17,
    width: 17,
  },
  activeTabIconShape: {
    borderColor: COLORS.amber,
  },
  searchHandle: {
    backgroundColor: COLORS.white,
    height: 2,
    left: 16,
    position: 'absolute',
    top: 17,
    transform: [{ rotate: '45deg' }],
    width: 8,
  },
  activeSearchHandle: {
    backgroundColor: COLORS.amber,
  },
  receiptIcon: {
    alignItems: 'center',
    borderColor: COLORS.white,
    borderRadius: 2,
    borderWidth: 2,
    height: 21,
    justifyContent: 'space-evenly',
    paddingHorizontal: 3,
    width: 17,
  },
  activeReceiptIcon: {
    borderColor: COLORS.amber,
  },
  receiptLine: {
    backgroundColor: COLORS.white,
    height: 1.5,
    width: 8,
  },
  activeReceiptLine: {
    backgroundColor: COLORS.amber,
  },
  profileIcon: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'flex-end',
    width: 24,
  },
  profileHead: {
    borderColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 2,
    height: 10,
    marginBottom: 2,
    width: 10,
  },
  profileBody: {
    borderColor: COLORS.white,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    height: 9,
    width: 17,
  },
  activeProfileIcon: {
    borderColor: COLORS.amber,
  },
  tabLabel: {
    color: COLORS.white,
    fontSize: 10,
    marginTop: 1,
  },
  activeTabText: {
    color: COLORS.amber,
  },
  placeholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
});
