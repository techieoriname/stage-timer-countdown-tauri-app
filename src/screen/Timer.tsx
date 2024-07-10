import React, { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";

interface TimerProps {
    mini?: boolean;
}

const Timer: React.FC<TimerProps> = ({ mini = false }) => {
    const [time, setTime] = useState(0);
    const [timeUp, setTimeUp] = useState(false);
    const [enableFlash, setEnableFlash] = useState(true);
    const [activity, setActivity] = useState("");

    useEffect(() => {
        const handleStartTimer = ({ time: totalTimeInSeconds, activity }: { time: number, activity: string }) => {
            setTime(totalTimeInSeconds);
            setActivity(activity);
            setTimeUp(false);
        };

        const handleResetTimer = () => {
            setTime(0);
            setTimeUp(false);
            setActivity("");
        };

        const handleFlashStateChange = (state: boolean) => {
            setEnableFlash(state);
        };

        listen("start_timer", (event) => {
            const payload = event.payload as { time: number, activity: string };
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
        }
    }, [time, activity]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const fontSize = mini ? "6vh" : "20vh";
    const textStyle = mini ? "text-sm" : "text-[14vh]";

    return (
        <div className={`flex items-center justify-center ${timeUp && enableFlash ? "bg-flash" : "bg-black"} ${mini ? 'h-52' : 'h-screen'}`}>
            {timeUp ? (
                <div className="flex flex-col justify-center items-center">
                    <h2 className={`font-bold text-white mt-8 uppercase ${textStyle}`}>{activity}</h2>
                    <h1 className={`font-black text-white ${enableFlash ? "animate-flash" : ""}`} style={{ fontSize }}>TIME UP!!!</h1>
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center">
                    <h2 className={`font-bold text-white mt-8 uppercase ${textStyle}`}>{activity}</h2>
                    <h1 className="font-black text-white" style={{ fontSize }}>{formatTime(time)}</h1>
                </div>
            )}
        </div>
    );
};

export default Timer;
