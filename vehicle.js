/*
  Calcule la projection orthogonale du point a sur le vecteur b
  a et b sont des vecteurs calculés comme ceci :
  let v1 = p5.Vector.sub(a, pos); soit v1 = pos -> a
  let v2 = p5.Vector.sub(b, pos); soit v2 = pos -> b
  */
  function findProjection(pos, a, b) {
    let v1 = p5.Vector.sub(a, pos);
    let v2 = p5.Vector.sub(b, pos);
    v2.normalize();
    let sp = v1.dot(v2);
    v2.mult(sp);
    v2.add(pos);
    return v2;
  }
  
  class Vehicle {
    static debug = false;
  
    constructor(x, y) {
      // position du véhicule
      this.pos = createVector(x, y);
      // vitesse du véhicule
      this.vel = createVector(0, 0);
      // accélération du véhicule
      this.acc = createVector(0, 0);
      // vitesse maximale du véhicule
      this.maxSpeed = 6;
      // force maximale appliquée au véhicule
      this.maxForce = 0.9;
      this.color = "white";
      // à peu près en secondes
      this.dureeDeVie = 5;
      this.weightArrive = 0.3;
      this.weightObstacle = 0.9;
      this.r_pourDessin = 8;
      // rayon du véhicule pour l'évitement
      this.r = this.r_pourDessin * 2;
  
      // Pour évitement d'obstacle
      this.largeurZoneEvitementDevantVaisseau = this.r / 2;
  
      // chemin derrière vaisseaux
      this.path = [];
      this.pathMaxLength = 30;
    }
    wander() {
      // point devant le véhicule
      let wanderPoint = this.vel.copy();
      wanderPoint.setMag(100);
      wanderPoint.add(this.pos);
      
      // on le dessine sous la forme d'une petit cercle rouge
       //fill(255, 0, 0);
       //noStroke();
       //circle(wanderPoint.x, wanderPoint.y, 8);
  
      // Cercle autour du point
      let wanderRadius = 50;
       //noFill();
       //stroke(255);
       //circle(wanderPoint.x, wanderPoint.y, wanderRadius * 2);
  
       // on dessine une lign qui relie le vaisseau à ce point
       // c'est la ligne blanche en face du vaisseau
       //line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
  
       // On va s'occuper de calculer le point vert SUR LE CERCLE
       // il fait un angle wanderTheta avec le centre du cercle
       // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
       // + cet angle
      let theta = this.wanderTheta + this.vel.heading();
  
      let x = wanderRadius * cos(theta);
      let y = wanderRadius * sin(theta);
  
      // maintenant wanderPoint c'est un point sur le cercle
      wanderPoint.add(x, y);
  
      // on le dessine sous la forme d'un cercle vert
       //fill(0, 255, 0);
       //noStroke();
       //circle(wanderPoint.x, wanderPoint.y, 16);
  
       // on dessine le vecteur desiredSpeed qui va du vaisseau au poibnt vert
       //stroke(255);
       //line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
  
       // On a donc la vitesse désirée que l'on cherche qui est le vecteur
       // allant du vaisseau au cercle vert. On le calcule :
       // ci-dessous, steer c'est la desiredSpeed directement !
      let steer = wanderPoint.sub(this.pos);
  
      steer.setMag(this.maxForce);
      this.applyForce(steer);
  
      // On déplace le point vert sur le cerlcle (en radians)
      this.displaceRange = 0.3;
      this.wanderTheta += random(-this.displaceRange, this.displaceRange);
    }
    // on fait une méthode applyBehaviors qui applique les comportements
    // seek et avoid
    applyBehaviors(target, obstacles) {
  
      let arriveForce = this.arrive(target);
      let avoidForce = this.avoidAmeliore(obstacles, vehicules, false);
      //let avoidForce = this.avoidAmeliore(obstacles);
  
      arriveForce.mult(this.weightArrive);
      avoidForce.mult(this.weightObstacle);
      
  
      this.applyForce(arriveForce);
      this.applyForce(avoidForce);
    }
  ///


  ///

  drawZoneAhead() {
    let pointAhead = this.vel.copy();
    pointAhead.setMag(100); // Réglez cette valeur pour ajuster la distance devant le leader
    pointAhead.add(this.pos);
  
    // Dessiner la zone
    fill(255, 0, 0, 50); // Couleur semi-transparente pour la zone
    noStroke();
    circle(pointAhead.x, pointAhead.y, 80); // 80 pixels de diamètre pour un rayon de 40
  }
///

///

drawEvadeZone() {
  let pointAhead = this.vel.copy();
  pointAhead.setMag(100); // La distance devant le leader pour le centre de la zone
  pointAhead.add(this.pos);

  fill(0, 0, 255, 100); // Bleu semi-transparent
  noStroke();
  ellipse(pointAhead.x, pointAhead.y, 80, 80); // Dessiner la zone

  return pointAhead; // Retourner le point central de la zone
}



  

    avoid(obstacles) {
      // calcul d'un vecteur ahead devant le véhicule
      // il regarde par exemple 50 frames devant lui
      let ahead = this.vel.copy();
      ahead.normalize();
      ahead.mult(100);
  
      // on le dessine
      this.drawVector(this.pos, ahead, "lightblue");
  
      // Detection de l'obstacle le plus proche
      let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);
  
      // On calcule la distance entre le cercle et le bout du vecteur ahead
      let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);
      // On dessine ce point pour debugger
      fill("red");
      noStroke();
      circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);
  
      // On dessine la zone d'évitement
      // On trace une ligne large qui va de la position du vaisseau
      // jusqu'au point au bout de ahead
      stroke(color(255, 200, 0, 90)); // gros, semi transparent
      strokeWeight(this.largeurZoneEvitementDevantVaisseau);
      line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
  
      let distance = pointAuBoutDeAhead.dist(obstacleLePlusProche.pos);
      //console.log("distance = " + distance)
  
      // si la distance est < rayon de l'obstacle
      // il y a collision possible et on dessine l'obstacle en rouge
      if (distance < obstacleLePlusProche.r + this.largeurZoneEvitementDevantVaisseau + this.r) {
        // collision possible
        obstacleLePlusProche.color = "red";
        // calcul de la force d'évitement. C'est un vecteur qui va
        // du centre de l'obstacle vers le point au bout du vecteur ahead
        let force = p5.Vector.sub(pointAuBoutDeAhead, obstacleLePlusProche.pos);
        // on le dessine pour vérifier qu'il est ok (dans le bon sens etc)
        this.drawVector(obstacleLePlusProche.pos, force, "yellow");
  
        // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
        // on limite ce vecteur à la longueur maxSpeed
        force.setMag(this.maxSpeed);
        // on calcule la force à appliquer pour atteindre la cible
        force.sub(this.vel);
        // on limite cette force à la longueur maxForce
        force.limit(this.maxForce);
        return force;
      } else {
        // pas de collision possible
        obstacleLePlusProche.color = "green";
        return createVector(0, 0);
      }
    }
  
    /* 
      Version avec deux vecteurs ahead et ahead2 (deux fois plus court) et 
      donc deux zones d'évitement. On adapte aussi en plus ces vecteurs à la vitesse du véhicule
      Plus le véhicule va vite plus il regarde loin...
    */
    avoidAmeliore(obstacles, vehicules, vehiculesAsObstacles = false) {
      // calcul d'un vecteur ahead devant le véhicule
      // il regarde par exemple 50 frames devant lui
      let ahead = this.vel.copy();
      ahead.normalize();
      ahead.mult(20 * this.vel.mag() * 0.8);
  
      // Deuxième vecteur deux fois plus petit
      let ahead2 = ahead.copy();
      ahead2.mult(0.5);
  
      // on les dessine
      if (Vehicle.debug) {
        this.drawVector(this.pos, ahead, "lightblue");
        this.drawVector(this.pos, ahead2, "red");
      }
  
      // Detection de l'obstacle le plus proche
      let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);
      let vehiculeLePlusProche = this.getVehiculeLePlusProche(vehicules);
  
      // On calcule la distance entre le cercle et le bout du vecteur ahead
      let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);
      let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);
  
      // On dessine ce point pour debugger
      if (Vehicle.debug) {
        fill("red");
        noStroke();
        circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);
  
        // On dessine la zone d'évitement
        // On trace une ligne large qui va de la position du vaisseau
        // jusqu'au point au bout de ahead
        stroke(color(255, 200, 0, 90)); // gros, semi transparent
        strokeWeight(this.largeurZoneEvitementDevantVaisseau);
        line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
      }
      let distance1 = pointAuBoutDeAhead.dist(obstacleLePlusProche.pos);
      let distance2 = pointAuBoutDeAhead2.dist(obstacleLePlusProche.pos);
      // on tient compte aussi de la position du vaisseau
      let distance3 = this.pos.dist(obstacleLePlusProche.pos);
      let distance4 = Infinity;
      if(vehiculeLePlusProche) {
        distance4 = this.pos.dist(vehiculeLePlusProche.pos);
      } 
  
      let plusPetiteDistance = min(distance1, distance2);
      plusPetiteDistance = min(plusPetiteDistance, distance3)
  
      // la plus petite distance est bien celle par rapport à l'obstacle
      // le plus proche
  
      // point de référence = point au bout de ahead, de ahead2 ou pos
      let pointDeReference;
      if (distance1 < distance2) {
        pointDeReference = pointAuBoutDeAhead;
      } else {
        pointDeReference = pointAuBoutDeAhead2;
      }
      if ((distance3 < distance1) && (distance3 < distance2)) {
        pointDeReference = this.pos;
      }
      // alerte rouge que si vaisseau dans obstacle
      let alerteRougeVaisseauEnCollisionAvecObstacleLePlusProche = (distance3 < obstacleLePlusProche.r);
  
      // Si le vaisseau n'est pas dans l'obstacle
      // on peut éventuellement considérer le vehicule le plus proche
      // comme l'obstacle à éviter, seulement s'il est plus proche
      // que l'obstacle le plus proche
      if(vehiculesAsObstacles) {
        if (!alerteRougeVaisseauEnCollisionAvecObstacleLePlusProche) {
          let distanceAvecVehiculeLePlusProche = distance4;
          let distanceAvecObstacleLePlusProche = distance3;
    
          if (distanceAvecVehiculeLePlusProche < distanceAvecObstacleLePlusProche) {
            obstacleLePlusProche = vehiculeLePlusProche;
            plusPetiteDistance = distanceAvecVehiculeLePlusProche;
          }
        }
      }
      
  
      // si la distance est < rayon de l'obstacle le plus proche
      // il y a collision possible et on dessine l'obstacle en rouge
      if (plusPetiteDistance < obstacleLePlusProche.r + this.largeurZoneEvitementDevantVaisseau) {
        // collision possible
        obstacleLePlusProche.color = "red";
        // calcul de la force d'évitement. C'est un vecteur qui va
        // du centre de l'obstacle vers le point au bout du vecteur ahead
        let force = p5.Vector.sub(pointDeReference, obstacleLePlusProche.pos);
  
        if (Vehicle.debug) {
          // on le dessine pour vérifier qu'il est ok (dans le bon sens etc)
          this.drawVector(obstacleLePlusProche.pos, force, "yellow");
        }
  
        // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
        // on limite ce vecteur à la longueur maxSpeed
        force.setMag(this.maxSpeed);
        // on calcule la force à appliquer pour atteindre la cible
        force.sub(this.vel);
        // on limite cette force à la longueur maxForce
        force.limit(this.maxForce);
  
        if (alerteRougeVaisseauEnCollisionAvecObstacleLePlusProche) {
          force.setMag(this.maxForce * 2);
        }
        return force;
      } else {
        // pas de collision possible
        obstacleLePlusProche.color = "green";
        return createVector(0, 0);
      }
    }
    getObstacleLePlusProche(obstacles) {
      let plusPetiteDistance = 100000000;
      let obstacleLePlusProche;
  
      obstacles.forEach(o => {
        // Je calcule la distance entre le vaisseau et l'obstacle
        const distance = this.pos.dist(o.pos);
        if (distance < plusPetiteDistance) {
          plusPetiteDistance = distance;
          obstacleLePlusProche = o;
        }
      });
  
      return obstacleLePlusProche;
    }
  
    getVehiculeLePlusProche(vehicules) {
      let plusPetiteDistance = Infinity;
      let vehiculeLePlusProche;
  
      vehicules.forEach(v => {
        if (v != this) {
          // Je calcule la distance entre le vaisseau et le vehicule
          const distance = this.pos.dist(v.pos);
          if (distance < plusPetiteDistance) {
            plusPetiteDistance = distance;
            vehiculeLePlusProche = v;
          }
        }
      });
  
      return vehiculeLePlusProche;
    }
  
    getClosestObstacle(pos, obstacles) {
      // on parcourt les obstacles et on renvoie celui qui est le plus près du véhicule
      let closestObstacle = null;
      let closestDistance = 1000000000;
      for (let obstacle of obstacles) {
        let distance = pos.dist(obstacle.pos);
        if (closestObstacle == null || distance < closestDistance) {
          closestObstacle = obstacle;
          closestDistance = distance;
        }
      }
      return closestObstacle;
    }
  
    arrive(target) {
      // 2nd argument true enables the arrival behavior
      return this.seek(target, true);
    }
  
    seek(target, arrival = false) {
      let force = p5.Vector.sub(target, this.pos);
      let desiredSpeed = this.maxSpeed;
      if (arrival) {
        let slowRadius = 100;
        let distance = force.mag();
        if (distance < slowRadius) {
          desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
        }
      }
      force.setMag(desiredSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      return force;
    }
  
    // inverse de seek !
    flee(target) {
      return this.seek(target).mult(-1);
    }
  
    /* Poursuite d'un point devant la target !
       cette methode renvoie la force à appliquer au véhicule
    */
    pursue(vehicle) {
      let target = vehicle.pos.copy();
      let prediction = vehicle.vel.copy();
      prediction.mult(10);
      target.add(prediction);
      fill(0, 255, 0);
      circle(target.x, target.y, 16);
      return this.seek(target);
    }
  
    evade(vehicle) {
      let pursuit = this.pursue(vehicle);
      pursuit.mult(-1);
      return pursuit;
    }
  
    // applyForce est une méthode qui permet d'appliquer une force au véhicule
    // en fait on additionne le vecteurr force au vecteur accélération
    applyForce(force) {
      this.acc.add(force);
    }
  
    update() {
      // on ajoute l'accélération à la vitesse. L'accélération est un incrément de vitesse
      // (accélératiion = dérivée de la vitesse)
      this.vel.add(this.acc);
      // on contraint la vitesse à la valeur maxSpeed
      this.vel.limit(this.maxSpeed);
      // on ajoute la vitesse à la position. La vitesse est un incrément de position, 
      // (la vitesse est la dérivée de la position)
      this.pos.add(this.vel);
  
      // on remet l'accélération à zéro
      this.acc.set(0, 0);
  
      // mise à jour du path (la trainée derrière)
      this.ajoutePosAuPath();
  
      // durée de vie
      this.dureeDeVie -= 0.01;
    }
  
    ajoutePosAuPath() {
      // on rajoute la position courante dans le tableau
      this.path.push(this.pos.copy());
  
      // si le tableau a plus de 50 éléments, on vire le plus ancien
      if (this.path.length > this.pathMaxLength) {
        this.path.shift();
      }
    }
  
    // On dessine le véhicule, le chemin etc.
    show() {
      // dessin du chemin
      this.drawPath();
      // dessin du vehicule
      this.drawVehicle();
    }
  applyBehaviors(target, obstacles, vehicles, separationDistance) {
    let arriveForce = this.arrive(target);
    let avoidForce = this.avoidAmeliore(obstacles, vehicles, false);
    let separationForce = this.separation(vehicles, separationDistance);
    separationForce.mult(this.weightSeparation);
    this.applyForce(separationForce);
    arriveForce.mult(this.weightArrive);
    avoidForce.mult(this.weightObstacle);
    separationForce.mult(this.weightSeparation);
  
    this.applyForce(arriveForce);
    this.applyForce(avoidForce);
    this.applyForce(separationForce);
    
  }
  separation(vehicles, separationDistance) {
    let desiredSeparation = separationDistance;
    let sum = createVector();
    let count = 0;
  
    for (let other of vehicles) {
      if (other != this) {
        let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
  
        // Ajoutez une vérification pour s'assurer que d est un nombre fini
        if (!isNaN(d) && isFinite(d) && d < desiredSeparation) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.normalize();
          diff.div(d); // Ponderation inverse proportionnelle à la distance
          sum.add(diff);
          count++;
        }
      }
    }
  
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      sum.sub(this.vel);
      sum.limit(this.maxForce);
    }
    return sum;
  }
  
  drawVehicle() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading()); // Oriente le véhicule dans la direction de sa vitesse
  
    // Choix de la couleur en fonction du rôle du véhicule
    if (this.isLeader) {
      fill(0, 0, 255); // Bleu pour le leader
    } else {
      fill(255, 165, 0); // Orange pour les followers
    }
  
    stroke(255); // Couleur du contour (blanc)
    strokeWeight(2); // Épaisseur du contour
  
    // Dessin du véhicule
    beginShape();
    vertex(-this.r, this.r);
    vertex(-this.r, -this.r);
    vertex(this.r, 0);
    endShape(CLOSE); // Forme de triangle
  
    // Affichage du vecteur de vitesse
    this.drawVector(createVector(0, 0), this.vel, color(255, 0, 0));
  
    // Cercle pour évitement entre véhicules et obstacles (en mode debug)
    if (Vehicle.debug) {
      stroke(255);
      noFill();
      circle(0, 0, this.r * 2); // Cercle de rayon r autour du véhicule
    }
  
    pop();
  }
  
  
    drawPath() {
      push();
      stroke(255);
      noFill();
      strokeWeight(1);
  
      fill(this.color);
      // dessin du chemin
      this.path.forEach((p, index) => {
        if (!(index % 5)) {
         
          circle(p.x, p.y, 1);
        }
      });
      pop();
    }
    drawVector(pos, v, color) {
      push();
      // Dessin du vecteur vitesse
      // Il part du centre du véhicule et va dans la direction du vecteur vitesse
      strokeWeight(3);
      stroke(color);
      line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
      // dessine une petite fleche au bout du vecteur vitesse
      let arrowSize = 5;
      translate(pos.x + v.x, pos.y + v.y);
      rotate(v.heading());
      translate(-arrowSize / 2, 0);
      triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
      pop();
    }
  
    // que fait cette méthode ?
    edges() {
      if (this.pos.x > width + this.r) {
        this.pos.x = -this.r;
      } else if (this.pos.x < -this.r) {
        this.pos.x = width + this.r;
      }
      if (this.pos.y > height + this.r) {
        this.pos.y = -this.r;
      } else if (this.pos.y < -this.r) {
        this.pos.y = height + this.r;
      }
    }
  }
  
  class Target extends Vehicle {
    constructor(x, y) {
      super(x, y);
      this.vel = p5.Vector.random2D();
      this.vel.mult(5);
    }
  
    show() {
      push();
      stroke(255);
      strokeWeight(2);
      fill("#F063A4");
      push();
      translate(this.pos.x, this.pos.y);
      circle(0, 0, this.r * 2);
      pop();
      pop();
    }
  }let pursuer1, pursuer2;
let target;
let obstacles = [];
let vehicules = [];
let separationDistance = 50; // Valeur par défaut

function setup() {
  createCanvas(windowWidth, windowHeight);

  separationSlider = createSlider(0, 200, separationDistance, 1);
  separationSlider.position(10, 10);
  separationSlider.style('width', '200px').style('height', '10px').style('background', 'bleu');
  pursuer1 = new Vehicle(100, 100);
  pursuer2 = new Vehicle(random(width), random(height));

  vehicules.push(pursuer1);
  vehicules.push(pursuer2);

  // On cree un obstalce au milieu de l'écran
  // un cercle de rayon 100px
  // TODO
  obstacle = new Obstacle(width / 2, height / 2, 100);
  obstacles.push(obstacle);

}

function draw() {
  // changer le dernier param (< 100) pour effets de trainée
  background(0, 0, 0, 100);

  target = createVector(mouseX, mouseY);
 
  // Dessin de la cible qui suit la souris
  // Dessine un cercle de rayon 32px à la position de la souris
  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);
  text(`Vitesse: ${vehicules[0].vel.mag().toFixed(2)}`, 10, height - 20);
  // dessin des obstacles
  // TODO
  obstacles.forEach(o => {
    o.show();
  });
  let targetMouse = createVector(mouseX, mouseY);
  let targetPrevious;
  separationDistance = separationSlider.value();
  let leader = vehicules[0]; // Supposons que vehicules[0] est le leader
  leader.drawZoneAhead();

  let zoneCenter = leader.drawEvadeZone(); // Obtenir le centre de la zone d'évitement
  let zoneRadius = 40; // Rayon de la zone d'évitement
  for (let i = 0; i < vehicules.length; i++) {
    //let vehicule = vehicules[i];

    if (i == 0) {
      vehicules[i].applyBehaviors(targetMouse, obstacles, vehicules, separationDistance);
    } else {
      let vehicule = vehicules[i];
      //let distanceToZone = p5.Vector.dist(vehicule.pos, zoneCenter);
      let distanceToZones = p5.Vector.dist(vehicule.pos, zoneCenter);

      let vehiculePrecedent = vehicules[i-1];
      let distanceToZone = dist(vehicule.pos.x, vehicule.pos.y, leader.pos.x, leader.pos.y);
      if (distanceToZone < 40) { // Si le véhicule est dans la zone
        let evadeForce = vehicule.evade(leader); // Supposons que vous avez une méthode evade
        vehicule.applyForce(evadeForce);
      }
      //targetPrevious = createVector(vehiculePrecedent.pos.x, vehiculePrecedent.pos.y);
     
      if (distanceToZones < zoneRadius / 2) { // Si à l'intérieur de la demi-largeur de la zone
        let evadeForce = vehicule.evade(leader);
        vehicule.applyForce(evadeForce);
      } else {
        // Réinitialiser ou diminuer le poids du comportement d'évasion
        vehicule.weightEvade = 0;
      }

      // en fait on veut viser un point derriere le vehicule précédent
      // On prend la vitesse du précédent et on en fait une copie
      let pointDerriere = vehiculePrecedent.vel.copy();
      // on le normalise
      pointDerriere.normalize();
      // et on le multiplie par une distance derrière le vaisseau
      pointDerriere.mult(-30);
      // on l'ajoute à la position du vaisseau
      pointDerriere.add(vehiculePrecedent.pos);

      // on le dessine sous la forme d'un cercle pour debug
      fill(255, 0, 0)
      circle(pointDerriere.x, pointDerriere.y, 10);

      vehicules[i].applyBehaviors(pointDerriere, obstacles, vehicules);

     // si le vehicule est à moins de 5 pixels du point derriere, on le fait s'arreter
     // en mettant le poids de son comportement arrive à 0
     // et en lui donnant comme direction du vecteur vel la direction du vecteur
      // entre sa position et le vaisseau précédent
      if(vehicules[i].pos.dist(pointDerriere) < 20 && vehicules[i].vel.mag() <0.01) {
        vehicules[i].weightArrive = 0;
        vehicules[i].weightObstacle = 0;
        vehicules[i].vel.setHeading(p5.Vector.sub(vehiculePrecedent.pos, vehicules[i].pos).heading());
        console.log("stop");
      } else {
        vehicules[i].weightArrive = 0.3;
        vehicules[i].weightObstacle = 0.9;
        console.log("nonstop");
      }

    }
    
    vehicules[i].update();
    vehicules[i].show();
  }
  
}

function mousePressed() {
  obstacle = new Obstacle(mouseX, mouseY, random(5, 60));
  obstacles.push(obstacle);
}

function keyPressed() {
  if (key == "v") {
    vehicules.push(new Vehicle(random(width), random(height)));
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  }

  if (key == "f") {
    const nbMissiles = 10;

    // On tire des missiles !
    for(let i=0; i < nbMissiles; i++) {
      let x = 20+random(10);
      let y = random(height/2-5, random(height/2+5));

      let v = new Vehicle(x, y);
      vehicules.push(v);
    }
  }
}