import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { UrlTile, Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function MapScreen() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { setLoading(false); return; }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords(pos.coords);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff5c5c" />
      </View>
    );
  }

  const region = {
    latitude: coords?.latitude ?? -26.4851,
    longitude: coords?.longitude ?? -49.0661,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} mapType="none">
             <UrlTile
             urlTemplate={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=fO4wqAIJZR9z2e8dyDi2`}
             maximumZ={19}
            />
        {coords && (
          <Marker
            coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
            title="Você está aqui"
            pinColor="blue"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});