/*
 * @Author: TYW
 * @Date: 2022-06-20 23:09:15
 * @LastEditTime: 2022-06-23 23:31:33
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
  gl_Position = proj * a_position;
  gl_PointSize = 60.0;
}
`;
const fragmentString = `
void main() {
  gl_FragColor =  vec4(0,0,1.0,1.0);
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
  const arrIndex = [
    0, 1, 2,
    0, 3, 4
  ]
  const pointsArr = [
    100.0, 100.0, 0, 1.0, 
    200.0, 200.0, 0, 1.0, 
    300.0, 200.0, 0, 1.0, 
    400.0, 600.0, 0, 1.0,
    500.0, 700.0, 0, 1.0
  ];
  const pointPosition = new Float32Array(pointsArr);
  const aPosition = webgl?.getAttribLocation(
    program as WebGLProgram,
    'a_position'
  ) as number;
  const lineBuffer = webgl?.createBuffer();
  webgl?.bindBuffer(webgl.ARRAY_BUFFER, lineBuffer as WebGLBuffer);
  webgl?.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl?.enableVertexAttribArray(aPosition);
  webgl?.vertexAttribPointer(aPosition, 4, webgl.FLOAT, false, 4 * 4, 0 * 4);

  const indexArr = new Uint16Array(arrIndex);
  const indexBuffer = webgl?.createBuffer() as WebGLBuffer;
  webgl?.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  webgl?.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indexArr, webgl.STATIC_DRAW);
  const uniforproj = webgl?.getUniformLocation(
    program as WebGLProgram,
    'proj'
  ) as WebGLUniformLocation;
  webgl?.uniformMatrix4fv(uniforproj, false, projMat4);
}

function draw() {
  webgl?.clearColor(0.0, 0.0, 0.0, 1.0);
  webgl?.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  // webgl?.drawArrays(webgl.LINES, 0, 4);
  // webgl?.drawArrays(webgl.LINE_STRIP, 0, 4);
  //  webgl?.drawArrays(webgl.LINE_LOOP, 0, 4);
  // webgl?.drawArrays(webgl.TRIANGLES, 0, 4);
  // webgl?.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
  // webgl?.drawArrays(webgl.TRIANGLE_FAN, 0, 4);
  webgl?.drawElements(webgl.TRIANGLES, 6, webgl.UNSIGNED_SHORT, 0);
}

run();
