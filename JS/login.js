import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9UQ6-4pQQVjlOhmsQWN86n3TUcmg8eAk",
    authDomain: "to-do-26b24.firebaseapp.com",
    databaseURL: "https://to-do-26b24-default-rtdb.firebaseio.com",
    projectId: "to-do-26b24",
    storageBucket: "to-do-26b24.appspot.com",
    messagingSenderId: "767144656111",
    appId: "1:767144656111:web:dc7d566149f67c176a6f1a",
    measurementId: "G-H2ZGN2GRSP"
};

// Inicialize o Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Selecionar elementos do formulário
const signupForm = document.getElementById('register-form');
const NameInput = document.getElementById('register-name');
const emailInput = document.getElementById('register-email');
const passwordInput = document.getElementById('register-password');

// Função de registro
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = NameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // Criar novo usuário
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Atualizar perfil com o nome do usuário
        await updateProfile(user, { displayName: name });

        // Salvar informações adicionais no Realtime Database
        await set(ref(database, 'users/' + user.uid), {
            name: name,
            email: email,
            uid: user.uid
        });

        alert("Usuário registrado com sucesso!");
        signupForm.reset();
        window.location.href = 'inicio.html';
    } catch (error) {
        console.error('Erro ao registrar:', error);
        alert("Erro no registro: " + error.message);
    }
});

// Função de login
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        // Login do usuário
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        alert("Login bem-sucedido! Bem-vindo, " + user.displayName);
        displayUserInfo(user);
        // Redirecionar para a página de início após o login
        window.location.href = 'inicio.html';
    } catch (error) {
        alert("Erro no login: " + error.message);
    }
});

// Exibir informações do usuário
const displayUserInfo = (user) => {
    const userInfo = document.getElementById("user-info");
    if (user) {
        userInfo.innerText = `Usuário logado: ${user.displayName} (${user.email})`;
    } else {
        userInfo.innerText = "Nenhum usuário logado.";
    }
};

// Verificar estado de autenticação
auth.onAuthStateChanged((user) => {
    if (user) {
        displayUserInfo(user);
    } else {
        displayUserInfo(null);
    }
});