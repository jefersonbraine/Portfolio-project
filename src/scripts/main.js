// * SCRIPT PRINCIPAL - SITE SPA*
// * Gerencia a navegação entre páginas sem recarregar o site

// * FUNÇÕES DE VALIDAÇÃO *
// Validação de e-mail usando regex mais robusta
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Validação de telefone brasileiro (aceita vários formatos)
function validatePhone(phone) {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, "");

  // Verifica se tem entre 10 e 11 dígitos (com ou sem DDD)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return false;
  }

  // Verifica se é um DDD válido (11 a 99)
  const ddd = cleanPhone.substring(0, 2);
  if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
    return false;
  }

  // Verifica se é celular (9 no segundo dígito quando tem 11 dígitos)
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== "9") {
    return false;
  }

  return true;
}

// Função para formatar telefone automaticamente
function formatPhone(input) {
  let value = input.value.replace(/\D/g, "");

  if (value.length <= 2) {
    input.value = value;
  } else if (value.length <= 6) {
    input.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
  } else if (value.length <= 10) {
    input.value = `(${value.substring(0, 2)}) ${value.substring(
      2,
      6
    )}-${value.substring(6)}`;
  } else if (value.length <= 11) {
    input.value = `(${value.substring(0, 2)}) ${value.substring(
      2,
      7
    )}-${value.substring(7)}`;
  }
}

// Função para mostrar mensagem de erro
function showError(input, message) {
  const formGroup = input.closest(".form-group");
  const existingError = formGroup.querySelector(".error-message");

  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.color = "#ff4444";
  errorDiv.style.fontSize = "0.875rem";
  errorDiv.style.marginTop = "0.25rem";

  formGroup.appendChild(errorDiv);
  input.style.borderColor = "#ff4444";
}

// Função para remover mensagem de erro
function removeError(input) {
  const formGroup = input.closest(".form-group");
  const existingError = formGroup.querySelector(".error-message");

  if (existingError) {
    existingError.remove();
  }

  input.style.borderColor = "";
  input.classList.remove("error");
}

// Função para mostrar feedback positivo
function showSuccess(input) {
  const formGroup = input.closest(".form-group");
  const existingSuccess = formGroup.querySelector(".success-message");

  if (existingSuccess) {
    existingSuccess.remove();
  }

  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = "✓ Válido";
  successDiv.style.color = "#22c55e";
  successDiv.style.fontSize = "0.875rem";
  successDiv.style.marginTop = "0.25rem";

  formGroup.appendChild(successDiv);
  input.style.borderColor = "#22c55e";
  input.classList.add("success");
}

// Função para validar o formulário completo
function validateForm(form) {
  let isValid = true;

  // Validação do e-mail
  const emailInput = form.querySelector("#email");
  if (emailInput && emailInput.value.trim()) {
    if (!validateEmail(emailInput.value.trim())) {
      showError(emailInput, "Por favor, insira um e-mail válido");
      isValid = false;
    } else {
      removeError(emailInput);
    }
  }

  // Validação do telefone (se preenchido)
  const phoneInput = form.querySelector("#phone");
  if (phoneInput && phoneInput.value.trim()) {
    if (!validatePhone(phoneInput.value.trim())) {
      showError(
        phoneInput,
        "Por favor, insira um telefone válido (formato: (99) 99999-9999)"
      );
      isValid = false;
    } else {
      removeError(phoneInput);
    }
  }

  return isValid;
}

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

          // * CONFIGURAÇÃO DAS VALIDAÇÕES EM TEMPO REAL *
          const emailInput = newForm.querySelector("#email");
          const phoneInput = newForm.querySelector("#phone");

          // Validação em tempo real para e-mail
          if (emailInput) {
            emailInput.addEventListener("blur", function () {
              if (this.value.trim()) {
                if (!validateEmail(this.value.trim())) {
                  showError(this, "Por favor, insira um e-mail válido");
                } else {
                  removeError(this);
                  showSuccess(this);
                }
              } else {
                removeError(this);
              }
            });

            emailInput.addEventListener("input", function () {
              if (this.value.trim() && validateEmail(this.value.trim())) {
                removeError(this);
                showSuccess(this);
              }
            });
          }

          // Validação em tempo real para telefone
          if (phoneInput) {
            // Formatação automática do telefone
            phoneInput.addEventListener("input", function () {
              formatPhone(this);

              // Remove erro e mostra sucesso se o telefone for válido
              if (this.value.trim() && validatePhone(this.value.trim())) {
                removeError(this);
                showSuccess(this);
              }
            });

            phoneInput.addEventListener("blur", function () {
              if (this.value.trim()) {
                if (!validatePhone(this.value.trim())) {
                  showError(
                    this,
                    "Por favor, insira um telefone válido (formato: (99) 99999-9999)"
                  );
                } else {
                  removeError(this);
                  showSuccess(this);
                }
              } else {
                removeError(this);
              }
            });
          }

          // Adiciona listener para o evento de submissão com validação
          newForm.addEventListener("submit", function (event) {
            event.preventDefault();

            // Valida o formulário antes de permitir o envio
            if (validateForm(this)) {
              alert(
                "O envio do formulário ainda está sendo implementado. Por favor, entre em contato por outros meios."
              );
            } else {
              alert(
                "Por favor, corrija os erros no formulário antes de enviar."
              );
            }
          });

          // * CONFIGURAÇÃO DO CONTADOR DE CARACTERES * (NOVO)
          const textarea = newForm.querySelector("#message");
          const charCount = newForm.querySelector("#char-count");
          if (textarea && charCount) {
            // Atualiza o contador ao carregar a página
            charCount.textContent = `${textarea.value.length}/500 caracteres`;

            // Adiciona listener para atualizar o contador em tempo real
            textarea.addEventListener("input", function () {
              charCount.textContent = `${textarea.value.length}/500 caracteres`;
            });
          }
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
