document.addEventListener("DOMContentLoaded", () => {
  const pageContentLoader = document.getElementById("dynamic-page");
  const allNavLinks = document.querySelectorAll(
    "#navbar-lista-superior a, .nav-block"
  );

  // ** MAPEA OS IDENTIFICADORES DO data-page PARA OS CAMINHOS REAIS DOS ARQUIVOS **
  const pagePaths = {
    home: "src/pages/home.html",
    formacao: "src/pages/formation.html",
    cursos: "src/pages/courses.html",
    projetos: "src/pages/projects.html",
    sobremim: "src/pages/aboutMe.html",
  };

  // * Rastrear a última página visitada *
  let lastPageIdentifier = "";
  const basePageTitle = "Meu Portfólio"; //título base

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

      // * 1. * .active no navbar
      // Marcador da navbar quando é selecionado
      // remove a classe active que a tenha no momento
      const currentActiveLi = document.querySelector(
        "#navbar-lista-superior li.active"
      );
      if (currentActiveLi) {
        currentActiveLi.classList.remove("active");
      }

      //adiciona a classe active
      const newActiveLink = document.querySelector(
        `#navbar-lista-superior a[data-page="${pageIdentifier}"]`
      );
      if (newActiveLink && newActiveLink.parentElement.tagName === "LI") {
        //adiciona a classe
        newActiveLink.parentElement.classList.add("active");
      }
      // ** Fim da lógica do active

      // * 2. * Mudar título da aba do navegador
      let newTitle = "";
      if (pageIdentifier === "home") {
        if (lastPageIdentifier !== "home" && lastPageIdentifier !== "") {
          //se está indo pra home e a página anterior era outra, mosta a mensagem especial
          newTitle = `Bem vindo(a) de volta à Home! | ${basePageTitle}`;
        } else {
          newTitle = `Home | ${basePageTitle}`; //Primeira vez na home ou recarregou o site
        }
      } else {
        //primeira letra maiúscula
        const capitalizedIdentifier =
          pageIdentifier.charAt(0).toUpperCase() + pageIdentifier.slice(1);
        newTitle = `${capitalizedIdentifier} | ${basePageTitle}`;
      }

      document.title = newTitle; //atualiza o título

      lastPageIdentifier = pageIdentifier; //atualiza o lastpageidentifier depois do carregamento

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
