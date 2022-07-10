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
uniform float angle;
void main(void) {
  gl_Position =  vec4((proj * a_position).x * cos(angle) - (proj * a_position).y * sin(angle), (proj * a_position).x * sin(angle) + (proj * a_position).y * cos(angle), (proj * a_position).z, (proj * a_position).w);
  gl_PointSize = 60.0;
}
`;
const fragmentString = `
void main() {
  gl_FragColor =  vec4(0,0,1.0,1.0);
}
`;

// gl_Position =  proj * vec4(a_position.x * cos(angle) - a_position.y * sin(angle), a_position.x * sin(angle) + a_position.y * cos(angle), a_position.z, a_position.w);
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
    0, 1, 2
  ]
  const pointsArr = [
    100.0, 100.0, 0, 1.0,
    200.0, 200.0, 0, 1.0,
    300.0, 200.0, 0, 1.0,
  ]
  // const pointsArr = [
  //   0.1, 0.4, 0, 1.0,
  //   0.1, 0.5, 0, 1.0,
  //   0.2, 0.4, 0, 1.0
  // ];
  const pointPosition = new Float32Array(pointsArr);
  const aPosition = webgl?.getAttribLocation(
    program as WebGLProgram,
    'a_position'
  ) as number;
  const lineBuffer = webgl?.createBuffer();
  webgl?.bindBuffer(webgl.ARRAY_BUFFER, lineBuffer as WebGLBuffer);
  webgl?.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);

  webgl?.vertexAttribPointer(aPosition, 4, webgl.FLOAT, false, 0, 0 * 4);

  webgl?.enableVertexAttribArray(aPosition);

  const indexArr = new Uint16Array(arrIndex);
  const indexBuffer = webgl?.createBuffer() as WebGLBuffer;
  webgl?.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  webgl?.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indexArr, webgl.STATIC_DRAW);



  const uniforproj = webgl?.getUniformLocation(
    program as WebGLProgram,
    'proj'
  ) as WebGLUniformLocation;
  webgl?.uniformMatrix4fv(uniforproj, false, projMat4);

  // 赋值 ---  shader 中的变量 真实赋值
  const uAngle = webgl?.getUniformLocation(program as WebGLProgram, "angle") as WebGLUniformLocation;
  // 弧度  设置弧度 用以旋转图形---更改弧度可测试
  const angle1 = 180 * Math.PI / 180;
  webgl?.uniform1f(uAngle, angle1);


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
  webgl?.drawElements(webgl.TRIANGLES, 3, webgl.UNSIGNED_SHORT, 0);
}

run();
