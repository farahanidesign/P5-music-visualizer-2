var song;
var fft;
var particles = [];
var img;
var imgWidth = 90;
var imgHeight = 90;
var isPlaying = false;
var currentComposition = 0;
var compositions = [];
var compositionChangeTime = 0;
var compositionChangeInterval = 1000; // 4 seconds in milliseconds

function preload() {
  song = loadSound('2.mp3');
  img = loadImage('2-0.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  rectMode(CENTER);
  fft = new p5.FFT();
  song.onended(songEnded);

  setupCompositions();

  setComposition();

  for (var i = 0; i < 1000; i++) {
    particles.push(new Particle(i));
  }
}

function draw() {
  background(0); // Set background color to black

  fft.analyze();
  var volume = fft.getEnergy(200, 200);

  // Check if it's time to change the composition
  if (millis() - compositionChangeTime >= compositionChangeInterval) {
    setComposition(); // Change the visual composition
    compositionChangeTime = millis(); // Update the last change time
  }

  for (var i = 0; i < particles.length; i++) {
    var particle = particles[i];
    compositions[currentComposition](particle);
    particle.updateColor(volume);
    particle.display();
  }
}

function mouseClicked() {
  if (isPlaying) {
    song.pause();
    noLoop();
    isPlaying = false;
  } else {
    song.play();
    loop();
    isPlaying = true;
  }
}

function songEnded() {
  song.stop();
  noLoop();
  isPlaying = false;
}

function setupCompositions() {
  // Define different visual compositions here
  compositions.push(function(particle) {
    // Circular movement pattern
    var angle = millis() * 0.1; // Rotate over time
    var radius = 200;
    particle.target.x = cos(angle) * radius;
    particle.target.y = sin(angle) * radius;
    particle.update();
  });

  compositions.push(function(particle) {
    // Linear movement pattern
    particle.target = createVector(random(-width / 2, width / 2), random(-height / 2, height / 2));
    particle.update();
  });

  compositions.push(function(particle) {
    // Square movement pattern
    var squarePath = [
      createVector(-200, -200),
      createVector(200, -200),
      createVector(200, 200),
      createVector(-200, 200),
    ];

    var pointIndex = particle.index % squarePath.length;
    particle.target = squarePath[pointIndex];
    particle.update();
  });

  // Add more visual compositions
  compositions.push(function(particle) {
    // Spiral movement pattern
    var angle = millis() * 0.1;
    var radius = map(sin(angle), -1, 1, 1000, 2000);
    particle.target.x = cos(angle) * radius;
    particle.target.y = sin(angle) * radius;
    particle.update();
  });

  compositions.push(function(particle) {
    // Diagonal movement pattern
    var diagonalAngle = millis() * 0.1;
    var diagonalSpeed = 2;
    particle.target.x += cos(diagonalAngle) * diagonalSpeed;
    particle.target.y += sin(diagonalAngle) * diagonalSpeed;
    particle.update();
  });

  compositions.push(function(particle) {
    // Concentric circles movement pattern
    var circleRadius = 50 + particle.index * 10;
    var circleAngle = millis() * 10.1;
    particle.target.x = cos(circleAngle) * circleRadius;
    particle.target.y = sin(circleAngle) * circleRadius;
    particle.update();
  });

  compositions.push(function(particle) {
    // Random wiggling movement pattern
    var wiggleX = random(-5, 5);
    var wiggleY = random(-5, 5);
    particle.target.x += wiggleX;
    particle.target.y += wiggleY;
    particle.update();
  });

  compositions.push(function(particle) {
    // Zigzag movement pattern
    var zigzagSpeed = 200;
    var zigzagAmplitude = 509;
    particle.target.x += zigzagSpeed;
    particle.target.y += random(-zigzagAmplitude, zigzagAmplitude);
    particle.update();
  });

  compositions.push(function(particle) {
    // Rotating spiral movement pattern
    var spiralAngle = millis() * 0.1;
    var spiralRadius = 10 + particle.index * 5;
    particle.target.x = cos(spiralAngle) * spiralRadius;
    particle.target.y = sin(spiralAngle) * spiralRadius;
    particle.target.rotate(1);
    particle.update();
  });

  compositions.push(function(particle) {
    // Randomized circular movement pattern
    var randomRadius = random(50, 200);
    var randomAngle = random(0, 360);
    particle.target.x = cos(randomAngle) * randomRadius;
    particle.target.y = sin(randomAngle) * randomRadius;
    particle.update();
  });
}

function setComposition() {
  currentComposition = floor(random(compositions.length));
}

class Particle {
  constructor(index) {
    this.index = index;
    this.position = createVector(random(-width / 2, width / 2), random(-height / 2, height / 2));
    this.target = createVector(0, 0, 110);
    this.velocity = createVector(10, 10, 110);
    this.acceleration = createVector(0, 0, 110);
    this.maxForce = 0.05;
    this.maxSpeed = 20;
    this.originalColor = color(random(100), random(50), random(255));
    this.color = this.originalColor;
    this.scale = 0.8;
  }

  update() {
    var desired = p5.Vector.sub(this.target, this.position);
    var distance = desired.mag();
    var speed = this.maxSpeed;
    if (distance < 100) {
      speed = map(distance, 0, 100, 0, this.maxSpeed);
    }
    desired.setMag(speed);
    var steering = p5.Vector.sub(desired, this.velocity);
    steering.limit(this.maxForce);
    this.acceleration.add(steering);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);

    this.acceleration.mult(0);
  }

  updateColor(volume) {
    var c;
    if (volume > 200) {
      c = color(0, random(255), random(255)); // Set color to a random mix of blue and green
    } else {
      c = this.originalColor; // Set color to the original random color
    }
    this.color = c;
  }

  display() {
    push();
    translate(this.position.x, this.position.y, this.position.z)
    rotateX(frameCount * 5.5 + this.index * 0.1);
    rotateY(frameCount * 0.3 + this.index * 0.1);
    rotateZ(frameCount * 0.3 + this.index * 0.1);
    scale(this.scale);
    noStroke();
    tint(this.color);
    image(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    pop();
  }
}
