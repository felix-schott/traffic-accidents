const app = {

    // APP COMPONENTS
    map: L.map('map-container', {
        preferCanvas: true,
        center: [52.529266, 13.409845],
        zoom: 10
    }),

    tiles: L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    }),

    legend: L.control({position: 'bottomright'}),

    overlays: L.layerGroup(),
    testSize: document.getElementById("test-size"),
    loading: document.querySelector(".loading-overlay"),

    // CONSTANTS
    colorGradient: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
    grades: [0, 5, 10, 15, 20, 25, 30, 35, 40],

    // DRIVER FUNCTION
    run() {

        this.tiles.addTo(this.map);

        document.querySelector(".ctrls-topright").onmouseover = (ev) => {
            this.map.dragging.disable();
        };
        document.querySelector(".ctrls-topright").onmouseleave = (ev) => {
            this.map.dragging.enable();
        };

        document.getElementById("predict-btn").onclick = async () => {
            if (this.testSize.value != 100) {
                this.loading.style.display = "flex";
                let predicted = await this.getPrediction(this.sampleKeys);
                this.predictedLayer = L.geoJson(predicted, { style: this.stylePredicted.bind(this) });
                this.dataLayer.remove();
                this.predictedLayer.addTo(this.map);
                this.loading.style.display = "none";
            }
        }

        document.getElementById("refresh-btn").onclick = async () => {
            this.testSize.value = "100";
            let event = new Event('change');
            this.testSize.dispatchEvent(event);
        }
        
        this.renderMap();
    },

    // API
    async getData() {
        let response = await fetch("/data", {
            headers: {
                'Accept': 'application/json'
            }
        });
        return response.json();
    },

    async getPrediction(sampleKeys) {
        let response = await fetch("/predict", {
            method: 'POST',
            body: JSON.stringify(sampleKeys),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.json()
    },

    // RENDER MAP UPON BTN CLICK
    async renderMap() {

        if (!this.dataLayer) {// check if layer has already been loaded during this session
            let polys = await this.getData();
            this.baseLayer = L.geoJson(polys, { style: this.styleBase });
            this.dataLayer = L.geoJson(polys, {
                style: this.styleData.bind(this), onEachFeature: (feature, layer) => {
                    layer.bindPopup((Math.round((feature.properties.mean_accidents_per_m2_2019 * 100000000 + Number.EPSILON) * 100) / 100).toString());
                }
            });
        }
        this.legend.onAdd = () => {
            let div = L.DomUtil.create('div', 'control legend');
            for (var i = 0; i < this.grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + this.getColour(this.grades[i]) + '"></i> ' +
                    this.grades[i] + (this.grades[i + 1] ? '&ndash;' + this.grades[i + 1] + '<br>' : '+');
            }
            return div;
        }
        this.legend.addTo(this.map);
        this.baseLayer.addTo(this.map);
        this.dataLayer.addTo(this.map);
        [...document.getElementsByClassName("control")].map(el => { el.style.display = "initial" });
        this.loading.style.display = "none";

        this.testSize.onchange = (ev) => {
            document.getElementById("test-size-display").innerText = ev.target.value;
            this.sampleKeys = this.samplePolys(ev.target.value);
        }
    },

    // SAMPLE POLYGONS (ACCORDING TO this.testSize)
    samplePolys(percent) {
        if (this.predictedLayer) this.predictedLayer.remove();
        this.dataLayer.remove();
        this.dataLayer.addTo(this.map);
        let layers = this.dataLayer.getLayers();
        let s = Math.round(layers.length * (1 - percent / 100)); // how many we need to remove
        let toRemove = layers.sort(() => 0.5 - Math.random()).slice(0, s);
        toRemove.forEach(l => l.remove());
        return toRemove.map(l => l.feature.properties.key)
    },

    // STYLE HELPER FUNCTIONS
    getColour(value) {
        if (value < 5) {
            return this.colorGradient[0]
        } else if (value < 10) {
            return this.colorGradient[1]
        } else if (value < 15) {
            return this.colorGradient[2]
        } else if (value < 20) {
            return this.colorGradient[3]
        } else if (value < 25) {
            return this.colorGradient[4]
        } else if (value < 30) {
            return this.colorGradient[5]
        } else if (value < 35) {
            return this.colorGradient[6]
        } else if (value < 40) {
            return this.colorGradient[7]
        } else {
            return this.colorGradient[8]
        }
    },
    
    styleData(feature) {
        return {
            fillColor: this.getColour(feature.properties.mean_accidents_per_m2_2019 * 100000000),
            weight: 1,
            opacity: 1,
            color: 'grey',
            fillOpacity: 0.9
        };
    },

    styleBase() {
        return {
            fillColor: '#E8E8E8',
            weight: 0.7,
            opacity: 0.9,
            color: 'grey',
            fillOpacity: 0.4
        };
    },

    stylePredicted(feature) {
        return {
            fillColor: this.getColour(feature.properties.mean_accidents_per_m2_2019 * 100000000),
            weight: 1,
            opacity: 0.9,
            color: feature.properties.predicted ? 'black' : 'grey',
            dashArray:  feature.properties.predicted ? '2' : '0',
            fillOpacity: 0.9
        };
    }
}

window.onload = () => { 
    if (window.matchMedia('(max-width: 600px)').matches) {
        location = "error.html"
    } else {
        app.run()
    }
}