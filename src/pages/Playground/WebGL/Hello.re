open Webapi.Canvas;

let _VSHADER_SOURCE = "
  void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 10.0;
  }
";

let _FSHADER_SOURCE = "
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
";

[@react.component]
let make = () => {
  let width = 600;
  let height = 600;

  let ref = React.useCallback0(
    (node: Js.Nullable.t(Dom.element)) => {
      let node = Js.Nullable.toOption(node);
      switch (node) {
      | Some(node) => {
        let ctx = CanvasElement.getContextWebGl(node);
        // prepare shaders
        let vert_shader = ctx -> WebGl.createShader(WebGl._VERTEX_SHADER);
        ctx -> WebGl.shaderSource(vert_shader, _VSHADER_SOURCE);
        ctx -> WebGl.compileShader(vert_shader);
        let frag_shader = ctx -> WebGl.createShader(WebGl._FRAGMENT_SHADER);
        ctx -> WebGl.shaderSource(frag_shader, _FSHADER_SOURCE);
        ctx -> WebGl.compileShader(frag_shader);
        let program = ctx -> WebGl.createProgram;
        ctx -> WebGl.attachShader(program, vert_shader);
        ctx -> WebGl.attachShader(program, frag_shader);
        ctx -> WebGl.linkProgram(program);
        ctx -> WebGl.useProgram(program);
        // cleanup
        ctx -> WebGl.clearColor(0.0, 0.0, 0.0, 1.0);
        ctx -> WebGl.clear(WebGl._COLOR_BUFFER_BIT);
        // draw a point
        ctx -> WebGl.drawArrays(WebGl._POINTS, 0, 1);
      }
      | _ => ()
      }
    },
  );

  <canvas
    ref={ReactDOMRe.Ref.callbackDomRef(ref)}
    width={Js.Int.toString(width)}
    height={Js.Int.toString(height)}
  />
}
