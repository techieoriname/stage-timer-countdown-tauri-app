import React, { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";

const Timer: React.FC = () => {
    const [time, setTime] = useState(0);
    const [timeUp, setTimeUp] = useState(false);
    const [enableFlash, setEnableFlash] = useState(true);

    useEffect(() => {
        const handleStartTimer = ({ time: totalTimeInSeconds }: { time: number }) => {
            setTime(totalTimeInSeconds);
            // Reset timeUp state when starting a new timer
            setTimeUp(false);
        };

        const handleResetTimer = () => {
            setTime(0);
            setTimeUp(false);
        };

        const handleFlashStateChange = (state: boolean) => {
            setEnableFlash(state);
        };

        listen("start_timer", (event) => {
            const payload = event.payload as { time: number };
            handleStartTimer(payload);
        });

        listen("reset_timer", handleResetTimer);

        listen("set_flash_state", (event) => {
            const state = event.payload as boolean;
            handleFlashStateChange(state);
        });

        return () => {
            invoke("unlisten_all").catch(console.error);
        };
    }, []);

    useEffect(() => {
        if (time > 0) {
            const interval = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime - 1;
                    invoke("update_timer", { minutes: Math.floor(newTime / 60), seconds: newTime % 60 }).catch(console.error); // Send timer value to main screen
                    if (newTime <= 0) {
                        console.log("time up", newTime);
                        setTimeUp(true);
                        clearInterval(interval);
                        invoke("time_up").catch(console.error);
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else {
            // Send timer value to main screen when time is zero
            invoke("update_timer", { minutes: 0, seconds: 0 }).catch(console.error);
        }
    }, [time]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    return (
        <div className={`flex items-center justify-center h-screen ${timeUp && enableFlash ? "bg-flash" : "bg-black"}`}>
            {timeUp ? (
                <h1 className={`text-[20vh] font-black text-white ${enableFlash ? "animate-flash" : ""}`}>TIME UP!!!</h1>
            ) : (
                <h1 className="font-black text-white" style={{ fontSize: "30vh" }}>{formatTime(time)}</h1>
            )}
        </div>
    );
};

export default Timer;
