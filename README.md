 <img src="sensebox_logo.svg?raw=true" height="128" alt="senseBox Logo"/>

# Remote sensebox - Backend

This project was created with [Create React App](https://github.com/facebook/create-react-app) and represents the continuation or improvement of [blockly.sensebox.de](https://blockly.sensebox.de/ardublockly/?lang=de&board=sensebox-mcu) to get the sensebox working remotely.


## Getting Started

1. [Download](https://github.com/Janni2006/remote-sensebox-react-backend/archive/refs/heads/main.zip) or clone the GitHub Repository ``git clone https://github.com/Janni2006/remote-sensebox-react-backend.git`` and checkout to branch ``main``.

3. open shell and navigate inside folder ``remote-sensebox-react-backend``
    * run ``bash setup.sh``
    * run ``npm install``
    * run ``npm start``
4. open  [localhost:8250](http://localhost:8250)

# Routes
- api
    - queue
    - private-sketches
    - sketch/:sketchId
    - upload

# Run in stand alone mode
1. [Download](https://github.com/Janni2006/remote-sensebox-react-backend/archive/refs/heads/standalone.zip) or clone the GitHub Repository ``git clone https://github.com/Janni2006/remote-sensebox-react-backend.git`` and checkout to branch ``standalone``.

2. install [Node.js v10.xx](https://nodejs.org/en/) on your local machine

3. open shell and navigate inside folder ``remote-sensebox-react-backend``
    * run ``npm install``
    * run ``npm start``
4. open  [localhost:8250](http://localhost:8250)
