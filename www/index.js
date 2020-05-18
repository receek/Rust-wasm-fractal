import { Fractal } from "wasm-fractal";

const fractal = Fractal.new(700, 700);
const reloadButton = document.getElementById("reload_button");
const xAxis = document.getElementById("X");
const yAxis = document.getElementById("Y");
const magnificationFactor = document.getElementById("magnification");
const radioGenerator = document.getElementById("genreator");

var width = 700;
var height = 700;

function renderInJS(magnificationFactor, panX, panY, maxIterations) {
  var iter = 1;

  function checkIfBelongsToMandelbrotSet(x,y) {
    var realComponentOfResult = x;
    var imaginaryComponentOfResult = y;

    for(var i = 0; i < iter; i++) {
        var tempRealComponent = realComponentOfResult * realComponentOfResult - imaginaryComponentOfResult * imaginaryComponentOfResult + x;
        var tempImaginaryComponent = 2 * realComponentOfResult * imaginaryComponentOfResult + y;
        realComponentOfResult = tempRealComponent;
        imaginaryComponentOfResult = tempImaginaryComponent;

         if(realComponentOfResult * imaginaryComponentOfResult > 5) 
            return (i/iter * 100);
    }
    return 0;
  } 

  

  var c = document.getElementById("rustCanvas");
  var ctx = c.getContext("2d");

  const renderloop = () => {
    console.time("Rendering time in JS");
    for(var x=0; x < c.width; x++) {
      for(var y=0; y < c.height; y++) {
        var belongsToSet = checkIfBelongsToMandelbrotSet(x/magnificationFactor - panX, y/magnificationFactor - panY);
        if(belongsToSet == 0) {
          ctx.fillStyle = '#000';
          ctx.fillRect(x,y, 1,1);
        } else {
          ctx.fillStyle = 'hsl(0, 100%, ' + belongsToSet + '%)';
          ctx.fillRect(x,y, 1,1);
        }
      }
    }
    console.timeEnd("Rendering time in JS");
    iter += 1;
    if(iter < maxIterations) requestAnimationFrame(renderloop);
  }

  requestAnimationFrame(renderloop);

  

}



function renderInRust(magnificationFactor, panX, panY, maxIterations) {
  var img = new Image();
  var ctx = document.getElementById('rustCanvas').getContext('2d');
  var iter = 1;
  fractal.calculate_frac(magnificationFactor, panX, panY, 1);
  var arr = fractal.render();
  var img = document.getElementById("img");
  ctx.drawImage(img, 0, 0);
  var imgData = ctx.getImageData(0, 0, width, height);
  imgData.data.set(arr);
  ctx.putImageData(imgData, 0, 0);

  const renderloop = () => {
    iter += 1;
    fractal.calculate_frac(magnificationFactor, panX, panY, iter);
    var arr = fractal.render();
    imgData.data.set(arr);
    ctx.putImageData(imgData, 0, 0);

    if(iter < maxIterations) requestAnimationFrame(renderloop);
  }

  requestAnimationFrame(renderloop);

}

reloadButton.addEventListener("click", event => {
  location.reload(); 
});

if(document.querySelector('input[name="genereator"]:checked').value == "rust") {
  renderInRust(magnificationFactor.value, xAxis.value, yAxis.value, 1000);
}
else {
  renderInJS(magnificationFactor.value, xAxis.value, yAxis.value, 1000);
}

/* var m = 200;
var x = 2;
var y = 2;
var iter = 126;

renderInRust(m, x, y, iter);

var i = 0;

const renderLoop = () => {

  renderInRust(m, x, y, i);
};


for (i = 0; i < 10; i++)
{
  setTimeout(() => {  requestAnimationFrame(renderLoop); }, 2000*i);
} */


//renderInJS(m, x, y, iter);
