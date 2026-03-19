
// const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
// const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let last = performance.now();
let state = {
    time: 0,
};

function loop(now: number) {
    const dt = (now - last) / 1000; // seconds
    last = now;

    update(dt);
    render();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

function update(dt: number) {
    console.log(state.time);
    state.time += dt;
}

function render() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
}

