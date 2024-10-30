//  import { test } from "../firebase";
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

// Inicialize o Firestore
const db = firebase.firestore();

const getAllTasks = async () => {
    try {
        const querySnapshot = await db.collection("tasks").get();

        // Array para armazenar todas as tarefas
        const tasks = [];


        // Iterando sobre os documentos retornados
        querySnapshot.forEach((doc) => {
            // Pega os dados do documento e seu ID
            const task = { id: doc.id, ...doc.data() };
            tasks.push(task);
        });


        console.log("Tarefas recuperadas com sucesso:", tasks);
        return tasks; // Aqui você pode retornar ou processar as tarefas conforme necessário
    } catch (error) {
        console.error("Erro ao buscar todas as tarefas: ", error);
    }
};

let taskLists = getAllTasks();

// Função para ativar cor no botão selecionado (navegação)
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const currentPath = window.location.pathname;
    const page = currentPath.substring(currentPath.lastIndexOf('/') + 1);


    const buttonMap = {
        'index.html': 'btn-inicio',
        'calendario.html': 'btn-calendario',
        'hoje.html': 'btn-hoje',
        'filtro.html': 'btn-filtro'
    };


    if (buttonMap[page]) {
        const activeButton = document.getElementById(buttonMap[page]);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    } else {
        const homeButton = document.getElementById('btn-inicio');
        if (homeButton) {
            homeButton.classList.add('active');
        }
    }


    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});
// ----------------------------------ADICIONAR TAREFA--------------------------------------------------------------------------
// Seleciona os elementos necessários para tarefas
const taskModal = document.getElementById('taskModal'); // Modal de tarefa
const cancelBtn = document.querySelector('.cancel-btn'); // Botão de cancelar tarefa
const taskForm = document.getElementById('taskForm'); // Formulário de tarefa
const overlay = document.getElementById('overlay'); // Overlay do modal de tarefa


let activeList = null; // Lista ativa onde a tarefa será inserida
let currentTask = null; // Variável que armazena a tarefa sendo editada
// -----------------------------Configuração da Lista Criadas------------------------------------
// Seleciona o botão "Adicionar Tarefa" da lista "Criadas"
const addTarefaCriadasBtn = document.querySelector('.lista-criadas .add-tarefa');
// Adiciona o evento de click para o botão "Adicionar Tarefa" da lista "Criadas"
if (addTarefaCriadasBtn) {
    addTarefaCriadasBtn.addEventListener('click', () => openTaskModal(document.querySelector('.lista-criadas')));
}

// Função para abrir o modal de tarefa
function openTaskModal(list) {
    activeList = list; // Define a lista ativa

    // Obtém a cor de fundo da lista ativa
    const listColor = getComputedStyle(activeList).backgroundColor;


    // Define a cor de fundo do modal de tarefa com a cor da lista ativa
    taskModal.style.backgroundColor = listColor;


    taskModal.style.display = 'flex'; // Exibe o modal
    overlay.style.display = 'block';  // Exibe o overlay
    // activeList = null;
}

// Função para criar ou ajustar listas dinamicamente com a cor do texto
function updateButtonColorForList(listElement) {
    const listColor = window.getComputedStyle(listElement).backgroundColor;
    const addTarefaButton = listElement.querySelector('.add-tarefa');

    // Ajusta a cor do texto do botão para o mesmo tom da lista
    addTarefaButton.style.color = listColor;
}

// Quando criar uma nova lista
document.querySelectorAll('.lista').forEach(listElement => {
    updateButtonColorForList(listElement);
});

// Função que captura os dados e adiciona ou edita a tarefa
async function saveTask(event) {

    event.preventDefault();
    
    console.log("Salvando tarefa...");


    let taskName = document.getElementById('taskName').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const taskDate = document.getElementById('taskDate').value; // No formato yyyy-mm-dd
    const taskPriority = document.getElementById('taskPriority').value;
    const concluidoCheckbox = document.getElementById('concluidoCheckbox');
    let isConcluded = concluidoCheckbox ? concluidoCheckbox.checked : false;


    // Limitar o nome da tarefa a 30 caracteres
    const maxTitleLength = 30;
    if (taskName.length > maxTitleLength) {
        taskName = taskName.substring(0, maxTitleLength) + '...';
    }


    // Formatar a data para dd/mm apenas para exibição no cartão
    const [year, month, day] = taskDate.split('-');
    const formattedDate = `${day}/${month}`;

    // activeList = document.querySelector(".listas-criadas")
    const priorityClass = taskPriority.toLowerCase();

    if (currentTask) {

        const taskId = currentTask.getAttribute('data-task-id');
        const activeListId = await getListByTaskId(taskId);      
        
        currentTask.querySelector('h3').textContent = taskName;
        currentTask.querySelector('.priority').textContent = taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1);
        currentTask.querySelector('.priority').className = `priority ${priorityClass}`;
        currentTask.querySelector('p').textContent = `Data: ${formattedDate}`; // Exibe a data formatada no cartão
        currentTask.querySelector('.checkbox-concluido').checked = isConcluded;

        // Atualizar a tarefa no Firestore
        AddandEditTask({
            id: taskId,
            name: taskName,
            description: taskDescription,
            date: taskDate,
            priority: taskPriority,
            concluded: isConcluded,
            list: activeListId
        });
    } else {
        const listId = activeList.getAttribute('data-list-id');
        // Criar nova tarefa
        const taskId = Date.now();
        const newTask = {
            id: taskId,
            name: taskName,
            description: taskDescription,
            date: taskDate,
            priority: taskPriority,
            concluded: isConcluded,
            list: listId
        };
        // console.log(listId);

        const tarefa = document.createElement('div');
        tarefa.classList.add('tarefa');
        tarefa.setAttribute('data-task-id', taskId);
        tarefa.setAttribute('data-list-id', listId);
        tarefa.innerHTML = `
            <div class="task-header">
                <span class="edit-icon">&#9998;</span>
                <span class="delete-icon">&#128465;</span>
            </div>
            <h3>${taskName}</h3>
            <p><strong>Data:</strong> ${formattedDate}</p> <!-- Exibe a data formatada -->
            <p class="priority ${priorityClass}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</p>
            <label>
                <input type="checkbox" class="checkbox-concluido" ${isConcluded ? 'checked' : 'disabled'}>
                Concluído
            </label>
        `;


        // Função de editar
        const editIcon = tarefa.querySelector('.edit-icon');
        editIcon.addEventListener('click', () => {
            openEditModal(taskName, taskDescription, taskDate, taskPriority, tarefa, isConcluded, lista);
        });


        // Função de excluir
        const deleteIcon = tarefa.querySelector('.delete-icon');
        deleteIcon.addEventListener('click', () => {
            deleteTaskFromFirebase(taskId);
        });


        // Checkbox de "Concluído"
        const checkbox = tarefa.querySelector('.checkbox-concluido');
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                tarefa.classList.add('concluido');
            } else {
                tarefa.classList.remove('concluido');
            }
        });

        activeList.querySelector('.tarefas').appendChild(tarefa);
        console.log("Tarefa adicionada: ", taskDate, taskName, taskDescription);
        
        //Adicionar no Firestore
        AddandEditTask(newTask);
    }

    loadTasksFromFirebase();
    closeTaskModal();
}

// Função para abrir o modal de edição
async function  openEditModal(name, description, date, priority, tarefa, isConcluded, lista) {
    // Atualizar `activeList` com a lista da tarefa
    const taskId = tarefa.getAttribute('data-task-id');
    const cor = await getListColorByTaskId(taskId);
    console.log(cor);
    if(cor){
        taskModal.style.backgroundColor = cor;
    }else{
        taskModal.style.backgroundColor = "#FFA500";
    }
    taskModal.style.display = 'flex';
    overlay.style.display = 'block';

    // Se a data estiver no formato yyyy-mm-dd, converta para dd/mm ao exibir no modal
    document.getElementById('taskName').value = name;
    document.getElementById('taskDescription').value = description;
    document.getElementById('taskDate').value = date; // Mantém o formato yyyy-mm-dd no campo de data
    document.getElementById('taskPriority').value = priority;
    document.getElementById('concluidoCheckbox').checked = isConcluded;

    currentTask = tarefa;
}

// Função para fechar o modal de tarefa
function closeTaskModal() {
    taskModal.style.display = 'none';
    overlay.style.display = 'none';
    taskModal.style.backgroundColor = null;

    // Resetar o formulário e limpar a referência à tarefa atual
    taskForm.reset();
    currentTask = null; // Limpa a referência da tarefa atual
}

// Eventos para os botões de cancelar e fechar modal de tarefa
if (cancelBtn) {
    cancelBtn.addEventListener('click', closeTaskModal);
}

if (taskForm) {
    taskForm.addEventListener('submit', saveTask);
}
// ----------------------------------ADICIONAR LISTA--------------------------------------------------------------------------
// Seleciona os elementos necessários para listas
const listModal = document.getElementById('listModal'); // Modal de lista
const cancelBtnList = document.getElementById('cancel-btn-list'); // Botão cancelar do modal de lista
const closeListModalBtn = document.querySelector('.close-modal'); // Botão de fechar o modal de lista
const listForm = document.getElementById('listForm'); // Formulário de lista
const scrollableSection = document.querySelector('.scrollable-section'); // Seção para adicionar as listas

// Função para abrir o modal de nova lista
function openListModal() {
    listModal.style.display = 'flex';
    overlay.style.display = 'block';
}

// Função para fechar o modal de lista
function closeListModal() {
    listModal.style.display = 'none';
    overlay.style.display = 'none';
    listForm.reset();
}

// Evento para abrir o modal de lista ao clicar em "+ Lista"
document.querySelector('.add-lista button').addEventListener('click', openListModal);

// Evento para fechar o modal de lista ao clicar em "Cancelar"
if (cancelBtnList) {
    cancelBtnList.addEventListener('click', closeListModal);
}

// Evento para fechar o modal de lista ao clicar no "X"
closeListModalBtn.addEventListener('click', closeListModal);

// Função para adicionar ou editar lista no Firebase
const AddandEditList = async (list) => {
    try {
        await db.collection("lists").doc(list.id.toString()).set(list);
        console.log("Lista adicionada ou editada com sucesso no Firebase!");
    } catch (error) {
        console.error("Erro ao adicionar ou editar a lista: ", error);
    }
};

// Função para buscar todas as listas do Firebase
const getAllLists = async () => {
    try {
        const querySnapshot = await db.collection("lists").get();
        const lists = [];
        // console.log(lists)
        querySnapshot.forEach((doc) => {
            const list = { id: doc.id, ...doc.data() };
            lists.push(list);
        });
        return lists;
    } catch (error) {
        console.error("Erro ao buscar todas as listas: ", error);
    }
};

// Função para carregar as listas do Firebase
const loadListsFromFirebase = async () => {
    try {
        const lists = await getAllLists(); // Recupera todas as listas do Firestore

        lists.forEach((list) => {
            const newList = document.createElement('div');
            newList.classList.add('lista');
            newList.setAttribute('data-list-id', list.id);
            newList.style.backgroundColor = list.color;

            newList.innerHTML = `
                <div class="list-header">
                    <h2>${list.name}</h2>
                </div>
                <div class="tarefas"></div>
                <button class="add-tarefa">Adicionar Tarefa</button>
            `;

            scrollableSection.appendChild(newList);

            // Adicionar evento de "Adicionar Tarefa" à nova lista
            const addTarefaBtn = newList.querySelector('.add-tarefa');
            addTarefaBtn.addEventListener('click', () => openTaskModal(newList));

            // Função de editar a lista
            // const editListIcon = newList.querySelector('.edit-list-icon');
            // editListIcon.addEventListener('click', () => {
            //     editList(newList);
            // });

            // Função de excluir a lista
            // const deleteListIcon = newList.querySelector('.delete-list-icon');
            // deleteListIcon.addEventListener('click', () => {
            //     deleteList(newList, list.id);
            // });

            // Atualizar a cor do texto do botão
            updateButtonColorForList(newList);

            console.log(`Lista ${list.name} carregada do Firebase`);
        });
    } catch (error) {
        console.error("Erro ao carregar listas do Firebase: ", error);
    }
};

// Evento para salvar nova lista
listForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const listName = document.getElementById('listName').value;
    const listColor = document.getElementById('listColor').value;
    const listId = Date.now();

    const newList = {
        id: listId,
        name: listName,
        color: listColor
    };

    // Criar a lista no DOM
    const listElement = document.createElement('div');
    listElement.classList.add('lista');
    listElement.setAttribute('data-list-id', listId);
    listElement.style.backgroundColor = listColor;

    listElement.innerHTML = `
        <div class="list-header">
            <h2>${listName}</h2>
        </div>
        <div class="tarefas"></div>
        <button class="add-tarefa">Adicionar Tarefa</button>
    `;

    scrollableSection.appendChild(listElement);

    // Adicionar evento de "Adicionar Tarefa" à nova lista
    const addTarefaBtn = listElement.querySelector('.add-tarefa');
    addTarefaBtn.addEventListener('click', () => openTaskModal(listElement));

    // Atualizar a cor do texto do botão
    updateButtonColorForList(listElement);

    // Salvar no Firestore
    AddandEditList(newList);

    closeListModal();
});


// Fecha o modal de lista ao clicar fora dele
window.addEventListener('click', (event) => {
    if (event.target === listModal) {
        closeListModal();
    }
});
// --------------------------------------Firebase-------------------------------------
// -------------------------Tarefas-------------------------
function addTaskToFirebase(task) {
    const taskId = Date.now(); // ID único baseado no timestamp
    firebase.database().ref('tasks/' + taskId).set({
        name: task.name,
        description: task.description,
        date: task.date,
        priority: task.priority,
        concluded: task.concluded
    }).then(() => {
        console.log("Tarefa adicionada com sucesso!");
    }).catch((error) => {
        console.error("Erro ao adicionar a tarefa:", error);
    });
}

function loadTasksFromFirebase() {
    firebase.database().ref('tasks/').once('value').then((snapshot) => {
        const tasks = snapshot.val(); // Dados retornados do Firebase
        console.log(tasks);
        // Aqui você pode renderizar as tarefas no DOM
    }).catch((error) => {
        console.error("Erro ao carregar tarefas:", error);
    });
}

// Função para atualizar a tarefa no Firestore
function updateTaskInFirestore(taskId, updatedTask) {
    db.collection("tasks").doc(taskId).update(updatedTask)
        .then(() => {
            console.log("Tarefa atualizada com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao atualizar tarefa:", error);
        });
}

function deleteTaskFromFirebase(taskId) {
    try {
        db.collection("tasks").doc(taskId.toString()).delete();
        console.log("Tarefa excluída com sucesso!");
        loadTasksFromFirebase();
    } catch (error) {
        console.error("Erro ao excluir tarefa:", error);
    }
}

async function loadTasksFromFirebase() {
    try {
        const querySnapshot = await db.collection("tasks").get();

        // Limpa as tarefas visíveis antes de carregar novas tarefas do Firebase
        document.querySelectorAll('.tarefas').forEach(taskListElement => {
            taskListElement.innerHTML = ''; // Limpa cada lista de tarefas no DOM
        });

        // Arrays para armazenar as tasks concluídas e não concluídas
        const completedTasks = [];
        const uncompletedTasks = [];

        // Itera sobre cada tarefa retornada
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            let taskListId = task.list; // ID da lista a qual a tarefa pertence

            // Verificar se a lista é nula ou indefinida e, nesse caso, definir como "Criadas"
            if (!taskListId) {
                console.warn(`Tarefa sem 'listId'. Atribuindo à lista 'Criadas'.`);
                const createdListElement = document.querySelector('.lista[data-list-id="criadas"]');
                taskListId = createdListElement ? 'criadas' : null;
            }

            // Criar o card da tarefa
            const tarefa = document.createElement('div');
            tarefa.classList.add('tarefa');
            tarefa.setAttribute('data-task-id', task.id);
            
            if (task.concluded) {
                tarefa.classList.add('concluido');
            }

            tarefa.innerHTML = `
                <div class="task-header">
                    <span class="edit-icon">&#9998;</span>
                    <span class="delete-icon">&#128465;</span>
                </div>
                <h3>${task.name}</h3>
                <p><strong>Data:</strong> ${task.date.split('-').reverse().join('/')}</p> 
                <p class="priority ${task.priority.toLowerCase()}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
                <label>
                    <input type="checkbox" class="checkbox-concluido" ${task.concluded ? 'checked' : 'disabled'} disabled>
                    Concluído
                </label>
            `;

            // Adicionar o evento de edição
            tarefa.querySelector('.edit-icon').addEventListener('click', () => {
                openEditModal(task.name, task.description, task.date, task.priority, tarefa, task.concluded);
            });

            // Adicionar o evento de exclusão
            tarefa.querySelector('.delete-icon').addEventListener('click', () => {
                deleteTaskFromFirebase(task.id);
            });

            // Adicionar evento de checkbox
            tarefa.querySelector('.checkbox-concluido').addEventListener('change', (event) => {
                if (event.target.checked) {
                    tarefa.classList.add('concluido');
                } else {
                    tarefa.classList.remove('concluido');
                }
            });

            // Adicionar ao array correto (concluída ou não concluída)
            if (task.concluded) {
                completedTasks.push({ tarefa, taskListId });
            } else {
                uncompletedTasks.push({ tarefa, taskListId });
            }
        });

        // Adiciona as tasks não concluídas primeiro
        uncompletedTasks.forEach(({ tarefa, taskListId }) => {
            const targetList = document.querySelector(`.lista[data-list-id='${taskListId}']`);
            if (targetList) {
                targetList.querySelector('.tarefas').appendChild(tarefa);
            } else {
                console.error(`Lista com ID ${taskListId} não encontrada no DOM.`);
            }
        });

        // Adiciona as tasks concluídas depois
        completedTasks.forEach(({ tarefa, taskListId }) => {
            const targetList = document.querySelector(`.lista[data-list-id='${taskListId}']`);
            if (targetList) {
                targetList.querySelector('.tarefas').appendChild(tarefa);
            } else {
                console.error(`Lista com ID ${taskListId} não encontrada no DOM.`);
            }
        });

        console.log("Tarefas carregadas e adicionadas às listas corretamente!");
    } catch (error) {
        console.error("Erro ao buscar todas as tarefas: ", error);
    }
}


// Função para buscar todas as tarefas de uma lista pelo ID da lista no Firebase
const getTasksByListId = async (listId) => {
    try {
        const querySnapshot = await db.collection("tasks").where("listId", "==", listId).get();
        const tasks = [];
        querySnapshot.forEach((doc) => {
            const task = { id: doc.id, ...doc.data() };
            tasks.push(task);
        });
        return tasks;
    } catch (error) {
        console.error("Erro ao buscar tarefas pelo ID da lista: ", error);
    }
};

// Função para buscar a lista ativa de uma tarefa
const getListByTaskId = async (taskId) => {
    try {
        // Busca a tarefa pelo ID
        const taskDoc = await db.collection("tasks").doc(taskId).get();
        
        if (!taskDoc.exists) {
            console.error(`Tarefa com ID ${taskId} não encontrada.`);
            return null;
        }
        
        // Obtém a referência à lista da tarefa e converte o ID para número
        const taskData = taskDoc.data();
        const listId = Number(taskData.list); // Converte para número
        console.log(listId);

        if (isNaN(listId)) {
            console.error("ID da lista inválido na tarefa.");
            return null;
        }
        
        // Busca a lista onde o ID é igual ao `listId` convertido
        const listQuery = await db.collection("lists").where("id", "==", listId).get();
        // console.log(`${listQuery.docs[0].id}`);

        // Extrai e retorna a lista encontrada
        if (!listQuery.empty) {
            const listDoc = listQuery.docs[0];
            // console.log(`Lista encontrada: ID - ${listQuery.docs[0].id}, Nome - ${listQuery.docs[0].name}, Cor - ${listQuery.docs[0].color}`);
            // console.log(listQuery.docs[0].id);
            return String(listDoc.id);
        } else {
            console.error(`Lista com ID ${listId} não encontrada.`);
            return null;
        }

    } catch (error) {
        console.error("Erro ao buscar lista ativa pela ID da tarefa: ", error);
    }
};

// Função para buscar a lista ativa de uma tarefa
const getListColorByTaskId = async (taskId) => {
    try {
        // Busca a tarefa pelo ID
        const taskDoc = await db.collection("tasks").doc(taskId).get();
        
        if (!taskDoc.exists) {
            console.error(`Tarefa com ID ${taskId} não encontrada.`);
            return null;
        }
        
        // Obtém a referência à lista da tarefa e converte o ID para número
        const taskData = taskDoc.data();
        const listId = Number(taskData.list); // Converte para número
        // console.log(listId);

        if (isNaN(listId)) {
            console.error("ID da lista inválido na tarefa.");
            return null;
        }
        
        // Busca a lista onde o ID é igual ao `listId` convertido
        const listQuery = await db.collection("lists").where("id", "==", listId).get();
        // console.log(`${listQuery.docs[0].color}`);

        // Extrai e retorna a lista encontrada
        if (!listQuery.empty) {
            const listDoc = listQuery.docs[0];
            // console.log(`Lista encontrada: ID - ${listQuery.docs[0].id}, Nome - ${listQuery.docs[0].name}, Cor - ${listQuery.docs[0].color}`);
            // console.log(listQuery.docs[0].id);
            return String(listDoc.data().color);
        } else {
            console.error(`Lista com ID ${listId} não encontrada.`);
            return null;
        }

    } catch (error) {
        console.error("Erro ao buscar lista ativa pela ID da tarefa: ", error);
    }
};

// Carregar as listas e suas tarefas quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
    getDatabase();
});

function getDatabase(){
    // 1. Primeiramente as listas são carregadas
    loadListsFromFirebase().then(() => {
        // 2. Após carregar as listas, carregar as tarefas e colocá-las em suas respectivas listas
        loadTasksFromFirebase();
    });
}

const AddandEditTask = async (task) => {
    try {
        await db.collection("tasks").doc(task.id.toString()).set(task);
        console.log("Documento adicionado ou editado com sucesso!");
    } catch (error) {
        console.error("Erro ao adicionar ou editar documento:", error);
    }
};