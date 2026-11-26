import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ORANGE = '#FF8500';
const BLUE = '#124F8C';

const METHODS = [
  { id: 'apple', name: 'Apple Pay', detail: 'Pague com Apple', badge: 'Parcele seu pedido', mark: 'Pay' },
  { id: 'nupay', name: 'NuPay', detail: 'Pague com o app do Nubank', mark: 'nu', color: '#820AD1' },
  { id: 'pix', name: 'Pix', detail: 'Aprovação automática', mark: '❖', color: '#24B7AA' },
];

function PaymentMethod({ method, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.method, selected && styles.selectedMethod]}
    >
      <View style={[styles.methodMark, method.color && { color: method.color }]}>
        <Text style={[styles.markText, method.color && { color: method.color }]}>{method.mark}</Text>
      </View>
      <View style={styles.methodCopy}>
        <Text style={styles.methodName}>{method.name}</Text>
        <View style={styles.detailLine}>
          <Text style={styles.methodDetail}>{method.detail}</Text>
          {!!method.badge && <Text style={styles.badge}>{method.badge}</Text>}
        </View>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
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

function UtensilsIcon() {
  return (
    <View accessibilityLabel="Garfo e faca" style={styles.utensilsIcon}>
      <View style={styles.forkTines}>
        <View style={styles.forkTine} />
        <View style={styles.forkTine} />
        <View style={styles.forkTine} />
      </View>
      <View style={styles.forkNeck} />
      <View style={styles.forkHandle} />
      <View style={styles.knifeBlade} />
      <View style={styles.knifeHandle} />
    </View>
  );
}

export default function PayScreen({ onBack, onFinishPayment, onSelectTab, onChoosePix, onOpenSummary, itemCount = 2, total = 'R$69,97' }) {
  const [selectedMethod, setSelectedMethod] = useState('apple');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={ORANGE} barStyle="light-content" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="Voltar" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Pagamento</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.methods}>
          {METHODS.map((method) => (
            <PaymentMethod
              key={method.id}
              method={method}
              onPress={() => {
                setSelectedMethod(method.id);
                if (method.id === 'pix') onChoosePix?.();
              }}
              selected={selectedMethod === method.id}
            />
          ))}
          <Pressable accessibilityRole="button" style={styles.combineMethod}>
            <Text style={styles.cardIcon}>▤</Text>
            <View style={styles.methodCopy}>
              <View style={styles.combineTitleLine}>
                <Text style={styles.methodName}>Combinar pagamentos</Text>
                <Text style={styles.newBadge}>Novo</Text>
              </View>
              <Text style={styles.methodDetail}>Escolha 2 formas de pagamento</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Abrir resumo do pedido" onPress={onOpenSummary} style={styles.summary}>
          <UtensilsIcon />
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Resumo do pedido</Text>
            <Text style={styles.summaryItems}>{itemCount} itens</Text>
          </View>
          <Text style={styles.total}>{total}</Text>
          <Text style={styles.summaryChevron}>›</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.securityNote}>
          Seus dados estão protegidos com tecnologia de criptografia. Aqui no Oullin, sua segurança vem em primeiro lugar.
        </Text>
        <Pressable accessibilityRole="button" onPress={onFinishPayment} style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}>
          <Text style={styles.check}>✓</Text>
          <Text style={styles.payButtonText}>Finalizar pagamento</Text>
        </Pressable>
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
  scrollContent: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: 12 },
  methods: { paddingHorizontal: 17, paddingTop: 34 },
  method: { height: 48, borderColor: '#EEEEEE', borderWidth: 1, borderRadius: 12, marginBottom: 9, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center' },
  selectedMethod: { borderColor: '#333333', borderWidth: 1.2 },
  methodMark: { width: 22, alignItems: 'center', justifyContent: 'center', marginRight: 5 },
  markText: { color: '#333333', fontSize: 9, fontWeight: '700' },
  methodCopy: { flex: 1 },
  methodName: { color: '#171717', fontSize: 9, fontWeight: '700' },
  detailLine: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  methodDetail: { color: '#858585', fontSize: 9 },
  badge: { color: '#19A873', backgroundColor: '#E4F8EF', borderRadius: 4, fontSize: 6, fontWeight: '700', paddingHorizontal: 4, paddingVertical: 2, marginLeft: 5 },
  radio: { width: 13, height: 13, borderRadius: 7, backgroundColor: '#ECECEC', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderWidth: 2, borderColor: '#222222', backgroundColor: '#FFFFFF' },
  radioDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#222222' },
  combineMethod: { height: 48, borderColor: '#EEEEEE', borderWidth: 1, borderRadius: 12, marginTop: 0, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center' },
  cardIcon: { color: '#333333', fontSize: 17, width: 27 },
  combineTitleLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 5 },
  newBadge: { color: '#333333', backgroundColor: '#F1F1F1', borderRadius: 4, fontSize: 7, paddingHorizontal: 5, paddingVertical: 2 },
  chevron: { color: '#222222', fontSize: 20, paddingHorizontal: 3 },
  summary: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 29, marginTop: 22, minHeight: 48 },
  utensilsIcon: { width: 19, height: 27, marginRight: 8, position: 'relative' },
  forkTines: { position: 'absolute', left: 1, top: 0, width: 8, height: 10, flexDirection: 'row', justifyContent: 'space-between' },
  forkTine: { width: 2, height: 9, backgroundColor: ORANGE, borderBottomLeftRadius: 1, borderBottomRightRadius: 1 },
  forkNeck: { position: 'absolute', left: 1, top: 7, width: 8, height: 5, backgroundColor: ORANGE, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  forkHandle: { position: 'absolute', left: 4, top: 11, width: 2, height: 16, backgroundColor: ORANGE, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  knifeBlade: { position: 'absolute', right: 1, top: 0, width: 5, height: 12, backgroundColor: ORANGE, borderTopRightRadius: 4, borderBottomLeftRadius: 2 },
  knifeHandle: { position: 'absolute', right: 2, top: 11, width: 3, height: 16, backgroundColor: ORANGE, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  summaryCopy: { flex: 1, alignItems: 'center' },
  summaryTitle: { color: '#171717', fontSize: 9, fontWeight: '700' },
  summaryItems: { color: '#777777', fontSize: 8, marginTop: 2 },
  total: { color: '#111111', fontSize: 12, fontWeight: '700', marginLeft: 8 },
  summaryChevron: { color: '#222222', fontSize: 23, marginLeft: 17 },
  footer: { paddingHorizontal: 15, paddingTop: 4, paddingBottom: 3 },
  securityNote: { color: '#888888', fontSize: 7, lineHeight: 10, marginBottom: 6 },
  payButton: { height: 25, borderRadius: 15, backgroundColor: '#FFB400', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  check: { color: '#09A847', fontSize: 16, marginRight: 17, fontWeight: '700' },
  payButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.78 },
  bottomNav: { height: 46, backgroundColor: BLUE, flexDirection: 'row', justifyContent: 'space-around' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { color: '#FFFFFF', fontSize: 16, lineHeight: 19 },
  staticSearch: { width: 21, height: 21, position: 'relative' },
  searchLens: { position: 'absolute', left: 1, top: 0, width: 14, height: 14, borderRadius: 8, borderWidth: 2, borderColor: '#FFFFFF' },
  searchHandle: { position: 'absolute', left: 14, top: 13, width: 2, height: 8, backgroundColor: '#FFFFFF', transform: [{ rotate: '-45deg' }] },
  tabLabel: { color: '#FFFFFF', fontSize: 7, marginTop: 1 },
  activeTab: { color: '#FFB400' },
});
