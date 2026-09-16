# umbra — reprise dans un dépôt neuf

Note de transfert. Ce fichier existe pour qu'une session future — la mienne ou une autre — sache
d'où vient ce code, où il s'en va, et ce qui a déjà été tranché. Il n'a rien à voir avec l'usage de
la librairie : pour ça, lire `README.md` (le quoi) et `CLAUDE.md` (le pourquoi et les conventions).

## D'où ça vient

Écrit sur le poste de travail, en local, **sans remote**. Tout l'historique est local, sous nom et
courriel **personnels**, sans aucun lien avec l'employeur. C'était la consigne : le dépôt se crée et se pousse
hors des heures de travail.

Le besoin a été cadré en observant du code de travail, mais **rien de cet emploi n'est nommé ici** —
ni entreprise, ni produit, ni vocabulaire de domaine. L'historique a d'ailleurs été réécrit une fois
(`git filter-branch`) pour retirer du vocabulaire pharmaceutique qui s'était glissé dans le
playground : `frag-licence.js` est devenu `frag-trial.js`, les « pharmacies » sont des
_workspaces_, les « patients » des _projects_, les « produits » des _tags_. **Cette règle tient pour
la suite** : aucun terme de domaine pharmaceutique dans ce dépôt, jamais.

Les messages de commit sont en **français québécois professionnel**, et **aucun `Co-Authored-By`**
ni aucune attribution d'IA n'y figure.

## Où ça s'en va

Un dépôt neuf, à la maison, sous le nom `umbra` (libre sur npm). Rien à migrer : `git init`,
copier le contenu de cette archive, premier commit.

À terme : un **monorepo** avec `antumbra` (gestionnaire de dialogues), `penumbra` (le design system) et
`umbra`, avec un **playground partagé**. C'est pour ça que le playground d'ici copie la structure
de celui d'antumbra jusqu'aux noms de fichiers — le jour où les trois se rejoignent, il n'y a pas deux
architectures à réconcilier.

## Ce que c'est

Un orchestrateur de démarrage **sans framework**. Des étapes déclarent ce qu'elles lisent dans
`needs` ; le parallélisme se déduit du graphe. Le résultat est un objet gelé dont le type appartient
à l'application (fusion de déclarations sur quatre interfaces). En chemin, la run accumule deux
choses que l'application récupère au montage : des **notices** (des faits consignés) et des
**intents** (du travail d'interface que la couche sans framework ne peut pas faire elle-même — une
modale à ouvrir, une redirection à proposer).

Deux phases, et la frontière est typée, pas documentée : une étape `preflight` peut refuser le
montage et n'a pas de port d'interface ; une étape `mounted` a le port et peut attendre une réponse,
mais ne peut plus refuser quoi que ce soit.

## Ce qui a été conclu

### Rien d'équivalent n'existe

Recherche faite au début, et le trou est réel mais petit. Angular `provideAppInitializer`, les
plugins Nuxt, les loaders de TanStack Router, Luigi `uxManager`, Effect `Layer`, single-spa, XState,
`orchestrator` / `p-graph` : chacun est verrouillé à son cadre, ou n'a pas la combinaison
« résultat typé par augmentation + file d'intentions transmise au framework qui monte ». Le tableau
complet est dans `README.md`.

### Décisions de conception qui ne se rediscutent pas sans raison neuve

- **Le parallélisme se déduit, il ne se déclare pas.** Pas de drapeau `parallel`, pas de plafond de
  concurrence — un plafond ferait mentir `plan()`.
- **`run()` ne rejette jamais sur un échec d'étape et mémoïse sa promesse.** Un échec est un statut.
  Les erreurs de programmation (cycle, identifiant inconnu ou dupliqué) lancent à la construction.
- **`plan()` rend des niveaux, pas des vagues.** C'est l'analyse statique ; `outcome.timeline` est
  la vérité d'exécution, et les deux ont le droit de différer.
- **Une seule politique d'échec : drain.** Les étapes en vol terminent, rien de neuf n'est
  ordonnancé.
- **`scope: 'page'`** partage le travail identique pour toute la page via un registre sur
  `globalThis` keyé par `Symbol.for`, pas par identité de module — c'est ce qui fait qu'une seconde
  copie de la librairie trouve quand même la réponse de la page. C'est le seul état global du
  paquet, et il est délibéré.
- **Pas de canal montant « module prêt ».** Demandé, étudié, refusé : croissance non bornée, aucun
  endroit où poser les types, et l'hôte le fait déjà mieux (`single-spa:app-change`,
  `getMountedApps()`). Une librairie qui réimplémente les signaux de son hôte, c'est deux sources de
  vérité à garder en phase.

### Vocabulaire

Trois noms, un mot chacun : **bootstrap** (la machine déclarée), **run** (une exécution), **step**
(une unité de travail). Le tableau de renommage complet est dans `CHANGELOG.md`, entrée « one noun
per concept ». Deux règles en sortent : un mot veut dire une chose (`phase` = `preflight` ou
`mounted`, point ; la position d'une run est un `stage`), et pas d'abréviation (il n'y a plus de
préfixe `Boot`).

### La seule décision laissée ouverte

**`Session`.** `boot.session()` est la moitié vivante d'une run, alors que `session` est ce que
presque toute application nomme son étape de jeton. La collision est permanente chez tout
consommateur, pas seulement dans le playground d'ici. Candidats esquissés : `boot.live()` /
`LiveRun`, ou `RunSession`. Non tranché, volontairement — c'est un renommage plus lourd que les
autres et il n'y a pas encore d'usage réel pour arbitrer.

## État du travail

Tout est vert : `yarn check` (types TS 7, oxlint type-aware, oxfmt, typedoc), 68 tests unitaires et
7 tests de composants, `yarn build`, `yarn verify:package`, et un smoke test navigateur sur les sept
routes du playground.

Le playground est un site routé en couches Feature-Sliced (`app` → `pages` → `widgets` → `entities`
→ `shared`), sur les tokens de Penumbra, avec :

- `/getting-started` — la démo complète : le graphe, la chronologie, l'outcome, des interrupteurs
  pour casser des choses exprès, et deux bootstraps sur la même page.
- `/microfrontends` — quatre fragments sur une page dans un iframe, dont un qui tourne sur sa
  **propre copie compilée** de la librairie et partage quand même.
- `/single-spa` — intégration avec un hôte existant : la run décide si `start()` est appelé.
- `/api` — la référence, projetée de typedoc, une page par chapitre.
- `/design-system`, `/stories`.

## Pour repartir de zéro

```sh
corepack enable          # le yarn global est le 1.22 classique; le dépôt épingle Yarn 4.18
yarn install
yarn check && yarn test  # devrait être vert tel quel
yarn dev                 # le playground sur :3002
```

Deux choses à savoir avant de toucher aux outils :

- **TypeScript 7 partout dans la chaîne de vérification**, via l'alias `typescript-7`. Le
  `typescript` 6.0.3 nu reste parce que typedoc y pèse et que `typescript-7/lib` ne livre pas de
  `tsserver.js` pour l'éditeur.
- **oxlint 1.82 et oxfmt 0.67 sont épinglés** : les versions suivantes étaient en quarantaine npm au
  moment de l'écriture. Vérifier avant de monter.

## Ce qui reste à faire

- Créer le dépôt distant et pousser (hors heures de travail).
- Trancher `Session`, ou décider explicitement de le garder.
- Le monorepo à trois paquets avec le playground partagé, quand antumbra et penumbra suivront.
