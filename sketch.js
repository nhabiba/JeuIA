let pursuer1, pursuer2;
let target;
let obstacles = [];
let vehicles = [];
let separationDistance = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);

  separationSlider = createSlider(0, 200, separationDistance, 1);
  separationSlider.position(10, 10);
  separationSlider.style('width', '200px').style('height', '10px').style('background', 'blue');
  pursuer1 = new Vehicle(100, 100);
  pursuer2 = new Vehicle(random(width), random(height));

  vehicles.push(pursuer1);
  vehicles.push(pursuer2);

  obstacle = new Obstacle(width / 2, height / 2, 100);
  obstacles.push(obstacle);
}

function draw() {
  background(0, 0, 0, 100);

  target = createVector(mouseX, mouseY);

  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);

  obstacles.forEach(o => {
    o.show();
  });

  let targetMouse = createVector(mouseX, mouseY);
  let zoneCenter = pursuer1.drawEvadeZone();

  separationDistance = separationSlider.value();
  let leader = vehicles[0];

  leader.drawZoneAhead();
  
  for (let i = 0; i < vehicles.length; i++) {
    if (i == 0) {
      vehicles[i].applyBehaviors(targetMouse, obstacles, vehicles, separationDistance);
    } else {
      let vehicle = vehicles[i];
      let distanceToZones = p5.Vector.dist(vehicle.pos, zoneCenter);
      let vehiclePrevious = vehicles[i - 1];
      let distanceToZone = dist(vehicle.pos.x, vehicle.pos.y, leader.pos.x, leader.pos.y);

      if (distanceToZone < 40) {
        let evadeForce = vehicle.evade(leader);
        vehicle.applyForce(evadeForce);
      }

      if (distanceToZones < 40) {
        let evadeForce = vehicle.evade(leader);
        vehicle.applyForce(evadeForce);
      } else {
        vehicle.weightEvade = 0;
      }

      let pointBehind = vehiclePrevious.vel.copy();
      pointBehind.normalize();
      pointBehind.mult(-30);
      pointBehind.add(vehiclePrevious.pos);

      fill(255, 0, 0);
      circle(pointBehind.x, pointBehind.y, 10);

      vehicle.applyBehaviors(pointBehind, obstacles, vehicles);

      if (vehicle.pos.dist(pointBehind) < 20 && vehicle.vel.mag() < 0.01) {
        vehicle.weightArrive = 0;
        vehicle.weightObstacle = 0;
        vehicle.vel.setHeading(p5.Vector.sub(vehiclePrevious.pos, vehicle.pos).heading());
      } else {
        vehicle.weightArrive = 0.3;
        vehicle.weightObstacle = 0.9;
      }
    }
    
    vehicles[i].update();
    vehicles[i].show();
  }
}

function mousePressed() {
  obstacle = new Obstacle(mouseX, mouseY, random(5, 60));
  obstacles.push(obstacle);
}

function keyPressed() {
  if (key == "v") {
    vehicles.push(new Vehicle(random(width), random(height)));
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  }

  if (key == "f") {
    const nbMissiles = 10;

    for(let i = 0; i < nbMissiles; i++) {
      let x = 20 + random(10);
      let y = random(height / 2 - 5, random(height / 2 + 5));

      let v = new Vehicle(x, y);
      vehicles.push(v);
    }
  }
}
