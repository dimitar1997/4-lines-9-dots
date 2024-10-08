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

    const doLinesIntersect = (line1: LineCoordinates, line2: LineCoordinates): boolean => {
        const { start: p1, end: p2 } = line1;
        const { start: p3, end: p4 } = line2;

        const orientation = (p: Coordinate, q: Coordinate, r: Coordinate) => {
            const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
            return val === 0 ? 0 : (val > 0 ? 1 : 2);
        };

        const onSegment = (p: Coordinate, q: Coordinate, r: Coordinate) => {
            return (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
                q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y));
        };

        const o1 = orientation(p1, p2, p3);
        const o2 = orientation(p1, p2, p4);
        const o3 = orientation(p3, p4, p1);
        const o4 = orientation(p3, p4, p2);

        if (o1 !== o2 && o3 !== o4) {
            return true;
        }

        if (o1 === 0 && onSegment(p1, p3, p2)) return true;
        if (o2 === 0 && onSegment(p1, p4, p2)) return true;
        if (o3 === 0 && onSegment(p3, p1, p4)) return true;
        if (o4 === 0 && onSegment(p3, p2, p4)) return true;

        return false;
    };


    const checkIfLineCrossDot = (line: LineCoordinates, shouldCheckIflineCrossDot?: boolean) => {


        dotsPositions.forEach(dot => {
            const dotRect = {
                start: { x: dot.x, y: dot.y },
                end: { x: dot.x + dot.width, y: dot.y + dot.height }
            };


            const rectangleLines: LineCoordinates[] = [
                { start: dotRect.start, end: { x: dotRect.end.x, y: dotRect.start.y } },
                { start: { x: dotRect.end.x, y: dotRect.start.y }, end: dotRect.end },
                { start: dotRect.end, end: { x: dotRect.start.x, y: dotRect.end.y } },
                { start: { x: dotRect.start.x, y: dotRect.end.y }, end: dotRect.start }
            ];

            if (shouldCheckIflineCrossDot) {
                const isCrossing = rectangleLines.some(rectLine => doLinesIntersect(line, rectLine));
                if (isCrossing) dot.isCrossed = true;
            };

        });
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
        lines.forEach(line => { drawLine(ctx, line); checkIfLineCrossDot(line, shouldCheckIflineCrossDot) });
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
