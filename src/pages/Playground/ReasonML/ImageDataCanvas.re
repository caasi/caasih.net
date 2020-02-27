open Webapi.Dom;
open Webapi.Canvas;

[@react.component]
let make = (~style, ~imageData: Js.Nullable.t(Image.t)) => {
  let imageData = Js.Nullable.toOption(imageData);
  let width = switch (imageData) {
  | Some(imageData) => imageData |> Image.width;
  | None => 0.0;
  }
  let height = switch (imageData) {
  | Some(imageData) => imageData |> Image.height;
  | None => 0.0;
  }

  let ref = React.useCallback1(
    (node: Js.Nullable.t(Dom.element)) => {
      let node = Js.Nullable.toOption(node);
      switch (node, imageData) {
      | (Some(node), Some(imageData)) => {
        let ctx = CanvasElement.getContext2d(node);
        ctx -> Canvas2d.putImageData(
          ~imageData=imageData,
          ~dx=0.0,
          ~dy=0.0,
          ~dirtyX=0.0,
          ~dirtyY=0.0,
          ~dirtyWidth=width,
          ~dirtyHeight=height,
          (),
        );
      }
      | (_, _) => ()
      };
    },
    [|imageData|],
  );

  <canvas
    style
    ref={ReactDOMRe.Ref.callbackDomRef(ref)}
    role="img"
    width={Js.Float.toString(width)}
    height={Js.Float.toString(height)}
  />
}
