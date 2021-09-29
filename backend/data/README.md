# Data Sources

- `lor_planungsraeume.gpkg`: downloaded as WFS from [FIS Broker](https://fbinter.stadt-berlin.de/fb/berlin/service_intern.jsp?id=s_lor_plan@senstadt&type=WFS), reprojected to WGS84 in QGIS
- `accidents_berlin_2019`: downloaded from [Open Data Berlin](https://daten.berlin.de/datensaetze/strassenverkehrsunfälle-nach-unfallort-berlin-2020)
- `LOR-Schluesselsystematik.xls`: downloaded from [city gov website](http://www.stadtentwicklung.berlin.de/planen/basisdaten_stadtentwicklung/lor/download/LOR-Schluesselsystematik.xls)
- `traffic.gpkg`: downloaded as WFS from [FIS Broker](https://fbinter.stadt-berlin.de/fb/berlin/service_intern.jsp?id=s_vmengen2019@senstadt&type=WFS)

- `num_accidents.gpkg`: 
    1. In QGIS 3.20, load `accidents.gpkg` (produced in `cleaning.py`)
    2. for each point layer in `accidents.gpkg` and `lor_planungsraeume.gpkg`: Vector > Analysis Tools > Count Points in Polygon
    3. perform spatial join (Data Management Tools > Join Attributes by Location)