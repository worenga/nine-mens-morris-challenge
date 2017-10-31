# Kampf gegen Mühlen
## Adesso / it-talents.de Code Competition
Autor: Benedikt Christoph Wolters <benedikt.wolters@rwth-aachen.de>

Einreichung für die it-talents.de/Adesso Code-Competition Oktober 2017 [Kampf gegen Mühlen](https://www.it-talents.de/foerderung/code-competition/code-competition-02-2017)

Eine ES6-Webapplikation auf Basis von [vue.js](), [bulma](https://bulma.io), [fabric.js](http://fabricjs.com/) und [synaptic](https://github.com/cazala/synaptic/) für das Spiel Mühle im Browser. Es stehen unterschiedlich starke AI (Random, Minimax mit AlphaBeta Pruning sowie, MaxQ mit Transition Tables und Temporal Difference Reinforcement Learning) mit diversen Charakteristika zur Verfuegung. Das Spiel laeuft komplett im Browser.


## Kurzbeschreibung / Uebersicht

TODO

## Systemarchitektur

TODO

## AI-Strategien

TODO

## Live Demo

Das bereitgestellte Docker Image wird auf der Google Cloud Engine gehostet http://104.199.16.87:4000/


## Installation

Die Installation ist am einfachsten ueber das Docker Image:

Ein Entsprechend vorbereitetes Docker Image findet sich unter https://hub.docker.com/r/worenga/nine-mens-morris-app/

```
docker pull worenga/nine-mens-morris-app:latest
```

Anschliessend kann die Applikation ueber
```
docker run -ti -p 8099:8099 worenga/nine-mens-morris-app:latest
```

gestartet werden.

Man kann anschliessend über einen Browser unter http://localhost:8099/ auf die Applikation zugreifen.

Mit CTRL-C kann die Application im Container wieder beendet werden.


# Lokale Manuelle Installation:

Gelingt die Docker Installation nicht, so kann der Code lokal installiert und gebaut werden werden.


Dazu wird zunaechst node.js 8 benötigt. Eine entsprechende Installationsanleitung findet sich [hier](https://nodejs.org/en/download/package-manager/)

Anschliessend kann der Code von GitHub geladen werden:
```
git clone https://github.com/worenga/nine-mens-morris-challenge.git
```
und entsprechend installiert werden. 

```
cd nine-mens-morris-challenge
npm install
npm run buildprod
npm run serve
```

Anschliessend kann man ueber einen Browser die Applikation auf http://localhost:8099 lokal aufrufen


# Development Modus

Beim Entwickeln bietet sich es an die Development Version mit Live-Reload und besseren Fehlermeldungen zu starten, dies geht via

```
npm start
```
