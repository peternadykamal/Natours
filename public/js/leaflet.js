import L from "./leaflet/leaflet-src";

const displayMap = (locations) => {
  const map = L.map("map", {
    zoomControl: false,
    doubleClickZoom: false,
    dragging: false,
  }); //to disable + - zoom
  // var map = L.map('map', { zoomControl: false }).setView([31.111745, -118.113491], );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    crossOrigin: "",
  }).addTo(map);

  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]])
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
        closeButton: false,
      })
      .addTo(map)
      .on("mouseover", function () {
        this.openPopup();
      })
      .on("mouseout", function () {
        this.closePopup();
      });
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  map.scrollWheelZoom.disable();
};

export default displayMap;
