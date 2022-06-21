/*
 * @Author: TYW
 * @Date: 2022-06-20 23:09:15
 * @LastEditTime: 2022-06-21 12:58:53
 * @LastEditors: TYW
 * @Description:
 */
import { mat4, vec3 } from 'gl-matrix';

let webgl: WebGLRenderingContext | null = null;
let program: WebGLProgram | null = null;
let canvas: HTMLCanvasElement | null = null;
const projMat4 = mat4.create();
const vertexString = `
attribute vec4 a_position;
uniform mat4 proj;
void main(void) {
  gl_Position = a_position;
  gl_PointSize = 60.0;
}
`;
const fragmentString = `
void main() {
  gl_FragColor =  vec4(0,1.0,0,1.0);
}
`;
function run() {
  initWebgl();
  initShader();
  initBuffer();
  draw();
}

function initWebgl() {
  canvas = document.querySelector('canvas') as HTMLCanvasElement;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  webgl = canvas.getContext('webgl') as WebGLRenderingContext;
  webgl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
  mat4.ortho(projMat4, 0, canvas.clientWidth, canvas.clientHeight, 0, -1, 1);
}
function initShader() {
  const vsshader = webgl?.createShader(webgl?.VERTEX_SHADER) as WebGLShader;
  const fsshader = webgl?.createShader(webgl?.FRAGMENT_SHADER) as WebGLShader;

  webgl?.shaderSource(vsshader, vertexString);
  webgl?.shaderSource(fsshader, fragmentString);

  webgl?.compileShader(vsshader);
  webgl?.compileShader(fsshader);

  const glprogram = webgl?.createProgram() as WebGLProgram;
  webgl?.attachShader(glprogram, vsshader);
  webgl?.attachShader(glprogram, fsshader);

  webgl?.linkProgram(glprogram);
  webgl?.useProgram(glprogram);

  program = glprogram;
}

function initBuffer() {
  const aPosition = webgl?.getAttribLocation(
    program as WebGLProgram,
    'a_position'
  ) as number;

  document.addEventListener('mousedown', e => {
    const x = e.clientX;
    const y = e.clientY;
    const rect = e.target.getBoundingClientRect();
    const top = rect.top;
    const left = rect.left;
    const pointX = (x - left - canvas?.width / 2) / (canvas?.width / 2);
    const pointY = -(y - top - canvas?.height / 2) / (canvas?.height / 2);
    const pointPosition = new Float32Array([pointX, pointY, 0, 1.0]);
    const pointBuffer = webgl?.createBuffer() as WebGLBuffer;
    webgl?.bindBuffer(webgl.ARRAY_BUFFER, pointBuffer);
    webgl?.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);

    webgl?.enableVertexAttribArray(aPosition);
    webgl?.vertexAttribPointer(aPosition, 4, webgl.FLOAT, false, 0, 0);

    webgl?.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl?.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
    webgl?.drawArrays(webgl.POINTS, 0, 1);
  });

  const uniforproj = webgl?.getUniformLocation(
    program as WebGLProgram,
    'proj'
  ) as WebGLUniformLocation;
  webgl?.uniformMatrix4fv(uniforproj, false, projMat4);
}

function draw() {
  webgl?.clearColor(0.0, 0.0, 0.0, 1.0);
  webgl?.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  webgl?.drawArrays(webgl.POINTS, 0, 1);
}

run();
