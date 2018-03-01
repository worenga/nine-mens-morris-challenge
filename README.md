# Kampf gegen Mühlen
[![Build status][travis-image]][travis-url]
[![Docker][docker-image]][docker-url]
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Automated build](https://img.shields.io/docker/automated/worenga/nine-mens-morris-challenge.svg?style=flat-square)](https://hub.docker.com/r/worenga/nine-mens-morris-challenge/builds/)
[![Docker Build Status](https://img.shields.io/docker/build/worenga/nine-mens-morris-challenge.svg?style=flat-square)](https://hub.docker.com/r/worenga/nine-mens-morris-challenge/builds/)

[docker-image]: https://img.shields.io/docker/pulls/worenga/nine-mens-morris-app.svg
[docker-url]: https://hub.docker.com/r/worenga/nine-mens-morris-app/
[travis-image]: https://travis-ci.org/worenga/nine-mens-morris-challenge.svg?branch=master&style=flat-square
[travis-url]: https://travis-ci.org/worenga/nine-mens-morris-challenge
 
## adesso / it-talents.de Code Competition Oktober 2017
Autor: Benedikt Christoph Wolters <benedikt.wolters@rwth-aachen.de>

Einreichung für die it-talents.de/Adesso Code-Competition Oktober 2017 [Kampf gegen Mühlen](https://www.it-talents.de/foerderung/code-competition/code-competition-02-2017)

Eine ES6-Webapplikation auf Basis von [vue.js](https://vuejs.org/), [bulma](https://bulma.io), [webpack](https://github.com/webpack/webpack), [Babel](https://babeljs.io/), [fabric.js](http://fabricjs.com/) und [synaptic](https://github.com/cazala/synaptic/) für das Spiel Mühle im Browser. Es stehen unterschiedlich starke AI (Random, Minimax mit AlphaBeta Pruning sowie, MaxQ mit Transition Tables und Temporal Difference Reinforcement Learning) mit diversen Charakteristika zur Verfuegung. Das Spiel laeuft komplett im Browser. Die rechenintensiven AI-Berechnungen finden in einem Web Worker statt.


## Kurzbeschreibung / Übersicht

![Screenshot](https://raw.githubusercontent.com/worenga/nine-mens-morris-challenge/master/screencapture.png)


## Systemarchitektur

Das System ist als Vue.js Komponente geschrieben und laesst sich somit ohne Muehe in Andere Web Applikationen integrieren.
Es gibt eine Game Engine, welche die Logik des Spiels auf Basis der Spielzüge händelt. Alles was mit dem aktuellen Spielfeld zu tun hat befindet sich in der Game Configuration.
Die Game-Engine kommuniziert via Events mit dem Spielbrett (UI). Das Spielbrett wurde mit fabric.js auf Basis von canvas implementiert. Es erlaubt das verschieben der Mühlesteine via Drag and Drop.
Das Spiel wird von Agenten gespielt. Im simplesten Fall ist ein Agent einfach ein menschlicher Spieler (Human Agent), somit erlaubt es unsere Applikation Zwei Menschen miteinander Spielen zu lassen (z.B. zur Validierung von Spielzügen oder Prüfung der Unentschieden-Bedingungen). Alternativ kann ein Agent auch eine AI sein. Es ist ebenfalls Möglich zwei AIs gegeneinander Spielen zu lassen.

Datenstruktur:
Die Game Engine nutzt zur Representation der Spielfelder Bits in einer JavaScript Number.
Jede Position auf dem Spielfeld entspricht dabei einem Bit. Wir speichern für jeden Spieler die Positionen auf dem Spielfeld separat. Dies ermöglicht performante Operationen anhand von Bitmasken, sowie das Shiften von Bits bei der zur Symmetrieberechnung.

## Implementierte AI-Strategien

* *MiniMax mit Alpha-Beta Pruning, Transposition Tables/Zobrist Hashing und Iterative Deepening*:
  Es wird ein Suchbaum auf Basis der aktuellen Spielposition erstellt. Unter der Annahme dass der Gegenspieler optimal Spielt   berechnet der Algorithmus den besten Spielzug bis zu einer gewissen Spieltiefe.
  Um zu verhindern, dass bisher besuchte Spielstände mehrfach ausgewertet werden, wird a) in Transpositionstabellen gespeichert (Caching) b) Spielstaende unabhängig Ihrer Symmetrieeigenschaften (vgl. [Mühle Lehrbuch](http://muehlespieler.de/download/muehle_lehrbuch.pdf) betrachtet (Symmetrische Spielfelder werden uniformiert) und c) es wird Alpha-Beta Pruning benutzt (eine Taktik um geschickt Subbäume im Spielbaum die der ideale Gegenspieler nicht wählen würde auszuschließen). Als Bewertungsfunktion werden die Anzahl der genommenen Steine, die Bewegungsfreiheit sowie die Differenz in Muehlen benutzt.
  Der Spieler kann entweder bestimmen bis zur welcher Tiefe der Computer die Spielzüge vorberechnen kann (was unter Umständen recht lange dauern kann) oder Iterative-Deepening benutzen und ein festes Zeitfenster vorgeben in dem der Computer antworten muss.

* *Deep Temporal Difference (TD) Reinforcement Learning*:
  Wir trainineren ein Neuronales Netz, sodass es den Wert von zuküntigen Spielständen approximiert.
  Wir haben ein Neuronales Netz für 10 Stunden auf 2500 Spielen und 200k Spielzügen traininert.
  Es koennen unterschiedliche Trainingsstufen ausgewählt werden.
  Vgl. [Reinforcement Learning for Board Games:
The Temporal Difference Algorithm](http://www.gm.fh-koeln.de/ciopwebpub/Kone15c.d/TR-TDgame_EN.pdf)

* *MaxQ*:
  Es werden 100 Spielzüge ausgehend von dem Aktuellen Spielzug mit dem bisherigen Wissen exploriert und die einzelnen 
  Spielzüge bewertet. Vgl. [A Painless Q Learning Tutorial](http://mnemstudio.org/path-finding-q-learning-tutorial.htm)

* *Random*:
  Der Computer wählt einen Zufälligen Zug (Benchmarkstrategie)


## Live Demo

Das bereitgestellte Docker Image ~~wird auf der Amazon Cloud gehostet http://35.158.18.145:8099/ bzw.~~* unter
https://morris.benedikt-wolters.de/ .

*Anmerkung: Nach ueber 4 Monaten Auswertungzeit der Coding Challenge bin ich nicht laenger bereit die Kosten fuer ein EC2 Demo Hosting bereitzustellen.

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


# Lokale Manuelle Installation

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

# Offline Training des Neuronalen Netzes
Das Neuronale Netz der TD-Learning Strategie kann offline via Node.js gestartet werden.
```
npm run train -- --outDirectory output_directory
```
Das entstandene NeuronaleNetz kann in `src/ai/TemporalDifferenceReinforcementAgent.js` zur Verwendung registriert werden.

# Fragen
Bei Fragen zur Abgabe steht der Autor via Mail jederzeit zut Verfügung.
