import { View, Text, StyleSheet } from "react-native";

export default function RequestHelpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📩 Pedir Ajuda</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 22 },
});
