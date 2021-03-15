let prepareVertexShader = (ctx, shader) => {
  let vert_shader = ctx->Gl.createShader(Gl._VERTEX_SHADER)
  ctx->Gl.shaderSource(vert_shader, shader)
  ctx->Gl.compileShader(vert_shader)
  if ctx->Gl.getShaderCompileStatus(vert_shader) {
    Some(vert_shader)
  } else {
    None
  }
}

let prepareFragmentShader = (ctx, shader) => {
  let frag_shader = ctx->Gl.createShader(Gl._FRAGMENT_SHADER)
  ctx->Gl.shaderSource(frag_shader, shader)
  ctx->Gl.compileShader(frag_shader)
  if ctx->Gl.getShaderCompileStatus(frag_shader) {
    Some(frag_shader)
  } else {
    None
  }
}

let prepareProgram = (ctx, vert_shader, frag_shader) => {
  let program = ctx->Gl.createProgram
  ctx->Gl.attachShader(program, vert_shader)
  ctx->Gl.attachShader(program, frag_shader)
  ctx->Gl.linkProgram(program)
  if ctx->Gl.getProgramLinkStatus(program) {
    Some(program)
  } else {
    None
  }
}
