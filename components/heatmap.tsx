"use client";

import { ActivityCalendar, type Activity } from "react-activity-calendar";

interface HeatmapProps {
    data: Activity[];
}

export default function Heatmap({ data }: HeatmapProps) {
    return (
        <ActivityCalendar
            data={data}
            theme={{
                light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
                dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
            }}
            labels={{
                totalCount: "{{count}} days logged",
            }}
        />
    );
}
