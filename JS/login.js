import { database } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Selecionar elementos do formulário
const signupForm = document.getElementById('signupForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Evento de submissão do formulário de registro
signupForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevenir o comportamento padrão de envio do formulário

    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Registrar o usuário com email e senha no Firebase
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Usuário criado com sucesso
            const user = userCredential.user;

            // Armazenar dados adicionais do usuário no Realtime Database
            return database.ref('users/' + user.uid).set({
                firstName: firstName,
                lastName: lastName,
                email: email,
                uid: user.uid
            });
        })
        .then(() => {
            alert('Usuário registrado com sucesso!');
            signupForm.reset(); // Limpa o formulário após o registro
        })
        .catch((error) => {
            console.error('Erro ao registrar:', error);
            alert('Erro ao registrar: ' + error.message);
        });
});
