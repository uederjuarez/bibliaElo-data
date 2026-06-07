# 📖 BibliaElo Data

Repositório de textos bíblicos em formato JSON para o app **BibliaElo**.

Todas as versões incluídas neste repositório possuem licenças verificadas (domínio público ou Creative Commons).

## Estrutura

```
bibliaElo-data/
├── json/              # JSONs prontos para consumo pelo app
├── scripts/           # Ferramentas de conversão (USFM → JSON)
├── sources/           # Ficheiros USFM originais (para auditoria)
├── versions.json      # Catálogo central de versões
└── LICENSES.md        # Detalhes de licenças por versão
```

## Formato JSON

Cada ficheiro JSON contém um array de 66 livros:

```json
[
  {
    "name": "Gênesis",
    "abbrev": "gn",
    "chapters": [
      ["No princípio criou Deus...", "E a terra era sem forma..."],
      ["Assim os céus e a terra foram acabados..."]
    ]
  }
]
```

## Versões Disponíveis

| Código | Nome | Idioma | Licença |
|--------|------|--------|---------|
| pt_blivre | Bíblia Livre (BLIVRE) | 🇵🇹 Português | CC BY 4.0 |
| en_kjv | King James Version | 🇬🇧 English | Domínio Público |
| en_bbe | Bible in Basic English | 🇬🇧 English | Domínio Público |
| es_rvr | Reina Valera 1909 | 🇪🇸 Español | Domínio Público |
| fr_apee | La Bible de l'Épée | 🇫🇷 Français | Domínio Público |
| ru_synodal | Синодальный перевод | 🇷🇺 Русский | Domínio Público |
| ar_svd | الكتاب المقدس (SVD) | 🇸🇦 العربية | Domínio Público |
| zh_cuv | 和合本 (CUV) | 🇨🇳 中文 | Domínio Público |
| ko_ko | 개역한글 | 🇰🇷 한국어 | Domínio Público |
| vi_vietnamese | Kinh Thánh 1934 | 🇻🇳 Tiếng Việt | Domínio Público |
| fi_finnish | Finnish Bible 1933/38 | 🇫🇮 Suomi | Domínio Público |
| fi_pr | Pyhä Raamattu | 🇫🇮 Suomi | Domínio Público |
| eo_esperanto | Londona Biblio | 🌐 Esperanto | Domínio Público |
| el_greek | Νεοελληνική Μετάφραση | 🇬🇷 Ελληνικά | A verificar |

## Créditos e Atribuições

### Bíblia Livre (BLIVRE) — CC BY 4.0
> Todas as Escrituras em português citadas são da Bíblia Livre (BLIVRE),
> Copyright © Diego Santos, Mario Sérgio, e Marco Teles,
> http://sites.google.com/site/biblialivre/ — fevereiro de 2018.
> Licença Creative Commons Atribuição 4.0 Brasil
> (http://creativecommons.org/licenses/by/4.0/br/).
> Reprodução permitida desde que devidamente mencionados fonte e autores.

### Fonte dos textos
Textos obtidos do [eBible.org](https://ebible.org) e outras fontes de domínio público.

## Licença do Repositório

O código deste repositório (scripts, ferramentas) está sob a licença MIT.
Os textos bíblicos mantêm suas licenças originais conforme documentado acima.
