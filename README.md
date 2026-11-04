# Travel Companion

Application web de planification de voyages, réalisée en binôme (2024).

**Stack** : Django (backend), React (frontend).

## Le problème

Pour organiser un voyage, il faut aujourd'hui jongler entre plusieurs outils : cartes, avis, forums, itinéraires. Et la plupart nécessitent une connexion Internet. Travel Companion regroupe tout au même endroit, avec un accès hors ligne aux itinéraires.

## Fonctionnalités

- Planification d'itinéraires jour par jour
- Exploration de lieux par catégorie (activités, restaurants, hôtels, événements)
- Carte interactive avec sauvegarde des lieux
- Accès hors ligne aux itinéraires téléchargés
- Communauté : publication de posts et partage de plans de voyage
- Profil utilisateur et suivi des voyages (en cours, à venir, terminés)

`[Retire les lignes qui ne sont pas implémentées dans le code.]`

## Conception UX

Avant de coder, nous avons mené une étude UX : interviews utilisateurs, personas, analyse concurrentielle (Google Maps, TripAdvisor, Booking, Rome2Rio, Skyscanner), user flow et design system. Les écrans (mobile et desktop) ont été prototypés sur Figma.

`[Ajoute le lien Figma ici.]`

## Ma contribution

`[À compléter : ta part dans la conception UX, le backend Django et/ou le frontend React.]`

## Structure du dépôt

| Dossier | Contenu |
|---|---|
| `travelcompanion/` | Configuration du projet Django |
| `account/` | `[Gestion des comptes et profils : à vérifier]` |
| `myapp/` | `[Logique métier : à vérifier]` |
| `reactapp/` | Interface React |

## Installation

```bash
# Backend
pip install -r requirements.txt    # [vérifie que ce fichier existe]
python manage.py migrate
python manage.py runserver

# Frontend
cd reactapp
npm install
npm start                          # [vérifie les commandes dans package.json]
```
