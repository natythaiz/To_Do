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

//Função para logout
const buttonsLogout = document.querySelectorAll("logout")
buttonsLogout.forEach((button)=> {
    button.addEventListener("click", async () => {
        try {
            await auth.signOut();
            alert("Logout realizado com sucesso!");
            displayUserInfo(null);
        } catch (error) {
            alert("Erro ao sair: " + error.message);
        }
    })
} );