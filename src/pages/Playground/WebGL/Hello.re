open Webapi.Canvas;

module Option = {
  let let_ = Belt.Option.flatMap;
};

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

  let ref =
    React.useCallback0((node: Js.Nullable.t(Dom.element)) => {
      ignore(
        {
          let%Option node = Js.Nullable.toOption(node);
          let ctx = CanvasElement.getContextWebGl(node);
          let%Option vert_shader =
            ctx->GlUtils.prepareVertexShader(_VSHADER_SOURCE);
          let%Option frag_shader =
            ctx->GlUtils.prepareFragmentShader(_FSHADER_SOURCE);
          let%Option program =
            ctx->GlUtils.prepareProgram(vert_shader, frag_shader);
          ctx->Gl.useProgram(program);
          // cleanup
          ctx->Gl.clearColor(0.0, 0.0, 0.0, 1.0);
          ctx->Gl.clear(Gl._COLOR_BUFFER_BIT);
          // draw a point
          ctx->Gl.drawArrays(Gl._POINTS, 0, 1);
          None;
        },
      );
      ();
    });

  <canvas
    ref={ReactDOMRe.Ref.callbackDomRef(ref)}
    width={Js.Int.toString(width)}
    height={Js.Int.toString(height)}
  />;
};