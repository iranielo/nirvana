const STORAGE_KEYS = {
  comments: "nirvana-fan-comments",
  images: "nirvana-fan-images"
};

const commentForm = document.querySelector("#comment-form");
const commentList = document.querySelector("#comment-list");
const formStatus = document.querySelector("#form-status");
const imageInput = document.querySelector("#image-upload");
const imageCaptionInput = document.querySelector("#image-caption");
const galleryGrid = document.querySelector("#gallery-grid");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

function readStoredItems(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Não foi possível ler os dados salvos neste navegador.", error);
    return [];
  }
}

function saveStoredItems(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

function renderComments() {
  const comments = readStoredItems(STORAGE_KEYS.comments);
  commentList.replaceChildren();

  if (comments.length === 0) {
    const empty = document.createElement("p");
    empty.className = "comment-empty";
    empty.textContent = "Seu recado pode ser o primeiro. Deixe a música falar.";
    commentList.append(empty);
    return;
  }

  comments.slice().reverse().forEach((comment) => {
    const card = document.createElement("article");
    card.className = "comment-card";
    const heading = document.createElement("div");
    heading.className = "comment-card-head";
    const name = document.createElement("h3");
    name.textContent = comment.name;
    const date = document.createElement("time");
    date.dateTime = comment.createdAt;
    date.textContent = formatDate(comment.createdAt);
    const message = document.createElement("p");
    message.textContent = comment.message;
    heading.append(name, date);
    card.append(heading, message);
    commentList.append(card);
  });
}

function renderUploadedImages() {
  galleryGrid.querySelectorAll(".gallery-card-upload").forEach((card) => card.remove());
  const images = readStoredItems(STORAGE_KEYS.images);
  images.forEach((image) => {
    const card = document.createElement("figure");
    card.className = "gallery-card gallery-card-upload";
    const img = document.createElement("img");
    img.src = image.dataUrl;
    img.alt = image.caption || "Imagem compartilhada por fã";
    const caption = document.createElement("figcaption");
    const label = document.createElement("span");
    label.textContent = image.caption || "COMPARTILHADO POR FÃ";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remover";
    remove.setAttribute("aria-label", `Remover imagem: ${label.textContent}`);
    remove.addEventListener("click", () => {
      const remaining = readStoredItems(STORAGE_KEYS.images).filter((item) => item.id !== image.id);
      if (!saveStoredItems(STORAGE_KEYS.images, remaining)) {
        window.alert("Não foi possível atualizar as imagens salvas neste navegador.");
        return;
      }
      card.remove();
    });
    caption.append(label, remove);
    card.append(img, caption);
    galleryGrid.prepend(card);
  });
}

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(commentForm);
  const name = String(formData.get("name") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!name || !message) return;

  const comments = readStoredItems(STORAGE_KEYS.comments);
  comments.push({ name, message, createdAt: new Date().toISOString() });
  if (!saveStoredItems(STORAGE_KEYS.comments, comments)) {
    formStatus.textContent = "Não foi possível salvar o comentário. Verifique o espaço disponível no navegador.";
    return;
  }
  commentForm.reset();
  formStatus.textContent = "Recado publicado. Obrigado por compartilhar!";
  renderComments();
});

imageInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    window.alert("Escolha um arquivo de imagem.");
    imageInput.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    window.alert("A imagem precisa ter até 2 MB.");
    imageInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (typeof reader.result !== "string") {
      window.alert("Não foi possível ler essa imagem.");
      return;
    }
    const images = readStoredItems(STORAGE_KEYS.images);
    images.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      dataUrl: reader.result,
      caption: imageCaptionInput.value.trim()
    });
    if (!saveStoredItems(STORAGE_KEYS.images, images)) {
      window.alert("Não foi possível salvar a imagem. O armazenamento do navegador pode estar cheio.");
      imageInput.value = "";
      return;
    }
    renderUploadedImages();
    imageCaptionInput.value = "";
    imageInput.value = "";
  });
  reader.addEventListener("error", () => {
    window.alert("Não foi possível ler essa imagem.");
    imageInput.value = "";
  });
  reader.readAsDataURL(file);
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  mainNav.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

mainNav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    mainNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
renderComments();
renderUploadedImages();
