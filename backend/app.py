from flask import Flask, send_from_directory, request, jsonify
import json
import geopandas as gpd
import numpy as np
import sqlite3
from joblib import load

app = Flask(__name__,
    static_url_path='', 
    static_folder='../frontend',)

@app.route('/')
def root():
    return send_from_directory("../frontend", 'index.html')

@app.route('/data', methods=["GET"])
def send_data():
    with open('data/accidents_per_lor.geojson') as f:
        data = json.load(f)
        return jsonify(data)

@app.route('/predict', methods=["POST"])
def send_prediction():
    keys = request.get_json() # array of lor keys for which we want to predict values
    model = load('model.joblib') # load pretrained model
    conn = sqlite3.connect('data/accidents.db')
    query = "SELECT key, daily_traffic_cars_per_m2, mean_accidents_per_m2_2019, centroid_lon, centroid_lat, geometry FROM accidents_per_lor"
    gdf = gpd.GeoDataFrame.from_postgis(query, conn, geom_col="geometry") # load data from db
    gdf["predicted"] = 0
    conn.close()

    gdf_keys = gdf[[k in keys for k in gdf["key"]]] # only look at rows for which we want to predict values
    X = np.array(gdf_keys["daily_traffic_cars_per_m2"]).reshape(-1, 1)
    coords = np.array([(x,y) for x,y in zip(gdf_keys["centroid_lon"], gdf_keys["centroid_lat"])])
    gdf.loc[[k in keys for k in gdf["key"]], "mean_accidents_per_m2_2019"] = model.predict(X, coords)
    gdf.loc[[k in keys for k in gdf["key"]], "predicted"] = 1 # mark predicted rows
    return gdf.to_json()

if __name__ == '__main__':
    app.run(debug=True)        