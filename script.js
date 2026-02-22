// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Data structure for storing works and categories
let works = JSON.parse(localStorage.getItem('works')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Dekorace', 'Figurky', 'Nářadí', 'Ostatní'];

function initializeApp() {
    renderCategories();
    renderGallery();
    createAddWorkForm();
    setupContactForm();
}

// Render category buttons
function renderCategories() {
    const categoriesContainer = document.getElementById('gallery-categories');
    categoriesContainer.innerHTML = '';

    // "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'Všechny';
    allBtn.onclick = () => filterGallery('all');
    categoriesContainer.appendChild(allBtn);

    // Category buttons
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        btn.onclick = () => filterGallery(category);
        categoriesContainer.appendChild(btn);
    });
}

// Filter gallery by category
function filterGallery(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter and render
    if (category === 'all') {
        renderGallery();
    } else {
        const filtered = works.filter(work => work.category === category);
        renderGalleryWorks(filtered);
    }
}

// Render gallery
function renderGallery() {
    renderGalleryWorks(works);
}

// Render gallery works
function renderGalleryWorks(worksList) {
    const galleryWorks = document.getElementById('gallery-works');
    galleryWorks.innerHTML = '';

    if (worksList.length === 0) {
        galleryWorks.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Zatím zde nejsou žádné výtvory. Přidej své první dílo!</p>';
        return;
    }

    worksList.forEach(work => {
        const card = document.createElement('div');
        card.className = 'work-card';
        card.innerHTML = `
            <div class="work-image">${work.image || 'Fotografie díla'}</div>
            <div class="work-info">
                <h3>${work.name}</h3>
                <p><strong>Kategorie:</strong> ${work.category}</p>
                <p>${work.description}</p>
            </div>
        `;
        galleryWorks.appendChild(card);
    });
}

// Create form for adding works
function createAddWorkForm() {
    const gallerySection = document.getElementById('gallery');
    
    const formContainer = document.createElement('div');
    formContainer.id = 'add-work-form';
    formContainer.innerHTML = `
        <h3>➕ Přidat nový výtvor</h3>
        <div class="success-message" id="success-message">Výtvor byl úspěšně přidán!</div>
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

            <label for="work-image">URL fotky (volitelné):</label>
            <input type="url" id="work-image" placeholder="https://example.com/image.jpg">

            <button type="submit">Přidat výtvor</button>
        </form>
    `;
    
    gallerySection.insertBefore(formContainer, document.getElementById('gallery-works'));
    
    // Populate category select
    updateCategorySelect();
    
    // Handle form submission
    document.getElementById('work-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addWork();
    });
}

// Update category select options
function updateCategorySelect() {
    const select = document.getElementById('work-category');
    select.innerHTML = '<option value="">-- Vyber kategorii --</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

// Add new work
function addWork() {
    const name = document.getElementById('work-name').value;
    const category = document.getElementById('work-category').value;
    const newCategory = document.getElementById('new-category').value;
    const description = document.getElementById('work-description').value;
    const image = document.getElementById('work-image').value;

    // Handle new category
    let selectedCategory = category;
    if (newCategory.trim()) {
        selectedCategory = newCategory.trim();
        if (!categories.includes(selectedCategory)) {
            categories.push(selectedCategory);
            localStorage.setItem('categories', JSON.stringify(categories));
            updateCategorySelect();
            renderCategories();
        }
    }

    if (!name || !selectedCategory || !description) {
        alert('Prosím, vyplň všechna povinná pole!');
        return;
    }

    // Add work to array
    const work = {
        id: Date.now(),
        name,
        category: selectedCategory,
        description,
        image
    };

    works.push(work);
    localStorage.setItem('works', JSON.stringify(works));

    // Reset form and show success message
    document.getElementById('work-form').reset();
    
    const successMessage = document.getElementById('success-message');
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);

    // Refresh gallery
    renderCategories();
    renderGallery();
}

// Setup contact form
function setupContactForm() {
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Create mailto link
            const mailtoLink = `mailto:chudyweb@gmail.com?subject=Nový dotaz od ${encodeURIComponent(name)}&body=${encodeURIComponent(`Jméno: ${name}\nEmail: ${email}\n\nZpráva:\n${message}`)}`;
            
            // In real application, you would send this to a backend service
            console.log('Kontaktní formulář:', { name, email, message });
            
            // Show success message
            alert('Děkujeme za tvou zprávu! Brzy se ti ozveme.');
            contactForm.reset();
        });
    }
}
