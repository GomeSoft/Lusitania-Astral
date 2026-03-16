const STORAGE_KEY = 'lusitania_astral_planets_v3';
const REMOTE_API_URL = 'https://formacoes-api.onrender.com/imobiliaria-interplanetaria';

const defaultPlanets = [
    {
        id: "p1",
        nome: "Aethelgard",
        vendedor: "Corp. Estelar",
        precoBTC: 2.5,
        status: "Disponivel",
        descricao: "Um planeta exuberante com vastas florestas bioluminescentes.",
        dimensoes: "12,042 km (Diâmetro)",
        imagem: "assets/Jupiter.jpg",
        recursos: ["madeireira", "liquido", "aquatico"]
    },
    {
        id: "p2",
        nome: "Kaelen-Prime",
        vendedor: "Mineradores Independentes",
        precoBTC: 0.8,
        status: "Vendido",
        descricao: "Mundo árido focado na extração intensiva de minérios raros.",
        dimensoes: "6,700 km (Diâmetro)",
        imagem: "assets/marte.webp",
        recursos: ["minerio", "gas", "insetos"]
    },
    {
        id: "p3",
        nome: "Nebula-9",
        vendedor: "Consórcio Orion",
        precoBTC: 15.0,
        status: "Disponivel",
        descricao: "Gigante gasoso com anéis majestosos e tempestades eternas.",
        dimensoes: "142,984 km (Diâmetro)",
        imagem: "assets/mercurio.jpeg",
        recursos: ["gas"]
    },
    {
        id: "p4",
        nome: "Oceana",
        vendedor: "AquaCorp",
        precoBTC: 5.2,
        status: "Disponivel",
        descricao: "Mundo coberto por 99% de oceanos com fauna marisca gigante.",
        dimensoes: "15,200 km (Diâmetro)",
        imagem: "assets/Jupiter.jpg",
        recursos: ["liquido", "aquatico", "marisco"]
    }
];

function initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPlanets));
    }
}

function normalizeRemotePlanet(remote) {
    const recursos = [];
    if (remote.recursos) {
        const { fauna, flora, geologia } = remote.recursos;
        if (fauna && fauna !== 'none') recursos.push(fauna);
        if (flora && flora !== 'none') recursos.push(flora);
        if (Array.isArray(geologia)) {
            recursos.push(...geologia.filter(item => item && item !== 'none'));
        }
    }

    const imagem = (remote.fotos && remote.fotos.length)
        ? remote.fotos[0]
        : 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800';

    return {
        id: String(remote.id),
        nome: remote.nome,
        vendedor: remote.vendedor,
        precoBTC: parseFloat(remote.preco_btc) || 0,
        status: remote.vendido ? 'Vendido' : 'Disponivel',
        descricao: remote.descricao,
        dimensoes: `Área útil: ${remote.area_util} | Área total: ${remote.area_total}`,
        imagem,
        recursos,
        galaxia: remote.galaxia,
        sistema_estrelar: remote.sistema_estrelar,
        parcela_venda: remote.parcela_venda,
        area_total: remote.area_total,
        area_util: remote.area_util,
        fotos: remote.fotos,
        vendido: remote.vendido
    };
}

function serializePlanetForRemote(planet) {
    const formatBTC = (value) => {
        const n = Number(value);
        if (Number.isNaN(n)) return "0.00000000";
        return n.toFixed(8);
    };

    const recursos = {
        fauna: null,
        flora: null,
        geologia: []
    };

    if (Array.isArray(planet.recursos)) {
        for (const r of planet.recursos) {
            if (!r) continue;
            if (['terrestre', 'aquatico', 'aviario', 'marisco', 'insetos'].includes(r)) {
                recursos.fauna = recursos.fauna || r;
            } else if (['madeireira', 'ornamental'].includes(r)) {
                recursos.flora = recursos.flora || r;
            } else if (['minerio', 'gas', 'liquido'].includes(r)) {
                recursos.geologia.push(r);
            }
        }
    }

    const payload = {
        nome: planet.nome,
        descricao: planet.descricao,
        vendedor: planet.vendedor,
        preco_btc: formatBTC(planet.precoBTC),
        vendido: planet.status === 'Vendido' || planet.vendido === true,
        recursos: recursos,
        fotos: planet.fotos || (planet.imagem ? [planet.imagem] : []),
        galaxia: planet.galaxia || null,
        sistema_estrelar: planet.sistema_estrelar || null,
        parcela_venda: planet.parcela_venda || null,
        area_total: planet.area_total || null,
        area_util: planet.area_util || null
    };
    return payload;
}

async function fetchRemotePlanets() {
    const response = await fetch(REMOTE_API_URL);
    if (!response.ok) {
        throw new Error(`Falha ao buscar dados da API (${response.status})`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error('Resposta da API inesperada.');
    }
    return data.map(normalizeRemotePlanet);
}

const API = {
    getPlanets: async () => {
        try {
            const remote = await fetchRemotePlanets();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
            return remote;
        } catch (error) {
            console.warn('Não foi possível carregar da API remota, usando dados locais.', error);
            initStorage();
            return JSON.parse(localStorage.getItem(STORAGE_KEY));
        }
    },
    getPlanetById: async (id) => {
        const idStr = String(id);
        
        // Try to fetch from remote API first
        try {
            const response = await fetch(`${REMOTE_API_URL}/${idStr}`);
            if (response.ok) {
                const remote = await response.json();
                return normalizeRemotePlanet(remote);
            }
        } catch (error) {
            console.warn('Erro ao buscar planeta na API remota, tentando local storage.', error);
        }

        // Fallback to local storage
        try {
            const planets = await API.getPlanets();
            const planet = planets.find(p => String(p.id) === idStr);
            if (planet) return planet;
        } catch (error) {
            console.warn('Erro ao buscar no cache local.', error);
        }

        // Final fallback: check localStorage directly
        initStorage();
        const planets = JSON.parse(localStorage.getItem(STORAGE_KEY));
        const planet = planets.find(p => String(p.id) === idStr);
        if (!planet) throw new Error("Planeta não encontrado.");
        return planet;
    },
    createPlanet: async (data) => {
        // Try to create in the remote API first
        try {
            const payload = serializePlanetForRemote(data);
            const response = await fetch(REMOTE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`Falha ao criar na API remota (${response.status})`);
            }
            const remote = await response.json();
            const created = normalizeRemotePlanet(remote);
            // Keep local cache in sync so UI updates quickly
            try {
                await API.getPlanets();
            } catch (e) {
                // ignore
            }
            return created;
        } catch (error) {
            console.warn('Criar planeta falhou na API remota, usando localStorage.', error);
            const planets = await API.getPlanets();
            const newPlanet = {
                id: 'p' + Date.now(),
                ...data
            };
            planets.push(newPlanet);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(planets));
            return newPlanet;
        }
    },
    updatePlanet: async (id, data) => {
        const idStr = String(id);
        // Try remote update first (only works for numeric IDs)
        try {
            const payload = serializePlanetForRemote(data);
            const response = await fetch(`${REMOTE_API_URL}/${idStr}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`Falha ao atualizar na API remota (${response.status})`);
            }
            const remote = await response.json();
            const updated = normalizeRemotePlanet(remote);
            try {
                await API.getPlanets();
            } catch (e) {
                // ignore
            }
            return updated;
        } catch (error) {
            console.warn('Atualizar planeta falhou na API remota, usando localStorage.', error);
            const planets = await API.getPlanets();
            const index = planets.findIndex(p => String(p.id) === idStr);
            if (index === -1) throw new Error("Planeta não encontrado.");
            planets[index] = { ...planets[index], ...data };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(planets));
            return planets[index];
        }
    },
    deletePlanet: async (id) => {
        const idStr = String(id);
        // Try remote delete first
        try {
            const response = await fetch(`${REMOTE_API_URL}/${idStr}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Falha ao apagar na API remota (${response.status})`);
            }
            try {
                await API.getPlanets();
            } catch (e) {
                // ignore
            }
            return { success: true };
        } catch (error) {
            console.warn('Apagar planeta falhou na API remota, usando localStorage.', error);
            let planets = await API.getPlanets();
            const initialLen = planets.length;
            planets = planets.filter(p => String(p.id) !== idStr);
            if (planets.length === initialLen) throw new Error("Planeta não encontrado.");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(planets));
            return { success: true };
        }
    }
};

initStorage();
