// * SCRIPT PRINCIPAL - SITE SPA*
// * Gerencia a navegação entre páginas sem recarregar o site
document.addEventListener("DOMContentLoaded", () => {
  // * ELEMENTOS DO DOM *
  const pageContentLoader = document.getElementById("dynamic-page"); //* Aonde o conteúdo das páginas será carregado
  const allNavLinks = document.querySelectorAll(
    "#navbar-lista-superior a, .nav-block" //* Todos os links de navegação (navbar superior e blocos de navegação)
  );

  // ** MAPEIA OS IDENTIFICADORES PARA OS CAMINHOS DOS HTMLs **
  // Cada identificador (data-page) corresponde ao caminho real do arquivo HTML
  const pagePaths = {
    home: "src/pages/home.html",
    formacao: "src/pages/formation.html",
    cursos: "src/pages/courses.html",
    projetos: "src/pages/projects.html",
    sobremim: "src/pages/aboutMe.html",
    contacteme: "src/pages/contactMe.html",
  };

  // * VARIÁVEIS DE CONTROLE *
  let lastPageIdentifier = ""; // Armazena a última página visitada para lógica especial
  const basePageTitle = "Meu Portfólio"; // Título base que aparecerá em todas as páginas

  // * FUNÇÃO PRINCIPAL: CARREGAMENTO DE PÁGINAS *
  // Recebe o identificador da página e carrega seu conteúdo dinamicamente
  async function loadPage(pageIdentifier) {
    // * VALIDA O CAMINHO *
    const filePath = pagePaths[pageIdentifier]; // Obtém o caminho real do arquivo pelo mapeamento

    if (!filePath) {
      console.error(
        `Caminho não encontrado para o identificador: ${pageIdentifier}`
      );
      pageContentLoader.innerHTML = `<p style="text-align: center; color: red;">Página não encontrada.</p>`;
      return;
    }

    try {
      // * CARREGAMENTO DO CONTEÚDO HTML *
      const response = await fetch(filePath); // Faz requisição para o arquivo HTML
      if (!response.ok) {
        throw new Error(`Erro ao carregar ${filePath}: ${response.statusText}`);
      }
      const htmlContent = await response.text();
      pageContentLoader.innerHTML = htmlContent; // Insere o conteúdo

      // * 1. ATUALIZAÇÃO DO ESTADO ATIVO NA NAVBAR *
      // Remove a classe 'active' do item atualmente selecionado
      const currentActiveLi = document.querySelector(
        "#navbar-lista-superior li.active"
      );
      if (currentActiveLi) {
        currentActiveLi.classList.remove("active");
      }

      // Adiciona a classe 'active' ao novo item selecionado
      const newActiveLink = document.querySelector(
        `#navbar-lista-superior a[data-page="${pageIdentifier}"]`
      );
      if (newActiveLink && newActiveLink.parentElement.tagName === "LI") {
        newActiveLink.parentElement.classList.add("active");
      }
      // ** Fim da lógica do active

      // * 2. ATUALIZAÇÃO DO TÍTULO DA ABA DO NAVEGADOR *
      let newTitle = "";
      if (pageIdentifier === "home") {
        // Lógica especial para a página home
        if (lastPageIdentifier !== "home" && lastPageIdentifier !== "") {
          // Se está indo para home e a página anterior era outra, mostra mensagem especial
          newTitle = `Bem vindo(a) de volta à Home! | ${basePageTitle}`;
        } else {
          // Primeira vez na home ou recarregou o site
          newTitle = `Home | ${basePageTitle}`;
        }
      } else {
        // Para outras páginas: primeira letra maiúscula + título base
        const capitalizedIdentifier =
          pageIdentifier.charAt(0).toUpperCase() + pageIdentifier.slice(1);
        newTitle = `${capitalizedIdentifier} | ${basePageTitle}`;
      }

      // * 3. CONFIGURAÇÃO DO FORMULÁRIO DE CONTATO*
      document.title = newTitle; // Atualiza o título da aba

      if (pageIdentifier === "contacteme") {
        const form = document.getElementById("contact-form");
        if (form) {
          // Remove listeners anteriores para evitar duplicação
          const newForm = form.cloneNode(true);
          form.replaceWith(newForm);

          // Adiciona listener para o evento de submissão
          newForm.addEventListener("submit", function (event) {
            // Impede o comportamento padrão de envio do formulário
            event.preventDefault();
            // Exibe o alerta
            alert(
              "O envio do formulário ainda está sendo implementado. Por favor, entre em contato por outros meios."
            );
          });
        }
      }

      // * ATUALIZAÇÃO DO CONTROLE DE HISTÓRICO *
      lastPageIdentifier = pageIdentifier; // Atualiza o identificador da última página

      // * ATUALIZAÇÃO DA URL DO NAVEGADOR *
      // Modifica a URL sem recarregar a página
      history.pushState({ page: pageIdentifier }, "", `#${pageIdentifier}`);
    } catch (error) {
      // * TRATAMENTO DE ERROS *
      console.error("Erro ao carregar a página:", error);
      pageContentLoader.innerHTML = `<p style="text-align: center; color: red;">Não foi possível carregar o conteúdo de ${pageIdentifier}.</p>`;
    }
  }

  // * CONFIGURAÇÃO DOS EVENT LISTENERS PARA NAVEGAÇÃO *
  // Adiciona listeners de clique nos elementos li da navbar
  const navbarItems = document.querySelectorAll("#navbar-lista-superior li");
  navbarItems.forEach((li) => {
    li.addEventListener("click", (event) => {
      event.preventDefault(); // Previne o comportamento padrão
      const link = li.querySelector("a"); // Encontra o link dentro do li
      if (link) {
        const pageIdentifier = link.dataset.page; // Obtém o identificador do data-page
        loadPage(pageIdentifier); // Carrega a página correspondente
      }
    });
  });

  // * NAVEGAÇÃO PELOS BOTÕES VOLTAR/AVANÇAR DO NAVEGADOR *
  // Gerencia a navegação quando o usuário usa os botões do navegador
  window.addEventListener("popstate", (event) => {
    const pageIdentifierFromHash = window.location.hash.substring(1); // Remove o '#' do hash
    if (pageIdentifierFromHash) {
      loadPage(pageIdentifierFromHash); // Carrega a página do hash
    } else {
      loadPage("home"); // Carrega 'home' se não houver hash
    }
  });

  // * CARREGAMENTO INICIAL DA PÁGINA *
  // Determina qual página carregar quando o site é acessado pela primeira vez
  const initialPageIdentifier = window.location.hash.substring(1);
  if (initialPageIdentifier) {
    // Se há um hash na URL, carrega a página correspondente
    loadPage(initialPageIdentifier);
  } else {
    // Se não há hash, carrega a página home por padrão
    loadPage("home");
  }
});


