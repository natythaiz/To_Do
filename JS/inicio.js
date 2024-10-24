// Função para salvar as listas de tarefas no LocalStorage
function saveTasksToLocalStorage(taskLists) {
    localStorage.setItem('taskLists', JSON.stringify(taskLists)); // Converte o objeto para JSON e salva no LocalStorage
}

// Função para carregar as tarefas do LocalStorage
function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('taskLists');
    return storedTasks ? JSON.parse(storedTasks) : {}; // Se houver dados, retorna o objeto JSON, caso contrário, um objeto vazio
}

// Inicializa as listas de tarefas carregadas do LocalStorage
let taskLists = loadTasksFromLocalStorage();

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

// Funções para trabalhar com LocalStorage
function saveTasksToLocalStorage(taskLists) {
    localStorage.setItem('taskLists', JSON.stringify(taskLists));
}

function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('taskLists');
    return storedTasks ? JSON.parse(storedTasks) : {};
}

// ----------------------------------ADICIONAR TAREFA--------------------------------------------------------------------------
// Seleciona os elementos necessários para tarefas
const taskModal = document.getElementById('taskModal'); // Modal de tarefa
const cancelBtn = document.querySelector('.cancel-btn'); // Botão de cancelar tarefa
const taskForm = document.getElementById('taskForm'); // Formulário de tarefa
const overlay = document.getElementById('overlay'); // Overlay do modal de tarefa

let activeList = null; // Lista ativa onde a tarefa será inserida
let currentTask = null; // Variável que armazena a tarefa sendo editada

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
function saveTask(event) {
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

    const priorityClass = taskPriority.toLowerCase();
    const listId = activeList.getAttribute('data-list-id');

    if (currentTask) {
        console.log(formattedDate);
        // Editar tarefa existente
        const taskId = currentTask.getAttribute('data-task-id');
        currentTask.querySelector('h3').textContent = taskName;
        currentTask.querySelector('.priority').textContent = taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1);
        currentTask.querySelector('.priority').className = `priority ${priorityClass}`;
        currentTask.querySelector('p').textContent = `Data: ${formattedDate}`; // Exibe a data formatada no cartão
        currentTask.querySelector('.checkbox-concluido').checked = isConcluded;

        // Atualizar no localStorage
        taskLists[listId] = taskLists[listId].map(task => {
            if (task.id === parseInt(taskId)) {
                task.name = taskName;
                task.description = taskDescription;
                task.date = taskDate; // Mantém o formato yyyy-mm-dd para armazenamento
                task.priority = taskPriority;
                task.concluded = isConcluded;
            }
            return task;
        });

        saveTasksToLocalStorage(taskLists);
        currentTask = null;
        console.log("Tarefa editada: ", taskDate, taskName, taskDescription);
    } else {
        // Criar nova tarefa
        const taskId = Date.now();
        const newTask = {
            id: taskId,
            name: taskName,
            description: taskDescription,
            date: taskDate, // Armazena a data no formato yyyy-mm-dd
            priority: taskPriority,
            concluded: isConcluded
        };

        const tarefa = document.createElement('div');
        tarefa.classList.add('tarefa');
        tarefa.setAttribute('data-task-id', taskId);
        tarefa.innerHTML = `
            <div class="task-header">
                <span class="edit-icon">&#9998;</span>
                <span class="delete-icon">&#128465;</span>
            </div>
            <h3>${taskName}</h3>
            <p><strong>Data:</strong> ${formattedDate}</p> <!-- Exibe a data formatada -->
            <p class="priority ${priorityClass}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</p>
            <label>
                <input type="checkbox" class="checkbox-concluido" ${isConcluded ? 'checked' : ''}>
                Concluído
            </label>
        `;

        // Função de editar
        const editIcon = tarefa.querySelector('.edit-icon');
        editIcon.addEventListener('click', () => {
            openEditModal(taskName, taskDescription, taskDate, taskPriority, tarefa, isConcluded);
        });

        // Função de excluir
        const deleteIcon = tarefa.querySelector('.delete-icon');
        deleteIcon.addEventListener('click', () => {
            deleteTask(tarefa, listId, taskId);
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

        if (!taskLists[listId]) {
            taskLists[listId] = [];
        }
        taskLists[listId].push(newTask);
        saveTasksToLocalStorage(taskLists);

        activeList.querySelector('.tarefas').appendChild(tarefa);
        console.log("Tarefa adicionada: ", taskDate, taskName, taskDescription);
    }

    closeTaskModal();
}

// Função para abrir o modal de edição
function openEditModal(name, description, date, priority, tarefa, isConcluded) {
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

    // Resetar o formulário e limpar a referência à tarefa atual
    taskForm.reset();
    currentTask = null; // Limpa a referência da tarefa atual
}



// Função para deletar uma tarefa
function deleteTask(taskElement, listId, taskId) {
    taskElement.remove();
    taskLists[listId] = taskLists[listId].filter(task => task.id !== taskId);
    saveTasksToLocalStorage(taskLists);
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

// Evento para salvar nova lista
listForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const listName = document.getElementById('listName').value;
    const listColor = document.getElementById('listColor').value;
    const listId = Date.now();

    const newList = document.createElement('div');
    newList.classList.add('lista');
    newList.setAttribute('data-list-id', listId);
    newList.style.backgroundColor = listColor;

    newList.innerHTML = `
    <div class="list-header">
        <span class="edit-list-icon">&#9998;</span> <!-- Ícone de edição -->
        <h2>${listName}</h2>
        <span class="delete-list-icon">&#128465;</span> <!-- Ícone de exclusão -->
    </div>
    <div class="tarefas"></div>
    <button class="add-tarefa">Adicionar Tarefa</button>
    `;

    scrollableSection.appendChild(newList);

    // Adicionar evento de "Adicionar Tarefa" à nova lista
    const addTarefaBtn = newList.querySelector('.add-tarefa');
    addTarefaBtn.addEventListener('click', () => openTaskModal(newList));

    // Função de editar a lista
    const editListIcon = newList.querySelector('.edit-list-icon');
    editListIcon.addEventListener('click', () => {
        // Função para editar a lista (nome ou cor)
        editList(newList);
    });

    // Função de excluir a lista
    const deleteListIcon = newList.querySelector('.delete-list-icon');
    deleteListIcon.addEventListener('click', () => {
        // Função para excluir a lista
        deleteList(newList, listId);
    });

    // Atualizar a cor do texto do botão
    updateButtonColorForList(newList);

    taskLists[listId] = [];
    saveTasksToLocalStorage(taskLists);

    closeListModal();
});

// Função para editar a lista
function editList(listElement) {
    const listName = prompt("Editar o nome da lista:", listElement.querySelector('h2').textContent);
    if (listName !== null) {
        listElement.querySelector('h2').textContent = listName;
    }
}

// Função para excluir a lista
function deleteList(listElement, listId) {
    listElement.remove();
    delete taskLists[listId]; // Remove a lista do localStorage
    saveTasksToLocalStorage(taskLists);
}

// Fecha o modal de lista ao clicar fora dele
window.addEventListener('click', (event) => {
    if (event.target === listModal) {
        closeListModal();
    }
});
// --------------------------------------Firebase-------------------------------------
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

function updateTaskInFirebase(taskId, updatedTask) {
    firebase.database().ref('tasks/' + taskId).update(updatedTask)
    .then(() => {
        console.log("Tarefa atualizada com sucesso!");
    })
    .catch((error) => {
        console.error("Erro ao atualizar tarefa:", error);
    });
}

function deleteTaskFromFirebase(taskId) {
    firebase.database().ref('tasks/' + taskId).remove()
    .then(() => {
        console.log("Tarefa excluída com sucesso!");
    })
    .catch((error) => {
        console.error("Erro ao excluir tarefa:", error);
    });
}
