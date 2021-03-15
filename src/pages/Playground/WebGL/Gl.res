open Webapi.Canvas
include WebGl

let _ERROR_STATUS = 0x8B80
let _COMPILE_STATUS = 0x8B81
let _SHADER_TYPE = 0x8B4F

let _DELETE_STATUS = 0x8B80
let _LINK_STATUS = 0x8B82
let _VALIDATE_SATUS = 0x8B83
let _ATTACHED_SHADERS = 0x8B85
let _ACTIVE_ATTRIBUTES = 0x8B89
let _ACTIVE_UNIFORMS = 0x8B86

type rec result<'a> =
  | Bool: result<bool>
  | Enum: result<int>
  | Int: result<int>

@bs.send
external getShaderParameter: (WebGl.glT, WebGl.shaderT, int, @bs.ignore result<'a>) => 'a =
  "getShaderParameter"

let getShaderErrorStatus = (gl, shader) => getShaderParameter(gl, shader, _ERROR_STATUS, Bool)

let getShaderCompileStatus = (gl, shader) => getShaderParameter(gl, shader, _COMPILE_STATUS, Bool)

let getShaderType = (gl, shader) => getShaderParameter(gl, shader, _SHADER_TYPE, Enum)

@bs.send
external getProgramParameter: (WebGl.glT, WebGl.programT, int, @bs.ignore result<'a>) => 'a =
  "getProgramParameter"

let getProgramDeleteStatus = (gl, program) => getProgramParameter(gl, program, _DELETE_STATUS, Bool)

let getProgramLinkStatus = (gl, program) => getProgramParameter(gl, program, _LINK_STATUS, Bool)

let getProgramValidateStatus = (gl, program) =>
  getProgramParameter(gl, program, _VALIDATE_SATUS, Bool)

let getProgramAttachedShaders = (gl, program) =>
  getProgramParameter(gl, program, _ATTACHED_SHADERS, Int)

let getProgramActiveAttributes = (gl, program) =>
  getProgramParameter(gl, program, _ACTIVE_ATTRIBUTES, Int)

let getProgramActiveUniforms = (gl, program) =>
  getProgramParameter(gl, program, _ACTIVE_UNIFORMS, Int)
