import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig"; // 👈 importa o auth também

export default function RequestHelpScreen() {
  const [tipo, setTipo] = useState("Pessoa");
  const [descricao, setDescricao] = useState("");
  const [contato, setContato] = useState("");
  const [urgencia, setUrgencia] = useState("Média");

  const handleSubmit = async () => {
    if (!descricao.trim()) {
      Alert.alert("Erro", "Por favor, preencha a descrição.");
      return;
    }

    try {
      const user = auth.currentUser; // 👈 pega o usuário logado
      if (!user) {
        Alert.alert("Erro", "Você precisa estar logado para criar um pedido.");
        return;
      }

      await addDoc(collection(db, "pedidos"), {
        tipo,
        descricao,
        contato,
        urgencia,
        userId: user.uid, // 👈 salva o ID do usuário
        data: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Pedido criado com sucesso!");
      setDescricao("");
      setContato("");
      setTipo("Pessoa");
      setUrgencia("Média");
    } catch (err) {
      Alert.alert("Erro", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📩 Criar Pedido de Ajuda</Text>

      <Text style={styles.label}>Tipo:</Text>
      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() =>
          setTipo(tipo === "Pessoa" ? "ONG" : tipo === "ONG" ? "Ração" : "Pessoa")
        }
      >
        <Text style={styles.toggleText}>Tipo atual: {tipo}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Descrição:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Preciso de roupas de frio"
        value={descricao}
        onChangeText={setDescricao}
      />

      <Text style={styles.label}>Contato:</Text>
      <TextInput
        style={styles.input}
        placeholder="Telefone ou WhatsApp"
        value={contato}
        onChangeText={setContato}
      />

      <Text style={styles.label}>Urgência:</Text>
      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() =>
          setUrgencia(
            urgencia === "Baixa" ? "Média" : urgencia === "Média" ? "Alta" : "Baixa"
          )
        }
      >
        <Text style={styles.toggleText}>Urgência: {urgencia}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.btnText}>Salvar Pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  label: { fontWeight: "bold", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  toggleBtn: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    alignItems: "center",
  },
  toggleText: { fontWeight: "bold", color: "#333" },
  btn: {
    backgroundColor: "#ff5c5c",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});