import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ORANGE = '#FF8500';
const BLUE = '#124F8C';
const DELIVERY_WINDOW_SECONDS = 30 * 60;

function MapIllustration() {
  return (
    <View accessibilityLabel="Mapa ilustrativo da região de entrega" style={styles.map}>
      <View style={styles.parkOne} />
      <View style={styles.parkTwo} />
      <View style={[styles.road, styles.roadOne]} />
      <View style={[styles.road, styles.roadTwo]} />
      <View style={[styles.road, styles.roadThree]} />
      <View style={[styles.road, styles.roadFour]} />
      <View style={[styles.road, styles.roadFive]} />
      <Text style={[styles.mapLabel, { top: 15, left: '16%' }]}>Vila Yara</Text>
      <Text style={[styles.mapLabel, { top: 62, left: '60%' }]}>Osasco</Text>
      <View style={styles.mapPin}><Text style={styles.pinText}>●</Text></View>
    </View>
  );
}

function BottomNavigation({ onSelectTab }) {
  return (
    <View style={styles.bottomNav}>
      {[
        ['🐨', 'Início'],
        ['⌕', 'Buscar'],
        ['▤', 'Pedidos'],
        ['♙', 'Perfil'],
      ].map(([icon, label]) => (
        <Pressable accessibilityRole="button" key={label} onPress={() => onSelectTab?.(label)} style={styles.tab}>
          <Text style={[styles.tabIcon, label === 'Pedidos' && styles.activeTab]}>{icon}</Text>
          <Text style={[styles.tabLabel, label === 'Pedidos' && styles.activeTab]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function DeliveryScreen({ onBack, onSelectTab, onViewOrders, address = 'Av. dos Autonomistas, 1496' }) {
  const progress = useRef(new Animated.Value(1)).current;
  const [secondsLeft, setSecondsLeft] = useState(DELIVERY_WINDOW_SECONDS);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: DELIVERY_WINDOW_SECONDS * 1000,
      useNativeDriver: false,
    });
    animation.start();
    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => {
      animation.stop();
      clearInterval(timer);
    };
  }, [progress]);

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={ORANGE} barStyle="light-content" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="Voltar" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Tempo de entrega</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.main}>
        <View style={styles.mapArea}>
          <MapIllustration />
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>Pedido confirmado, logo seus itens serão separados</Text>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <View style={styles.etaRow}>
              <Text style={styles.etaLabel}>Previsão de entrega: </Text>
              <Text style={styles.etaTime}>20:00 - 20:30</Text>
              <Text style={styles.remaining}>  •  {minutes}:{seconds}</Text>
            </View>
          </View>
        </View>

        <View style={styles.promoBanner}>
          <Image source={require('./assets/delivery-koala-gift.png')} resizeMode="contain" style={styles.mascot} />
          <View style={styles.promoCopy}>
            <Text style={styles.promoText}>Novos itens adicionados</Text>
            <Pressable accessibilityRole="button" onPress={onViewOrders} style={styles.ordersButton}>
              <Text style={styles.ordersButtonText}>Ver pedidos</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.sectionTitle}>Endereço de entrega</Text>
          <View style={styles.addressRow}>
            <View style={styles.locationBadge}><Text style={styles.locationPin}>●</Text></View>
            <View>
              <Text style={styles.addressTitle}>{address}</Text>
              <Text style={styles.addressLine}>Vila Yara, Osasco - apt 104 Torre 2</Text>
              <Text style={styles.addressNote}>Mandar mensagem, não tocar o interfone</Text>
            </View>
          </View>

          <View style={styles.orderHeading}>
            <Text style={styles.sectionTitle}>Detalhes do pedido</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.vendorBadge}><Text style={styles.vendorMark}>❋</Text></View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailTitle}>Nome do vendedor</Text>
              <Text style={styles.detailSubtitle}>Pedido Nº 3649 / 3 itens</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.paymentBadge}><Text style={styles.paymentMark}>▣</Text></View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailTitle}>Pagamento na entrega / Dinheiro</Text>
              <Text style={styles.detailSubtitle}>Troco para R$ 50,00</Text>
            </View>
          </View>
        </View>
      </View>
      <BottomNavigation onSelectTab={onSelectTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 56, alignItems: 'center', flexDirection: 'row', backgroundColor: ORANGE },
  backButton: { width: 56, height: '100%', justifyContent: 'center', paddingLeft: 19 },
  backArrow: { color: '#FFFFFF', fontSize: 37, lineHeight: 40, fontWeight: '300' },
  headerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 56 },
  main: { flex: 1 },
  mapArea: { height: '31%', minHeight: 180, position: 'relative' },
  map: { flex: 1, overflow: 'hidden', backgroundColor: '#E5F2E7' },
  parkOne: { position: 'absolute', width: 120, height: 85, left: -25, top: 8, backgroundColor: '#CBE8CF', borderRadius: 24, transform: [{ rotate: '-18deg' }] },
  parkTwo: { position: 'absolute', width: 140, height: 90, right: -28, bottom: -15, backgroundColor: '#D0EBCF', borderRadius: 30, transform: [{ rotate: '17deg' }] },
  road: { position: 'absolute', height: 5, backgroundColor: '#FFFFFF', borderColor: '#D7DED4', borderTopWidth: 1, borderBottomWidth: 1 },
  roadOne: { width: '120%', left: '-8%', top: 25, transform: [{ rotate: '18deg' }] },
  roadTwo: { width: '120%', left: '-8%', top: 77, transform: [{ rotate: '-12deg' }] },
  roadThree: { width: '120%', left: '-8%', top: 134, transform: [{ rotate: '8deg' }] },
  roadFour: { width: 230, left: 12, top: 65, transform: [{ rotate: '74deg' }] },
  roadFive: { width: 240, right: -38, top: 76, transform: [{ rotate: '-66deg' }] },
  mapLabel: { position: 'absolute', color: '#859184', fontSize: 7 },
  mapPin: { position: 'absolute', top: '43%', left: '52%', width: 19, height: 19, borderRadius: 10, backgroundColor: ORANGE, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  pinText: { color: '#FFFFFF', fontSize: 7 },
  confirmationCard: { position: 'absolute', top: 10, left: 32, right: 32, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 13, elevation: 3, shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  confirmationTitle: { color: '#141414', fontSize: 12, fontWeight: '700', lineHeight: 15 },
  progressTrack: { height: 2, backgroundColor: '#E4E4E4', marginTop: 19, marginBottom: 8 },
  progressFill: { height: 2, backgroundColor: '#25B76A' },
  etaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  etaLabel: { color: '#777777', fontSize: 8 },
  etaTime: { color: '#222222', fontSize: 8, fontWeight: '700' },
  remaining: { color: '#777777', fontSize: 8 },
  promoBanner: { minHeight: 60, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 31 },
  mascot: { width: 43, height: 48 },
  promoCopy: { flex: 1, alignItems: 'center' },
  promoText: { color: '#191919', fontSize: 8, marginBottom: 4 },
  ordersButton: { backgroundColor: BLUE, borderRadius: 16, minWidth: 100, alignItems: 'center', paddingVertical: 4, paddingHorizontal: 16 },
  ordersButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  details: { flex: 1, paddingHorizontal: 18, paddingTop: 15 },
  sectionTitle: { color: '#161616', fontSize: 11, fontWeight: '700' },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 9, marginBottom: 16 },
  locationBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E2E2E2', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  locationPin: { color: '#2B2B2B', fontSize: 11 },
  addressTitle: { color: '#222222', fontSize: 9, fontWeight: '700', marginBottom: 4 },
  addressLine: { color: '#777777', fontSize: 8, marginBottom: 3 },
  addressNote: { color: '#777777', fontSize: 8 },
  orderHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  chevron: { color: '#222222', fontSize: 21 },
  detailRow: { minHeight: 49, flexDirection: 'row', alignItems: 'center' },
  vendorBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E8EBE2', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  vendorMark: { color: '#719268', fontSize: 18 },
  paymentBadge: { width: 25, height: 25, borderRadius: 5, backgroundColor: '#E6F3E9', alignItems: 'center', justifyContent: 'center', marginHorizontal: 5, marginRight: 13 },
  paymentMark: { color: '#13A34A', fontSize: 14 },
  detailCopy: { flex: 1 },
  detailTitle: { color: '#222222', fontSize: 8, fontWeight: '700', marginBottom: 3 },
  detailSubtitle: { color: '#777777', fontSize: 8 },
  bottomNav: { height: 46, backgroundColor: BLUE, flexDirection: 'row', justifyContent: 'space-around' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { color: '#FFFFFF', fontSize: 16, lineHeight: 19 },
  tabLabel: { color: '#FFFFFF', fontSize: 7, marginTop: 1 },
  activeTab: { color: '#FFB400' },
});
