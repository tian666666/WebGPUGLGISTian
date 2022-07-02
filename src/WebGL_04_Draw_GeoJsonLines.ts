/*
 * @Author: TYW
 * @Date: 2022-06-20 23:09:15
 * @LastEditTime: 2022-06-23 23:42:25
 * @LastEditors: TYW
 * @Description:
 */
import { mat4, vec3 } from 'gl-matrix';
import { heNanGeoJson } from './Data/henanGeoJSON';

let webgl: WebGLRenderingContext | null = null;
let program: WebGLProgram | null = null;
let canvas: HTMLCanvasElement | null = null;
let glPoints: number[];
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
  glPoints = geoLinesToArray();
  // const pointsArr = [
  //   100.0, 100.0, 0, 1.0, 200.0, 200.0, 0, 1.0, 300.0, 200.0, 0, 1.0, 400.0,
  //   600.0, 0, 1.0
  // ];
  const pointPosition = new Float32Array(glPoints);
  const aPosition = webgl?.getAttribLocation(
    program as WebGLProgram,
    'a_position'
  ) as number;
  const lineBuffer = webgl?.createBuffer();
  webgl?.bindBuffer(webgl.ARRAY_BUFFER, lineBuffer as WebGLBuffer);
  webgl?.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl?.enableVertexAttribArray(aPosition);
  webgl?.vertexAttribPointer(aPosition, 4, webgl.FLOAT, false, 4 * 4, 0 * 4);

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
  webgl?.drawArrays(webgl.LINE_LOOP, 0, glPoints.length / 4);
}

function geoLinesToArray() {
  // 横轴：从 -180 至 180
  // 纵轴：从 -90 至 90
  // 经纬度和Canvas的对应关系：(-90,-180) 对应于 canvas 的左上角即(0,0),而(90,180)对应于(canvas.clientHeight,canvas.clientWidth)
  // 而 canvas 和 webgl 坐标的对应关系 可以通过 mat4.ortho(projMat4, 0, canvas.clientWidth, canvas.clientHeight, 0, -1, 1) 方法做简单转换计算得来

  // 但同时也需要考虑到 数据范围的问题  数据范围可能非常小 坐标相差只有 0.0000 几
  // 此时可求出其最大范围的包围盒  以此包围盒的左上角对应 canvas 的左上角  以此包围盒的右下角对应此canvas的右下角
  // 从而使得该图形得以满屏显示在canvas上
  // 而比例缩放也可以通过该原理  如 通过包围盒的一半 与 canvas 对应等

  // webgl 的 xyz 的范围 都是 -1 到 1
  const glPointsArr = [];
  const geoLines = heNanGeoJson.features[0].geometry.coordinates[0][0];
  const allGeoX = [];
  const allGeoY = [];
  for (let k = 0; k < geoLines.length; k++) {
    allGeoX.push(geoLines[k][0]);
    allGeoY.push(geoLines[k][1]);
  }
  const maxX = Math.max(...allGeoX);
  const minX = Math.min(...allGeoX);
  const maxY = Math.max(...allGeoY);
  const minY = Math.min(...allGeoY);

  const xDiff = maxX - minX;
  const yDiff = maxY - minY;

  for (let k = 0; k < geoLines.length; k++) {
    glPointsArr.push(
      ((geoLines[k][0] - minX) / xDiff) * (canvas?.clientWidth as number)
    );
    glPointsArr.push(
      (1 - (geoLines[k][1] - minY) / yDiff) * (canvas?.clientHeight as number)
    );
    glPointsArr.push(0);
    glPointsArr.push(1.0);
  }
  return glPointsArr;
}

run();
