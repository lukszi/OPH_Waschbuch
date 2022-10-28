import addHours from 'date-fns/addHours';
import parse from 'date-fns/parse';
import {format} from "date-fns";

export default class TimeSlot {
    start: string
    end: string
    id: number

    constructor(id: number) {
        const zeroDate: Date = parse("00:00", "HH:mm", new Date());
        const start = addHours(zeroDate, id*2);
        const end = addHours(zeroDate, (id+1)*2);

        this.start = format(start, "HH:mm");
        this.end = format(end, "HH:mm");
        this.id = id;
    }

    toString(): string {
        return this.start + " - " + this.end;
    }

    equals(other: TimeSlot) {
        return this.id === other.id;
    }
}