import React, { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Timer from "./Timer.tsx";
import { toast } from "react-toastify";
import Tippy from "@tippyjs/react";

const Main: React.FC = () => {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [enableFlash, setEnableFlash] = useState(true);
    const [activities, setActivities] = useState<string[]>([]);
    const [activeActivity, setActiveActivity] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);
    const secondsRef = useRef<HTMLDivElement>(null);
    const [focusedInput, setFocusedInput] = useState<"minutes" | "seconds">("minutes");

    useEffect(() => {
        if (focusedInput === "minutes" && minutesRef.current) {
            minutesRef.current.focus();
        } else if (focusedInput === "seconds" && secondsRef.current) {
            secondsRef.current.focus();
        }
    }, [focusedInput]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, type: "minutes" | "seconds") => {
        if (e.key === "ArrowUp") {
            if (type === "minutes") {
                setMinutes(prev => Math.min(prev + 1, 59));
            } else {
                setSeconds(prev => Math.min(prev + 1, 59));
            }
        } else if (e.key === "ArrowDown") {
            if (type === "minutes") {
                setMinutes(prev => Math.max(prev - 1, 0));
            } else {
                setSeconds(prev => Math.max(prev - 1, 0));
            }
        } else if (!isNaN(Number(e.key))) {
            if (type === "minutes") {
                setMinutes(prev => Number(`${prev}`.slice(-1) + e.key));
            } else {
                setSeconds(prev => Number(`${prev}`.slice(-1) + e.key));
            }
        } else if (e.key === "ArrowRight" || e.key === "Tab") {
            e.preventDefault();
            const nextFocus = type === "minutes" ? "seconds" : "minutes";
            setFocusedInput(nextFocus);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            const prevFocus = type === "seconds" ? "minutes" : "seconds";
            setFocusedInput(prevFocus);
        } else if (e.key === "Enter") {
            handleStart();
        }
    };

    const handleActivityInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            if (!activities.includes(inputValue.trim())) {
                setActivities([...activities, inputValue.trim()]);
                setInputValue("");

                if (activities.length === 0) {
                    setActiveActivity(inputValue.trim());
                }
            }
            e.preventDefault();
        }
    };

    const removeActivity = (index: number) => {
        const activity = activities[index];
        setActivities(activities.filter((_, i) => i !== index));
        if (activity === activeActivity) {
            setActiveActivity(null);
        }
    };

    const selectActivity = (activity: string) => {
        setActiveActivity(activity);
    };

    const updateInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const clickInput = () => {
        inputRef.current?.focus();
    };

    const handleStart = () => {
        if (activeActivity) {
            invoke("start_timer", { minutes, seconds, activity: activeActivity }).catch(console.error);
        } else {
            if (activities.length === 0) {
                toast("Please add an activity to start the timer!");
            } else {
                toast("Please select an activity to start the timer!");
            }
        }
    };

    const handleReset = () => {
        setMinutes(0);
        setSeconds(0);
        // setTimeUp(false);
        invoke("reset_timer").catch(console.error);
    };

    const handleFlashToggle = () => {
        setEnableFlash(!enableFlash);
        invoke("set_flash_state", { enable: !enableFlash }).catch(console.error);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h2 className="text-4xl font-black mb-8">Set Timer</h2>
            <div className="flex mb-4 text-6xl font-bold items-center">
                <div
                    ref={minutesRef}
                    tabIndex={0}
                    className="p-4 border rounded w-32 text-center bg-gray-800 cursor-pointer flex items-center justify-center"
                    onKeyDown={(e) => handleKeyDown(e, "minutes")}
                >
                    {String(minutes).padStart(2, "0")}
                </div>
                <span className="mx-4">:</span>
                <div
                    ref={secondsRef}
                    tabIndex={0}
                    className="p-4 border rounded w-32 text-center bg-gray-800 cursor-pointer flex items-center justify-center"
                    onKeyDown={(e) => handleKeyDown(e, "seconds")}
                >
                    {String(seconds).padStart(2, "0")}
                </div>
            </div>
            <div className="w-7/12 mb-4">
                <div
                    className="flex items-center flex-wrap bg-gray-800 p-2 rounded w-full"
                    onClick={clickInput}
                >
                    {activities.map((activity, index) => (
                        <div key={index}
                             className={`flex items-center bg-gray-700 text-gray-300 rounded px-2 py-1 m-1 text-xs cursor-pointer 
                             ${activity === activeActivity ? "!bg-blue-500 text-white" : ""}`}
                             onClick={() => selectActivity(activity)}
                        >
                            {activity}
                            {activity === activeActivity && <span className="text-xs ml-2">▶</span>}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent the activity selection event from firing when removing
                                    removeActivity(index);
                                }}
                                className="text-red-500 text-sm ml-2 cursor-default" title="Remove activity">×
                            </button>
                        </div>
                    ))}
                    <Tippy content="Press Enter to save" visible={inputValue.length > 0}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={updateInputValue}
                            onKeyDown={handleActivityInput}
                            placeholder={activities.length > 0 ? "" : "Add activities..."}
                            className="bg-transparent p-1 text-white w-full outline-none"
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                        />
                    </Tippy>
                </div>
            </div>
            <div className="flex space-x-4 mb-4">
                <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded w-32 transition duration-300 ease-in-out cursor-default"
                    onClick={handleReset}
                >
                    Reset
                </button>
                <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-32 transition duration-300 ease-in-out cursor-default"
                    onClick={handleStart}
                >
                    Start
                </button>
                <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-32 transition duration-300 ease-in-out cursor-default"
                    onClick={handleFlashToggle}
                >
                    {enableFlash ? "Disable Flash" : "Enable Flash"}
                </button>
            </div>
            <div className="mt-8 text-4xl w-3/6">
                <h3 className="font-black text-center mb-2">Preview</h3>
                <Timer mini={true} />
            </div>
        </div>
    );
};

export default Main;
