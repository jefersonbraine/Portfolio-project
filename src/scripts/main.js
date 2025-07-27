document.addEventListener("DOMContentLoaded", () => {
  const pageContentLoader = document.getElementById("dynamic-page");
  const allNavLinks = document.querySelectorAll("#navbar-lista-superior a, .nav-block");

  // ** MAPEA OS IDENTIFICADORES DO data-page PARA OS CAMINHOS REAIS DOS ARQUIVOS **
  const pagePaths = {
    home: "src/pages/home.html",
    formacao: "src/pages/formation.html",
    educacao: "src/pages/education.html",
    projetos: "src/pages/projects.html",
    sobremim: "src/pages/aboutMe.html",
  };

  // * Função para carregar o conteúdo de uma página *
  async function loadPage(pageIdentifier) {
    // * Agora recebe o identificador (ex: 'home', 'formacao') *
    const filePath = pagePaths[pageIdentifier]; // * Pega o caminho real do arquivo pelo mapeamento *

    if (!filePath) {
      console.error(
        `Caminho não encontrado para o identificador: ${pageIdentifier}`
      );
      pageContentLoader.innerHTML = `<p style="text-align: center; color: red;">Página não encontrada.</p>`;
      return;
    }

    try {
      const response = await fetch(filePath); // * Usa o caminho real do arquivo *
      if (!response.ok) {
        throw new Error(`Erro ao carregar ${filePath}: ${response.statusText}`);
      }
      const htmlContent = await response.text();
        pageContentLoader.innerHTML = htmlContent;
        
        // ** .active no navbar
        // Marcador da navbar quando é selecionado
        // remove a classe active que a tenha no momento
        const currentActiveLi = document.querySelector('#navbar-lista-superior li.active');
        if (currentActiveLi) {
            currentActiveLi.classList.remove('active');
        }

        //adiciona a classe active
        const newActiveLink = document.querySelector(`#navbar-lista-superior a[data-page="${pageIdentifier}"]`);
        if (newActiveLink && newActiveLink.parentElement.tagName === "LI") {
            //adiciona a classe
            newActiveLink.parentElement.classList.add('active');
        }
        // ** Fim da lógica do active

      // * Atualiza a URL do navegador sem recarregar a página *
      history.pushState({ page: pageIdentifier }, "", `#${pageIdentifier}`);
    } catch (error) {
      console.error("Erro ao carregar a página:", error);
      pageContentLoader.innerHTML = `<p style="text-align: center; color: red;">Não foi possível carregar o conteúdo de ${pageIdentifier}.</p>`;
    }
  }

  // * Adiciona event listeners aos links de navegação *
  allNavLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const pageIdentifier = link.dataset.page; // * Obtém o identificador do data-page *
      loadPage(pageIdentifier);
    });
  });

  // * Lida com a navegação pelo botão "Voltar/Avançar" do navegador *
  window.addEventListener("popstate", (event) => {
    const pageIdentifierFromHash = window.location.hash.substring(1);
    if (pageIdentifierFromHash) {
      loadPage(pageIdentifierFromHash);
    } else {
      loadPage("home"); // *Carrega 'home' se não houver hash*
    }
  });

  // * Carrega a página inicial ao carregar o site (baseado no hash ou Home padrão) *
  const initialPageIdentifier = window.location.hash.substring(1);
  if (initialPageIdentifier) {
    loadPage(initialPageIdentifier);
  } else {
    loadPage("home"); // * Carrega 'home' por padrão *
  }
});
