const STORAGE_KEY = 'lusitania_astral_planets_v3';
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
const API = {
    getPlanets: async () => {
        initStorage();
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
    },
    getPlanetById: async (id) => {
        const planets = await API.getPlanets();
        const planet = planets.find(p => p.id === id);
        if (!planet) throw new Error("Planeta não encontrado.");
        return planet;
    },
    createPlanet: async (data) => {
        const planets = await API.getPlanets();
        const newPlanet = {
            id: 'p' + Date.now(),
            ...data
        };
        planets.push(newPlanet);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(planets));
        return newPlanet;
    },
    updatePlanet: async (id, data) => {
        const planets = await API.getPlanets();
        const index = planets.findIndex(p => p.id === id);
        if (index === -1) throw new Error("Planeta não encontrado.");
        planets[index] = { ...planets[index], ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(planets));
        return planets[index];
    },
    deletePlanet: async (id) => {
        let planets = await API.getPlanets();
        const initialLen = planets.length;
        planets = planets.filter(p => p.id !== id);
        if (planets.length === initialLen) throw new Error("Planeta não encontrado.");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(planets));
        return { success: true };
    }
};
initStorage();
