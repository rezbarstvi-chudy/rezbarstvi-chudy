let works = [];
let categories = ['Dekorace', 'Figurky', 'Nářadí', 'Ostatní'];
let activeCategory = 'all';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

window.addEventListener('auth:changed', () => {
  window.updateAuthUI?.();
});

async function initializeApp() {
  createAddWorkForm();
  setupContactForm();
  await loadWorks();
  renderCategories();
  renderGallery();
  window.updateAuthUI?.();
}

async function loadWorks() {
  try {
    const response = await fetch(window.apiUrl('/api/works'));
    const data = await response.json();
    works = data.works || [];

    const apiCategories = [...new Set(works.map((work) => work.category).filter(Boolean))];
    categories = [...new Set([...categories, ...apiCategories])];
  } catch (error) {
    console.error('Nepodařilo se načíst díla:', error);
  }
}

function renderCategories() {
  const categoriesContainer = document.getElementById('gallery-categories');
  categoriesContainer.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = `category-btn ${activeCategory === 'all' ? 'active' : ''}`;
  allBtn.textContent = 'Všechny';
  allBtn.addEventListener('click', () => filterGallery('all'));
  categoriesContainer.appendChild(allBtn);

  categories.forEach((category) => {
    const btn = document.createElement('button');
    btn.className = `category-btn ${activeCategory === category ? 'active' : ''}`;
    btn.textContent = category;
    btn.addEventListener('click', () => filterGallery(category));
    categoriesContainer.appendChild(btn);
  });
}

function filterGallery(category) {
  activeCategory = category;
  renderCategories();

  if (category === 'all') {
    renderGalleryWorks(works);
    return;
  }

  const filtered = works.filter((work) => work.category === category);
  renderGalleryWorks(filtered);
}

function renderGallery() {
  if (activeCategory === 'all') {
    renderGalleryWorks(works);
    return;
  }

  filterGallery(activeCategory);
}

function renderGalleryWorks(worksList) {
  const galleryWorks = document.getElementById('gallery-works');
  galleryWorks.innerHTML = '';

  if (worksList.length === 0) {
    galleryWorks.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Zatím zde nejsou žádné výtvory.</p>';
    return;
  }

  worksList.forEach((work) => {
    const card = document.createElement('div');
    card.className = 'work-card';
    const imageUrl = work.imageUrl || work.image_url;

    card.innerHTML = `
      <div class="work-image">
        ${imageUrl ? `<img src="${imageUrl}" alt="${work.name}">` : 'Fotografie díla'}
      </div>
      <div class="work-info">
        <h3>${work.name}</h3>
        <p><strong>Kategorie:</strong> ${work.category}</p>
        <p>${work.description}</p>
      </div>
    `;

    galleryWorks.appendChild(card);
  });
}

function createAddWorkForm() {
  const gallerySection = document.getElementById('gallery');

  const formContainer = document.createElement('div');
  formContainer.id = 'add-work-form';
  formContainer.innerHTML = `
    <h3>➕ Přidat nový výtvor</h3>
    <div class="success-message" id="success-message">Výtvor byl úspěšně přidán!</div>
    <p id="work-form-error" class="form-error"></p>
    <form id="work-form">
      <label for="work-name">Název výtvoru:</label>
      <input type="text" id="work-name" placeholder="např. Dřevěná maska" required>

      <label for="work-category">Kategorie:</label>
      <select id="work-category" required>
        <option value="">-- Vyber kategorii --</option>
      </select>
      <input type="text" id="new-category" placeholder="Nebo napiš novou kategorii...">

      <label for="work-description">Popis:</label>
      <textarea id="work-description" placeholder="Popiš svůj výtvor..." rows="4" required></textarea>

      <label for="work-image">Fotka výtvoru:</label>
      <input type="file" id="work-image" accept="image/*">

      <button type="submit">Přidat výtvor</button>
    </form>
  `;

  gallerySection.insertBefore(formContainer, document.getElementById('gallery-works'));

  updateCategorySelect();

  document.getElementById('work-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await addWork();
  });
}

function updateCategorySelect() {
  const select = document.getElementById('work-category');
  select.innerHTML = '<option value="">-- Vyber kategorii --</option>';
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(window.apiUrl('/api/uploads'), {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Upload obrázku selhal');
  }

  return data.url;
}

async function addWork() {
  const name = document.getElementById('work-name').value.trim();
  const category = document.getElementById('work-category').value;
  const newCategory = document.getElementById('new-category').value.trim();
  const description = document.getElementById('work-description').value.trim();
  const imageFile = document.getElementById('work-image').files[0];
  const errorMessage = document.getElementById('work-form-error');
  errorMessage.textContent = '';

  let selectedCategory = category;
  if (newCategory) {
    selectedCategory = newCategory;
    if (!categories.includes(selectedCategory)) {
      categories.push(selectedCategory);
      updateCategorySelect();
      renderCategories();
    }
  }

  if (!name || !selectedCategory || !description) {
    errorMessage.textContent = 'Prosím, vyplň všechna povinná pole.';
    return;
  }

  if (!window.isAuthenticated?.()) {
    errorMessage.textContent = 'Pro přidání díla se prosím přihlas.';
    return;
  }

  try {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const response = await fetch(window.apiUrl('/api/works'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        category: selectedCategory,
        description,
        imageUrl,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Uložení díla selhalo');
    }

    works.push(data.work);
    document.getElementById('work-form').reset();

    const successMessage = document.getElementById('success-message');
    successMessage.classList.add('show');
    setTimeout(() => {
      successMessage.classList.remove('show');
    }, 3000);

    renderCategories();
    renderGallery();
  } catch (error) {
    errorMessage.textContent = error.message;
  }
}

function setupContactForm() {
  const contactForm = document.querySelector('#contact form');
  if (!contactForm) return;

  const resultNode = document.createElement('p');
  resultNode.id = 'contact-result';
  resultNode.className = 'form-result';
  contactForm.appendChild(resultNode);

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    resultNode.textContent = '';

    try {
      const response = await fetch(window.apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Odeslání zprávy selhalo');
      }

      resultNode.textContent = 'Děkujeme za zprávu! Ozveme se co nejdříve.';
      contactForm.reset();
    } catch (error) {
      resultNode.textContent = `Chyba: ${error.message}`;
    }
  });
}
