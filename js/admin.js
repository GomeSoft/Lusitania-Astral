document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    initAdminPanel();
});
async function initAdminPanel() {
    await fetchAndRenderTable();
    document.getElementById('planetForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancelEditBtn').addEventListener('click', resetForm);
}
async function fetchAndRenderTable() {
    try {
        const planets = await API.getPlanets();
        renderTable(planets);
    } catch (error) {
        console.error("Erro ao carregar planetas na tabela:", error);
    }
}
function renderTable(planets) {
    const tbody = document.getElementById('planetsTableBody');
    tbody.innerHTML = '';
    if (planets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-gray-500">
                    <i class="fa-solid fa-folder-open text-4xl mb-4 block"></i>
                    Nenhum planeta registado no arquivo.
                </td>
            </tr>
        `;
        return;
    }
    planets.forEach(planet => {
        const statusColor = planet.status === 'Disponivel' || planet.status === 'Disponível' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10';
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-800/30 transition-colors group";
        tr.innerHTML = `
            <td class="p-4 font-mono text-sm text-gray-500">${planet.id}</td>
            <td class="p-4 font-bold text-white flex items-center gap-3">
                <img src="${planet.imagem}" class="w-8 h-8 rounded-full border border-gray-700 object-cover" onerror="this.src='https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=100';">
                ${planet.nome}
            </td>
            <td class="p-4 text-cyan-400">${planet.vendedor}</td>
            <td class="p-4 font-mono text-yellow-500">₿ ${planet.precoBTC}</td>
            <td class="p-4">
                <span class="px-2 py-1 rounded-md text-xs font-semibold ${statusColor} border ${statusColor.replace('bg-', 'border-').replace('/10', '/30')}">
                    ${planet.status}
                </span>
            </td>
            <td class="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="editPlanet('${planet.id}')" class="text-blue-400 hover:text-blue-300 mr-3 transition" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deletePlanet('${planet.id}')" class="text-red-500 hover:text-red-400 transition" title="Apagar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('planetId').value;
    const nome = document.getElementById('nome').value.trim();
    const vendedor = document.getElementById('vendedor').value.trim();
    const status = document.getElementById('status').value;
    const precoBTC = parseFloat(document.getElementById('precoBTC').value);
    const dimensoes = document.getElementById('dimensoes').value.trim();
    const imagem = document.getElementById('imagem').value.trim() || 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800';
    const descricao = document.getElementById('descricao').value.trim();
    const select = document.getElementById('recursos');
    const recursos = Array.from(select.selectedOptions).map(opt => opt.value);
    if (precoBTC < 0) {
        alert("O preço não pode ser negativo.");
        return;
    }
    if (!nome) {
        alert("O nome do planeta é obrigatório.");
        return;
    }
    const planetData = {
        nome,
        vendedor,
        status,
        precoBTC,
        dimensoes,
        imagem,
        descricao,
        recursos
    };
    try {
        if (id) {
            await API.updatePlanet(id, planetData);
            alert("Planeta atualizado com sucesso!");
        } else {
            await API.createPlanet(planetData);
            alert("Descoberta registada com sucesso!");
        }
        resetForm();
        fetchAndRenderTable();
    } catch (error) {
        alert("Erro ao guardar planeta.");
        console.error(error);
    }
}
async function editPlanet(id) {
    try {
        const planet = await API.getPlanetById(id);
        document.getElementById('planetId').value = planet.id;
        document.getElementById('nome').value = planet.nome;
        document.getElementById('vendedor').value = planet.vendedor;
        document.getElementById('status').value = planet.status;
        document.getElementById('precoBTC').value = planet.precoBTC;
        document.getElementById('dimensoes').value = planet.dimensoes;
        document.getElementById('imagem').value = planet.imagem;
        document.getElementById('descricao').value = planet.descricao;
        const select = document.getElementById('recursos');
        Array.from(select.options).forEach(opt => {
            opt.selected = (planet.recursos || []).includes(opt.value);
        });
        document.getElementById('formTitle').innerHTML = `<i class="fa-solid fa-pen text-blue-400"></i> Editar Planeta (${planet.id})`;
        document.getElementById('submitBtn').textContent = "Atualizar Planeta";
        document.getElementById('submitBtn').className = "flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.02]";
        document.getElementById('cancelEditBtn').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        alert("Erro ao carregar os dados do planeta.");
        console.error(error);
    }
}
async function deletePlanet(id) {
    if (confirm("Tem a certeza que deseja APAGAR este planeta? Esta ação é irreversível.")) {
        try {
            await API.deletePlanet(id);
            fetchAndRenderTable();
        } catch (error) {
            alert("Erro ao apagar planeta.");
            console.error(error);
        }
    }
}
function resetForm() {
    document.getElementById('planetForm').reset();
    document.getElementById('planetId').value = '';
    const select = document.getElementById('recursos');
    Array.from(select.options).forEach(opt => opt.selected = false);
    document.getElementById('formTitle').innerHTML = `<i class="fa-solid fa-satellite text-cyan-400"></i> Registar Nova Descoberta`;
    document.getElementById('submitBtn').textContent = "Guardar Descoberta";
    document.getElementById('submitBtn').className = "flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.02]";
    document.getElementById('cancelEditBtn').classList.add('hidden');
}
