open Webapi.Canvas;
include WebGl;

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