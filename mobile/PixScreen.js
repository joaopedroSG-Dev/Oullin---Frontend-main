import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ORANGE = '#FF8500';
const BLUE = '#124F8C';
const QR_SIZE = 27;
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

function inFinder(row, column, top, left) {
  const y = row - top;
  const x = column - left;
  if (x < 0 || x > 6 || y < 0 || y > 6) return null;
  return x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
}

function QRCodePlaceholder() {
  const modules = [];
  for (let row = 0; row < QR_SIZE; row += 1) {
    for (let column = 0; column < QR_SIZE; column += 1) {
      const finder = inFinder(row, column, 0, 0)
        ?? inFinder(row, column, 0, QR_SIZE - 7)
        ?? inFinder(row, column, QR_SIZE - 7, 0);
      const dark = finder ?? (((row * 13 + column * 7 + row * column * 3) % 11) < 5);
      modules.push(<View key={`${row}-${column}`} style={[styles.qrModule, dark && styles.qrDark]} />);
    }
  }
  return <View accessibilityLabel="Ilustração de código QR Pix" style={styles.qrCode}>{modules}</View>;
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
          {label === 'Buscar' ? <SearchTabIcon /> : <Text style={[styles.tabIcon, label === 'Pedidos' && styles.activeTab]}>{icon}</Text>}
          <Text style={[styles.tabLabel, label === 'Pedidos' && styles.activeTab]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SearchTabIcon() {
  return (
    <View style={styles.staticSearch}>
      <View style={styles.searchLens} />
      <View style={styles.searchHandle} />
    </View>
  );
}

export default function PixScreen({ onBack, onSelectTab, onCopyPix, onSharePix }) {
  const progress = useRef(new Animated.Value(1)).current;
  const hourglassRotation = useRef(new Animated.Value(0)).current;
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: PAYMENT_WINDOW_MS,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) setExpired(true);
    });
    return () => animation.stop();
  }, [progress]);

  useEffect(() => {
    const spin = Animated.loop(Animated.timing(hourglassRotation, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }));
    spin.start();
    return () => spin.stop();
  }, [hourglassRotation]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={ORANGE} barStyle="light-content" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="Voltar" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Pix</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.statusLine}>
          <Text style={styles.statusText}>{expired ? 'Tempo para pagamento expirado' : 'Aguardando Pagamento'}</Text>
          <Animated.View style={{ transform: [{ rotate: hourglassRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
            <Text style={styles.hourglass}>⌛</Text>
          </Animated.View>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.instruction}>Pagar com Pix é rápido e seguro! É só seguir estes passos</Text>

        <View style={styles.qrWrap}><QRCodePlaceholder /></View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onCopyPix ? onCopyPix() : Alert.alert('Pix indisponível', 'O código Pix será gerado quando a cobrança for integrada.')}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>Copiar pix</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onSharePix ? onSharePix() : Alert.alert('Pix indisponível', 'O código Pix será gerado quando a cobrança for integrada.')}
            style={styles.actionButton}
          >
            <Text style={styles.shareIcon}>⌯</Text>
            <Text style={styles.actionText}>Compartilhar</Text>
          </Pressable>
        </View>
        <Text style={styles.confirmationNote}>Revise as informações e confirme o Pagamento</Text>
      </View>
      <BottomNavigation onSelectTab={onSelectTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 68, alignItems: 'center', flexDirection: 'row', backgroundColor: ORANGE, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  backButton: { width: 56, height: '100%', justifyContent: 'center', paddingLeft: 19 },
  backArrow: { color: '#FFFFFF', fontSize: 37, lineHeight: 40, fontWeight: '300' },
  headerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 56 },
  content: { flex: 1, paddingHorizontal: 25, paddingTop: 29 },
  statusLine: { flexDirection: 'row', alignItems: 'center', marginLeft: 1 },
  statusText: { color: '#111111', fontSize: 10, fontWeight: '700' },
  hourglass: { fontSize: 10, marginLeft: 4 },
  progressTrack: { height: 5, borderRadius: 4, backgroundColor: '#FFDCE1', marginTop: 8 },
  progressFill: { height: 5, borderRadius: 4, backgroundColor: '#F23344' },
  instruction: { color: '#111111', fontSize: 8, lineHeight: 10, marginTop: 7, width: 200 },
  qrWrap: { alignItems: 'center', marginTop: 22 },
  qrCode: { width: 140, height: 140, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', backgroundColor: '#FFFFFF' },
  qrModule: { width: 5.18, height: 5.18 },
  qrDark: { backgroundColor: '#050505', borderRadius: 1 },
  actions: { flexDirection: 'row', justifyContent: 'center', marginTop: 66, gap: 13 },
  actionButton: { width: 77, height: 20, backgroundColor: BLUE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#FFFFFF', fontSize: 7 },
  shareIcon: { color: '#FFFFFF', fontSize: 14, marginRight: 4 },
  confirmationNote: { color: '#111111', fontSize: 7, textAlign: 'center', marginTop: 10 },
  bottomNav: { height: 46, backgroundColor: BLUE, flexDirection: 'row', justifyContent: 'space-around' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { color: '#FFFFFF', fontSize: 16, lineHeight: 19 },
  staticSearch: { width: 21, height: 21, position: 'relative' },
  searchLens: { position: 'absolute', left: 1, top: 0, width: 14, height: 14, borderRadius: 8, borderWidth: 2, borderColor: '#FFFFFF' },
  searchHandle: { position: 'absolute', left: 14, top: 13, width: 2, height: 8, backgroundColor: '#FFFFFF', transform: [{ rotate: '-45deg' }] },
  tabLabel: { color: '#FFFFFF', fontSize: 7, marginTop: 1 },
  activeTab: { color: '#FFB400' },
});
