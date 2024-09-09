import { useEffect, useState } from "react";
import { LineCoordinates } from "./CanvasHook";

interface Props {
    lines: LineCoordinates[]
    allDotsCross: boolean;
    isPainting: boolean
}

const Allert = ({ lines, allDotsCross, isPainting }: Props) => {

    return (<div className="w-ful">
        {
            lines.length >= 4 && !allDotsCross && !isPainting ? <span className="absolute top-[2%] right-[5%]  bg-red-700 p-[10px] border rounded-[5px] cursor-pointer" >You use all 4 lines!</span>
                : allDotsCross && !isPainting ? (
                    <span className="absolute top-[2%] right-[5%] bg-green-700 p-[10px] border rounded-[5px] cursor-pointer" >
                        Good job!
                    </span>
                ) : null
        }

    </div>)
};
export default Allert;