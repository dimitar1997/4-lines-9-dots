import Allert from "./Allert";
import CanvasHook from "./CanvasHook";


const infoGameText = 'In this game, you are presented with 9 dots arranged in a 3x3 grid. Your task is to draw four straight lines, ensuring that no dot is left untouched. You can lift your mouse between lines, but each new line must start from where the last line ended. Plan carefully to connect all the dots within the given number of lines!'

const Canvas = () => {

    const { warningMessage, lines, allDotsCross, isPainting, handleRefresh, canvasRef } = CanvasHook();

    return (
        <div className='w-full h-full flex justify-evenly items-center flex-col'>
            {
                warningMessage && warningMessage.show && <span className="absolute top-[2%] right-[5%] bg-yellow-700 p-[10px] border rounded-[5px] cursor-pointer" >{warningMessage.text}</span>
            }
            <Allert lines={lines} allDotsCross={allDotsCross} isPainting={isPainting} />
            <>
                <p className="w-[80%] font-semibold text-[18px] text-center">{infoGameText}</p>
                <button className="bg-[#445D48] border font-semibold p-[0.4em] rounded-[5px] text-[#D6CC99]" onClick={handleRefresh}>Refresh</button>
            </>
            <span className="font-semibold text-[14px] text-center">Left lines: {4 - lines.length}</span>
            <canvas ref={canvasRef} width="600" height="500" style={{ border: '1px solid #000000', marginBottom: '4em' }}></canvas>
        </div>
    );
};

export default Canvas;
