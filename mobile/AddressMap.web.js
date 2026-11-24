import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { View } from 'react-native';

function getZoom(region) {
  const delta = Math.max(region.latitudeDelta || 0.008, region.longitudeDelta || 0.008);
  return Math.max(2, Math.min(19, Math.round(Math.log2(360 / delta))));
}

function safeJson(value) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => ({
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
  })[character]);
}

function createMapDocument(region, markers) {
  const initialCenter = safeJson([region.latitude, region.longitude]);
  const initialZoom = getZoom(region);
  const initialMarkers = safeJson(markers.map(({ coordinate, title, description }) => ({
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    title: title || '',
    description: description || '',
  })));

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css">
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; overflow: hidden; }
      .leaflet-control-attribution { font-size: 9px !important; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        var map = L.map('map', { zoomControl: true }).setView(${initialCenter}, ${initialZoom});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        var markers = ${initialMarkers};
        markers.forEach(function (item, index) {
          var marker = L.marker([item.latitude, item.longitude]).addTo(map);
          var label = [item.title, item.description].filter(Boolean).join(', ');
          if (label) marker.bindPopup(label);
          marker.on('click', function () {
            window.parent.postMessage(JSON.stringify({ type: 'marker-press', index: index }), '*');
          });
        });

        map.on('moveend', function () {
          var center = map.getCenter();
          var bounds = map.getBounds();
          window.parent.postMessage(JSON.stringify({
            type: 'region-change',
            latitude: center.lat,
            longitude: center.lng,
            latitudeDelta: Math.abs(bounds.getNorth() - bounds.getSouth()),
            longitudeDelta: Math.abs(bounds.getEast() - bounds.getWest()),
          }), '*');
        });

        window.addEventListener('message', function (event) {
          var message;
          try { message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; }
          catch (_) { return; }
          if (message && message.type === 'set-region') {
            var center = map.getCenter();
            var delta = Math.max(message.region.latitudeDelta || 0.008, message.region.longitudeDelta || 0.008);
            var zoom = Math.max(2, Math.min(19, Math.round(Math.log2(360 / delta))));
            if (Math.abs(center.lat - message.region.latitude) > 0.00001
              || Math.abs(center.lng - message.region.longitude) > 0.00001
              || map.getZoom() !== zoom) {
              map.setView([message.region.latitude, message.region.longitude], zoom, { animate: true });
            }
          }
          if (message && message.type === 'invalidate-size') map.invalidateSize();
        });

        setTimeout(function () { map.invalidateSize(); }, 150);
      }());
    </script>
  </body>
</html>`;
}

function MapMarker() {
  return null;
}

const AddressMap = forwardRef(function AddressMap(
  { children, initialRegion, onRegionChangeComplete, region, style },
  ref,
) {
  const iframeRef = useRef(null);
  const mapRegion = region || initialRegion || {
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };
  const startingRegion = useRef(mapRegion);
  const markers = useMemo(
    () => React.Children.toArray(children).map((child) => child.props),
    [children],
  );
  const srcDoc = useMemo(() => createMapDocument(startingRegion.current, markers), [markers]);

  const sendRegion = useCallback((nextRegion) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ type: 'set-region', region: nextRegion }),
      '*',
    );
  }, []);

  useImperativeHandle(ref, () => ({
    animateToRegion(nextRegion) {
      sendRegion(nextRegion);
    },
  }), [sendRegion]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      let message;
      try {
        message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (message?.type === 'region-change') {
        onRegionChangeComplete?.({
          latitude: message.latitude,
          longitude: message.longitude,
          latitudeDelta: message.latitudeDelta,
          longitudeDelta: message.longitudeDelta,
        });
      } else if (message?.type === 'marker-press') {
        markers[message.index]?.onPress?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [markers, onRegionChangeComplete]);

  return (
    <View accessibilityLabel="Mapa interativo OpenStreetMap" style={[{ flex: 1, overflow: 'hidden' }, style]}>
      <iframe
        ref={iframeRef}
        aria-label="Mapa interativo: arraste para mover e use os controles para aproximar"
        loading="eager"
        onLoad={() => sendRegion(mapRegion)}
        referrerPolicy="strict-origin-when-cross-origin"
        srcDoc={srcDoc}
        style={{ border: 0, display: 'block', height: '100%', width: '100%' }}
        title="Mapa interativo OpenStreetMap"
      />
    </View>
  );
});

AddressMap.Marker = MapMarker;

export default AddressMap;
