open Webapi.Canvas;

module Option = {
  let let_ = Belt.Option.flatMap;
};

let _ERROR_STATUS = 0x8B80;
let _COMPILE_STATUS = 0x8B81;
let _SHADER_TYPE = 0x8B4F;

let _DELETE_STATUS = 0x8B80;
let _LINK_STATUS = 0x8B82;
let _VALIDATE_SATUS = 0x8B83;
let _ATTACHED_SHADERS = 0x8B85;
let _ACTIVE_ATTRIBUTES = 0x8B89;
let _ACTIVE_UNIFORMS = 0x8B86;

[@bs.send]
external getBoolShaderParameter: (WebGl.glT, WebGl.shaderT, int) => bool =
  "getShaderParameter";

[@bs.send]
external getEnumShaderParameter: (WebGl.glT, WebGl.shaderT, int) => bool =
  "getShaderParameter";

let getShaderErrorStatus = (gl, shader) =>
  getBoolShaderParameter(gl, shader, _ERROR_STATUS);

let getShaderCompileStatus = (gl, shader) =>
  getBoolShaderParameter(gl, shader, _COMPILE_STATUS);

let getShaderType = (gl, shader) =>
  getEnumShaderParameter(gl, shader, _SHADER_TYPE);

[@bs.send]
external getBoolProgramParameter: (WebGl.glT, WebGl.programT, int) => bool =
  "getProgramParameter";

[@bs.send]
external getIntProgramParameter: (WebGl.glT, WebGl.programT, int) => int =
  "getProgramParameter";

let getProgramDeleteStatus = (gl, program) =>
  getBoolProgramParameter(gl, program, _DELETE_STATUS);

let getProgramLinkStatus = (gl, program) =>
  getBoolProgramParameter(gl, program, _LINK_STATUS);

let getProgramValidateStatus = (gl, program) =>
  getBoolProgramParameter(gl, program, _VALIDATE_SATUS);

let getProgramAttachedShaders = (gl, program) =>
  getIntProgramParameter(gl, program, _ATTACHED_SHADERS);

let getProgramActiveAttributes = (gl, program) =>
  getIntProgramParameter(gl, program, _ACTIVE_ATTRIBUTES);

let getProgramActiveUniforms = (gl, program) =>
  getIntProgramParameter(gl, program, _ACTIVE_UNIFORMS);

let prepareVertexShader = (ctx, shader) => {
  let vert_shader = ctx->WebGl.createShader(WebGl._VERTEX_SHADER);
  ctx->WebGl.shaderSource(vert_shader, shader);
  ctx->WebGl.compileShader(vert_shader);
  if (ctx->getShaderCompileStatus(vert_shader)) {
    Some(vert_shader);
  } else {
    None;
  };
};

let prepareFragmentShader = (ctx, shader) => {
  let frag_shader = ctx->WebGl.createShader(WebGl._FRAGMENT_SHADER);
  ctx->WebGl.shaderSource(frag_shader, shader);
  ctx->WebGl.compileShader(frag_shader);
  if (ctx->getShaderCompileStatus(frag_shader)) {
    Some(frag_shader);
  } else {
    None;
  };
};

let prepareProgram = (ctx, vert_shader, frag_shader) => {
  let program = ctx->WebGl.createProgram;
  ctx->WebGl.attachShader(program, vert_shader);
  ctx->WebGl.attachShader(program, frag_shader);
  ctx->WebGl.linkProgram(program);
  if (ctx->getProgramLinkStatus(program)) {
    Some(program);
  } else {
    None;
  };
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
          let%Option vert_shader = ctx->prepareVertexShader(_VSHADER_SOURCE);
          let%Option frag_shader =
            ctx->prepareFragmentShader(_FSHADER_SOURCE);
          Js.log("frag");
          let%Option program = ctx->prepareProgram(vert_shader, frag_shader);
          ctx->WebGl.useProgram(program);
          // cleanup
          ctx->WebGl.clearColor(0.0, 0.0, 0.0, 1.0);
          ctx->WebGl.clear(WebGl._COLOR_BUFFER_BIT);
          // draw a point
          ctx->WebGl.drawArrays(WebGl._POINTS, 0, 1);
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