# OM Running — Estrutura Própria

Recriação estrutural completa do site `omrunning-es.com` em uma stack 100% estática
(HTML + CSS + JS puro), sem dependência de Shopify nem de frameworks. Pronta para
publicar em qualquer host estático (Netlify, Vercel, GitHub Pages, S3, etc.).

## Estrutura de pastas

```
on sneaker/
├── index.html              # Homepage (hero, destaques, banners, features)
├── men.html                # Coleção masculina (14 produtos)
├── women.html              # Coleção feminina (14 produtos)
├── product.html            # Página de produto (dinâmica via ?id=...)
├── cart.html               # Carrinho (persistido em localStorage)
├── pages/
│   ├── contact.html        # Contato (formulário + canais)
│   ├── privacy.html        # Política de privacidade
│   ├── refund.html         # Devoluções e reembolsos
│   ├── shipping.html       # Política de envio
│   └── terms.html          # Termos de serviço
├── assets/
│   ├── css/style.css       # Estilos globais + componentes
│   ├── js/products.js      # Catálogo de produtos + helpers
│   ├── js/cart.js          # Carrinho via localStorage
│   ├── js/main.js          # Comportamentos da UI
│   └── images/             # (vazio — usamos SVG dinâmico por padrão)
└── README.md
```

## Páginas mapeadas a partir de omrunning-es.com

| Original                                | Equivalente local              |
| --------------------------------------- | ------------------------------ |
| `/`                                     | `index.html`                   |
| `/collections/on-running-men-s`         | `men.html`                     |
| `/collections/on-running-women-s`       | `women.html`                   |
| `/products/...`                         | `product.html?id=<id>`         |
| `/cart`                                 | `cart.html`                    |
| `/policies/contact-information`         | `pages/contact.html`           |
| `/policies/privacy-policy`              | `pages/privacy.html`           |
| `/policies/refund-policy`               | `pages/refund.html`            |
| `/policies/shipping-policy`             | `pages/shipping.html`          |
| `/policies/terms-of-service`            | `pages/terms.html`             |

## Catálogo

`assets/js/products.js` contém 28 produtos (14 masc. + 14 fem.) com:

- `id` único (e.g. `m-cloud-6`, `w-cloudmonster-3`)
- `name`, `gender`, `price`, `original`, `image`, `description`, `badge`

A renderização das grades é feita automaticamente em qualquer elemento com
`data-product-grid="men|women|featured"`.

## Carrinho

- Persistido em `localStorage` (chave `om-running-cart`).
- API exposta em `window.cart`: `add`, `remove`, `update`, `total`, `read`.
- Badge contagem atualizado em todas as páginas (`[data-cart-count]`).
- Checkout é só visual (demonstrativo).

## Imagens

Para evitar hotlink ao domínio original, cada card / detalhe de produto usa um
SVG vetorial gerado em JS (`window.shoeSVG`). Para usar imagens reais, basta
colocar os arquivos em `assets/images/` e trocar a renderização em
`productCardHTML` (`assets/js/main.js`) por uma tag `<img>`.

## Como rodar localmente

Qualquer servidor estático serve. Exemplo:

```bash
cd "on sneaker"
python3 -m http.server 8000
# http://localhost:8000
```

Ou abra `index.html` diretamente no navegador (algumas funções podem exigir um
servidor por causa de paths relativos).

## Customização rápida

- Cores: editar variáveis em `:root` no topo de `assets/css/style.css`.
- Logo / nome: substituir o bloco `.logo` em cada HTML (ou em um futuro include).
- Conteúdo das policies: editar diretamente os arquivos em `pages/`.
- Novos produtos: adicionar entrada em `window.PRODUCTS` (`assets/js/products.js`).
