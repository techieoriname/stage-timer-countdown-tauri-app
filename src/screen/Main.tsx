import React, { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

const Main: React.FC = () => {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [enableFlash, setEnableFlash] = useState(true);
    const [previewTime, setPreviewTime] = useState(0);
    const [timeUp, setTimeUp] = useState(false);
    const [activity, setActivity] = useState("");
    const minutesRef = useRef<HTMLDivElement>(null);
    const secondsRef = useRef<HTMLDivElement>(null);
    const [focusedInput, setFocusedInput] = useState<"minutes" | "seconds">("minutes");

    useEffect(() => {
        // Focus on minutes input by default on app launch
        if (minutesRef.current) {
            minutesRef.current.focus();
        }

        // Listen for time updates from the timer screen
        const unlistenUpdateTimer = listen("update_timer", (event) => {
            const payload = event.payload as { minutes: number, seconds: number };
            setPreviewTime(payload.minutes * 60 + payload.seconds);
        });

        // Listen for time up event from the timer screen
        const unlistenTimeUp = listen("time_up", () => {
            setTimeUp(true);
        });

        // Listen for flash state changes
        const unlistenFlashState = listen("set_flash_state", (event) => {
            const state = event.payload as boolean;
            setEnableFlash(state);
        });

        return () => {
            unlistenUpdateTimer.then(f => f());
            unlistenTimeUp.then(f => f());
            unlistenFlashState.then(f => f());
        };
    }, []);

    const handleStart = () => {
        setTimeUp(false); // Reset timeUp when starting
        invoke('start_timer', { minutes, seconds, activity }).catch(console.error);
        refocusInput();
    };

    const handleReset = () => {
        setMinutes(0);
        setSeconds(0);
        setTimeUp(false);
        invoke('reset_timer').catch(console.error);
        refocusInput();
    };

    const refocusInput = () => {
        if (focusedInput === "minutes" && minutesRef.current) {
            minutesRef.current.focus();
        } else if (focusedInput === "seconds" && secondsRef.current) {
            secondsRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, type: "minutes" | "seconds") => {
        if (e.key === "ArrowUp") {
            if (type === "minutes") {
                setMinutes((prev) => Math.min(prev + 1, 59));
            } else {
                setSeconds((prev) => Math.min(prev + 1, 59));
            }
        } else if (e.key === "ArrowDown") {
            if (type === "minutes") {
                setMinutes((prev) => Math.max(prev - 1, 0));
            } else {
                setSeconds((prev) => Math.max(prev - 1, 0));
            }
        } else if (!isNaN(Number(e.key))) {
            if (type === "minutes") {
                setMinutes((prev) => Number(`${prev}`.slice(-1) + e.key));
            } else {
                setSeconds((prev) => Number(`${prev}`.slice(-1) + e.key));
            }
        } else if (e.key === "ArrowRight" || e.key === "Tab") {
            e.preventDefault();
            if (type === "minutes") {
                setFocusedInput("seconds");
                if (secondsRef.current) {
                    secondsRef.current.focus();
                }
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (type === "seconds") {
                setFocusedInput("minutes");
                if (minutesRef.current) {
                    minutesRef.current.focus();
                }
            }
        } else if (e.key === "Enter") {
            handleStart();
        }
    };

    const handleFlashToggle = () => {
        setEnableFlash(!enableFlash);
        invoke('set_flash_state', { enable: !enableFlash }).catch(console.error);
        refocusInput();
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h2 className="text-4xl font-black mb-8">Set Timer</h2>
            <div className="flex mb-4 text-6xl font-bold items-center">
                <div
                    ref={minutesRef}
                    tabIndex={0}
                    className="p-4 border rounded w-32 text-center bg-gray-800 cursor-pointer flex items-center justify-center"
                    onClick={() => setFocusedInput("minutes")}
                    onKeyDown={(e) => handleKeyDown(e, "minutes")}
                >
                    {String(minutes).padStart(2, "0")}
                </div>
                <span className="mx-4">:</span>
                <div
                    ref={secondsRef}
                    tabIndex={0}
                    className="p-4 border rounded w-32 text-center bg-gray-800 cursor-pointer flex items-center justify-center"
                    onClick={() => setFocusedInput("seconds")}
                    onKeyDown={(e) => handleKeyDown(e, "seconds")}
                >
                    {String(seconds).padStart(2, "0")}
                </div>
            </div>
            <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Enter activity (e.g., Prayers)"
                className="p-2 mb-4 text-gray-300 bg-gray-800 rounded outline-none ring-0 border-0 focus:ring-0 focus:outline-none focus:border-0 text-sm"
            />
            <div className="flex space-x-4 mb-4">
                <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded w-32 transition duration-300 ease-in-out"
                    onClick={handleReset}
                >
                    Reset
                </button>
                <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-32 transition duration-300 ease-in-out"
                    onClick={handleStart}
                >
                    Start
                </button>
                <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-32 transition duration-300 ease-in-out"
                    onClick={handleFlashToggle}
                >
                    {enableFlash ? "Disable Flash" : "Enable Flash"}
                </button>
            </div>
            <div className="mt-8 text-4xl">
                <h3 className="font-black">Preview Timer</h3>
                <div className={`text-center ${timeUp && enableFlash ? "animate-flash" : ""}`}
                     style={{ fontSize: "3rem" }}>
                {timeUp ? "TIME UP!!!" : formatTime(previewTime)}
                </div>
                <div className="text-center text-2xl mt-2">
                    {activity}
                </div>
            </div>
        </div>
    );
};

export default Main;
