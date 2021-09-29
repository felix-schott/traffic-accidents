# Overview

This is a simple Flask app with a HTML/JS/CSS + Leaflet.js frontend. The app displays the number of traffic accidents per district in Berlin in 2019 relative to area. Users can sample n % of districts and let a pretrained [Regression-Kriging](https://en.wikipedia.org/wiki/Regression-kriging) model predict the values for the missing districts. The demo can be accessed [here](https://felixschott.net/traffic-accidents).

The folder `backend` contains all python scripts, including the notebooks `cleaning1` and `cleaning2` that contain all the data preparation work. Data sources are listed in the readme file in the `data` directory. `train_model` contains the actual model. `app` sets up the API and runs a local development server (the demo is deployed on a linux server using nginx/gunicorn/pm2).

`frontend` contains the app frontend. All geodata is dynamically requested from the backend (API specified in `backend/app.py`) and then rendered on the client side using Leaflet.js.

# How to run the app on your machine

1. Clone the repo.
2. `cd` into the backend subdirectory.
3. Create and activate a [virtual environment](https://docs.python.org/3/library/venv.html).
4. Run `pip install -r requirements.txt` to install the dependencies.
5. Run the app with `python app.py`.