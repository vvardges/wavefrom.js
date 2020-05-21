createPolygon = (points, color, delta) => {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("fill", color);
    polygon.setAttribute("opacity", "0.5");

    const complexArray = [];
    for (let i = 0; i < points.length; i++) {
        complexArray.push(i*100+delta[0] + "," + (delta[1] + points[i]));
    }
    for (let i = points.length - 2; i > 0; i--) {
        complexArray.push(i*100+delta[0] + "," + (delta[1] - points[i]));
    }
    const pointsStr = complexArray.join(" ");

    polygon.setAttribute("points",pointsStr);

    return polygon;
};

const svg = document.getElementById("svg");
let polygon = createPolygon([0, 10, 0, 30, 20, 0, 0 , 0, 10, 0], "rgb(255, 228, 190)", [0, 40]);
svg.appendChild(polygon);
polygon = createPolygon([0, 0, 0, 40, 10, 0, 0 , 10, 0, 10], "rgb(240, 157, 178)", [20, 40]);
svg.appendChild(polygon);
polygon = createPolygon([0, 20, 0, 0, 20, 20, 0 , 20, 10, 0], "rgb(118, 161, 196)", [30, 40]);
svg.appendChild(polygon);
polygon = createPolygon([0, 0, 0, 0, 0, 0, 40 , 0, 0, 0], "rgb(110, 121, 163)", [30, 40]);
svg.appendChild(polygon);