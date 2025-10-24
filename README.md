

```markdown
# 📱 DoaAqui

Aplicativo protótipo desenvolvido em **React Native (Expo)** para conectar pessoas, ONGs e doadores.  
Permite que usuários **cadastrem pedidos de ajuda** (como roupas, alimentos e ração) e visualizem em um **mapa interativo**.

⚠️ **Importante:** Este protótipo roda apenas em **Android** (não testado em iOS).

---

## 🚀 Funcionalidades
- 🔑 Cadastro e login de usuários com **Firebase Authentication** (e-mail/senha)  
- 📝 Criação de pedidos de ajuda vinculados ao usuário logado  
- 🗺️ Exibição dos pedidos em um **mapa interativo** com ícones diferentes para cada tipo  
- 🎯 Filtro de pedidos por categoria  
- 📌 Modal com detalhes de cada pedido  
- ➕ Botão flutuante no mapa para criar novos pedidos  

---

## 🛠️ Tecnologias utilizadas
- ⚛️ React Native + Expo  
- 🔐 Firebase Authentication  
- ☁️ Firebase Firestore  
- 📍 react-native-maps  
- 📡 expo-location  

---

## 📦 Pré-requisitos
- 📌 Node.js (versão LTS)  
- ⚙️ Expo CLI  
- 📱 Dispositivo Android com o app **Expo Go**  

---

## 🔧 Como rodar o projeto

1. 📂 Clone este repositório:
  
   git clone https://github.com/seu-usuario/doaaqui.git
   cd doaaqui
   

2. 📦 Instale as dependências:
  
   npm install
  

3. ▶️ Inicie o app:
   
   npx expo start
  

4. 📲 Instale através da Play Store o aplicativo **Expo Go**

5. 📷 Escaneie o QR code com o app **Expo Go** no Android

---

## ⚠️ Limitações atuais
1. 🚫 Não testado no iOS  
2. 🌐 No Web, a UI carrega, mas o **mapa não funciona** (limitação do `react-native-maps`)  
3. 🧪 Protótipo focado em **demonstração** (não pronto para produção)  

---

## 👥 Equipe
- 👨‍💻 Jeliel Nunes  
- 👨‍💻 Thiago Sanson  
- 👨‍💻 Thiago Reis  