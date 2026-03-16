# 🌌 Lusitânia Astral: Imobiliária Interplanetária

A Lusitânia Astral é uma plataforma pioneira dedicada à compra e venda de corpos celestes e parcelas territoriais em todo o universo conhecido.
Graças à revolucionária tecnologia de "Dobras de Camões", eliminámos as barreiras das viagens intergalácticas, permitindo que novos colonos e investidores adquiram o seu lugar nas estrelas.

Este projeto foi desenvolvido como um exercício de consolidação de conteúdos, focando-se na gestão de inventário e na estruturação de dados complexos através de objetos dinâmicos.

## 🚀 Funcionalidades

- **Gestão de Inventário**: Registo e controlo completo de planetas, sistemas estelares e zonas específicas.
- **Visualização Apelativa**: Interface preparada para exibir detalhes climáticos, gravidade e potencial de habitação.
- **Sistema de Favoritos**: Permite aos usuários salvarem planetas favoritos no localStorage.
- **Conversão de Moeda**: Conversão automática de BTC para EUR usando API externa.
- **Filtragem**: Filtragem de planetas por tipo de recurso.
- **CRUD Completo**: Criar, ler, atualizar e eliminar planetas.
- **Responsividade**: Design responsivo usando Tailwind CSS.

## 🪐 Estrutura de Dados (Objeto Planeta)

Cada corpo celeste é tratado como um objeto único, contendo:

```javascript
{
    id: "uuid", // Identificador único universal
    nome: "Nome do Planeta",
    localizacao: "Galáxia • Sistema Estelar",
    descricao: "Descrição detalhada sobre clima, gravidade e potencial de habitação",
    parcela: "Planeta Inteiro",
    area: "1000000 km²",
    recursos: ["minerio", "marisco", "madeireira"], // Array de recursos
    vendedor: "Nome do Explorador",
    preco: 1.5, // em BTC
    estado: "Disponível" | "Vendido",
    fotos: ["foto1.jpg", "foto2.jpg", "foto3.jpg", "foto4.jpg"] // Array de URLs de fotos
}
```

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica com tags como `<article>`, `<section>`, `<nav>`
- **CSS**: Tailwind CSS para estilização responsiva
- **JavaScript**: Lógica de front-end e manipulação do DOM
- **API**: Fetch API para comunicação com backend (atualmente usando dados mockados)
- **LocalStorage**: Persistência de favoritos
- **URLSearchParams**: Para capturar IDs na página de detalhes

## 📁 Estrutura do Projeto

```
Lusitania-Astral/
├── index.html          # Página principal (Montra Galáctica)
├── detalhes.html       # Página de detalhes do planeta
├── admin.html          # Centro de Comando (tabela de gestão)
├── formulario.html     # Formulário de registo/edição
├── README.md           # Documentação
├── css/
│   └── styles.css      # Estilos adicionais (vazio)
└── js/
    ├── api.js          # Funções de API e dados mockados
    └── main.js         # Lógica principal da aplicação
```

## 🚀 Como Executar

1. Clone ou baixe o repositório
2. Abra os arquivos HTML diretamente no navegador, ou
4. Abra `index.html` diretamente no navegador ou, se preferir, use uma extensão de Live Server no seu editor (ex: Live Server no VS Code).

## 📋 Funcionalidades Implementadas

### Pessoa A (Front-end & UX)
- ✅ Estrutura HTML5 semântica
- ✅ Design responsivo com Tailwind CSS
- ✅ Galeria de fotos na página de detalhes
- ✅ Tabela formatada no Centro de Comando
- ✅ Fallbacks para imagens com "Espaço Profundo"
- ✅ Estados visuais "Vendido"/"Disponível"

### Pessoa B (Lógica & Integração)
- ✅ API com funções fetch (GET, POST, PUT, DELETE)
- ✅ URLSearchParams para capturar ID do planeta
- ✅ Conversor BTC para EUR
- ✅ Filtros por tipo de recurso
- ✅ Sistema de favoritos no localStorage
- ✅ Validação de formulário (preços não negativos, UUID gerado)

## 🔧 Configuração da API

Atualmente usa dados mockados em `js/api.js`. Para conectar a uma API real:

1. Substitua `API_BASE_URL` pela URL da sua API
2. Remova os dados mockados e use as funções fetch reais
3. Certifique-se que a API retorna dados no formato esperado

## 🎨 Cores da Lusitânia Astral

- Fundo: `bg-gray-900` (cinza escuro)
- Texto: `text-white`
- Destaques: `text-blue-400` (azul)
- Preços: `text-yellow-400` (amarelo)
- Estados: Verde para disponível, vermelho para vendido

## 📝 Notas de Desenvolvimento

- O projeto usa dados mockados para demonstração
- A conversão BTC/EUR usa a API CoinGecko (com fallback)
- Imagens usam placeholder quando não encontradas
- O sistema de favoritos persiste no localStorage do navegador
