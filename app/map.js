import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function MapScreen() {
  const [coords, setCoords] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("Pessoa");
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [menuAtivo, setMenuAtivo] = useState(null);
  const [filtro, setFiltro] = useState("Todos");

  // 1️⃣ Localização do usuário
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Não foi possível acessar a localização.");
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCoords(location.coords);
      setLoading(false);
    })();
  }, []);

  // 2️⃣ Buscar pedidos no Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      setPedidos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 3️⃣ Criar ou editar pedido
  const handleAddPedido = async () => {
    if (!descricao) return Alert.alert("Preencha a descrição!");
    try {
      if (editando) {
        await updateDoc(doc(db, "pedidos", editando), { descricao, tipo });
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
  const handleDeletePedido = async (id) => {
    try {
      await deleteDoc(doc(db, "pedidos", id));
      setMenuAtivo(null);
      Alert.alert("Pedido removido!");
    } catch (err) {
      Alert.alert("Erro", err.message);
    }
  };

  // 5️⃣ Modal de formulário
  const renderModal = () => (
    <Modal visible={modalVisible} animationType="fade" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editando ? "Editar Pedido" : "Novo Pedido"}
          </Text>

          <TouchableOpacity
            style={styles.tipoBtn}
            onPress={() => setTipo(tipo === "Pessoa" ? "ONG" : "Pessoa")}
          >
            <Text style={styles.tipoText}>Tipo atual: {tipo}</Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            style={styles.input}
          />

          <TouchableOpacity style={styles.btn} onPress={handleAddPedido}>
            <Text style={styles.btnText}>
              {editando ? "Salvar alterações" : "Criar pedido"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#ccc" }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading || !coords) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff5c5c" />
      </View>
    );
  }

  // 6️⃣ Filtragem dos pedidos
  const pedidosFiltrados =
    filtro === "Todos"
      ? pedidos
      : pedidos.filter((p) => p.tipo === filtro);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType="none"
        region={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile
          urlTemplate="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=fO4wqAIJZR9z2e8dyDi2"
          maximumZ={19}
        />

        {/* Marcador do usuário */}
        <Marker coordinate={coords} title="Você está aqui">
          <Icon name="account-circle" size={40} color="#007bff" />
        </Marker>

        {/* Marcadores dos pedidos */}
        {pedidosFiltrados.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.tipo}
            description={p.descricao}
            onPress={() => setMenuAtivo(p.id === menuAtivo ? null : p.id)}
          >
            <Icon
              name={p.tipo === "ONG" ? "hand-heart" : "account"}
              size={36}
              color={p.tipo === "ONG" ? "#ff6b6b" : "#4CAF50"}
            />
          </Marker>
        ))}
      </MapView>

      {/* Menu flutuante editar/excluir */}
      {menuAtivo && (
        <View style={styles.menuOpcoes}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => {
              const p = pedidos.find((x) => x.id === menuAtivo);
              setDescricao(p.descricao);
              setTipo(p.tipo);
              setEditando(p.id);
              setModalVisible(true);
              setMenuAtivo(null);
            }}
          >
            <Icon name="pencil" size={20} color="#333" />
            <Text>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => handleDeletePedido(menuAtivo)}
          >
            <Icon name="delete" size={20} color="#e74c3c" />
            <Text>Excluir</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Barra de filtros */}
      <View style={styles.filtroContainer}>
        {["Todos", "ONG", "Pessoa"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filtroBtn,
              filtro === item && styles.filtroBtnAtivo,
            ]}
            onPress={() => setFiltro(item)}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtro === item && styles.filtroTextoAtivo,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botão flutuante de novo pedido */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setDescricao("");
          setEditando(null);
          setModalVisible(true);
        }}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 25,
    backgroundColor: "#ff5c5c",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 6,
  },
  filtroContainer: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 5,
  },
  filtroBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  filtroBtnAtivo: {
    backgroundColor: "#ff5c5c",
  },
  filtroTexto: {
    color: "#555",
    fontWeight: "500",
  },
  filtroTextoAtivo: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#ff5c5c",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  tipoBtn: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  tipoText: { color: "#333", fontWeight: "bold" },
  btn: {
    backgroundColor: "#ff5c5c",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  menuOpcoes: {
    position: "absolute",
    bottom: 170,
    right: 25,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 8,
  },
  menuBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    gap: 5,
  },
});
