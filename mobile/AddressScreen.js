import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView from './AddressMap';

const COLORS = {
  amber: '#FFB400',
  blue: '#124F8C',
  text: '#101010',
  muted: '#777777',
  border: '#D5D5D5',
  white: '#FFFFFF',
  background: '#F3F3F5',
  orange: '#F07800',
};

const ADDRESSES_KEY = '@oullin/delivery-addresses';
const SELECTED_ADDRESS_KEY = '@oullin/selected-delivery-address';
const DEFAULT_MAP_REGION = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

const INITIAL_ADDRESSES = [
  {
    id: 'address-1',
    street: 'Rua Tito',
    number: '54',
    neighborhood: 'Vila Romana',
    city: 'São Paulo',
    state: 'SP',
    reference: 'Senac',
  },
  {
    id: 'address-2',
    street: 'Rua Tito',
    number: '120',
    neighborhood: 'Vila Romana',
    city: 'São Paulo',
    state: 'SP',
    reference: 'Próximo à praça',
  },
  {
    id: 'address-3',
    street: 'Rua Clélia',
    number: '850',
    neighborhood: 'Água Branca',
    city: 'São Paulo',
    state: 'SP',
    reference: '',
  },
  {
    id: 'address-4',
    street: 'Rua Aurélia',
    number: '400',
    neighborhood: 'Vila Romana',
    city: 'São Paulo',
    state: 'SP',
    reference: '',
  },
];

const EMPTY_FORM = {
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  complement: '',
  placeType: 'Casa',
  reference: '',
};

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAddressQuery(value) {
  return normalizeText(value)
    .replace(/\bav\b/g, 'avenida')
    .replace(/\br\b/g, 'rua')
    .trim();
}

function buildAddressSearchQueries(value) {
  const exact = normalizeAddressQuery(value);
  const withoutTrailingNumber = exact.replace(/\s+\d+[a-z]?$/i, '').trim();
  return [...new Set([exact, withoutTrailingNumber].filter(Boolean))];
}

function getAddressTitle(address) {
  return [address.street, address.number].filter(Boolean).join(', ');
}

async function searchPhotonAddresses(query) {
  const params = new URLSearchParams({
    lang: 'default',
    limit: '10',
    countrycode: 'BR',
    lat: '-23.5505',
    lon: '-46.6333',
    zoom: '9',
    q: query,
  });
  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`A busca de endereços falhou (${response.status}).`);
  }

  const { features = [] } = await response.json();
  const suggestions = features.map((feature, index) => {
    const place = feature.properties || {};
    const [longitude, latitude] = feature.geometry?.coordinates || [];
    return {
      id: `suggestion-${place.osm_type || 'place'}-${place.osm_id || index}`,
      street: place.street || place.name || query,
      number: place.housenumber || '',
      neighborhood: place.district || place.locality || '',
      city: place.city || place.county || '',
      state: place.state || '',
      reference: '',
      coordinates: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
    };
  }).filter((result) =>
    Number.isFinite(result.coordinates.latitude) &&
    Number.isFinite(result.coordinates.longitude) &&
    (!result.state || normalizeText(result.state).includes('sao paulo') || normalizeText(result.state) === 'sp'),
  );
  return suggestions.filter((suggestion, index) => suggestions.findIndex((item) =>
    Math.abs(item.coordinates.latitude - suggestion.coordinates.latitude) < 0.0001 &&
    Math.abs(item.coordinates.longitude - suggestion.coordinates.longitude) < 0.0001,
  ) === index);
}

async function reversePhotonAddress(coordinates) {
  const params = new URLSearchParams({
    lat: String(coordinates.latitude),
    lon: String(coordinates.longitude),
    lang: 'default',
  });
  const response = await fetch(`https://photon.komoot.io/reverse?${params.toString()}`);
  if (!response.ok) throw new Error(`Reverse geocoding failed (${response.status}).`);
  const { features = [] } = await response.json();
  return features[0]?.properties || null;
}

function AddressFormField({ label, value, onChangeText, ...props }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={COLORS.muted}
        style={styles.formInput}
        value={value}
        {...props}
      />
    </View>
  );
}

function AddressEditor({ address, onCancel, onSave }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...address }));

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalScrim}
    >
      <Pressable onPress={onCancel} style={StyleSheet.absoluteFill} />
      <View style={styles.editor}>
        <Text style={styles.editorTitle}>
          {address ? 'Complementos da entrega' : 'Adicionar endereço de entrega'}
        </Text>
        <Text style={styles.editorDescription}>
          Confira o endereço e adicione detalhes para ajudar na entrega.
        </Text>
        <ScrollView keyboardShouldPersistTaps="handled">
          <AddressFormField
            autoCapitalize="words"
            label="Endereço"
            onChangeText={(value) => updateField('street', value)}
            value={form.street || ''}
          />
          <AddressFormField
            label="Número"
            onChangeText={(value) => updateField('number', value)}
            value={form.number || ''}
          />
          <AddressFormField
            autoCapitalize="words"
            label="Bairro"
            onChangeText={(value) => updateField('neighborhood', value)}
            value={form.neighborhood || ''}
          />
          <AddressFormField
            autoCapitalize="words"
            label="Cidade"
            onChangeText={(value) => updateField('city', value)}
            value={form.city || ''}
          />
          <AddressFormField
            autoCapitalize="characters"
            label="Estado"
            maxLength={2}
            onChangeText={(value) => updateField('state', value)}
            value={form.state || ''}
          />
          <Text style={styles.formLabel}>Tipo de local</Text>
          <View style={styles.placeTypeRow}>
            {['Casa', 'Apartamento', 'Trabalho', 'Outro'].map((placeType) => {
              const active = form.placeType === placeType;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  key={placeType}
                  onPress={() => updateField('placeType', placeType)}
                  style={[styles.placeTypeOption, active && styles.placeTypeOptionSelected]}
                >
                  <Text style={[styles.placeTypeText, active && styles.placeTypeTextSelected]}>
                    {placeType}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <AddressFormField
            autoCapitalize="words"
            label="Complemento (apto, bloco, casa)"
            onChangeText={(value) => updateField('complement', value)}
            value={form.complement || ''}
          />
          <AddressFormField
            autoCapitalize="sentences"
            label="Ponto de referência (opcional)"
            onChangeText={(value) => updateField('reference', value)}
            value={form.reference || ''}
          />
        </ScrollView>
        <View style={styles.editorActions}>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
          <Pressable onPress={() => onSave(form)} style={styles.saveButton}>
            <Text style={styles.saveText}>Salvar endereço</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function AddressConfirmation({
  address,
  confirming,
  onAddressChange,
  onBack,
  onConfirm,
}) {
  const [region, setRegion] = useState(() => ({
    ...DEFAULT_MAP_REGION,
    ...address.coordinates,
  }));
  const details = [
    address.neighborhood,
    [address.city, address.state].filter(Boolean).join('/'),
  ].filter(Boolean);

  function updateMapRegion(nextRegion) {
    setRegion(nextRegion);
    onAddressChange({
      ...address,
      coordinates: {
        latitude: nextRegion.latitude,
        longitude: nextRegion.longitude,
      },
    });
  }

  return (
    <View style={styles.confirmationScreen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Voltar para os endereços"
          accessibilityRole="button"
          hitSlop={10}
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>ENDEREÇO DE ENTREGA</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.mapPreview}>
        <MapView
          accessibilityLabel="Mapa interativo: mova o mapa para ajustar a localização"
          initialRegion={region}
          loadingEnabled
          moveOnMarkerPress={false}
          onRegionChangeComplete={updateMapRegion}
          showsCompass
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.mapCenterMarker}>
          <View style={styles.mapMarker}>
            <View style={styles.mapMarkerDot} />
          </View>
          <Text style={styles.mapMoveHint}>Mova o mapa para ajustar o local</Text>
        </View>
      </View>
      <View style={styles.confirmationFooter}>
        <Pressable
          accessibilityRole="button"
          disabled={confirming}
          onPress={onConfirm}
          style={({ pressed }) => [styles.confirmAddressButton, pressed && styles.cardPressed]}
        >
          <Text style={styles.confirmAddressText}>
            {confirming ? 'Confirmando endereço...' : 'Confirmar endereço de entrega'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function AddressDetailsScreen({ address, onBack, onSave }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...address }));
  const [noComplement, setNoComplement] = useState(false);
  return (
    <View style={styles.confirmationScreen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backArrow}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>ENDEREÇO DE ENTREGA</Text><View style={styles.headerSpacer} />
      </View>
      <View style={styles.detailsMap}>
        <MapView initialRegion={{ ...DEFAULT_MAP_REGION, ...address.coordinates }} loadingEnabled style={StyleSheet.absoluteFill} />
        <View pointerEvents="none" style={styles.detailsMarker}><Text style={styles.detailsMarkerText}>●</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.detailsContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.confirmationAddress}>{form.street}</Text>
        <Text style={styles.confirmationSubtitle}>{[form.neighborhood, form.city, form.state].filter(Boolean).join(', ')}</Text>
        <TextInput keyboardType="number-pad" onChangeText={(number) => setForm((value) => ({ ...value, number }))} placeholder="Número" style={styles.detailsInput} value={form.number || ''} />
        <TextInput onChangeText={(complement) => setForm((value) => ({ ...value, complement }))} editable={!noComplement} placeholder="Complemento" style={styles.detailsInput} value={noComplement ? '' : form.complement || ''} />
        <Pressable onPress={() => setNoComplement((value) => !value)} style={styles.detailsCheckRow}><Text>{noComplement ? '☑' : '☐'}  Sem complemento</Text></Pressable>
        <Text style={styles.detailsFavorite}>Favoritar endereço</Text>
        <View style={styles.favoriteRow}>{['Casa', 'Trabalho', 'Outro'].map((placeType) => (
          <Pressable key={placeType} onPress={() => setForm((value) => ({ ...value, placeType }))} style={[styles.favoriteChip, form.placeType === placeType && styles.favoriteChipActive]}><Text>{placeType}</Text></Pressable>
        ))}</View>
        <Pressable onPress={() => onSave({ ...form, complement: noComplement ? '' : form.complement })} style={styles.detailsSave}><Text style={styles.confirmAddressText}>Salvar endereço</Text></Pressable>
      </ScrollView>
    </View>
  );
}

function AddressSearchMap({
  error,
  loading,
  onBack,
  onChangeQuery,
  onSelect,
  query,
  suggestions,
}) {
  const mapRef = useRef(null);
  const [region, setRegion] = useState(DEFAULT_MAP_REGION);

  useEffect(() => {
    const first = suggestions[0];
    if (!first) return;
    const nextRegion = {
      ...DEFAULT_MAP_REGION,
      latitude: first.coordinates.latitude,
      longitude: first.coordinates.longitude,
    };
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 350);
  }, [suggestions]);

  return (
    <View style={styles.searchMapScreen}>
      <View style={styles.searchMapHeader}>
        <Pressable
          accessibilityLabel="Voltar para a lista de endereços"
          accessibilityRole="button"
          hitSlop={10}
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <View style={styles.mapSearchBox}>
          <TextInput
            accessibilityLabel="Buscar endereço no mapa"
            autoFocus
            autoCapitalize="words"
            onChangeText={onChangeQuery}
            placeholder="Pesquise endereço ou lugar"
            placeholderTextColor={COLORS.muted}
            returnKeyType="search"
            style={styles.mapSearchInput}
            value={query}
          />
          {!!query && (
            <Pressable
              accessibilityLabel="Limpar busca"
              onPress={() => onChangeQuery('')}
              style={styles.mapSearchClear}
            >
              <Text style={styles.mapSearchClearText}>×</Text>
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.searchMap}>
        <MapView
          ref={mapRef}
          accessibilityLabel="Mapa de resultados da pesquisa"
          initialRegion={region}
          loadingEnabled
          onRegionChangeComplete={setRegion}
          showsCompass
          style={StyleSheet.absoluteFill}
        >
          {suggestions.map((suggestion) => (
            <MapView.Marker
              coordinate={suggestion.coordinates}
              key={suggestion.id}
              onPress={() => onSelect(suggestion)}
              pinColor={COLORS.orange}
              title={getAddressTitle(suggestion)}
              description={suggestion.neighborhood || suggestion.city}
            />
          ))}
        </MapView>
      </View>
      <View style={styles.suggestionPanel}>
        <Text style={styles.suggestionHeading}>
          {loading
            ? 'Buscando endereços...'
            : suggestions.length
              ? 'Resultados próximos'
              : query.trim().replace(/\s/g, '').length < 3
                ? 'Digite ao menos 3 caracteres para buscar'
                : 'Endereços encontrados'}
        </Text>
        {error ? <Text style={styles.searchMapMessage}>{error}</Text> : null}
        {!loading && !suggestions.length && query.trim().length >= 3 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onSelect({
              id: `map-point-${Date.now()}`,
              street: query,
              number: '',
              neighborhood: '',
              city: '',
              state: '',
              reference: '',
              coordinates: { latitude: region.latitude, longitude: region.longitude },
            })}
            style={styles.manualMapButton}
          >
            <Text style={styles.manualMapButtonText}>Marcar este ponto no mapa</Text>
          </Pressable>
        ) : null}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.suggestionList}
        >
          {suggestions.map((suggestion) => (
            <Pressable
              accessibilityRole="button"
              key={suggestion.id}
              onPress={() => onSelect(suggestion)}
              style={styles.suggestionRow}
            >
              <View style={styles.suggestionPin}>
                <View style={styles.suggestionPinCenter} />
              </View>
              <View style={styles.suggestionDetails}>
                <Text numberOfLines={1} style={styles.suggestionTitle}>
                  {getAddressTitle(suggestion)}
                </Text>
                <Text numberOfLines={1} style={styles.suggestionSubtitle}>
                  {[suggestion.neighborhood, suggestion.city, suggestion.state]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function AddressCard({ address, selected, onSelect, onOpenMenu, onRemove }) {
  const details = [address.neighborhood, [address.city, address.state].filter(Boolean).join('/')].filter(Boolean);

  return (
    <View style={styles.addressCard}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        onPress={onSelect}
        style={({ pressed }) => [styles.addressCardContent, pressed && styles.cardPressed]}
      >
        <View style={styles.pinIcon}>
          <View style={styles.pinCenter} />
        </View>
        <View style={styles.addressDetails}>
          <Text numberOfLines={1} style={styles.addressTitle}>
            {getAddressTitle(address)}
          </Text>
          {details.map((detail) => (
            <Text key={detail} numberOfLines={1} style={styles.addressSubtitle}>
              {detail}
            </Text>
          ))}
          {!!address.complement && (
            <Text numberOfLines={1} style={styles.addressSubtitle}>
              {address.complement}
            </Text>
          )}
          {!!address.reference && (
            <Text numberOfLines={1} style={styles.addressSubtitle}>
              {address.reference}
            </Text>
          )}
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel={`Editar ${getAddressTitle(address)}`}
        accessibilityRole="button"
        onPress={onOpenMenu}
        style={styles.addressActionButton}
      >
        <Text style={styles.editAddressIcon}>✎</Text>
      </Pressable>
      <Pressable
        accessibilityLabel={`Remover ${getAddressTitle(address)}`}
        accessibilityRole="button"
        onPress={onRemove}
        style={styles.addressActionButton}
      >
        <Text style={styles.removeAddressIcon}>×</Text>
      </Pressable>
    </View>
  );
}

export default function AddressScreen({
  completeLabel = 'Concluir cadastro',
  onBack,
  onComplete,
}) {
  const searchInput = useRef(null);
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedId, setSelectedId] = useState(INITIAL_ADDRESSES[0].id);
  const [search, setSearch] = useState('');
  const [searchMapOpen, setSearchMapOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [pendingAddress, setPendingAddress] = useState(null);
  const [detailsAddress, setDetailsAddress] = useState(null);
  const [confirmingAddress, setConfirmingAddress] = useState(false);
  const geocodeCache = useRef(new Map());

  useEffect(() => {
    if (!searchMapOpen) return undefined;
    const query = normalizeAddressQuery(search);
    const searchQueries = buildAddressSearchQueries(search);
    if (query.replace(/\s/g, '').length < 3) {
      setSearchSuggestions([]);
      setSearchError('');
      setSearchLoading(false);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError('');
      try {
        let suggestions = [];
        for (const candidate of searchQueries) {
          const cacheKey = `photon-sp-v2:${candidate}`;
          suggestions = geocodeCache.current.get(cacheKey);
          if (!suggestions) {
            if (!active) return;
            suggestions = await searchPhotonAddresses(candidate);
            if (suggestions.length) geocodeCache.current.set(cacheKey, suggestions);
          }
          if (suggestions.length) break;
        }
        if (!active) return;
        setSearchSuggestions(suggestions);
        if (suggestions.length === 0) setSearchError('Nenhum endereço encontrado.');
      } catch {
        if (active) {
          setSearchSuggestions([]);
          setSearchError(
            'Não foi possível buscar endereços. Verifique a conexão e tente novamente.',
          );
        }
      } finally {
        if (active) setSearchLoading(false);
      }
    }, Platform.OS === 'web' ? 1000 : 650);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, searchMapOpen]);

  useEffect(() => {
    let active = true;

    async function loadAddresses() {
      try {
        const savedValues = await AsyncStorage.multiGet([
          ADDRESSES_KEY,
          SELECTED_ADDRESS_KEY,
        ]);
        const savedAddresses = savedValues[0][1]
          ? JSON.parse(savedValues[0][1])
          : null;
        const savedSelectedId = savedValues[1][1];
        if (
          savedAddresses !== null &&
          (!Array.isArray(savedAddresses) ||
            savedAddresses.some(
              (address) =>
                !address ||
                typeof address.id !== 'string' ||
                typeof address.street !== 'string' ||
                typeof address.city !== 'string',
            ))
        ) {
          throw new Error('Os endereços salvos estão em um formato inválido.');
        }
        if (!active) return;
        if (savedAddresses) {
          setAddresses(savedAddresses);
          const selectionExists = savedAddresses.some(
            (address) => address.id === savedSelectedId,
          );
          setSelectedId(
            selectionExists ? savedSelectedId : savedAddresses[0]?.id || null,
          );
        }
      } catch {
        if (active) {
          Alert.alert(
            'Não foi possível carregar os endereços',
            'Os endereços de exemplo serão exibidos. Você ainda pode adicionar e salvar outros.',
          );
        }
      } finally {
        if (active) setStorageReady(true);
      }
    }

    loadAddresses();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    AsyncStorage.multiSet([
      [ADDRESSES_KEY, JSON.stringify(addresses)],
      [SELECTED_ADDRESS_KEY, selectedId || ''],
    ]).catch(() => {
      Alert.alert(
        'Não foi possível salvar',
        'A alteração ficou temporariamente nesta tela. Verifique o armazenamento do aparelho.',
      );
    });
  }, [addresses, selectedId, storageReady]);

  const filteredAddresses = useMemo(() => {
    const query = normalizeText(search);
    if (!query) return addresses;
    return addresses.filter((address) =>
      normalizeText(
        [
          address.street,
          address.number,
          address.neighborhood,
          address.city,
          address.state,
          address.complement,
          address.reference,
        ]
          .filter(Boolean)
          .join(' '),
      ).includes(query),
    );
  }, [addresses, search]);
  const selectedAddress = addresses.find((address) => address.id === selectedId);

  function openEditor(address = null) {
    setEditingAddress(address);
    setEditorVisible(true);
  }

  function saveAddress(form) {
    const savedAddress = {
      ...form,
      street: (form.street || '').trim(),
      number: (form.number || '').trim(),
      neighborhood: (form.neighborhood || '').trim(),
      city: (form.city || '').trim(),
      state: (form.state || '').trim().toLocaleUpperCase('pt-BR'),
      complement: (form.complement || '').trim(),
      placeType: form.placeType || 'Casa',
      reference: (form.reference || '').trim(),
      id: editingAddress?.id || `address-${Date.now()}`,
    };

    if (!savedAddress.street || !savedAddress.city) {
      Alert.alert('Confira os dados', 'Preencha pelo menos o endereço e a cidade.');
      return;
    }

    const isNewAddress = !addresses.some((item) => item.id === savedAddress.id);
    setAddresses((current) => {
      const alreadyExists = current.some((item) => item.id === savedAddress.id);
      return alreadyExists
        ? current.map((item) => (item.id === savedAddress.id ? savedAddress : item))
        : [savedAddress, ...current];
    });
    setSelectedId(savedAddress.id);
    setEditorVisible(false);
    setPendingAddress(null);
    setSearch('');
    if (isNewAddress) {
      Alert.alert('Endereço adicionado', 'O novo endereço foi salvo na sua lista.');
    }
  }

  async function confirmAddressOnMap() {
    setConfirmingAddress(true);
    try {
      const place = await reversePhotonAddress(pendingAddress.coordinates);
      const confirmedAddress = place
        ? {
            ...pendingAddress,
            street: place.street || place.name || pendingAddress.street,
            number: place.housenumber || pendingAddress.number,
            neighborhood:
              place.district || place.locality || pendingAddress.neighborhood,
            city: place.city || place.county || pendingAddress.city,
            state: place.state || pendingAddress.state,
          }
        : pendingAddress;
      setDetailsAddress(confirmedAddress);
    } catch (error) {
      Alert.alert(
        'Não foi possível atualizar o endereço pelo mapa',
        error?.message || 'Confira os dados do endereço antes de continuar.',
      );
      setDetailsAddress(pendingAddress);
    } finally {
      setConfirmingAddress(false);
    }
  }

  function selectSearchSuggestion(suggestion) {
    setPendingAddress({
      ...suggestion,
      id: `address-${Date.now()}`,
    });
    setSearchMapOpen(false);
  }

  function removeAddress(address) {
    Alert.alert(
      'Remover endereço?',
      `${getAddressTitle(address)} será removido dos seus endereços salvos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const remaining = addresses.filter((item) => item.id !== address.id);
            setAddresses(remaining);
            if (selectedId === address.id) setSelectedId(remaining[0]?.id || null);
          },
        },
      ],
    );
  }

  function openAddressMenu(address) {
    openEditor(address);
  }

  async function useCurrentLocation() {
    setLocationLoading(true);
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted' && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      if (permission.status !== 'granted') {
        Alert.alert(
          'Permissão de localização necessária',
          'Ative o acesso à localização nas configurações do aparelho para usar este recurso.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync(position.coords);
      if (!place) {
        throw new Error('Não foi possível encontrar um endereço para esta localização.');
      }

      const newAddress = {
        id: `address-${Date.now()}`,
        street: place.street || place.name || 'Minha localização atual',
        number: place.streetNumber || '',
        neighborhood: place.district || place.subregion || '',
        city: place.city || place.subregion || '',
        state: place.region || '',
        reference: 'Adicionado pela localização atual',
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };
      setPendingAddress(newAddress);
    } catch (error) {
      Alert.alert(
        'Não foi possível encontrar sua localização',
        error?.message || 'Verifique sua conexão e tente novamente.',
      );
    } finally {
      setLocationLoading(false);
    }
  }

  if (pendingAddress) {
    return (
      <>
        {detailsAddress ? (
          <AddressDetailsScreen
            address={detailsAddress}
            onBack={() => setDetailsAddress(null)}
            onSave={(form) => {
              setEditingAddress(null);
              saveAddress(form);
              setDetailsAddress(null);
            }}
          />
        ) : (
          <AddressConfirmation
            address={pendingAddress}
            confirming={confirmingAddress}
            onAddressChange={setPendingAddress}
            onBack={() => setPendingAddress(null)}
            onConfirm={confirmAddressOnMap}
          />
        )}
        <Modal
          animationType="slide"
          onRequestClose={() => setEditorVisible(false)}
          transparent
          visible={editorVisible}
        >
          {editorVisible && (
            <AddressEditor
              address={editingAddress}
              onCancel={() => setEditorVisible(false)}
              onSave={saveAddress}
            />
          )}
        </Modal>
      </>
    );
  }

  if (searchMapOpen) {
    return (
      <AddressSearchMap
        error={searchError}
        loading={searchLoading}
        onBack={() => setSearchMapOpen(false)}
        onChangeQuery={setSearch}
        onSelect={selectSearchSuggestion}
        query={search}
        suggestions={searchSuggestions}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={10}
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>ENDEREÇO DE ENTREGA</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchBar}>
        <TextInput
          ref={searchInput}
          accessibilityLabel="Pesquisar endereço"
          onChangeText={setSearch}
          onFocus={() => setSearchMapOpen(true)}
          onSubmitEditing={() => searchInput.current?.blur()}
          placeholder="Endereço e número"
          placeholderTextColor={COLORS.muted}
          returnKeyType="search"
          style={styles.searchInput}
          value={search}
        />
        <Pressable
          accessibilityLabel={search ? 'Limpar pesquisa' : 'Pesquisar endereço'}
          accessibilityRole="button"
          onPress={() => (search ? setSearch('') : searchInput.current?.focus())}
          style={styles.searchAction}
        >
          <Text style={styles.searchIconText}>{search ? '×' : '⌕'}</Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={locationLoading}
          onPress={useCurrentLocation}
          style={styles.locationButton}
        >
          <View style={styles.locationPin}>
            <View style={styles.locationPinCenter} />
          </View>
          <Text style={styles.locationText}>
            {locationLoading ? 'Buscando localização...' : 'Usar minha localização'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Adicionar endereço manualmente"
          accessibilityRole="button"
          onPress={() => openEditor()}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Adicionar</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.addressList}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filteredAddresses.length ? (
          filteredAddresses.map((address) => (
            <AddressCard
              address={address}
              key={address.id}
              onOpenMenu={() => openAddressMenu(address)}
              onSelect={() => setSelectedId(address.id)}
              onRemove={() => removeAddress(address)}
              selected={selectedId === address.id}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum endereço encontrado</Text>
            <Text style={styles.emptyText}>
              Tente outra busca ou adicione um novo endereço.
            </Text>
            <Pressable onPress={() => openEditor()} style={styles.emptyAddButton}>
              <Text style={styles.emptyAddText}>Adicionar endereço</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={styles.completeFooter}>
        <Pressable
          accessibilityRole="button"
          disabled={!storageReady || !selectedAddress}
          onPress={() => selectedAddress && onComplete(selectedAddress)}
          style={({ pressed }) => [
            styles.completeAddressButton,
            (!storageReady || !selectedAddress) && styles.completeAddressButtonDisabled,
            pressed && styles.completeAddressButtonPressed,
          ]}
        >
          <Text style={styles.completeAddressButtonText}>{completeLabel}</Text>
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={() => setEditorVisible(false)}
        transparent
        visible={editorVisible}
      >
        {editorVisible && (
          <AddressEditor
            address={editingAddress}
            onCancel={() => setEditorVisible(false)}
            onSave={saveAddress}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  confirmationScreen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  searchMapScreen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  detailsMap: { height: 150, overflow: 'hidden', position: 'relative' },
  detailsMarker: { alignItems: 'center', backgroundColor: '#F07800', borderRadius: 18, height: 36, justifyContent: 'center', left: '50%', marginLeft: -18, marginTop: -36, position: 'absolute', top: '55%', width: 36 },
  detailsMarkerText: { color: COLORS.white, fontSize: 12 },
  detailsContent: { padding: 18, paddingBottom: 24 },
  detailsInput: { borderColor: COLORS.amber, borderRadius: 6, borderWidth: 1, color: COLORS.text, height: 40, marginTop: 13, paddingHorizontal: 10 },
  detailsCheckRow: { paddingVertical: 8 },
  detailsFavorite: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginTop: 18 },
  favoriteRow: { flexDirection: 'row', marginTop: 8 },
  favoriteChip: { borderColor: COLORS.amber, borderRadius: 5, borderWidth: 1, marginRight: 7, paddingHorizontal: 10, paddingVertical: 5 },
  favoriteChipActive: { backgroundColor: '#FFF5D9' },
  detailsSave: { alignItems: 'center', backgroundColor: COLORS.amber, borderRadius: 8, height: 46, justifyContent: 'center', marginTop: 28 },
  searchMapHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 12,
  },
  mapSearchBox: {
    alignItems: 'center',
    backgroundColor: '#F1F0F5',
    borderColor: '#D0CFD4',
    borderRadius: 9,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 42,
    paddingLeft: 13,
  },
  mapSearchInput: {
    color: COLORS.text,
    flex: 1,
    fontSize: 13,
    height: '100%',
    paddingVertical: 0,
  },
  mapSearchClear: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 38,
  },
  mapSearchClearText: {
    color: COLORS.muted,
    fontSize: 23,
  },
  searchMap: {
    flex: 1,
    minHeight: 180,
  },
  suggestionPanel: {
    backgroundColor: COLORS.white,
    maxHeight: 250,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  suggestionHeading: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  searchMapMessage: {
    color: COLORS.muted,
    fontSize: 12,
    paddingVertical: 10,
  },
  manualMapButton: { alignItems: 'center', backgroundColor: COLORS.amber, borderRadius: 8, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 11 },
  manualMapButtonText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  suggestionList: {
    flexGrow: 0,
  },
  suggestionRow: {
    alignItems: 'center',
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 54,
    paddingVertical: 8,
  },
  suggestionPin: {
    alignItems: 'center',
    borderColor: COLORS.blue,
    borderRadius: 9,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    marginRight: 13,
    transform: [{ rotate: '45deg' }],
    width: 16,
  },
  suggestionPinCenter: {
    borderColor: COLORS.blue,
    borderRadius: 3,
    borderWidth: 1,
    height: 6,
    transform: [{ rotate: '-45deg' }],
    width: 6,
  },
  suggestionDetails: {
    flex: 1,
  },
  suggestionTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 54,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 40,
  },
  backArrow: {
    color: COLORS.amber,
    fontSize: 32,
    lineHeight: 36,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  mapPreview: {
    flex: 1,
    marginTop: 1,
    maxHeight: 480,
    minHeight: 230,
    overflow: 'hidden',
    position: 'relative',
  },
  mapCenterMarker: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '50%',
  },
  mapMarker: {
    alignItems: 'center',
    backgroundColor: '#F07800',
    borderColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 2,
    height: 34,
    justifyContent: 'center',
    marginTop: -34,
    transform: [{ rotate: '45deg' }],
    width: 34,
  },
  mapMarkerDot: {
    backgroundColor: COLORS.white,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  mapMoveHint: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 14,
    color: COLORS.text,
    fontSize: 10,
    marginTop: 5,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  confirmationDetails: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  confirmationHint: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 5,
  },
  confirmationAddress: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  confirmationSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  confirmationFooter: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  confirmAddressButton: {
    alignItems: 'center',
    backgroundColor: COLORS.amber,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  confirmAddressText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#F1F0F5',
    borderColor: '#D0CFD4',
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    height: 40,
    marginHorizontal: 11,
    marginTop: 4,
  },
  searchInput: {
    color: COLORS.text,
    flex: 1,
    fontSize: 12,
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  searchAction: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 39,
  },
  searchIconText: {
    color: '#F07800',
    fontSize: 23,
    lineHeight: 28,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 43,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  locationButton: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  locationPin: {
    alignItems: 'center',
    borderColor: COLORS.blue,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.5,
    height: 14,
    justifyContent: 'center',
    marginRight: 10,
    transform: [{ rotate: '45deg' }],
    width: 14,
  },
  locationPinCenter: {
    borderColor: COLORS.blue,
    borderRadius: 3,
    borderWidth: 1,
    height: 6,
    width: 6,
    transform: [{ rotate: '-45deg' }],
  },
  locationText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  addButtonText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '600',
  },
  addressList: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    paddingBottom: 14,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  completeFooter: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  completeAddressButton: {
    alignItems: 'center',
    backgroundColor: COLORS.amber,
    borderRadius: 9,
    justifyContent: 'center',
    minHeight: 48,
  },
  completeAddressButtonDisabled: {
    opacity: 0.5,
  },
  completeAddressButtonPressed: {
    opacity: 0.8,
  },
  completeAddressButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  addressCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.amber,
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 81,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  addressCardContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minHeight: 60,
  },
  cardPressed: {
    opacity: 0.8,
  },
  pinIcon: {
    alignItems: 'center',
    borderColor: COLORS.blue,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 9,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 1.5,
    height: 15,
    justifyContent: 'center',
    marginRight: 16,
    transform: [{ rotate: '45deg' }],
    width: 15,
  },
  pinCenter: {
    borderColor: COLORS.blue,
    borderRadius: 3,
    borderWidth: 1,
    height: 6,
    width: 6,
    transform: [{ rotate: '-45deg' }],
  },
  addressDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  addressTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  addressSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 11,
  },
  radio: {
    alignItems: 'center',
    borderColor: COLORS.amber,
    borderRadius: 9,
    borderWidth: 1,
    height: 13,
    justifyContent: 'center',
    marginHorizontal: 8,
    width: 13,
  },
  radioSelected: {
    borderWidth: 1.5,
  },
  radioDot: {
    backgroundColor: COLORS.amber,
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  addressActionButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginLeft: 5,
    width: 25,
  },
  editAddressIcon: {
    color: COLORS.blue,
    fontSize: 19,
  },
  removeAddressIcon: {
    alignItems: 'center',
    borderColor: '#C83E36',
    borderRadius: 9,
    borderWidth: 1,
    color: '#C83E36',
    fontSize: 15,
    height: 18,
    lineHeight: 16,
    textAlign: 'center',
    width: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyAddButton: {
    backgroundColor: COLORS.amber,
    borderRadius: 8,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyAddText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  modalScrim: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  editor: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  editorTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  editorDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
    marginTop: 4,
  },
  placeTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginTop: 3,
  },
  placeTypeOption: {
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 5,
    marginRight: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  placeTypeOptionSelected: {
    backgroundColor: '#FFF5D9',
    borderColor: COLORS.amber,
  },
  placeTypeText: {
    color: COLORS.muted,
    fontSize: 11,
  },
  placeTypeTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  formField: {
    marginBottom: 11,
  },
  formLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 5,
  },
  formInput: {
    borderColor: COLORS.border,
    borderRadius: 7,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 13,
    height: 42,
    paddingHorizontal: 12,
  },
  editorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
    minHeight: 44,
  },
  cancelText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.amber,
    borderRadius: 8,
    flex: 1.4,
    justifyContent: 'center',
    minHeight: 44,
  },
  saveText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
