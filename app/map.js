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
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null); // 👈 novo estado

  // Localização do usuário
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

  // Buscar pedidos no Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      setPedidos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Criar ou editar pedido
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

  // Excluir pedido
  const handleDeletePedido = async (id) => {
    try {
      await deleteDoc(doc(db, "pedidos", id));
      setMenuAtivo(null);
      Alert.alert("Pedido removido!");
    } catch (err) {
      Alert.alert("Erro", err.message);
    }
  };

  // Alternar tipo no modal
  const alternarTipo = () => {
    if (tipo === "Pessoa") setTipo("ONG");
    else if (tipo === "ONG") setTipo("Ração");
    else setTipo("Pessoa");
  };

  if (loading || !coords) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff5c5c" />
      </View>
    );
  }

  const pedidosFiltrados =
    filtro === "Todos" ? pedidos : pedidos.filter((p) => p.tipo === filtro);

  // Ícone de cada tipo
  const getIcon = (tipo) => {
    if (tipo === "ONG") return { name: "hand-heart", color: "#ff6b6b" };
    if (tipo === "Ração") return { name: "paw", color: "#f4a261" };
    return { name: "account", color: "#4CAF50" };
  };

  return (
    <View style={styles.container}>
      {/* Barra de filtros no topo */}
      <View style={styles.filtroContainer}>
        {["Todos", "Pessoa", "ONG", "Ração"].map((item) => (
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
        {pedidosFiltrados.map((p) => {
          const icone = getIcon(p.tipo);
          return (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              onPress={() => setPedidoSelecionado(p)} // 👈 abre modal
            >
              <Icon name={icone.name} size={36} color={icone.color} />
            </Marker>
          );
        })}
      </MapView>

      {/* Modal de detalhes do pedido */}
      {pedidoSelecionado && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPedidoSelecionado(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{pedidoSelecionado.tipo}</Text>
              <Text style={styles.modalDescription}>
                {pedidoSelecionado.descricao}
              </Text>

              <TouchableOpacity
                style={[styles.btn, { marginTop: 20 }]}
                onPress={() => setPedidoSelecionado(null)}
              >
                <Text style={styles.btnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

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

      {/* Modal de criar/editar pedido */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editando ? "Editar Pedido" : "Novo Pedido"}
            </Text>

            <TouchableOpacity style={styles.tipoBtn} onPress={alternarTipo}>
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
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  fab: {
    position: "absolute",
    bottom: 40,
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
    top: 50,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  filtroBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
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
    bottom: 120,
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
