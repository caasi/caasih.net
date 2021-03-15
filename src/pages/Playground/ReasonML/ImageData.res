open Webapi.Dom
open Webapi.Canvas
open HtmlImageElement

module MyCanvas2d = {
  include Canvas2d
  @bs.send external drawImage: (Canvas2d.t, HtmlImageElement.t, float, float) => unit = "drawImage"
}

let useImageData = url => {
  let (imageData, setImageData) = React.useState(() => Js.Nullable.undefined)

  React.useEffect1(() => {
    let imageData = Js.Nullable.toOption(imageData)
    switch imageData {
    | Some(_) => None
    | None =>
      let img = HtmlImageElement.make()
      img->setCrossOrigin(Some("anonymous"))
      img->setSrc(url)

      let rec f = _ => {
        let canvas = document |> Document.createElement("canvas")
        let width = img->width
        let height = img->height
        canvas->CanvasElement.setWidth(width)
        canvas->CanvasElement.setHeight(height)
        let ctx = canvas->CanvasElement.getContext2d
        ctx->MyCanvas2d.drawImage(img, 0.0, 0.0)
        let imageData =
          ctx->MyCanvas2d.getImageData(
            ~sx=0.0,
            ~sy=0.0,
            ~sw=Js.Int.toFloat(width),
            ~sh=Js.Int.toFloat(height),
          )
        setImageData(_ => Js.Nullable.return(imageData))
        img |> removeLoadEventListener(f)
      }

      img |> addLoadEventListener(f)

      Some(() => img |> removeLoadEventListener(f))
    }
  }, [url])

  imageData
}

@react.component
let make = () => {
  let imageData = useImageData("https://farm8.staticflickr.com/7166/6595168855_5566d615d9_b.jpg")
  let style = ReactDOM.Style.make(~width="100%", ())

  <ImageDataCanvas style imageData />
}
