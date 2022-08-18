//Tabs
function openTab(e, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    e.currentTarget.className += " active";
}
document.getElementById("defaultOpen").click();


//Colors
function selectColor(e, colorBox) {
  var i, colors;
  colors = document.getElementsByClassName("colors");
  for (i = 0; i < colors.length; i++) {
    colors[i].className = colors[i].className.replace(" selected", "");
  }
  e.currentTarget.className += " selected";
}
document.getElementById("black").click();

//Brushes
function selectBrush(e, brushType) {
  var i, brush;
  brush = document.getElementsByClassName("brushes");
  for (i = 0; i < brush.length; i++) {
    brush[i].className = brush[i].className.replace(" current", "");
  }
  e.currentTarget.className += " current";
}
document.getElementById("butt").click();

//Shapes
function selectShape(e, shapeType) {
  var i, shape;
  shape = document.getElementsByClassName("shapes");
  for (i = 0; i < shape.length; i++) {
    shape[i].className = shape[i].className.replace(" to draw", "");
  }
  e.currentTarget.className += " to draw";
}
document.getElementById("circle").click();


//Download Image
function saveImage() {
  const snapshot = document.querySelector("#baseLayer");
  var save = document.getElementById('downloadlink');
  save.setAttribute('download', 'MosaicImage.png');
  save.setAttribute('href', snapshot.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  save.click();
}

//Clear canvas
function clearCanvas() {
  const clear = document.querySelector("#baseLayer");
  const ctx = clear.getContext("2d");
  clear.height = window.innerHeight;
  clear.width = window.innerWidth;
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, clear.width, clear.height);
}