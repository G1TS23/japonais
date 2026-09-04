# Apprentissage du japonais — débutant → B2

[![CI](https://github.com/G1TS23/japonais/actions/workflows/ci.yml/badge.svg)](https://github.com/G1TS23/japonais/actions/workflows/ci.yml)

Dossier de travail pour un apprentissage structuré du japonais, de zéro (bases kana)
jusqu'au niveau **B2** du CECR (≈ JLPT N2 solide + expression orale/écrite entraînée).

## Contenu

| Fichier | Rôle |
|---|---|
| [`PROGRAMME.md`](./PROGRAMME.md) | Le programme complet : 6 phases, calibrées par paliers JLPT, avec objectifs de grammaire / vocabulaire / kanji, compétences visées et méthode. |
| [`RESSOURCES.md`](./RESSOURCES.md) | Liste commentée de ressources (manuels, SRS, écoute, lecture, tuteurs), classée par niveau et par usage. |
| [`SUIVI.md`](./SUIVI.md) | Modèle de suivi : tableau de bord, journal hebdomadaire, jalons à cocher, bilans mensuels. |
| [`SPEC-V1.md`](./SPEC-V1.md) | Spécification de l'application web v1 : périmètre, choix techniques, modules, modèle de données, plan de construction. |
| [`web/`](./web/) | L'application (Nuxt 4). Voir [`web/README.md`](./web/README.md). |

## Point de départ

- Lecture des hiragana et katakana : bases, à consolider (Phase 0).
- Aucune grammaire ni vocabulaire structuré pour l'instant.

## Cible

**B2 du CECR.** Le JLPT ne teste que la compréhension (lecture + écoute), pas la
production. Atteindre un vrai B2 = réussir confortablement le **N2** *et* avoir
travaillé activement l'expression orale et écrite à un niveau équivalent. Le plafond
lecture/écoute d'un B2 avancé touche le N1.

## Application web

En construction dans [`web/`](./web/) (Nuxt 4, SPA, 100 % local). Périmètre et
avancement dans [`SPEC-V1.md`](./SPEC-V1.md). Étape 1 (squelette) faite.

```bash
cd web && npm install && npm run dev
```
