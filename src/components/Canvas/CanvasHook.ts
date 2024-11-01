import { useRef, useEffect, useState } from "react";
import { dotsPositions } from './DotsPositions';

type Coordinate = {
    x: number;
    y: number;
};

export type LineCoordinates = {
    start: Coordinate;
    end: Coordinate;
};
type WarningMessage = {
    show: boolean,
    text: string
};

const CanvasHook = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPainting, setIsPainting] = useState(false);
    const [startMousePosition, setStartMousePosition] = useState<Coordinate | undefined>(undefined);
    const [lines, setLines] = useState<LineCoordinates[]>([]);
    const [allDotsCross, setAllDotsCross] = useState(false);
    const [warningMessage, setWarningMessage] = useState<WarningMessage | undefined>();


    const handleRefresh = () => {
        setLines([]);
        dotsPositions.forEach(dot => dot.isCrossed = false);
        const canvas = canvasRef.current;
        setAllDotsCross(false);
        setWarningMessage(undefined);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        };

    };


    const drawDots = (ctx: CanvasRenderingContext2D) => {

        dotsPositions.forEach(dotP => {
            ctx.fillStyle = dotP.isCrossed ? 'green' : 'red';
            ctx.fillRect(dotP.x, dotP.y, dotP.width, dotP.height);
        });

    };

    const checkIfLineCrossDot = (line: LineCoordinates) => {
        const { start, end } = line;
    
        // Function to check if a point is inside a smaller bounding box of the dot
        const isPointNearDot = (point: Coordinate, dot: any) => {
            const padding = 5; // Reduce this value to make detection more precise
            return (
                point.x >= dot.x - padding && point.x <= dot.x + dot.width + padding &&
                point.y >= dot.y - padding && point.y <= dot.y + dot.height + padding
            );
        };
    
        // Check multiple points along the line to reduce noise
        const steps = 30; // Number of steps to check along the line
        for (let i = 0; i <= steps; i++) {
            const x = start.x + (end.x - start.x) * (i / steps);
            const y = start.y + (end.y - start.y) * (i / steps);
    console.log('here i: ', i, x, y)
            dotsPositions.forEach((dot) => {
                if (isPointNearDot({ x, y }, dot)) {
                    dot.isCrossed = true;
                }
            });
        };
    };

    const drawLine = (ctx: CanvasRenderingContext2D, line: LineCoordinates) => {
        const { start, end } = line;

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    };

    const redrawLines = (ctx: CanvasRenderingContext2D, shouldCheckIflineCrossDot?: boolean) => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        drawDots(ctx);
        lines.forEach(line => { drawLine(ctx, line); if (shouldCheckIflineCrossDot) checkIfLineCrossDot(line) });
    };
    useEffect(() => {
        const dotsThatAreCrossed = dotsPositions.filter(dot => dot.isCrossed)
        if (dotsThatAreCrossed.length === dotsPositions.length) setAllDotsCross(true);
    }, [dotsPositions, isPainting, lines]);

    const calculateDifference = (oldLineSum: number, NewLineSum: number) => {
        const maxAllowedDifference = Math.max(oldLineSum, NewLineSum) * 0.02;
        const actualDifference = Math.abs(oldLineSum - NewLineSum);
        return actualDifference <= maxAllowedDifference;
    };

    useEffect(() => {
        const canvas = canvasRef.current;

        if (lines.length > 4) return;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                drawDots(ctx);

                const handleMouseDown = (e: MouseEvent) => {
                    setIsPainting(true);
                    const startMousePos = {
                        x: e.clientX - canvas.offsetLeft,
                        y: e.clientY - canvas.offsetTop,
                    };

                    if (lines.length > 0) {
                        const isEndOfThePreviuosLine = calculateDifference(lines[lines.length - 1].end.x + lines[lines.length - 1].end.y, startMousePos.x + startMousePos.y);
                        if (!isEndOfThePreviuosLine) {
                            setWarningMessage({ show: true, text: 'You need to start from the last line end!' });
                            setTimeout(() => { setWarningMessage(undefined) }, 2000);
                            return;
                        }
                    };

                    setStartMousePosition(startMousePos);

                    const line = {
                        start: startMousePos,
                        end: startMousePos,
                    };


                    setLines(prevLines => [...prevLines, line]);
                    redrawLines(ctx);
                };

                const handleMouseMove = (e: MouseEvent) => {
                    if (isPainting && startMousePosition) {
                        const currentMousePos = {
                            x: e.clientX - canvas.offsetLeft,
                            y: e.clientY - canvas.offsetTop,
                        };

                        const line = {
                            start: startMousePosition,
                            end: currentMousePos,
                        };

                        setLines(prevLines => {
                            const updatedLines = [...prevLines];
                            updatedLines[updatedLines.length - 1] = line;
                            redrawLines(ctx);
                            return updatedLines;
                        });
                    }
                };


                const handleMouseUp = () => {
                    console.log(lines)
                    setIsPainting(false);
                    redrawLines(ctx, true);
                    setStartMousePosition(undefined);
                };


                canvas.addEventListener('mousedown', handleMouseDown);
                canvas.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);


                return () => {
                    canvas.removeEventListener('mousedown', handleMouseDown);
                    canvas.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);

                };
            }
        }

    }, [isPainting, startMousePosition, lines]);

    return { warningMessage, lines, allDotsCross, isPainting, handleRefresh, canvasRef };
};

export default CanvasHook;
