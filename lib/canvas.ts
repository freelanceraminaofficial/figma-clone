export const initializeFabric = ({
  fabricRef,
  canvasRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  //  get canvas element
  const canvasElement = document.getElementById("canvas");
  
  // create fabric canvas
  const canvas = new fabric.Canvas(canvasRef.current, {
    width: canvasElement?.clientWidth,
    height: canvasElement?.clientHeight,
  });

  fabricRef.current = canvas;

  return canvas;
};

export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
}: CanvasMouseDown) => {
  // get pointer coordinates
  const pointer = canvas.getPointer(options.e);

  /**
   * get target object i.e., the object that is clicked
   * findtarget() returns the object that is clicked
   *
   * findTarget: http://fabricjs.com/docs/fabric.Canvas.html#findTarget
   */
  const target = canvas.findTarget(options.e, false);

  // set canvas drawing mode to false
  canvas.isDrawingMode = false;

  // if selected shape is freeform, set drawing mode to true and return
  if (selectedShapeRef.current === "freeform") {
    isDrawing.current = true;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 5;
    return;
  }

  canvas.isDrawingMode = false;

  // if target is the selected shape or active selection, set isDrawing to false
  if (
    target &&
    (target.type === selectedShapeRef.current ||
      target.type === "activeSelection")
  ) {
    isDrawing.current = false;

    // set active object to target
    canvas.setActiveObject(target);

    /**
     * setCoords() is used to update the controls of the object
     * setCoords: http://fabricjs.com/docs/fabric.Object.html#setCoords
     */
    target.setCoords();
  } else {
    isDrawing.current = true;

    // create custom fabric object/shape and set it to shapeRef
    shapeRef.current = createSpecificShape(
      selectedShapeRef.current,
      pointer as any
    );

    // if shapeRef is not null, add it to canvas
    if (shapeRef.current) {
      // add: http://fabricjs.com/docs/fabric.Canvas.html#add
      canvas.add(shapeRef.current);
    }
  }

};

export const handleCanvasMouse = ({
  options,
  canvas,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  syncShapeInStorage,
}: CanvasMouseMove) => {
   
  if (!isDrawing.current) return;
  if(!selectedShapeRef.current === "freeform") return;

  canvas.isDrawingMode = false;

  const pointer = canvas.getPointer(options.e);

  switch (selectedShapeRef?.current) {
    case "rectangle":
      shapeRef.current?.set({
        width: pointer.x -(shapeRef.current?.left || 0),
        height: pointer.y -(shapeRef.current?.top || 0),
      });
      break;

    case "circle":
      shapeRef.current.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;

   case "triangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case "line":
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;

    case "image":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      })
      
  default:
    break;

  }

  canvas.renderAll();

  if (shapeRef.current?.objectId) {
    syncShapeInStorage(shapeRef.current);
  }
}