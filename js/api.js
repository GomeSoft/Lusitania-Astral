const BASE_URL = 'https://formacoes-api.onrender.com/imobiliaria-interplanetaria';

const mapBackendToFrontend = (data) => {
    let recursosArray = [];
    if (data.recursos) {
        if (typeof data.recursos === 'string') {
            recursosArray = data.recursos.split(',').map(r => r.trim()).filter(r => r);
        } else if (typeof data.recursos === 'object') {
            if (data.recursos.fauna && data.recursos.fauna !== 'none') recursosArray.push(data.recursos.fauna);
            if (data.recursos.flora && data.recursos.flora !== 'none') recursosArray.push(data.recursos.flora);
            if (Array.isArray(data.recursos.geologia)) {
                recursosArray.push(...data.recursos.geologia);
            }
        }
    }

    let resolvedImg = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800";
    if (data.fotos2 && Array.isArray(data.fotos2) && data.fotos2.length > 0 && data.fotos2[0]) {
        resolvedImg = data.fotos2[0];
    } else if (data.fotos && Array.isArray(data.fotos) && data.fotos.length > 0 && data.fotos[0].startsWith('http')) {
        resolvedImg = data.fotos[0];
    }

    return {
        id: data.id,
        nome: data.nome || "Planeta Desconhecido",
        vendedor: data.vendedor || "Autor Desconhecido",
        status: data.vendido ? "Vendido" : "Disponivel",
        precoBTC: parseFloat(data.preco_btc) || 0,
        dimensoes: (data.area_total || 0) + " km",
        imagem: resolvedImg,
        descricao: data.descricao || "Sem descrição.",
        recursos: recursosArray
    };
};

const mapFrontendToBackend = (data) => {
    const area = parseFloat(String(data.dimensoes).replace(/[^0-9.]/g, '')) || 0;
    
    let recursosObj = {
        fauna: "none",
        flora: "none",
        geologia: []
    };
    if (Array.isArray(data.recursos)) {
        data.recursos.forEach(r => {
            if (['terrestre', 'aviario', 'aquatico', 'marisco', 'insetos'].includes(r)) recursosObj.fauna = r;
            else if (['madeireira', 'ornamental'].includes(r)) recursosObj.flora = r;
            else if (['minerio', 'gas', 'liquido'].includes(r)) recursosObj.geologia.push(r);
        });
    }
    
    return {
        nome: data.nome,
        descricao: data.descricao || "",
        fotos: data.imagem ? [data.imagem] : [],
        fotos2: data.imagem ? [data.imagem] : [],
        galaxia: "Via Láctea", // default dummy data
        sistema_estrelar: "Desconhecido", // default dummy data
        parcela_venda: "Global", // default dummy data
        area_total: area,
        area_util: area,
        preco_btc: Number(data.precoBTC) || 0.0,
        recursos: recursosObj,
        vendedor: data.vendedor || "",
        vendido: data.status === "Vendido" || data.status === "Em Negociação"
    };
};

const API = {
    getPlanets: async () => {
        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) throw new Error("Erro ao carregar planetas");
            const data = await response.json();
            return Array.isArray(data) ? data.map(mapBackendToFrontend) : [];
        } catch (error) {
            console.error("Erro na API getPlanets:", error);
            return [];
        }
    },
    
    getPlanetById: async (id) => {
        const response = await fetch(`${BASE_URL}/${id}`);
        if (!response.ok) throw new Error("Planeta não encontrado.");
        const data = await response.json();
        return mapBackendToFrontend(data);
    },

    createPlanet: async (data) => {
        const payload = mapFrontendToBackend(data);
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Erro ao criar planeta.");
        const created = await response.json();
        return mapBackendToFrontend(created);
    },

    updatePlanet: async (id, data) => {
        const payload = mapFrontendToBackend(data);
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Erro ao atualizar planeta.");
        const updated = await response.json();
        return mapBackendToFrontend(updated);
    },

    deletePlanet: async (id) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error("Erro ao apagar planeta.");
        return { success: true };
    }
};
