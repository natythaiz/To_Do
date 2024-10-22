// Seleciona todos os botões com a classe 'nav-btn'
const navButtons = document.querySelectorAll('.nav-btn')

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove a classe 'active' de todos os botões
        navButtons.forEach(btn => btn.classList.remove('active'))

        // Adiciona a classe 'active' apenas ao botão clicado
        button.classList.add('active')
    })
})

//Função para ativar cor no botão selecionado
document.addEventListener('DOMContentLoaded', () => {
    // Obtém o caminho completo da URL atual
    const currentPath = window.location.pathname

    // Extrai o nome do arquivo, por exemplo: 'inicio.html', 'calendario.html', etc.
    const page = currentPath.substring(currentPath.lastIndexOf('/') + 1)

    // Mapeia páginas aos IDs dos botões
    const buttonMap = {
        'index.html': 'btn-inicio',
        'calendario.html': 'btn-calendario',
        'hoje.html': 'btn-hoje',
        'filtro.html': 'btn-filtro'
    }

    // Verifica se a página atual corresponde a um botão no mapa
    if (buttonMap[page]) {
        // Seleciona o botão e adiciona a classe 'active'
        const activeButton = document.getElementById(buttonMap[page])
        if (activeButton) {
            activeButton.classList.add('active') // Destaca o botão da página atual
        }
    } else {
        // Se estiver na página inicial padrão (ex: index.html), adicionar a classe ao botão "Início"
        const homeButton = document.getElementById('btn-inicio')
        if (homeButton) {
            homeButton.classList.add('active')
        }
    }
})
// ----------------------------------ADICIONAR TAREFA--------------------------------------------------------------------------
// Seleciona os elementos necessários
const addListButton = document.getElementById('add-list-button');
const closeModal = document.querySelector('.close');
let activeButton = null;
const taskModal = document.getElementById('taskModal');
const cancelBtn = document.querySelector('.cancel-btn');
const taskForm = document.getElementById('taskForm');
const scrollableSection = document.querySelector('.scrollable-section');
const overlay = document.getElementById('overlay');

let activeList = null; // Lista ativa onde a tarefa será inserida
let currentTask = null; // Variável que armazena a tarefa sendo editada

// Função para abrir o modal
function openTaskModal(list) {
    activeList = list; // Define a lista ativa
    taskModal.style.display = 'flex';
    overlay.style.display = 'block';
}

// Função para fechar o modal
function closeTaskModal() {
    taskModal.style.display = 'none';
    overlay.style.display = 'none';
    taskForm.reset();
    currentTask = null; // Limpa a referência da tarefa atual para criação de novas
}

// Função que captura os dados e adiciona ou edita a tarefa
function saveTask(event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    // Captura os valores preenchidos no formulário
    let taskName = document.getElementById('taskName').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const taskDate = document.getElementById('taskDate').value;
    const taskPriority = document.getElementById('taskPriority').value;

    // Verifica se o checkbox existe
    const concluidoCheckbox = document.getElementById('concluidoCheckbox');
    let isConcluded = false;
    if (concluidoCheckbox) {
        isConcluded = concluidoCheckbox.checked;
    }

    // Limitar o nome da tarefa a 30 caracteres
    const maxTitleLength = 30;
    if (taskName.length > maxTitleLength) {
        taskName = taskName.substring(0, maxTitleLength) + '...';
    }

    // Formatar a data de yyyy-mm-dd para dd/mm
    const [year, month, day] = taskDate.split('-');
    const formattedDate = `${day}/${month}`;

    // Defina a cor da prioridade com base no valor
    const priorityClass = taskPriority.toLowerCase();

    // Se estamos editando uma tarefa existente (currentTask NÃO é nulo)
    if (currentTask) {
        // Atualiza os campos da tarefa existente
        currentTask.querySelector('h3').textContent = taskName;
        currentTask.querySelector('.priority').textContent = taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1);
        currentTask.querySelector('.priority').className = `priority ${priorityClass}`;
        currentTask.querySelector('p strong').textContent = `Data: ${formattedDate}`;
        currentTask.querySelector('.checkbox-concluido').checked = isConcluded;

        // Atualiza o estado do checkbox no card da tarefa
        const checkbox = currentTask.querySelector('.checkbox-concluido');
        checkbox.checked = isConcluded;

        if (isConcluded) {
            currentTask.classList.add('concluido');
        } else {
            currentTask.classList.remove('concluido');
        }

        // Limpa a referência da tarefa após edição
        currentTask = null;
    } else {
        // Se NÃO estamos editando, cria uma nova tarefa
        const tarefa = document.createElement('div');
        tarefa.classList.add('tarefa');
        tarefa.innerHTML = `
            <h3>${taskName}</h3>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p class="priority ${priorityClass}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</p>
            <label>
                <input type="checkbox" class="checkbox-concluido" ${isConcluded ? 'checked' : ''}>
                Concluído
            </label>
            <span class="edit-icon">&#9998;</span>
        `;

        // Adiciona o evento de edição ao ícone
        const editIcon = tarefa.querySelector('.edit-icon');
        editIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            openEditModal(taskName, taskDescription, taskDate, taskPriority, tarefa, isConcluded);
        });

        // Adiciona o evento para o checkbox de "Concluído"
        const checkbox = tarefa.querySelector('.checkbox-concluido');
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                tarefa.classList.add('concluido');
            } else {
                tarefa.classList.remove('concluido');
            }
        });

        // Adiciona a tarefa à lista ativa
        if (activeList) {
            activeList.querySelector('.tarefas').appendChild(tarefa);
        } else {
            console.error("Lista ativa não está definida.");
        }
    }

    // Fecha o modal e reseta o formulário
    closeTaskModal();
}

// Função para abrir o modal de edição ao clicar no card
function openEditModal(name, description, date, priority, tarefa, isConcluded) {
    taskModal.style.display = 'flex';
    overlay.style.display = 'block';

    // Preenche o modal com os valores da tarefa existente
    document.getElementById('taskName').value = name;
    document.getElementById('taskDescription').value = description;
    document.getElementById('taskDate').value = date;
    document.getElementById('taskPriority').value = priority;
    document.getElementById('concluidoCheckbox').checked = isConcluded;

    // Armazena a referência da tarefa que está sendo editada
    currentTask = tarefa;
}
// Eventos para os botões de cancelar e fechar modal
if (cancelBtn) {
    cancelBtn.addEventListener('click', closeTaskModal);
}

if (closeModal) {
    closeModal.addEventListener('click', closeTaskModal);
}

// Evento para o formulário salvar a tarefa
if (taskForm) {
    taskForm.addEventListener('submit', saveTask);
}
// ----------------------------------ADICIONAR Lista--------------------------------------------------------------------------
// Elementos de modal e formulário
const listModal = document.getElementById('listModal');
const listForm = document.getElementById('listForm');
const listNameInput = document.getElementById('listName');
const listColorInput = document.getElementById('listColor');
const closeListModalBtn = document.querySelector('.close-modal');
const saveListBtn = document.querySelector('.save-list-btn');
const cancelBtnList = document.querySelector('.cancel-btn-list');

// Função para abrir o modal de nova lista
function openListModal() {
  listModal.style.display = 'block';
}

// Função para fechar o modal
function closeListModal() {
  listModal.style.display = 'none';
  listForm.reset(); // Reseta o formulário ao fechar
}

// Evento para abrir o modal quando "+ Lista" for clicado
document.querySelector('.add-lista button').addEventListener('click', openListModal);

// Fechar modal ao clicar no "X"
closeListModalBtn.addEventListener('click', closeListModal);

// Fechar modal ao clicar fora dele
window.addEventListener('click', (event) => {
  if (event.target === listModal) {
    closeListModal();
  }
});

// Função para salvar a nova lista com nome e cor
listForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Evitar o comportamento padrão do formulário
  
  const listName = listNameInput.value;
  const listColor = listColorInput.value;

  // Cria a nova lista com o nome e cor selecionados
  const newList = document.createElement('div');
  newList.classList.add('lista');
  newList.style.backgroundColor = listColor; // Aplica a cor de fundo
  
  newList.innerHTML = `
    <h2>${listName}</h2>
    <div class="tarefas"></div> <!-- Contêiner para as tarefas -->
    <button class="add-tarefa">Adicionar Tarefa</button>
  `;

  // Adiciona a nova lista na área de listas
  document.querySelector('.scrollable-section').appendChild(newList);

  // Fecha o modal após criar a lista
  closeListModal();

  // Função para abrir o modal de tarefa ao clicar em "Adicionar Tarefa"
  const addTarefaBtn = newList.querySelector('.add-tarefa');
  addTarefaBtn.addEventListener('click', () => openTaskModal(newList));
});

if (cancelBtnList) {
    cancelBtnList.addEventListener('click', closeListModal);
}

// Verificar se a lista criada está disponível e adicionar funcionalidade
const listaCriadas = document.querySelector('.lista-criadas');
if (listaCriadas) {
    const addTarefaCriadasBtn = listaCriadas.querySelector('.add-tarefa');
    if (addTarefaCriadasBtn) {
        addTarefaCriadasBtn.addEventListener('click', () => openTaskModal(listaCriadas));
    }
}


