import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "dayjs/locale/pt-br";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useScale } from "@/contexts/scaleContext";
import { ScaleCalendarDetails } from "./ScaleCalendarDetails";

dayjs.locale("pt-br");

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const ScaleCalendar = () => {
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const today = dayjs();

    const { scales, fetchScales, scaleCountsByDate } = useScale();

    const handlePreviousMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
    const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
    const startOfMonth = currentDate.startOf("month");
    const daysInMonth = currentDate.daysInMonth();
    const emptyDays = Array(startOfMonth.day()).fill(null);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleDayClick = async (day: number) => {
        const date = currentDate.date(day);
        setSelectedDate(date);
        setLoading(true);
        await fetchScales({ data: date.format("YYYY-MM-DD") });
        setLoading(false);
    };

    return (
        <div className="p-4 w-full h-full m-auto">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePreviousMonth} className="text-lg font-bold">
                    <ChevronLeft />
                </button>
                <h2 className="text-xl font-semibold">
                    {currentDate.format("MMMM YYYY").replace(/^\w/, (c) => c.toUpperCase())}
                </h2>
                <button onClick={handleNextMonth} className="text-lg font-bold">
                    <ChevronRight />
                </button>
            </div>
            <div className="grid grid-cols-7 text-center font-semibold mb-2">
                {daysOfWeek.map((day) => (
                    <div key={day} className="p-2">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center cursor-pointer h-[87%]">
                {emptyDays.map((_, index) => (
                    <div key={index} className="p-2 h-full bg-secondary opacity-30 shadow"></div>
                ))}
                {monthDays.map((day) => {
                    const date = currentDate.date(day).format("YYYY-MM-DD");
                    const scaleCount = scaleCountsByDate[date] || 0;
                    const isPastDay = currentDate.date(day).isBefore(today, "day");
                    return (
                        <div key={day} className={`p-2 h-full rounded shadow-md ${isPastDay ? "bg-secondary opacity-30" : "bg-secondary"}`}>
                            <Dialog >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-full w-full text-start flex items-start justify-between"
                                        onClick={() => handleDayClick(day)}
                                    >
                                        {day}
                                        {scaleCount > 0 && (
                                            <span className="block text-xs font-bold">
                                                {scaleCount} escala(s)
                                            </span>
                                        )}
                                    </Button>
                                </DialogTrigger>
                                {selectedDate && (
                                    <ScaleCalendarDetails
                                        date={selectedDate}
                                        scales={scales}
                                        loading={loading}
                                    />
                                )}
                            </Dialog>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
