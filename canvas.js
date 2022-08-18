window.addEventListener("load", () => {
    const canvas = document.querySelector("#baseLayer");
    const ctx = canvas.getContext("2d");

    // don't use * 0.6 until the stroke offset issue has been fixed...
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // // Resize canvas upon window resize(might not use/might make toggleable)
    // window.addEventListener("resize", () => {
    //     canvas.height = window.innerHeight;
    //     canvas.width = window.innerWidth;
    // });
        
    //variables
    let painting = false;
    
    function startPosition(e){
        painting = true;
        draw(e);
    }
    
    function finishPosition(){
        painting = false;
        ctx.beginPath();
    }
    
    function draw(e) {
        let color = document.getElementsByClassName("colors selected")[0].id;
        let size = document.getElementById("size").value;
        let brush = document.getElementsByClassName("brushes current")[0].id;
        if (!painting) return;
        ctx.lineWidth = size; //10
        ctx.lineCap = brush; //"round"
        ctx.strokeStyle = color; //"red"

        // with * 0.6 the stroke is offset and not under mouse while using clientX and clientY
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath(); //without this line and only having it in finishPosition will result in jagged/pixelated lines
        ctx.moveTo(e.clientX, e.clientY);
    }

    //event listeners
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", finishPosition);
    canvas.addEventListener("mousemove", draw);
});