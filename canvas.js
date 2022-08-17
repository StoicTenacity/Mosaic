window.addEventListener("load", () => {
    const canvas = document.querySelector("#baseLayer");
    const ctx = canvas.getContext("2d");

    canvas.height = window.innerHeight * 0.6;
    canvas.width = window.innerWidth * 0.6;
});

// // Resize canvas upon window resize(might not use)
// window.addEventListener("resize", () => {
//     context.canvas.height = window.innerHeight * 0.6;
//     context.canvas.width = window.innerWidth * 0.6;
// });