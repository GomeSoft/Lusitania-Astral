const EXCHANGE_RATE_BTC_EUR = 60000; 
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    if (document.getElementById('planetsGrid')) {
        initStorefront();
    }
    if (document.getElementById('planetDetailContainer')) {
        initDetailsPage();
    }
});
let allPlanets = [];
let favorites = [];
async function initStorefront() {
    loadFavorites();
    await fetchAndRenderPlanets();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', applyFilters);

    const resourceFilter = document.getElementById('resourceFilter');
    if (resourceFilter) resourceFilter.addEventListener('change', applyFilters);

    const showFavBtn = document.getElementById('showFavoritesBtn');
    if (showFavBtn) showFavBtn.addEventListener('click', toggleFavoritesView);

    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
}
function loadFavorites() {
    const favs = localStorage.getItem('lusitania_favorites');
    favorites = favs ? JSON.parse(favs) : [];
    updateFavoritesUI();
}
function toggleFavorite(id) {
    const index = favorites.indexOf(id);
    if (index === -1) {
        favorites.push(id);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('lusitania_favorites', JSON.stringify(favorites));
    applyFilters(); 
}
function updateFavoritesUI() {
    const favBtn = document.getElementById('showFavoritesBtn');
    const heartIcon = document.getElementById('heartIcon');
    const favoritesText = document.getElementById('favoritesText');
    if (!favBtn || !heartIcon || !favoritesText) return;

    const isShowingFavs = favBtn.classList.contains('showing-favs');
    if (isShowingFavs) {
        heartIcon.classList.remove('fa-regular');
        heartIcon.classList.add('fa-solid', 'text-red-500');
        favoritesText.textContent = "Ver Todos";
    } else {
        heartIcon.classList.remove('fa-solid', 'text-red-500');
        heartIcon.classList.add('fa-regular');
        favoritesText.textContent = "Favoritos";
    }
}
function toggleFavoritesView() {
    const favBtn = document.getElementById('showFavoritesBtn');
    favBtn.classList.toggle('showing-favs');
    updateFavoritesUI();
    applyFilters();
}
async function fetchAndRenderPlanets() {
    try {
        allPlanets = await API.getPlanets();
        applyFilters();
    } catch (error) {
        console.error("Erro ao carregar planetas:", error);
    }
}
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const resourceFilterElem = document.getElementById('resourceFilter');
    const resourceFilter = resourceFilterElem ? resourceFilterElem.value : '';

    const favBtn = document.getElementById('showFavoritesBtn');
    const isShowingFavs = favBtn ? favBtn.classList.contains('showing-favs') : false;
    let filtered = allPlanets.filter(planet => {
        const matchesSearch = planet.nome.toLowerCase().includes(searchTerm) || 
                              planet.descricao.toLowerCase().includes(searchTerm);
        const cleanResourceFilter = resourceFilter.trim();
        const matchesResource = cleanResourceFilter === 'all' || cleanResourceFilter === '' || 
                                (planet.recursos && planet.recursos.some(r => r.trim() === cleanResourceFilter));
        const matchesFav = !isShowingFavs || favorites.includes(planet.id);
        return matchesSearch && matchesResource && matchesFav;
    });
    renderPlanets(filtered);
}
function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const resourceFilter = document.getElementById('resourceFilter');
    if (resourceFilter) resourceFilter.value = '';

    const favBtn = document.getElementById('showFavoritesBtn');
    if (favBtn) favBtn.classList.remove('showing-favs');

    updateFavoritesUI();
    applyFilters();
}
function renderPlanets(planets) {
    const grid = document.getElementById('planetsGrid');
    const emptyState = document.getElementById('emptyState');
    grid.innerHTML = '';
    if (planets.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    planets.forEach(planet => {
        const eurPrice = (planet.precoBTC * EXCHANGE_RATE_BTC_EUR).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
        const isFav = favorites.includes(planet.id);
        const statusColor = planet.status === 'Disponivel' || planet.status === 'Disponível' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50';
        const resourceTags = (planet.recursos || []).map(r => 
            `<span class="text-xs px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300 capitalize">${r}</span>`
        ).join('');
        const card = document.createElement('article');
        card.className = "glass-card rounded-2xl overflow-hidden flex flex-col h-full";
        card.innerHTML = `
            <div class="planet-img-container h-48 sm:h-56 relative group cursor-pointer" onclick="window.location.href='detalhes.html?id=${planet.id}'">
                <img src="${planet.imagem}" alt="${planet.nome}" 
                     class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                     onerror="this.src='https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800'; this.onerror=null;">
                <div class="absolute top-3 right-3 flex gap-2">
                    <span class="px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-md ${statusColor}">
                        ${planet.status}
                    </span>
                    <button onclick="event.stopPropagation(); toggleFavorite('${planet.id}')" 
                            class="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition z-10">
                        <i class="fa-${isFav ? 'solid text-red-500' : 'regular text-white'} fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <h3 class="text-2xl font-bold mb-1 text-white">${planet.nome}</h3>
                <p class="text-sm text-cyan-400 mb-3"><i class="fa-solid fa-user-astronaut mr-1"></i> ${planet.vendedor}</p>
                <p class="text-gray-400 text-sm mb-4 flex-grow line-clamp-2">${planet.descricao}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${resourceTags}
                </div>
                <div class="pt-4 border-t border-gray-800 flex justify-between items-end mt-auto">
                    <div>
                        <div class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                            ₿ ${planet.precoBTC}
                        </div>
                        <div class="text-xs text-gray-500">~ ${eurPrice}</div>
                    </div>
                    <a href="detalhes.html?id=${planet.id}" class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-all">
                        Detalhes
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    const tbody = document.getElementById('planetsTableBodyIndex');
    if (tbody) {
        tbody.innerHTML = '';
        if (planets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum planeta para apresentar.</td></tr>`;
        } else {
            planets.forEach(planet => {
                const statusColor = planet.status === 'Disponivel' || planet.status === 'Disponível' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10';
                const borderColor = statusColor.replace('bg-', 'border-').replace('/10', '/30');
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-800/30 transition-colors";
                tr.innerHTML = `
                    <td class="p-4 font-mono text-sm text-gray-500">${planet.id}</td>
                    <td class="p-4 font-bold text-white flex items-center gap-3">
                        <img src="${planet.imagem}" class="w-8 h-8 rounded-full border border-gray-700 object-cover" onerror="this.src='https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=100'; this.onerror=null;">
                        <a href="detalhes.html?id=${planet.id}" class="hover:text-cyan-400 transition">${planet.nome}</a>
                    </td>
                    <td class="p-4 text-cyan-400 text-sm">${planet.vendedor}</td>
                    <td class="p-4 font-mono text-yellow-500 text-sm">₿ ${planet.precoBTC}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-md text-xs font-semibold ${statusColor} border ${borderColor}">
                            ${planet.status}
                        </span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }
}
async function initDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('planetDetailContainer').innerHTML = `
            <div class="text-center py-20">
                <h2 class="text-3xl text-red-400 mb-4">Planeta Não Especificado</h2>
                <a href="index.html" class="text-cyan-400 hover:underline">Voltar à Montra Galáctica</a>
            </div>
        `;
        return;
    }
    try {
        const planet = await API.getPlanetById(id);
        renderPlanetDetails(planet);
    } catch (error) {
        document.getElementById('planetDetailContainer').innerHTML = `
            <div class="text-center py-20">
                <h2 class="text-3xl text-red-400 mb-4">Erro: Planeta não encontrado</h2>
                <a href="index.html" class="text-cyan-400 hover:underline">Voltar à Montra Galáctica</a>
            </div>
        `;
    }
}
function renderPlanetDetails(planet) {
    const container = document.getElementById('planetDetailContainer');
    const eurPrice = (planet.precoBTC * EXCHANGE_RATE_BTC_EUR).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
    const statusColor = planet.status === 'Disponivel' || planet.status === 'Disponível' ? 'text-green-400' : 'text-red-400';
    let resourceMap = {
        'terrestre': 'Fauna Terrestre', 'aviario': 'Fauna Aviária', 'aquatico': 'Fauna Aquática', 
        'marisco': 'Marisco', 'insetos': 'Insetos', 'madeireira': 'Flora Madeireira', 
        'ornamental': 'Flora Ornamental', 'minerio': 'Geologia de Minério', 
        'gas': 'Gás', 'liquido': 'Líquido'
    };
    const resourceTags = (planet.recursos || []).map(r => 
        `<span class="px-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-cyan-300 font-medium">
            <i class="fa-solid fa-leaf mr-2"></i>${resourceMap[r] || r}
        </span>`
    ).join('');
    const fallbackImg = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200";
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Image Side -->
            <div class="rounded-3xl overflow-hidden glass-card h-[500px] border border-cyan-500/30">
                <img src="${planet.imagem}" alt="${planet.nome}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='${fallbackImg}'; this.onerror=null;">
            </div>
            <!-- Details Side -->
            <div class="flex flex-col justify-center">
                <div class="mb-4 flex items-center justify-between">
                    <span class="${statusColor} font-bold text-lg tracking-wider uppercase flex items-center gap-2">
                        <i class="fa-solid fa-circle text-[10px] ${statusColor.replace('text', 'bg').replace('-400', '-500')} rounded-full animate-pulse"></i>
                        ${planet.status}
                    </span>
                    <a href="index.html" class="text-gray-400 hover:text-white transition flex items-center gap-2">
                        <i class="fa-solid fa-arrow-left"></i> Voltar
                    </a>
                </div>
                <h1 class="text-5xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    ${planet.nome}
                </h1>
                <p class="text-xl text-cyan-400 mb-8 font-medium">
                    <i class="fa-solid fa-user-astronaut mr-2"></i> ${planet.vendedor}
                </p>
                <div class="glass-card p-6 rounded-2xl mb-8 space-y-4">
                    <div>
                        <h4 class="text-sm text-gray-400 uppercase tracking-widest mb-1">Dimensões</h4>
                        <p class="text-xl font-semibold">${planet.dimensoes}</p>
                    </div>
                    <div class="w-full h-px bg-gray-800"></div>
                    <div>
                        <h4 class="text-sm text-gray-400 uppercase tracking-widest mb-2">Recursos Detetados</h4>
                        <div class="flex flex-wrap gap-3">
                            ${resourceTags || '<span class="text-gray-500">Nenhum recurso registado.</span>'}
                        </div>
                    </div>
                </div>
                <div class="mb-8">
                    <h4 class="text-lg text-white mb-2 font-semibold">Descrição do Arquivo</h4>
                    <p class="text-gray-300 leading-relaxed text-lg bg-gray-900/40 p-6 rounded-xl border border-gray-800">
                        ${planet.descricao}
                    </p>
                </div>
                <div class="mt-auto flex items-center justify-between bg-black/50 p-6 rounded-2xl backdrop-blur-md border border-gray-800">
                    <div>
                        <div class="text-sm text-gray-400 mb-1">Preço Atual</div>
                        <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                            ₿ ${planet.precoBTC}
                        </div>
                        <div class="text-md text-gray-500 mt-1">~ ${eurPrice} EUR</div>
                    </div>
                    <button class="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(8,145,178,0.3)] transition-all transform hover:scale-105 flex items-center gap-3 text-lg">
                        <i class="fa-solid fa-cart-shopping"></i> Adquirir Planeta
                    </button>
                </div>
            </div>
        </div>
    `;
}
