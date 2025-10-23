import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, UrlTile, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export default function MapScreen() {
  const [coords, setCoords] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("Pessoa");
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);

  // 1️⃣ Pegar localização do usuário
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Ative a localização para continuar.");
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords(pos.coords);
      setLoading(false);
    })();
  }, []);

  // 2️⃣ Buscar pedidos do Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      setPedidos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 3️⃣ Criar ou editar pedido
  const handleSalvar = async () => {
    if (!descricao) return Alert.alert("Preencha a descrição!");
    try {
      if (editando) {
        await updateDoc(doc(db, "pedidos", editando), { tipo, descricao });
        Alert.alert("Pedido atualizado!");
        setEditando(null);
      } else {
        await addDoc(collection(db, "pedidos"), {
          tipo,
          descricao,
          latitude: coords.latitude,
          longitude: coords.longitude,
          data: serverTimestamp(),
        });
        Alert.alert("Pedido criado!");
      }
      setDescricao("");
      setModalVisible(false);
    } catch (err) {
      Alert.alert("Erro", err.message);
    }
  };

  // 4️⃣ Excluir pedido
  const handleExcluir = async (id) => {
    await deleteDoc(doc(db, "pedidos", id));
    Alert.alert("Pedido removido!");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff5c5c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
  style={styles.map}
  mapType="none"
  initialRegion={{
    latitude: coords?.latitude ?? -26.4851,
    longitude: coords?.longitude ?? -49.0661,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>
  <UrlTile
    urlTemplate="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=fO4wqAIJZR9z2e8dyDi2"
    maximumZ={19}
  />

  {/* 📍 marcador do usuário */}
  {coords && (
    <Marker coordinate={coords} title="Você está aqui" pinColor="blue" />
  )}

  {/* 📍 pedidos do firebase */}
  {pedidos.map((p) => (
    <Marker
      key={p.id}
      coordinate={{ latitude: p.latitude, longitude: p.longitude }}
    >
      {/* Ícone vetorial dentro do Marker */}
      <Ionicons
        name={p.tipo === "ONG" ? "paw" : "person"}
        size={32}
        color={p.tipo === "ONG" ? "green" : "red"}
      />

      {/* Callout com descrição */}
      <Callout
        onPress={() =>
          Alert.alert(
            "Informações",
            p.tipo === "ONG"
              ? `Esta é uma ONG.\nDescrição: ${p.descricao}`
              : `Este é um pedido de ajuda de uma pessoa.\nDescrição: ${p.descricao}`,
            [
              {
                text: "Editar",
                onPress: () => {
                  setDescricao(p.descricao);
                  setTipo(p.tipo);
                  setEditando(p.id);
                  setModalVisible(true);
                },
              },
              {
                text: "Excluir",
                style: "destructive",
                onPress: () => handleExcluir(p.id),
              },
              { text: "Fechar" },
            ],
            { cancelable: true }
          )
        }
      >
        <View style={{ width: 200 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {p.tipo === "ONG" ? "ONG" : "Pessoa"}
          </Text>
          <Text>{p.descricao}</Text>
          <Text style={{ fontSize: 12, color: "#777" }}>
            Toque para mais opções
          </Text>
        </View>
      </Callout>
    </Marker>
  ))}
</MapView>

      {/* ➕ botão flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setDescricao("");
          setEditando(null);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* 🧾 modal de formulário */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editando ? "Editar Pedido" : "Novo Pedido"}
            </Text>

            <TouchableOpacity
              style={styles.tipoBtn}
              onPress={() => setTipo(tipo === "Pessoa" ? "ONG" : "Pessoa")}
            >
              <Text style={styles.tipoBtnText}>Tipo: {tipo}</Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              style={styles.input}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
              <Text style={styles.saveBtnText}>
                {editando ? "Salvar Alterações" : "Criar Pedido"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
// 💅 estilos
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#ff5c5c",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff5c5c",
    marginBottom: 10,
  },
  tipoBtn: {
    backgroundColor: "#eee",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  tipoBtnText: { fontWeight: "bold", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  saveBtn: {
    backgroundColor: "#ff5c5c",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
  cancelText: {
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
});