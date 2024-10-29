import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// Inicializa Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  

// Função para buscar a cor da lista ativa de uma tarefa
async function getListColorByTaskId(taskId) {
    try {
        // Busca a tarefa pelo ID
        const taskDoc = await getDoc(doc(db, "tasks", taskId.toString()));
        
        if (!taskDoc.exists()) {
            console.error(`Tarefa com ID ${taskId} não encontrada.`);
            return null;
        }
        
        // Obtém a referência à lista da tarefa
        const taskData = taskDoc.data();
        const listId = taskData.list;

        // Verifica se `listId` é "criadas" e define uma cor padrão para essa lista
        if (listId == null) {
            console.log("Lista 'criadas' encontrada, retornando cor padrão.");
            return "#FFA500"; // Cor padrão para lista 'criadas'
        }

        // Converte `listId` para número, mas só se ele não for uma string
        const numericListId = parseInt(listId, 10);
        if (isNaN(numericListId)) {
            console.error("ID da lista inválido na tarefa.");
            return null;
        }

        // Busca a lista onde o ID é igual ao `numericListId`
        const listQuery = query(collection(db, "lists"), where("id", "==", numericListId));
        const listSnapshot = await getDocs(listQuery);

        if (!listSnapshot.empty) {
            const listDoc = listSnapshot.docs[0];
            return String(listDoc.data().color);
        } else {
            console.error(`Lista com ID ${numericListId} não encontrada.`);
            return null;
        }

    } catch (error) {
        console.error("Erro ao buscar lista ativa pela ID da tarefa: ", error);
    }
}

// Função para buscar as tarefas de hoje no Firestore
async function showTodayTasks() {
    try {
        const today = new Date().toISOString().split('T')[0]; // Formato yyyy-mm-dd
        const formattedDate = `${today.split('-').reverse().join('/')}`;
        
        const data = document.getElementById("data_1");
        data.innerHTML = `<h2 id="data"><span>${formattedDate}</span></h2>`;

        // Consulta para obter tarefas onde a data é igual a hoje
        const tasksRef = collection(db, "tasks");
        const todayQuery = query(tasksRef, where("date", "==", today));
        const snapshot = await getDocs(todayQuery);

        const taskContainer = document.getElementById('todayTasks');
        taskContainer.innerHTML = ''; // Limpa a lista de tarefas anteriores

        if (snapshot.empty) {
            console.log('Nenhuma tarefa para hoje.');
            return;
        }

        snapshot.forEach(async (doc) => {
            const task = { id: doc.id, ...doc.data() };
            const taskElement = document.createElement('div');
            taskElement.className = 'task-today';

            // Pegar a cor da lista e aplicar no fundo da tarefa
            const listColor = await getListColorByTaskId(task.id);
            taskElement.style.backgroundColor = listColor || '#FFA500'; // Cor padrão se não houver

            taskElement.innerHTML = `
                <div class="task-row">
                    <div class="task-name">
                        <input type="radio" ${task.concluded ? 'checked' : ''} disabled />
                        <span style="text-decoration: ${task.concluded ? 'line-through' : 'none'};">
                            ${task.name}
                        </span>
                    </div>
                </div>
                <div class="task-row">
                    <div class="task-description" style="text-decoration: ${task.concluded ? 'line-through' : 'none'};">
                        <strong>Descrição:</strong> ${task.description || "Sem descrição"}
                    </div>
                </div>
            `;

            taskContainer.appendChild(taskElement);
        });

        console.log("Tarefas de hoje carregadas com sucesso!");

    } catch (error) {
        console.error("Erro ao buscar tarefas para o dia de hoje: ", error);
    }
}

// Carregar as tarefas ao carregar a página
document.addEventListener('DOMContentLoaded', showTodayTasks);
