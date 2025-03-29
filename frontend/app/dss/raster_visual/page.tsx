'use client'
import IndiaGISRasterViewer from "./components/raster_display";
const RasterVisual = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold underline">
                <IndiaGISRasterViewer />
            </h1>
        </div>
    )
}
export default RasterVisual