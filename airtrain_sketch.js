// airtrain_sketch.js for JFK AirTrain Route Visualization

let table;
let allRoutePoints = []; // Stores all parsed [lon, lat] pairs
let minLat, maxLat, minLon, maxLon;

function preload() {
  console.log("preload: Starting to load table.");
  table = loadTable('AIRTRAIN_20260208.csv', 'csv', 'header');
  console.log("preload: Table loaded. Row count:", table ? table.getRowCount() : 0);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES); 
  console.log("setup: Canvas created.");

  if (table && table.getRowCount() > 0) {
    minLat = 90;
    maxLat = -90;
    minLon = 180;
    maxLon = -180;
    console.log("setup: Initializing min/max Lat/Lon.");

    for (let i = 0; i < table.rows.length; i++) {
      let row = table.rows[i];
      let geomString = row.get('the_geom');
      
      if (!geomString) {
        console.warn("setup: Row", i, "has empty 'the_geom'. Skipping.");
        continue;
      }

      // Handle potential variations in MULTILINESTRING format
      let cleanedGeomString = geomString.replace('MULTILINESTRING ((', '').replace('))', '');
      let parts = cleanedGeomString.split('), (');
      
      for (let part of parts) {
        let coords = part.split(', ');
        for (let coord of coords) {
          let lonLat = coord.split(' ').map(parseFloat);
          let lon = lonLat[0];
          let lat = lonLat[1];

          if (!isNaN(lat) && !isNaN(lon)) {
            allRoutePoints.push([lon, lat]);

            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
          } else {
            console.warn("setup: Invalid coordinate found in row", i, ":", coord);
          }
        }
      }
      if (i % 100 === 0) { // Log progress for large files
        console.log("setup: Parsed", i, "rows.");
      }
    }
    console.log("setup: Finished parsing all rows.");
    console.log("setup: Found min/max Lat/Lon:", minLat, maxLat, minLon, maxLon);
    console.log("setup: Total route points:", allRoutePoints.length);

  } else {
    console.error("setup: Error: Could not load AirTrain data or data is empty.");
  }
  
  noLoop(); 
  console.log("setup: noLoop() called. Setup finished.");
}

function draw() {
  background(240); // Light gray background
  
  if (allRoutePoints.length > 0) {
    // --- Draw Bounding Box (abstract map area) ---
    let padding = 50; // Padding from canvas edges
    let mapWidth = width - padding * 2;
    let mapHeight = height - padding * 2;

    // Adjust mapping to fit within padded area
    let xMapStart = padding;
    let xMapEnd = width - padding;
    let yMapStart = padding;
    let yMapEnd = height - padding;

    stroke(150);
    strokeWeight(1);
    noFill();
    rect(xMapStart, yMapStart, mapWidth, mapHeight); // Bounding box for the map area

    // --- Draw AirTrain Route ---
    stroke(0, 0, 255); // Blue line
    strokeWeight(3);
    noFill();

    beginShape();
    for (let i = 0; i < allRoutePoints.length; i++) {
      let lon = allRoutePoints[i][0];
      let lat = allRoutePoints[i][1];

      // Map longitude and latitude to canvas coordinates, considering padding
      let x = map(lon, minLon, maxLon, xMapStart, xMapEnd);
      let y = map(lat, maxLat, minLat, yMapStart, yMapEnd); // Invert lat mapping for y-axis

      vertex(x, y);
    }
    endShape();

  } else {
    fill(0);
    textAlign(CENTER, CENTER);
    text("Loading data or data error.", width / 2, height / 2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw(); // Re-draw everything when window is resized for responsiveness
}
