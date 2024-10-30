import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9UQ6-4pQQVjlOhmsQWN86n3TUcmg8eAk",
    authDomain: "to-do-26b24.firebaseapp.com",
    projectId: "to-do-26b24",
    storageBucket: "to-do-26b24.appspot.com",
    messagingSenderId: "767144656111",
    appId: "1:767144656111:web:dc7d566149f67c176a6f1a",
    measurementId: "G-H2ZGN2GRSP"
};

// Verifica se o Firebase já foi inicializado para evitar duplicação
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0]; // Usa o app existente
}

const db = getFirestore(app);

// Seleção dos elementos do modal e do formulário
const filterModal = document.getElementById("filterModal");
const openFilterModalBtn = document.getElementById("openFilterModal");
const closeModalBtn = document.querySelector(".close");
const filterForm = document.getElementById("filterForm");

// Função para abrir e fechar o modal
openFilterModalBtn.addEventListener("click", () => filterModal.style.display = "block");
closeModalBtn.addEventListener("click", () => filterModal.style.display = "none");
window.addEventListener("click", (event) => {
    if (event.target === filterModal) filterModal.style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
    // Função updateFilterOptions
    async function updateFilterOptions() {
        const filterType = document.getElementById("filter-type").value;
        const filterValue = document.getElementById("filter-value");
        filterValue.innerHTML = "<option value='' disabled selected>Selecione um valor</option>";

        if (filterType === "Prioridade") {
            ["Alta", "Media", "Baixa"].forEach(priority => {
                const option = document.createElement("option");
                option.value = priority.toLowerCase();
                option.textContent = priority;
                filterValue.appendChild(option);
            });
        } else if (filterType === "nomeLista") {
            const listsRef = collection(db, "lists");
            const listSnapshot = await getDocs(listsRef);
            listSnapshot.forEach((doc) => {
                const listName = doc.data().name;
                const option = document.createElement("option");
                option.value = listName;
                option.textContent = listName;
                filterValue.appendChild(option);
            });
        }
    }

    // Adiciona o evento onchange para chamar updateFilterOptions
    document.getElementById("filter-type").addEventListener("change", updateFilterOptions);
});

// Função para buscar a cor da lista ativa de uma tarefa
async function getListColorByTaskId(taskId) {
    try {
        // Busca a tarefa pelo ID
        // console.log(taskId);
        const taskDoc = await getDoc(doc(db, "tasks", taskId.toString()));
        
        if (!taskDoc.exists()) {
            console.error(`Tarefa com ID ${taskId} não encontrada.`);
            return null;
        }
        
        // Obtém a referência à lista da tarefa
        const taskData = taskDoc.data();
        const listId = taskData.list;
        // console.log(listId);
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

// Função para lidar com o submit do formulário
filterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const filterType = document.getElementById("filter-type").value;
    const filterValue = document.getElementById("filter-value").value;

    // Limpa o container de tarefas
    const taskContainer = document.getElementById("filteredTasks");
    taskContainer.innerHTML = '';

    let querySnapshot;

    if (filterType === "Prioridade" && filterValue) {
        // Busca apenas por prioridade, garantindo que filterValue está preenchido
        querySnapshot = await getDocs(query(collection(db, "tasks"), where("priority", "==", filterValue)));
    } else if (filterType === "nomeLista" && filterValue) {
        // Busca apenas por nome da lista
        const listsQuerySnapshot = await getDocs(query(collection(db, "lists"), where("name", "==", filterValue)));
        
        if (!listsQuerySnapshot.empty) {
            const listId = listsQuerySnapshot.docs[0].id;
            querySnapshot = await getDocs(query(collection(db, "tasks"), where("list", "==", listId)));
        } else {
            console.log("Lista não encontrada.");
            return;
        }
    } else {
        console.log("Tipo de filtro ou valor de pesquisa inválido.");
        return;
    }
    

    if (querySnapshot && !querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
            const task = doc.data();
            const taskElement = document.createElement("div");
            taskElement.className = "task-today";

            // Chama a função para obter a cor da lista e aplica ao background
            const listColor = await getListColorByTaskId(task.id);
            taskElement.style.backgroundColor = listColor || '#FFA500'; // Cor padrão caso não tenha cor definida
            
            taskElement.innerHTML = `
                <div class="task-row">
                    <div class="task-name">
                        <input type="radio" ${task.concluded ? 'checked ' : 'disabled'} />
                        <span style="text-decoration: ${task.concluded ? 'line-through' : 'none'};">
                            ${task.name}
                        </span>
                    </div>
                </div>
                <div class="task-row">
                    <div class="task-description">
                        <strong>Descrição: </strong> ${task.description || "Sem descrição"}
                    </div>
                </div>
            `;
            taskContainer.appendChild(taskElement);
        });
    } else {
        taskContainer.innerHTML = `<p>Nenhuma tarefa encontrada para o filtro selecionado.</p>`;
    }

    // Fecha o modal após o submit
    filterModal.style.display = "none";
});
